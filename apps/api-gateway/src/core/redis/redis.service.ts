import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import {
  getAuthPolicy,
  TOUCH_AUTH_SESSION,
} from '../../../../../shared/core/auth-session';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  private hasLoggedError = false;
  private readonly authPolicy = getAuthPolicy();

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
      db: parseInt(process.env.REDIS_DB || '0', 10),
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      commandTimeout: 5000,
      retryStrategy: (times) => {
        return Math.min(times * 500, 5000);
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
      this.hasLoggedError = false;
    });

    this.redis.on('error', (err) => {
      if (!this.hasLoggedError) {
        this.logger.error('Redis error', err);
        this.hasLoggedError = true;
      }
    });
  }

  async touchAuthSession(sessionId: string, userId: string): Promise<boolean> {
    const idle = this.authPolicy.idleSeconds;
    return (
      Number(
        await this.redis.eval(
          TOUCH_AUTH_SESSION,
          2,
          'auth:session:' + sessionId,
          'auth:user:version:' + userId,
          userId,
          idle,
        ),
      ) === 1
    );
  }

  getClient(): Redis {
    return this.redis;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      return this.redis.del(...keys);
    }
    return 0;
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
