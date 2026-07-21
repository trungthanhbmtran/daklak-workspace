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

    const softDeleteModels = ['Task', 'TaskStep', 'TaskAttachment', 'TaskComment', 'Employee'];

    const client = this.$extends({
      query: {
        $allModels: {
          async findMany({ model, args, query }) {
            if (model && softDeleteModels.includes(model as string)) {
              args.where = { ...args.where, isDeleted: false };
            }
            return query(args);
          },
          async findFirst({ model, args, query }) {
            if (model && softDeleteModels.includes(model as string)) {
              args.where = { ...args.where, isDeleted: false };
            }
            return query(args);
          },
          async findUnique({ model, args, query }) {
            if (model && softDeleteModels.includes(model as string)) {
              const result = await query(args);
              if (result && (result as any).isDeleted) {
                return null;
              }
              return result;
            }
            return query(args);
          },
          async count({ model, args, query }) {
            if (model && softDeleteModels.includes(model as string)) {
              args.where = { ...args.where, isDeleted: false };
            }
            return query(args);
          },
          async aggregate({ model, args, query }) {
            if (model && softDeleteModels.includes(model as string)) {
              args.where = { ...args.where, isDeleted: false };
            }
            return query(args);
          },
          async delete({ model, args, query }) {
            if (model && softDeleteModels.includes(model as string)) {
              return (client as any)[model].update({
                ...args,
                data: { isDeleted: true },
              });
            }
            return query(args);
          },
          async deleteMany({ model, args, query }) {
            if (model && softDeleteModels.includes(model as string)) {
              return (client as any)[model].updateMany({
                ...args,
                data: { isDeleted: true },
              });
            }
            return query(args);
          },
        },
      },
    });

    (client as any).onModuleInit = async () => {
      await client.$connect();
    };

    (client as any).onModuleDestroy = async () => {
      await client.$disconnect();
    };

    return client as unknown as this;
  }

  async onModuleInit() {
    // This will be overridden by the proxy returned from constructor
    await this.$connect();
  }

  async onModuleDestroy() {
    // This will be overridden by the proxy returned from constructor
    await this.$disconnect();
  }
}
