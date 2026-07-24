import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class PresenceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PresenceService.name);
  private redisClient: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redisClient = new Redis(url);
    this.logger.log('Connected to Redis for Presence');
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async setUserOnline(userId: string) {
    await this.redisClient.set(`online:${userId}`, 'true');
    await this.redisClient.set(`last_seen:${userId}`, new Date().toISOString());
  }

  async setUserOffline(userId: string) {
    await this.redisClient.del(`online:${userId}`);
    await this.redisClient.set(`last_seen:${userId}`, new Date().toISOString());
  }

  async setTyping(userId: string, conversationId: string) {
    // Typing expires in 5 seconds
    await this.redisClient.setex(`typing:${conversationId}:${userId}`, 5, 'true');
  }

  async getPresence(userIds: string[]) {
    const pipeline = this.redisClient.pipeline();
    userIds.forEach(id => {
      pipeline.get(`online:${id}`);
      pipeline.get(`last_seen:${id}`);
    });
    
    const results = await pipeline.exec();
    const presenceMap = new Map<string, any>();
    
    if (results) {
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const isOnline = results[i * 2]?.[1] === 'true';
        const lastSeen = results[i * 2 + 1]?.[1];
        
        presenceMap.set(userId, {
          userId,
          status: isOnline ? 'ONLINE' : 'OFFLINE',
          lastSeen: lastSeen || null
        });
      }
    }
    
    return Array.from(presenceMap.values());
  }
}
