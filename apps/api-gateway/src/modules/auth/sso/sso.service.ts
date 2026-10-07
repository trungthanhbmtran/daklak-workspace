import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ServiceUnavailableException,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  createHash,
  createPublicKey,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Pool, type Dispatcher } from 'undici';
import { RedisService } from '../../../core/redis/redis.service';
import { guardedUpstreamLookup } from '../../integration/upstream-network';
import { loadSsoProviders, SsoProvider } from './sso.config';

interface Transaction {
  providerId: string;
  binding: string;
  verifier: string;
  nonce: string;
  callbackUrl: string;
}
const equal = (a: string, b: string) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
export function validateIdToken(
  token: string,
  jwks: { keys?: unknown[] },
  provider: SsoProvider,
  nonce: string,
): jwt.JwtPayload {
  if (typeof token !== 'string' || token.length > 32768)
    throw new UnauthorizedException('SSO không hợp lệ');
  const decoded = jwt.decode(token, { complete: true });
  if (
    !decoded ||
    decoded.header.alg !== 'RS256' ||
    typeof decoded.header.kid !== 'string' ||
    !Array.isArray(jwks.keys) ||
    jwks.keys.length > 32
  )
    throw new UnauthorizedException('SSO không hợp lệ');
  const keys = jwks.keys.filter(
    (value: any) =>
      value?.kid === decoded.header.kid &&
      value.kty === 'RSA' &&
      (!value.alg || value.alg === 'RS256') &&
      (!value.use || value.use === 'sig') &&
      (!value.key_ops || value.key_ops.includes('verify')) &&
      !value.d,
  );
  if (keys.length !== 1) throw new UnauthorizedException('SSO không hợp lệ');
  const key = createPublicKey({ key: keys[0] as any, format: 'jwk' });
  if ((key.asymmetricKeyDetails?.modulusLength || 0) < 2048)
    throw new UnauthorizedException('SSO không hợp lệ');
  const claims = jwt.verify(token, key, {
    algorithms: ['RS256'],
    issuer: provider.issuer,
    audience: provider.clientId,
    clockTolerance: 30,
  }) as jwt.JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  if (
    typeof claims.sub !== 'string' ||
    !claims.sub ||
    claims.sub.length > 255 ||
    typeof claims.nonce !== 'string' ||
    !equal(claims.nonce, nonce) ||
    typeof claims.iat !== 'number' ||
    claims.iat > now + 30 ||
    now - claims.iat > 600 ||
    typeof claims.exp !== 'number' ||
    claims.exp - claims.iat > 3600 ||
    (Array.isArray(claims.aud) &&
      claims.aud.length > 1 &&
      claims.azp !== provider.clientId) ||
    (claims.azp !== undefined && claims.azp !== provider.clientId) ||
    (provider.requiredAcr && claims.acr !== provider.requiredAcr) ||
    provider.requiredAmr?.some(
      (amr) => !Array.isArray(claims.amr) || !claims.amr.includes(amr),
    )
  )
    throw new UnauthorizedException('SSO không hợp lệ');
  return claims;
}

