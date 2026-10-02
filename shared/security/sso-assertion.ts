import { createPublicKey, verify } from 'crypto';
import { AUTH_JWT } from '../core/auth-session';
export const SSO_GRANT_AUDIENCE = 'urn:daklak:sso-grant';
export function verifySsoAssertion(token: string, pem: string) {
  try {
    if (typeof token !== 'string' || token.length > 8192) throw new Error();
    const [head, body, signature] = token.split('.');
    const header = JSON.parse(Buffer.from(head, 'base64url').toString()), claims = JSON.parse(Buffer.from(body, 'base64url').toString());
    const key = createPublicKey(pem.replace(/\\n/g, '\n')), now = Math.floor(Date.now()/1000);
    if (header.alg !== 'RS256' || key.asymmetricKeyType !== 'rsa' ||
      !verify('RSA-SHA256', Buffer.from(head + '.' + body), key, Buffer.from(signature, 'base64url')) ||
      claims.iss !== AUTH_JWT.issuer || claims.aud !== SSO_GRANT_AUDIENCE ||
      !Number.isSafeInteger(claims.exp) || claims.exp <= now || !Number.isSafeInteger(claims.iat) ||
      claims.iat > now + 30 || claims.exp - claims.iat > 30 ||
      !/^[a-f0-9]{64}$/.test(claims.issuerHash) || !/^[a-f0-9]{64}$/.test(claims.subjectHash) ||
      typeof claims.jti !== 'string' || !/^[a-f0-9-]{36}$/i.test(claims.jti)) throw new Error();
    return claims as { issuerHash: string; subjectHash: string; jti: string; requestId?: string; ipAddress?: string };
  } catch { throw new Error('Invalid SSO assertion'); }
}

