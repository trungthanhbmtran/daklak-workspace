import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class AppCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppCacheService.name);
  private redisClient: Redis;
  private readonly DEFAULT_TTL_MS = 3600 * 1000; // 1 hour

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl);
    this.redisClient.on('connect', () => this.logger.log('Connected to Redis'));
    this.redisClient.on('error', (err) => this.logger.error('Redis error', err));
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (e) {
      this.logger.error(`Error getting cache for key ${key}`, e);
      return null;
    }
  }

  async set(key: string, data: any, ttlMs: number = this.DEFAULT_TTL_MS): Promise<void> {
    try {
      await this.redisClient.set(key, JSON.stringify(data), 'PX', ttlMs);
    } catch (e) {
      this.logger.error(`Error setting cache for key ${key}`, e);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (e) {
      this.logger.error(`Error deleting cache for key ${key}`, e);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redisClient.flushdb();
    } catch (e) {
      this.logger.error('Error clearing cache', e);
    }
  }
}
