import { generateKeyPairSync } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { loadSsoProviders, SsoProvider } from './sso.config';
import { validateIdToken, SsoService } from './sso.service';
const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
const provider: SsoProvider = { id: 'agency', label: 'SSO', issuer: 'https://id.example.gov.vn', clientId: 'hub', authorizationEndpoint: 'https://id.example.gov.vn/auth', tokenEndpoint: 'https://id.example.gov.vn/token', jwksUri: 'https://id.example.gov.vn/jwks', callbackUrl: 'https://hub.example.gov.vn/api/v1/admin/auth/sso/agency/callback', clientSecretRef: 'AGENCY_SECRET' };
const jwks = { keys: [{ ...pair.publicKey.export({ format: 'jwk' }), kid: 'one', alg: 'RS256', use: 'sig' }] };
const token = (changes = {}, key = pair.privateKey) => jwt.sign({ sub: 'opaque-subject', nonce: 'nonce', ...changes }, key, { algorithm: 'RS256', keyid: 'one', issuer: provider.issuer, audience: provider.clientId, expiresIn: 300 });
describe('Prepared OIDC integration', () => {
  it('is disabled by default', () => expect(loadSsoProviders('')).toEqual([]));
  it('loads only explicit approved HTTPS endpoints', () => expect(loadSsoProviders(JSON.stringify([provider]))).toEqual([provider]));
  it.each(['http://id.example.gov.vn/token', 'https://attacker.example/token', 'https://id.example.gov.vn/token?secret=x'])('rejects endpoint %s', address => {
    expect(() => loadSsoProviders(JSON.stringify([{ ...provider, tokenEndpoint: address }]))).toThrow();
  });
  it('accepts verified issuer/audience/nonce/sub', () => expect(validateIdToken(token(), jwks, provider, 'nonce').sub).toBe('opaque-subject'));
  it.each([{ nonce: 'wrong' }, { azp: 'attacker' }, { sub: '' }, { iat: 1 }])('rejects invalid identity %p', changes => expect(() => validateIdToken(token(changes), jwks, provider, 'nonce')).toThrow());
  it('rejects a substituted signing key', () => {
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
    expect(() => validateIdToken(token({}, other.privateKey), jwks, provider, 'nonce')).toThrow();
  });
  it('rejects missing MFA assurance when configured', () => expect(() => validateIdToken(token(), jwks, { ...provider, requiredAmr: ['mfa'] }, 'nonce')).toThrow());
  it('does not accept an OAuth access token without ID-token nonce', () => expect(() => validateIdToken(token({ nonce: undefined }), jwks, provider, 'nonce')).toThrow());
  it('stores PKCE and nonce only at backend and consumes state once', async () => {
    const old = process.env.SSO_PROVIDERS_JSON; process.env.SSO_PROVIDERS_JSON = JSON.stringify([provider]); process.env.AGENCY_SECRET = 'test-only';
    const redis = { set: jest.fn(), getClient: () => ({ eval: jest.fn().mockResolvedValue(null) }) };
    try {
      const sso = new SsoService(redis as any), start = await sso.start('agency');
      const params = new URL(start.url).searchParams;
      expect(params.get('code_challenge_method')).toBe('S256');
      const transaction = JSON.parse(redis.set.mock.calls[0][1]);
      expect(params.get('code_challenge')).not.toBe(transaction.verifier);
      expect(start.url).not.toContain('test-only');
      expect(redis.set.mock.calls[0][2]).toBe(300);
      await expect(sso.finish('agency', { state: params.get('state'), code: 'code' }, start.binding)).rejects.toThrow('đã hết hạn');
      await expect(sso.finish('agency', { state: params.get('state'), code: 'code' }, undefined)).rejects.toThrow();
    } finally { delete process.env.AGENCY_SECRET; if (old === undefined) delete process.env.SSO_PROVIDERS_JSON; else process.env.SSO_PROVIDERS_JSON = old; }
  });
});

