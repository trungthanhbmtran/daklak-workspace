import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';
import { clientIp } from '../client-ip';

/** Decorator để cấu hình rate limit per route:
 *  @RateLimit({ limit: 10, windowSec: 900, keyBy: 'ip' })
 */
export const RATE_LIMIT_KEY = 'rate_limit_config';
export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);

export interface RateLimitConfig {
  /** Số request tối đa trong window */
  limit: number;
  /** Kích thước cửa sổ (giây) */
  windowSec: number;
  /** Cách tính key: 'ip' hoặc 'user' (theo sub JWT) */
  keyBy?: 'ip' | 'user';
  /** Prefix nhận biết ngữ cảnh (vd: 'login', 'api') */
  prefix?: string;
}

// Cấu hình mặc định — áp dụng nếu không có @RateLimit trên route
const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 300,
  windowSec: 60,
  keyBy: 'user',
  prefix: 'api',
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config =
      this.reflector.getAllAndOverride<RateLimitConfig>(RATE_LIMIT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_CONFIG;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const key = this.buildKey(config, request);
    const { allowed, remaining, retryAfterSec } = await this.rateLimiter.check(
      key,
      config.limit,
      config.windowSec,
    );

    // Gắn header chuẩn RateLimit (RFC 6585 + GitHub API convention)
    response.setHeader('X-RateLimit-Limit', config.limit);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', retryAfterSec);

    if (!allowed) {
      response.setHeader('Retry-After', retryAfterSec);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfterSec} giây.`,
          retryAfterSec,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private buildKey(config: RateLimitConfig, request: any): string {
    const prefix = config.prefix ?? 'api';
    const keyBy = config.keyBy ?? 'ip';

    if (keyBy === 'ip') {
      const ip = clientIp(request);
      return `${prefix}:ip:${ip}`;
    }

    // keyBy === 'user': dùng JWT sub (đã được decode bởi JwtAuthGuard trước đó)
    const userId = request.user?.sub || request.user?.id || 'anonymous';
    return `${prefix}:user:${userId}`;
  }
}
