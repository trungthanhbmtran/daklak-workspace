import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationAuthService {
  private readonly logger = new Logger(IntegrationAuthService.name);

  private privateKey: string;
  private publicKey: string;
  private kid: string;

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys() {
    // In production, we'd load this from an environment variable or secret manager.
    // For now, we generate an RSA key pair in-memory.
    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
      this.privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
      this.publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
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

  signAccessToken(userId: number, expiresIn: number, sessionId: string = crypto.randomUUID()): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    return this.signToken({
      iss: 'daklak-user-service',
      aud: 'daklak-api-gateway',
      sub: String(userId),
      sid: sessionId,
      jti: crypto.randomUUID(),
      iat: issuedAt,
      exp: issuedAt + expiresIn,
    });
  }

  signToken(payload: any): string {
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

