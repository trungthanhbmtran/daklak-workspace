import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { AUTH_JWT } from '../../../../../shared/core/auth-session';

@Injectable()
export class TokenIssuerService {
  private readonly logger = new Logger(TokenIssuerService.name);

  private privateKey: string;
  private publicKey: string;
  private kid: string;

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys() {
    if (
      process.env.AUTH_REQUIRE_PERSISTENT_KEYS === 'true' &&
      (!process.env.JWT_PRIVATE_KEY || !process.env.JWT_PUBLIC_KEY)
    ) {
      throw new Error(
        'Persistent JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are required',
      );
    }
    if (
      Boolean(process.env.JWT_PRIVATE_KEY) !==
      Boolean(process.env.JWT_PUBLIC_KEY)
    ) {
      throw new Error('JWT private/public keys must be configured together');
    }
    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
      this.privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
      this.publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
      const privateKey = crypto.createPrivateKey(this.privateKey);
      const publicKey = crypto.createPublicKey(this.publicKey);
      if (
        privateKey.asymmetricKeyType !== 'rsa' ||
        (privateKey.asymmetricKeyDetails?.modulusLength || 0) < 2048 ||
        !crypto
          .createPublicKey(privateKey)
          .export({ type: 'spki', format: 'der' })
          .equals(publicKey.export({ type: 'spki', format: 'der' }))
      ) {
        throw new Error(
          'JWT keys must be a matching RSA pair with at least 2048 bits',
        );
      }
      this.kid = process.env.JWT_KID || 'default-kid-1';
      this.logger.log('Loaded asymmetric keys from environment');
    } else {
      this.logger.log('Generating ephemeral RSA key pair for JWKS');
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      this.privateKey = privateKey;
      this.publicKey = publicKey;
      this.kid = 'ephemeral-kid-' + Date.now();
    }
  }

  getJwks() {
    // Convert PEM public key to JWK (simplified for brevity, realistically use 'pem-jwk' or 'jose' library)
    // A robust system would use 'jose' library to format the JWK perfectly.
    // We'll return a basic structure. To fully support JWK, we must parse the PEM.
    // However, since Node crypto can export to JWK in recent versions:
    const key = crypto.createPublicKey(this.publicKey);
    const jwk = key.export({ format: 'jwk' }) as any;

    return {
      keys: [
        {
          ...jwk,
          kid: this.kid,
          use: 'sig',
          alg: 'RS256',
        },
      ],
    };
  }

  getPublicKeyDetails() {
    return {
      publicKey: this.publicKey,
      kid: this.kid,
      alg: 'RS256',
    };
  }

  signAccessToken(
    userId: number,
    expiresIn: number,
    sessionId: string = crypto.randomUUID(),
    authVersion = 0,
  ): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    return this.signToken({
      iss: AUTH_JWT.issuer,
      aud: AUTH_JWT.audience,
      sub: String(userId),
      sid: sessionId,
      authVersion,
      jti: crypto.randomUUID(),
      iat: issuedAt,
      exp: issuedAt + expiresIn,
    });
  }

  signDelegation(
    user: Record<string, unknown>,
    trace: { requestId?: string; ipAddress?: string } = {},
  ): string {
    const id = Number(user.id ?? user.sub);
    const authVersion = Number(user.authVersion);
    const sid = user.sid;
    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !Number.isSafeInteger(authVersion) ||
      authVersion < 0 ||
      typeof sid !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(sid)
    )
      throw new Error('Verified session context is required for delegation');
    const now = Math.floor(Date.now() / 1000);
    const context: Record<string, unknown> = {
      iss: AUTH_JWT.issuer,
      aud: AUTH_JWT.internalAudience,
      id,
      sub: String(id),
      sid,
      authVersion,
      iat: now,
      exp: now + 60,
      jti: crypto.randomUUID(),
      originJti: user.jti,
      ...trace,
    };
    
    return this.signToken(context);
  }

  signToken(payload: Record<string, unknown>): string {
    const sign = crypto.createSign('RSA-SHA256');
    const header = { alg: 'RS256', typ: 'JWT', kid: this.kid };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    sign.update(`${encodedHeader}.${encodedPayload}`);
    const signature = sign.sign(this.privateKey, 'base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
