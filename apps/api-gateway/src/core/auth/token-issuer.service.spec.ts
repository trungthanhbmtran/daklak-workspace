import * as crypto from 'crypto';
import { TokenIssuerService } from './token-issuer.service';

describe('Persistent authentication signing configuration', () => {
  const names = [
    'JWT_PRIVATE_KEY',
    'JWT_PUBLIC_KEY',
    'JWT_KID',
    'AUTH_REQUIRE_PERSISTENT_KEYS',
  ];
  const previous = Object.fromEntries(
    names.map((key) => [key, process.env[key]]),
  );
  const pair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  beforeEach(() => {
    for (const key of names) delete process.env[key];
  });
  afterEach(() => {
    for (const key of names) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  it('requires keys when persistent signing is enabled', () => {
    process.env.AUTH_REQUIRE_PERSISTENT_KEYS = 'true';
    expect(() => new TokenIssuerService()).toThrow('required');
  });
  it('rejects partially configured keys instead of silently replacing them', () => {
    process.env.JWT_PRIVATE_KEY = pair.privateKey;
    expect(() => new TokenIssuerService()).toThrow('together');
  });
  it('loads escaped PEM and uses the same stable public key after restart', () => {
    process.env.AUTH_REQUIRE_PERSISTENT_KEYS = 'true';
    process.env.JWT_PRIVATE_KEY = pair.privateKey.replace(/\n/g, '\\n');
    process.env.JWT_PUBLIC_KEY = pair.publicKey.replace(/\n/g, '\\n');
    const first = new TokenIssuerService(),
      restarted = new TokenIssuerService();
    const token = first.signAccessToken(7, 900);
    expect(restarted.getPublicKeyDetails().publicKey).toBe(
      first.getPublicKeyDetails().publicKey,
    );
    const [header, payload, signature] = token.split('.');
    expect(
      crypto.verify(
        'RSA-SHA256',
        Buffer.from(header + '.' + payload),
        restarted.getPublicKeyDetails().publicKey,
        Buffer.from(signature, 'base64url'),
      ),
    ).toBe(true);
  });
  it('rejects mismatched private/public keys at startup', () => {
    const different = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    process.env.JWT_PRIVATE_KEY = pair.privateKey;
    process.env.JWT_PUBLIC_KEY = different.publicKey;
    expect(() => new TokenIssuerService()).toThrow('matching RSA');
  });
});

