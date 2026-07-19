import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>('DATABASE_URL');
    const adapter = new PrismaMariaDb(url);
    super({ adapter });
  }

  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).$use(async (params: any, next: any) => {
      const softDeleteModels = ['Task', 'TaskStep', 'TaskAttachment', 'TaskComment', 'Employee'];
      
      if (params.model && softDeleteModels.includes(params.model)) {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst';
          params.args = params.args || {};
          params.args.where = { ...params.args.where, isDeleted: false };
        }
        if (params.action === 'findMany' || params.action === 'count' || params.action === 'aggregate') {
          params.args = params.args || {};
          params.args.where = { ...params.args.where, isDeleted: false };
        }
        // Soft delete logic for delete/deleteMany
        if (params.action === 'delete') {
          params.action = 'update';
          params.args = params.args || {};
          params.args.data = { isDeleted: true };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          params.args = params.args || {};
          params.args.data = { isDeleted: true };
        }
      }
      return next(params);
    });
    
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
