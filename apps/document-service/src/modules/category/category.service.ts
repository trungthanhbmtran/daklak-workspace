import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    const slug = data.slug || this.generateSlug(data.name);
    const category = await this.prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });
    return { data: this.mapToProto(category) };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    return this.mapToProto(category);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, type } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }
    if (type) {
      where.type = type;
    }

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: items.map(item => this.mapToProto(item)),
      meta: {
        pagination: {
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async update(id: string, data: any) {
    const updateData = { ...data };
    delete updateData.id;
    if (updateData.name && !updateData.slug) {
      updateData.slug = this.generateSlug(updateData.name);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });
    return { data: this.mapToProto(category) };
  }

  async remove(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  private mapToProto(cat: any) {
    if (!cat) return null;
    return {
      ...cat,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    };
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
