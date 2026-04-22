import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    const { tagIds, ...rest } = data;
    const slug = rest.title.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    return this.prisma.post.create({
      data: {
        ...rest,
        slug,
        tags: {
          connect: tagIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        tags: true,
        category: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        tags: true,
        category: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug },
      include: {
        tags: true,
        category: true,
      },
    });
  }

  async findAll(query: any) {
    const { authorId, categoryId, search } = query;
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
          category: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    console.log('items', items);
    console.log('total', total);

    return { items, total };
  }

  async update(id: string, data: any) {
    const { tagIds, ...rest } = data;

    // Logic for updating tags: disconnect all and connect new ones (simplest way)
    return this.prisma.post.update({
      where: { id },
      data: {
        ...rest,
        tags: tagIds ? {
          set: tagIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        tags: true,
        category: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  async review(data: any) {
    const { id, status, note } = data;
    return this.prisma.post.update({
      where: { id },
      data: {
        status,
        moderationNote: note,
      },
      include: {
        tags: true,
        category: true,
      },
    });
  }
}
