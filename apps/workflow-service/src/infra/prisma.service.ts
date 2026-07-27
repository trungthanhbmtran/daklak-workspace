import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client'


/**
 * PrismaService - Chuẩn Prisma 7.x
 *
 * Prisma 7 bắt buộc sử dụng Driver Adapter thay vì kết nối trực tiếp.
 * Với MariaDB/MySQL, dùng `@prisma/adapter-mariadb`.
 *
 * DATABASE_URL format: mysql://user:password@host:port/dbname
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');
    const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
    const adapter = new PrismaMariaDb(mariadbUrl);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
