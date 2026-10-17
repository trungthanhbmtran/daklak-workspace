import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PortalConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { code: string; name: string; description?: string }) {
    return this.prisma.portalConfig.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      },
    });
  }

  async findOneByCode(code: string) {
    return this.prisma.portalConfig.findUnique({
      where: { code },
    });
  }

  async findAll() {
    return this.prisma.portalConfig.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async update(id: number, data: { code?: string; name?: string; description?: string }) {
    return this.prisma.portalConfig.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  async upsertByCode(
    code: string,
    data: { name: string; description?: string },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.portalConfig.upsert({
      where: { code },
      update: {
        name: data.name,
        description: data.description,
      },
      create: {
        code,
        name: data.name,
        description: data.description,
      },
    });
  }

  /**
   * Upsert nhiều config trong 1 lần — thay thế pattern client gọi N requests tuần tự.
   * Ledger #32: bọc trong 1 $transaction để các upsert là atomic (tránh partial-fail
   * khi một code trùng/unique conflict ở giữa batch).
   */
  async batchUpsert(dataList: { code: string; name: string; description?: string }[]) {
    if (!dataList || dataList.length === 0) return { count: 0, data: [] };
    const results = await this.prisma.$transaction(async (tx) => {
      const upserted = await Promise.all(
        dataList.map(item =>
          this.upsertByCode(item.code, { name: item.name, description: item.description }, tx as Prisma.TransactionClient),
        ),
      );
      return upserted;
    });
    return { count: results.length, data: results };
  }
}
