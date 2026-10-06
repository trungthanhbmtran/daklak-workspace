import { createPublicKey, verify } from 'crypto';
import { AUTH_JWT } from '../core/auth-session';

export interface AuthState { userId: number; isActive: boolean; authVersion: number; sessionActive: boolean; }
export interface GatewayContext {
  id: number; sub: string; sid: string; authVersion: number;
  employeeCode?: string; unitId?: string | number; username?: string;
  permissionsFlatten: string[]; jti: string; originJti?: string;
  requestId?: string; ipAddress?: string; exp: number;
  [key: string]: unknown;
}
export class InvalidGatewayContext extends Error { }

export function verifyGatewayContextToken(token: string, pem: string): GatewayContext {
  const fail = () => new InvalidGatewayContext('Invalid gateway context');
  if (!pem || token.length > 32768 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) throw fail();
  try {
    const [headerPart, payloadPart, signature] = token.split('.');
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString());
    const claims = JSON.parse(Buffer.from(payloadPart, 'base64url').toString()) as GatewayContext;
    const key = createPublicKey(pem.replace(/\\n/g, '\n'));
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || key.asymmetricKeyType !== 'rsa' ||
      !verify('RSA-SHA256', Buffer.from(headerPart + '.' + payloadPart), key, Buffer.from(signature, 'base64url')) ||
      claims.iss !== AUTH_JWT.issuer || claims.aud !== AUTH_JWT.internalAudience ||
      !Number.isSafeInteger(claims.exp) || claims.exp <= now ||
      typeof claims.iat !== 'number' || claims.iat > now + 30 || claims.exp - claims.iat > 60 ||
      !Number.isSafeInteger(claims.id) || claims.id < 1 || claims.sub !== String(claims.id) ||
      !Number.isSafeInteger(claims.authVersion) || claims.authVersion < 0 ||
      !/^[a-f0-9-]{36}$/i.test(claims.sid) || typeof claims.jti !== 'string' ||
      !Array.isArray(claims.permissionsFlatten) || claims.permissionsFlatten.length > 2048 ||
      claims.permissionsFlatten.some((permission) => typeof permission !== 'string' || permission.length > 128)
    ) throw fail();
    return claims;
  } catch { throw fail(); }
}

export async function validateGatewayContext(
  token: string,
  pem: string,
  getState: (id: number, sessionId: string) => Promise<AuthState>,
  getRedis: (key: string) => Promise<string | null>,
): Promise<GatewayContext> {
  const context = verifyGatewayContextToken(token, pem);
  const [state, raw, revoked] = await Promise.all([
    getState(context.id, context.sid), getRedis('auth:session:' + context.sid),
    getRedis('denylist:' + (context.originJti ?? context.jti)),
  ]);
  let session: { userId: number; version: number; expiresAt: number } | undefined;
  try { session = raw ? JSON.parse(raw) : undefined; } catch { throw new InvalidGatewayContext('Invalid session'); }
  if (!state.isActive || !state.sessionActive || state.userId !== context.id || state.authVersion !== context.authVersion ||
    !session || session.userId !== context.id || session.version !== context.authVersion ||
    session.expiresAt <= Math.floor(Date.now() / 1000) || revoked)
    throw new InvalidGatewayContext('Session expired or revoked');
  return context;
}


