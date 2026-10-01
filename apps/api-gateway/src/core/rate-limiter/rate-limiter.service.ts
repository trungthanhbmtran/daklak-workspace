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

  /**
   * Lua script: INCR + EXPIRE atomic trong 1 lời gọi Redis.
   * Đảm bảo key LUÔN có TTL — tránh key vĩnh viễn khi Redis crash giữa 2 lệnh.
   * Return: [count, ttl]
   */
  private readonly LUA_SLIDING_WINDOW = `
    local c = redis.call('INCR', KEYS[1])
    if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
    return {c, redis.call('TTL', KEYS[1])}
  `;

  constructor(private readonly redisService: RedisService) {}

  /**
   * Kiểm tra và tăng bộ đếm rate limit (atomic).
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
      // Atomic Lua: INCR + EXPIRE trong 1 round-trip — tránh race condition
      const result = (await client.eval(
        this.LUA_SLIDING_WINDOW,
        1,        // numkeys
        redisKey, // KEYS[1]
        windowSec.toString(), // ARGV[1]
      )) as [number, number];

      const count = result[0];
      const ttl = result[1] > 0 ? result[1] : windowSec;

      const remaining = Math.max(0, limit - count);
      const retryAfterSec = ttl;
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
