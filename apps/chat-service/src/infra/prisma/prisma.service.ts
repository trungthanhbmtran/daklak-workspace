import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');
    const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
    const adapter = new PrismaMariaDb(mariadbUrl);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to Database successfully');
    } catch (e) {
      this.logger.error('Failed to connect to Database', e);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
