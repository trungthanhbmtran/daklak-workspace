import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { paginateArray } from '../../../../../shared/utils/pagination.util';

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
    const allTags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    const paginated = paginateArray(allTags, page, limit);
    return { data: paginated.data, meta: paginated.meta };
  }
}
