import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl);
    
    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis error', err);
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  getClient(): Redis {
    return this.redisClient;
  }

  // Tiện ích Cache Presence / Typing
  async setPresence(userId: string, status: string, ttl?: number) {
    const key = `presence:${userId}`;
    if (ttl) {
      await this.redisClient.set(key, status, 'EX', ttl);
    } else {
      await this.redisClient.set(key, status);
    }
  }

  async getPresence(userId: string) {
    return await this.redisClient.get(`presence:${userId}`);
  }
}
