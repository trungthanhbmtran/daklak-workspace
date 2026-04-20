import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/ /g, '-');
    return this.prisma.banner.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.banner.findUnique({
      where: { id },
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, position, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (position) where.position = position;
    if (status !== undefined) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.banner.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, data: any) {
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
