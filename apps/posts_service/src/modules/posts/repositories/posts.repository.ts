import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Post, Prisma } from '@generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { QueryPostDto } from '../dto/query-post.dto';

@Injectable()
export class PostsRepository extends BaseRepository<
  Post,
  CreatePostDto,
  UpdatePostDto,
  QueryPostDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.post);
  }

  protected prepareQuery(query: QueryPostDto): {
    skip?: number;
    take?: number;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  } {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);
    const take = query.limit || 10;
    const where: Prisma.PostWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.categorySlug) {
      where.category = {
        slug: query.categorySlug.startsWith('/')
          ? query.categorySlug
          : `/${query.categorySlug}`,
      };
    }

    if (query.status) {
      where.status = query.status as Prisma.EnumPostStatusFilter;
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    return {
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
    };
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async create(data: CreatePostDto): Promise<Post> {
    const { tagIds, ...postData } = data;
    return this.prisma.post.create({
      data: {
        ...(postData as Prisma.PostUncheckedCreateInput),
        tags: tagIds
          ? {
              connect: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async update(id: string, data: UpdatePostDto): Promise<Post> {
    const { tagIds, ...updateData } = data;
    return this.prisma.post.update({
      where: { id },
      data: {
        ...(updateData as Prisma.PostUpdateInput),
        tags: tagIds
          ? {
              set: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findMany(query: QueryPostDto) {
    const { skip, take, where, orderBy } = this.prepareQuery(query);
    const [rows, count] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          tags: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);
    return { rows, count };
  }

  async addTags(postId: string, tagIds: string[]) {
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: { tags: true },
    });
  }

  async removeTag(postId: string, tagId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
      include: { tags: true },
    });
  }

  async getTags(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { tags: true },
    });
    return post?.tags || [];
  }

  async setCategory(postId: string, categoryId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { categoryId },
      include: { category: true },
    });
  }

  async findByCategorySlug(slug: string) {
    return this.prisma.post.findMany({
      where: {
        category: { slug },
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
