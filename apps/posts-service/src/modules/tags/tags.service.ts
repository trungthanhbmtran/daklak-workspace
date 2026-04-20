import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string }) {
    const slug = data.name.toLowerCase().replace(/ /g, '-');
    return this.prisma.tag.upsert({
      where: { name: data.name },
      update: {},
      create: {
        name: data.name,
        slug,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.prisma.tag.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    });
  }
}
