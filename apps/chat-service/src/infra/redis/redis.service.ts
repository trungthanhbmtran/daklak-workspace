import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.client.on('connect', () => {
      this.logger.log('Connected to Redis successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  // Presence
  async setUserOnline(userId: string, socketId: string) {
    await this.client.hset('presence:online', userId, socketId);
    await this.client.set(`presence:last_seen:${userId}`, Date.now().toString());
  }

  async setUserOffline(userId: string) {
    await this.client.hdel('presence:online', userId);
    await this.client.set(`presence:last_seen:${userId}`, Date.now().toString());
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const exists = await this.client.hexists('presence:online', userId);
    return exists === 1;
  }

  // Typing
  async setUserTyping(conversationId: string, userId: string) {
    const key = `typing:${conversationId}`;
    await this.client.sadd(key, userId);
    await this.client.expire(key, 10); // Auto expire after 10 seconds
  }

  async stopUserTyping(conversationId: string, userId: string) {
    const key = `typing:${conversationId}`;
    await this.client.srem(key, userId);
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    return this.client.smembers(`typing:${conversationId}`);
  }
}
