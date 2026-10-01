import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class TokenValidatorService {
  private readonly logger = new Logger(TokenValidatorService.name);
  private client: jwksClient.JwksClient;

  constructor(
    private readonly redisService: RedisService,
  ) {
    const jwksUri = process.env.JWKS_URI || 'http://localhost:3001/.well-known/jwks.json';
    
    this.client = jwksClient({
      jwksUri,
      cache: true,
      cacheMaxEntries: 5, // Default is 5
      cacheMaxAge: 600000, // 10 mins
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  private getKey(header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  }

  public async verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.getKey.bind(this), async (err, decoded: any) => {
        if (err) {
          return reject(new UnauthorizedException('Invalid or expired token'));
        }

        // Check Denylist in Redis
        if (decoded.jti) {
          const isRevoked = await this.redisService.get(`denylist:${decoded.jti}`);
          if (isRevoked) {
            return reject(new UnauthorizedException('Token has been revoked'));
          }
        }
        
        resolve(decoded);
      });
    });
  }
}
