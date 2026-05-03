import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { buildTree } from '@/common/utils/tree.util';

@Injectable()
export class PortalMenuService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.portalMenu.create({
      data: {
        ...data,
        status: data.status ?? true,
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.portalMenu.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Portal menu not found');
    return item;
  }

  async findAll(query: any) {
    const { position, activeOnly } = query;
    return this.prisma.portalMenu.findMany({
      where: {
        ...(position && { position }),
        ...(activeOnly === true && { status: true }),
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.portalMenu.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.portalMenu.delete({ where: { id } });
  }

  async getTree(position?: string) {
    const items = await this.prisma.portalMenu.findMany({
      where: {
        ...(position && { position }),
        status: true,
      },
      orderBy: { orderIndex: 'asc' },
    });
    return buildTree(items, null);
  }
}
