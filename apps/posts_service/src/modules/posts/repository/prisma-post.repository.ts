import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IPostRepository } from '../domain/post.repository.interface';
import { Post } from '../domain/post.entity';
import { PostMapper } from '../mapper/post.mapper';
import { QueryPostDto } from '../dto/query-post.dto';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class PrismaPostRepository implements IPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(post: Post): Promise<Post> {
    const data = PostMapper.toPersistence(post);
    const created = await this.prisma.post.create({
      data,
      include: {
        category: true,
        tags: true,
      },
    });
    return PostMapper.toDomain(created)!;
  }

  async update(id: string, post: Partial<Post>): Promise<Post> {
    const updateData = post instanceof Post 
      ? PostMapper.toPersistence(post)
      : this.mapPartialPostToPrisma(post);

    const updated = await this.prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: true,
      },
    });
    return PostMapper.toDomain(updated)!;
  }

  async findById(id: string): Promise<Post | null> {
    const found = await this.prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
      },
    });
    return PostMapper.toDomain(found);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const found = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
      },
    });
    return PostMapper.toDomain(found);
  }

  async findAll(query: QueryPostDto): Promise<{ rows: Post[]; count: number }> {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);
    const take = query.limit || 10;
    const where: Prisma.PostWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const [rows, count] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          tags: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      rows: rows.map(PostMapper.toDomain) as Post[],
      count,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }

  async addTags(postId: string, tagIds: string[]): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });
  }

  async removeTag(postId: string, tagId: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });
  }

  async setCategory(postId: string, categoryId: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: { categoryId },
    });
  }

  async findByCategorySlug(slug: string): Promise<Post[]> {
    const rows = await this.prisma.post.findMany({
      where: {
        category: { slug },
      },
      include: {
        category: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(PostMapper.toDomain) as Post[];
  }

  private mapPartialPostToPrisma(partial: any): Prisma.PostUpdateInput {
    // Helper to map partial domain-like updates to Prisma
    const result: any = { ...partial };
    if (partial.status) {
      // Logic for status mapping if needed
    }
    return result;
  }
}
