import { Injectable } from '@nestjs/common';
import { createPublicKey } from 'crypto';

// Compatibility endpoint for consumers of the public key. Only Gateway holds/signs with the private key.
@Injectable()
export class IntegrationAuthService {
  getPublicKeyDetails() {
    const pem = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
    if (!pem) throw new Error('JWT_PUBLIC_KEY is required');
    const key = createPublicKey(pem);
    if (
      key.asymmetricKeyType !== 'rsa' ||
      (key.asymmetricKeyDetails?.modulusLength ?? 0) < 2048
    )
      throw new Error('JWT_PUBLIC_KEY must be RSA with at least 2048 bits');
    return {
      publicKey: pem,
      kid: process.env.JWT_KID || 'default-kid-1',
      alg: 'RS256',
    };
  }
  getJwks() {
    const details = this.getPublicKeyDetails();
    return {
      keys: [
        {
          ...createPublicKey(details.publicKey).export({ format: 'jwk' }),
          kid: details.kid,
          alg: 'RS256',
          use: 'sig',
        },
      ],
    };
  }
}
