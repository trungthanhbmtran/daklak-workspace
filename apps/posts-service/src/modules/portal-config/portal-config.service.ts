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
}
