// apps/user-service/src/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mysql from 'mysql2'; // 🔹 Sử dụng import chuẩn (không /promise)
import { ConfigService } from '@nestjs/config';

const extendedClient = (config: ConfigService) => {
  const url = config.get<string>('DATABASE_URL');
  if (!url) {
    throw new Error('❌ DATABASE_URL missing in .env');
  }

  const pool = mysql.createPool(url);
  const adapter = new PrismaMariaDb(pool as any);

  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const duration = Date.now() - start;
        if (duration > 200) {
          console.warn(`⚠️ [Slow Query] ${model}.${operation} took ${duration}ms`);
        }
        return result;
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof extendedClient>;

@Injectable()
export class PrismaService extends (PrismaClient as any) implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super();
    return extendedClient(config) as any;
  }

  async onModuleInit() {
    await (this as any).$connect();
  }

  async onModuleDestroy() {
    await (this as any).$disconnect();
  }
}

export interface PrismaService extends ExtendedPrismaClient { }

