import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { parentId, ...rest } = data;
    
    // Simplified logic for nested sets for now
    // In a real scenario, we would calculate lft, rgt, depth
    return this.prisma.category.create({
      data: {
        ...rest,
        parentId: parentId || null,
        lft: 0,
        rgt: 0,
        depth: 0,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  async getTree() {
    // Basic tree retrieval
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true, // Support up to 3 levels for now, or use recursive function
          }
        }
      },
      orderBy: { orderIndex: 'asc' },
    });
    return categories;
  }
}
