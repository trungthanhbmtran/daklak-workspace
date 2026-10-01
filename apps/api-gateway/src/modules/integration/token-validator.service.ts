import { Injectable, Logger, UnauthorizedException, Inject, OnModuleInit } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { RedisService } from '../../core/redis/redis.service';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TokenValidatorService implements OnModuleInit {
  private readonly logger = new Logger(TokenValidatorService.name);
  private grpcService: any;
  private cachedPublicKey: string | null = null;
  private lastFetchTime = 0;

  constructor(
    private readonly redisService: RedisService,
    @Inject(MICROSERVICES.INTEGRATION.SYMBOL) private readonly client: any,
  ) {}

  async onModuleInit() {
    this.grpcService = this.client.getService(MICROSERVICES.INTEGRATION.SERVICE);
    // Attempt to load the key immediately, but don't crash if user-service isn't up yet.
    this.fetchPublicKey().catch(e => this.logger.warn(`Failed to initial fetch public key: ${e.message}`));
  }

  private async fetchPublicKey(): Promise<string> {
    const now = Date.now();
    // Cache for 5 minutes
    if (this.cachedPublicKey && (now - this.lastFetchTime) < 5 * 60 * 1000) {
      return this.cachedPublicKey;
    }

    try {
      const response = await firstValueFrom(this.grpcService.GetPublicKey({})) as any;
      if (response && response.publicKey) {
        this.cachedPublicKey = response.publicKey;
        this.lastFetchTime = now;
        this.logger.log('Successfully fetched and cached JWT Public Key from user-service');
        return this.cachedPublicKey as string;
      }
      throw new Error('Public key not found in response');
    } catch (e: any) {
      this.logger.error(`Error fetching public key via gRPC: ${e.message}`);
      if (this.cachedPublicKey) {
        return this.cachedPublicKey as string; // Fallback to stale cache
      }
      throw new Error('Unable to fetch public key for JWT verification');
    }
  }

  public async verifyToken(token: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const publicKey = await this.fetchPublicKey();
        
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, async (err, decoded: any) => {
          if (err) {
            return reject(new UnauthorizedException('Invalid or expired token'));
          }

          // Check Denylist in Redis
          if (decoded.jti) {
            try {
              const isRevoked = await this.redisService.get(`denylist:${decoded.jti}`);
              if (isRevoked) {
                return reject(new UnauthorizedException('Token has been revoked'));
              }
            } catch (e) {
              this.logger.warn(`Failed to check denylist in Redis: ${e.message}`);
            }
          }
          // Fetch full user session from Redis
          let userSession = {};
          if (decoded.sub) {
            try {
              const sessionStr = await this.redisService.get(`user_session:${decoded.sub}`);
              if (sessionStr) {
                userSession = JSON.parse(sessionStr);
              }
            } catch (e) {
              this.logger.warn(`Failed to fetch user session from Redis for user ${decoded.sub}: ${e.message}`);
            }
          }
          
          // Return merged object: decoded token + full user permissions/roles from cache
          resolve({ ...userSession, ...decoded });
        });
      } catch (err) {
        reject(new UnauthorizedException('System is unavailable to verify token'));
      }
    });
  }
}
