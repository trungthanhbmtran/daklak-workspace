import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PortalMenuService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.portalMenu.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        link: data.link,
        order: data.order || 0,
        parentId: data.parentId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        target: data.target || '_self',
        type: data.type || 'URL',
        referenceId: data.referenceId,
        position: data.position || 'HORIZONTAL',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.portalMenu.findUnique({
      where: { id },
      include: { children: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(onlyActive = false, position?: string) {
    const where: any = { parentId: null };
    if (onlyActive) where.isActive = true;
    if (position && position !== 'ALL') where.position = position;

    return this.prisma.portalMenu.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { 
        children: { 
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        } 
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.portalMenu.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.portalMenu.delete({ where: { id } });
    return { success: true };
  }
}
