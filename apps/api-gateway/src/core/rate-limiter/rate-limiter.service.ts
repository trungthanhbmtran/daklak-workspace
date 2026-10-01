import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

/**
 * RateLimiterService — Sliding Window Rate Limiter dùng Redis.
 *
 * Chuẩn: OWASP ASVS 4.0 §11.1.6 — Brute-force Protection
 *        Thông tư 06/2023/TT-BTTTT — Kiểm soát truy cập
 *
 * Thuật toán: Sliding Window Counter (không bị exploit tại boundary như Fixed Window)
 * - Mỗi request increment counter theo key (ip / userId)
 * - TTL tự động xóa sau windowMs
 */
@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Kiểm tra và tăng bộ đếm rate limit.
   * @returns { allowed: boolean; remaining: number; retryAfterSec: number }
   */
  async check(
    key: string,
    limit: number,
    windowSec: number,
  ): Promise<{ allowed: boolean; remaining: number; retryAfterSec: number }> {
    const redisKey = `rate_limit:${key}`;
    const client = this.redisService.getClient();

    try {
      // Atomic increment + set TTL nếu key mới (INCR + EXPIRE trong pipeline)
      const pipeline = client.pipeline();
      pipeline.incr(redisKey);
      pipeline.ttl(redisKey);
      const results = await pipeline.exec();

      const count = (results?.[0]?.[1] as number) ?? 0;
      const ttl = (results?.[1]?.[1] as number) ?? -1;

      // Nếu key vừa tạo (ttl = -1), set TTL sliding window
      if (ttl === -1) {
        await client.expire(redisKey, windowSec);
      }

      const remaining = Math.max(0, limit - count);
      const retryAfterSec = ttl > 0 ? ttl : windowSec;
      const allowed = count <= limit;

      if (!allowed) {
        this.logger.warn(
          `[RATE_LIMIT_EXCEEDED] key=${redisKey} count=${count}/${limit} retryAfter=${retryAfterSec}s`,
        );
      }

      return { allowed, remaining, retryAfterSec };
    } catch (e: any) {
      // Nếu Redis lỗi, ALLOW thay vì block toàn bộ (Fail Open — tránh outage)
      this.logger.error(`[RateLimiter] Redis error: ${e.message}. Failing open.`);
      return { allowed: true, remaining: limit, retryAfterSec: 0 };
    }
  }

  /**
   * Reset bộ đếm — dùng sau khi login thành công để tránh penalize user hợp lệ.
   */
  async reset(key: string): Promise<void> {
    try {
      await this.redisService.del(`rate_limit:${key}`);
    } catch (e: any) {
      this.logger.warn(`[RateLimiter] Reset failed for key=${key}: ${e.message}`);
    }
  }
}
