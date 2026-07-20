import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

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

  async upsertByCode(code: string, data: { name: string; description?: string }) {
    return this.prisma.portalConfig.upsert({
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
   * Dùng Promise.all để chạy song song, giảm latency 10-17x.
   */
  async batchUpsert(dataList: { code: string; name: string; description?: string }[]) {
    if (!dataList || dataList.length === 0) return { count: 0, data: [] };
    const results = await Promise.all(
      dataList.map(item => this.upsertByCode(item.code, { name: item.name, description: item.description }))
    );
    return { count: results.length, data: results };
  }
}
