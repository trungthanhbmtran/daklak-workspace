import { generateKeyPairSync } from 'crypto';
import { IntegrationAuthService } from './integration-auth.service';
describe('User public-key verifier', () => {
  const saved = process.env.JWT_PUBLIC_KEY;
  afterEach(() => { if (saved === undefined) delete process.env.JWT_PUBLIC_KEY; else process.env.JWT_PUBLIC_KEY = saved; });
  it('cannot sign', () => { const service = new IntegrationAuthService(); expect((service as any).signAccessToken).toBeUndefined(); expect((service as any).signToken).toBeUndefined(); });
  it('rejects missing public key', () => { delete process.env.JWT_PUBLIC_KEY; expect(() => new IntegrationAuthService().getPublicKeyDetails()).toThrow(); });
  it('publishes RSA public key without private key', () => {
    const pair = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
    process.env.JWT_PUBLIC_KEY = pair.publicKey; expect(new IntegrationAuthService().getPublicKeyDetails().publicKey).toBe(pair.publicKey);
  });
});

