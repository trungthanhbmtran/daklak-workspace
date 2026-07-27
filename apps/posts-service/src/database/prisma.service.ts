import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { softDeleteExtension } from './extensions/soft-delete.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    const client = this.$extends(softDeleteExtension);
    (client as any).onModuleInit = async () => {
      await this.$connect();
    };
    (client as any).onModuleDestroy = async () => {
      await this.$disconnect();
    };
    return client as unknown as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
