import { Injectable } from '@nestjs/common';
import { RedisService } from '../../core/redis/redis.service';
import { randomUUID } from 'crypto';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: Date | string;
  read: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly MAX_FEED_ITEMS = 500;

  constructor(private readonly redisService: RedisService) {}

  async push(
    userId: string | number,
    title: string,
    body: string,
    metadata?: Record<string, any>,
  ): Promise<InAppNotification> {
    const id = `n-${Date.now()}-${randomUUID()}`;
    const timestamp = Date.now();
    const uid = String(userId);

    const n: InAppNotification = {
      id,
      userId: uid,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
      metadata,
    };

    const redis = this.redisService.getClient();
    const pipeline = redis.pipeline();

    // 1. Lưu payload vào HASH
    pipeline.hset('notifications:data', id, JSON.stringify(n));
    // 2. Thêm vào ZSET của User
    pipeline.zadd(`notifications:user:${uid}`, timestamp, id);
    // 3. Auto-Trim giữ lại 500 item mới nhất tránh tràn RAM Redis
    pipeline.zremrangebyrank(
      `notifications:user:${uid}`,
      0,
      -(this.MAX_FEED_ITEMS + 1),
    );

    await pipeline.exec();
    return n;
  }

  async listByUser(
    userId: string | number,
    page: number = 1,
    limit: number = 50,
  ) {
    return this.listByUserOrEmployeeCode(
      userId,
      undefined,
      undefined,
      page,
      limit,
    );
  }

  async listByUserOrEmployeeCode(
    userId: string | number,
    employeeCode?: string,
    email?: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    data: InAppNotification[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const uid = String(userId);
    const redis = this.redisService.getClient();

    const userZset = `notifications:user:${uid}`;
    const employeeZset = employeeCode
      ? `notifications:user:${employeeCode}`
      : null;
    const emailZset = email ? `notifications:user:${email}` : null;

    const fetchZset = async (key: string) => {
      // Lấy toàn bộ IDs (tối đa 500) từ mỗi mảng cùng score
      const result = await redis.zrevrange(key, 0, -1, 'WITHSCORES');
      const pairs: { id: string; score: number }[] = [];
      for (let i = 0; i < result.length; i += 2) {
        pairs.push({ id: result[i], score: parseInt(result[i + 1], 10) });
      }
      return pairs;
    };

    const promises = [fetchZset(userZset)];
    if (employeeZset) promises.push(fetchZset(employeeZset));
    if (emailZset) promises.push(fetchZset(emailZset));

    const results = await Promise.all(promises);
    const mergedMap = new Map<string, number>();
    for (const arr of results) {
      for (const item of arr) {
        mergedMap.set(item.id, item.score);
      }
    }

    // Merge các thông báo (nếu có user thuộc nhiều id/email) và sort giảm dần
    const sortedIds = Array.from(mergedMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    const totalCount = sortedIds.length;
    const start = (page - 1) * limit;
    const paginatedIds = sortedIds.slice(start, start + limit);

    if (paginatedIds.length === 0) {
      return {
        data: [],
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }

    // O(1) query HMGET
    const payloads = await redis.hmget('notifications:data', ...paginatedIds);
    const notifications = payloads
      .map((p) => (p ? JSON.parse(p) : null))
      .filter(Boolean);

    return {
      data: notifications,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async markRead(
    id: string,
    userId: string | number,
    employeeCode?: string,
    email?: string,
  ): Promise<boolean> {
    const redis = this.redisService.getClient();
    const payloadStr = await redis.hget('notifications:data', id);
    if (!payloadStr) return false;

    const n = JSON.parse(payloadStr) as InAppNotification;
    const uid = String(userId);

    if (
      n.userId === uid ||
      (employeeCode && n.userId === employeeCode) ||
      (email && n.userId === email)
    ) {
      n.read = true;
      await redis.hset('notifications:data', id, JSON.stringify(n));
      return true;
    }
    return false;
  }
}
