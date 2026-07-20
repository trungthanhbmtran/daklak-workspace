import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

/**
 * PrismaService - Chuẩn Prisma 7.x
 *
 * Prisma 7 bắt buộc sử dụng Driver Adapter thay vì kết nối trực tiếp.
 * Với MariaDB/MySQL, dùng `@prisma/adapter-mariadb`.
 *
 * DATABASE_URL format: mysql://user:password@host:port/dbname
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Prisma 7 + @prisma/adapter-mariadb:
    // PrismaMariaDb nhận PoolConfig object hoặc URL string trực tiếp.
    // KHÔNG cần gọi createPool() trước.
    const url = new URL(dbUrl);
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', ''),
      connectionLimit: 10,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