@Injectable()
export class SsoService implements OnModuleDestroy {
  private readonly providers = loadSsoProviders();
  private readonly pools = new Map<string, Pool>();
  constructor(private readonly redis: RedisService) {}
  list() {
    return this.providers.map(({ id, label }) => ({ id, label }));
  }
  provider(id: string): SsoProvider {
    const p = this.providers.find((item) => item.id === id);
    if (!p) throw new NotFoundException('SSO chưa được cấu hình');
    return p;
  }
  async start(id: string) {
    const provider = this.provider(id);
    // Check readiness before creating a browser transaction; never expose the secret.
    if (!process.env[provider.clientSecretRef])
      throw new ServiceUnavailableException('SSO chưa sẵn sàng');
    const state = randomBytes(32).toString('base64url'),
      binding = randomBytes(32).toString('base64url');
    const transaction: Transaction = {
      providerId: id,
      binding,
      verifier: randomBytes(32).toString('base64url'),
      nonce: randomBytes(32).toString('base64url'),
      callbackUrl: provider.callbackUrl,
    };
    await this.redis.set(
      'auth:sso:state:' + state,
      JSON.stringify(transaction),
      300,
    );
    const url = new URL(provider.authorizationEndpoint);
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: provider.clientId,
      redirect_uri: provider.callbackUrl,
      scope: 'openid',
      state,
      nonce: transaction.nonce,
      code_challenge: createHash('sha256')
        .update(transaction.verifier)
        .digest('base64url'),
      code_challenge_method: 'S256',
      ...(provider.requiredAcr ? { acr_values: provider.requiredAcr } : {}),
    }).toString();
    return { url: url.toString(), binding };
  }
  async finish(id: string, query: Record<string, unknown>, binding: unknown) {
    const provider = this.provider(id);
    if (
      typeof query.state !== 'string' ||
      !/^[A-Za-z0-9_-]{43}$/.test(query.state) ||
      typeof binding !== 'string' ||
      typeof query.code !== 'string' ||
      !query.code ||
      query.code.length > 4096 ||
      query.error ||
      (query.iss !== undefined && query.iss !== provider.issuer)
    )
      throw new UnauthorizedException('SSO không hợp lệ');
    // Atomic compare-and-consume: an attacker without the browser binding cannot destroy the legitimate state.
    const raw = await this.redis.getClient().eval(
      `
local raw = redis.call('GET', KEYS[1])
if not raw then return nil end
local t = cjson.decode(raw)
if t.binding ~= ARGV[1] or t.providerId ~= ARGV[2] then return nil end
redis.call('DEL', KEYS[1])
return raw`,
      1,
      'auth:sso:state:' + query.state,
      binding,
      id,
    );
    if (typeof raw !== 'string')
      throw new UnauthorizedException('SSO đã hết hạn hoặc đã được sử dụng');
    const transaction = JSON.parse(raw) as Transaction;
    const secret = process.env[provider.clientSecretRef];
    if (!secret) throw new ServiceUnavailableException('SSO chưa sẵn sàng');
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: query.code,
      redirect_uri: transaction.callbackUrl,
      code_verifier: transaction.verifier,
    });
    const headers: Record<string, string> = {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    };
    if (provider.tokenAuthMethod === 'client_secret_post') {
      body.set('client_id', provider.clientId);
      body.set('client_secret', secret);
    } else
      headers.authorization =
        'Basic ' +
        Buffer.from(
          encodeURIComponent(provider.clientId) +
            ':' +
            encodeURIComponent(secret),
        ).toString('base64');
    const tokens = await this.requestJson(
      provider.tokenEndpoint,
      'POST',
      body.toString(),
      headers,
    );
    const jwks = await this.requestJson(provider.jwksUri, 'GET');
    try {
      const claims = validateIdToken(
        tokens.id_token,
        jwks,
        provider,
        transaction.nonce,
      );
      return { issuer: provider.issuer, subject: claims.sub! };
    } catch {
      throw new UnauthorizedException('Xác thực SSO không hợp lệ');
    }
  }
  private async requestJson(
    address: string,
    method: 'GET' | 'POST',
    body?: string,
    headers?: Record<string, string>,
  ): Promise<any> {
    const url = new URL(address);
    let pool = this.pools.get(url.origin);
    if (!pool) {
      pool = new Pool(url.origin, {
        connections: 2,
        headersTimeout: 5000,
        bodyTimeout: 5000,
        connect: {
          lookup: guardedUpstreamLookup('external'),
          rejectUnauthorized: true,
        },
      });
      this.pools.set(url.origin, pool);
    }
    let response: Dispatcher.ResponseData | undefined;
    try {
      response = await pool.request({
        path: url.pathname,
        method,
        body,
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (response.statusCode !== 200) throw new Error('SSO upstream failed');
      let bytes = 0;
      const chunks: Buffer[] = [];
      for await (const chunk of response.body) {
        const buffer = Buffer.from(chunk);
        bytes += buffer.length;
        if (bytes > 262144) throw new Error('SSO response too large');
        chunks.push(buffer);
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      response?.body.destroy();
      throw new ServiceUnavailableException(
        'Nhà cung cấp SSO tạm thời không khả dụng',
      );
    }
  }
  async onModuleDestroy() {
    await Promise.all([...this.pools.values()].map((pool) => pool.close()));
  }
}
