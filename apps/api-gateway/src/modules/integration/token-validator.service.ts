import {
  Injectable,
  Logger,
  UnauthorizedException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';

import { RedisService } from '../../core/redis/redis.service';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

// Chuẩn RFC 7519 + OWASP ASVS Level 2 (Thông tư 06/2023/TT-BTTTT)
const JWT_ISSUER = 'daklak-user-service';
const JWT_AUDIENCE = 'daklak-api-gateway';

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
    this.fetchPublicKey().catch(e =>
      this.logger.warn(`Failed to initial fetch public key: ${e.message}`),
    );
  }

  private async fetchPublicKey(): Promise<string> {
    const now = Date.now();
    if (this.cachedPublicKey && now - this.lastFetchTime < 5 * 60 * 1000) {
      return this.cachedPublicKey;
    }
    try {
      const response = (await firstValueFrom(
        this.grpcService.GetPublicKey({}),
      )) as any;
      if (response && response.publicKey) {
        this.cachedPublicKey = response.publicKey;
        this.lastFetchTime = now;
        this.logger.log('JWT Public Key fetched and cached from user-service');
        return this.cachedPublicKey as string;
      }
      throw new Error('Public key not found in response');
    } catch (e: any) {
      this.logger.error(`Error fetching public key via gRPC: ${e.message}`);
      if (this.cachedPublicKey) return this.cachedPublicKey as string;
      throw new Error('Unable to fetch public key for JWT verification');
    }
  }

  /**
   * Lấy full user session (permissionsFlatten, roles, policies) từ Redis.
   * Key: user_session:{userId} — được user-service push vào khi login/refresh.
   * Fallback về {} nếu chưa có cache.
   */
  public async getUserSession(userId: string | number): Promise<Record<string, any>> {
    if (!userId) return {};
    try {
      const sessionStr = await this.redisService.get(`user_session:${userId}`);
      if (sessionStr) return JSON.parse(sessionStr);
    } catch (e: any) {
      this.logger.warn(`[getUserSession] Redis error for user ${userId}: ${e.message}`);
    }
    return {};
  }

  /**
   * Xác thực JWT chuẩn Chính phủ (TT06/2023 + OWASP ASVS L2 + RFC 7519):
   *
   * 1. Xác thực chữ ký RS256 bằng Public Key từ user-service (qua gRPC)
   * 2. Validate claims bắt buộc: iss, aud, exp
   *    → Chống token giả từ hệ thống khác (SSRF/Token Substitution Attack)
   * 3. Kiểm tra JTI Denylist → chống reuse token bị đánh cắp
   * 4. Enrich với session quyền từ Redis (Coarse-grained permission cache)
   * 5. Ghi Audit Log (traceable theo yêu cầu kiểm toán TT06/2023)
   */
  public async verifyToken(token: string, ipAddress?: string): Promise<any> {
    const publicKey = await this.fetchPublicKey();
    const jwtVerify = promisify<string, string, jwt.VerifyOptions, jwt.JwtPayload>(
      jwt.verify as any,
    );

    let decoded: any;
    try {
      decoded = await jwtVerify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: JWT_ISSUER,     // RFC 7519 §4.1.1 — chống Token Substitution Attack
        audience: JWT_AUDIENCE, // RFC 7519 §4.1.3 — chỉ chấp nhận token cấp cho gateway
        // exp tự động validate bởi jsonwebtoken
      });
    } catch (e: any) {
      this.logger.warn(
        `[AUTH_FAILED] ${e.message} | ip=${ipAddress ?? 'unknown'}`,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Kiểm tra JTI Denylist (OWASP ASVS 3.5.2 — Token Revocation)
    if (decoded.jti) {
      try {
        const isRevoked = await this.redisService.get(`denylist:${decoded.jti}`);
        if (isRevoked) {
          this.logger.warn(
            `[AUTH_REVOKED] jti=${decoded.jti} sub=${decoded.sub} | ip=${ipAddress ?? 'unknown'}`,
          );
          throw new UnauthorizedException('Token has been revoked');
        }
      } catch (e: any) {
        if (e instanceof UnauthorizedException) throw e;
        this.logger.warn(`Denylist check failed for jti=${decoded.jti}: ${e.message}`);
      }
    }

    // Enrich với session quyền từ Redis (Coarse-grained permission cache)
    const userSession = await this.getUserSession(decoded.sub);

    // Audit log xác thực thành công (traceable theo TT06/2023/TT-BTTTT)
    this.logger.log(
      `[AUTH_SUCCESS] sub=${decoded.sub} jti=${decoded.jti} | ip=${ipAddress ?? 'unknown'}`,
    );

    // JWT claims (đã xác thực chữ ký) ghi đè session để đảm bảo toàn vẹn
    return { ...userSession, ...decoded };
  }
}
