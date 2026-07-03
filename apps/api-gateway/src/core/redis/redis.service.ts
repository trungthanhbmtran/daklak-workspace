import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  private hasLoggedError = false;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times) => {
        // Chỉ retry tối đa 3 lần nếu không có Redis, tránh spam log console
        if (times > 3) return null;
        return Math.min(times * 500, 2000);
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

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
