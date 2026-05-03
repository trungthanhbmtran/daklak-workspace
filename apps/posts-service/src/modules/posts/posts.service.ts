import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowService, PostStatus } from '../workflow/workflow.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private workflowService: WorkflowService,
  ) { }

  async create(data: any) {
    const { tagIds, ...rest } = data;
    const slug = rest.slug || rest.title.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const post = await this.prisma.post.create({
      data: {
        ...rest,
        slug,
        status: PostStatus.DRAFT,
        tags: {
          connect: tagIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        tags: true,
        category: true,
      },
    });

    // Create initial version
    await this.prisma.postVersion.create({
      data: {
        postId: post.id,
        version: 1,
        title: post.title,
        description: post.description,
        content: post.content,
        contentJson: post.contentJson,
        editorId: post.authorId,
        authorName: post.authorName,
        source: post.source,
        language: post.language,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        seoKeywords: post.seoKeywords,
        changeNote: 'Initial creation',
      },
    });

    await this.auditService.log({
      postId: post.id,
      actorId: post.authorId,
      action: 'CREATE_POST',
      entityId: post.id,
      metadata: { title: post.title },
    });

    return post;
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
      include: {
        tags: true,
        category: true,
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findBySlug(slug: string) {
    return this.prisma.post.findFirst({
      where: { slug, isDeleted: false, status: PostStatus.PUBLISHED },
      include: {
        tags: true,
        category: true,
      },
    });
  }

  async findAll(query: any) {
    const { authorId, categoryId, search, status } = query;
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

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

    return {
      data: items,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: any) {
    const { tagIds, actorId, changeNote, ...rest } = data;

    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const nextVersion = post.currentVersion + 1;

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...rest,
        currentVersion: nextVersion,
        tags: tagIds ? {
          set: tagIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        tags: true,
        category: true,
      },
    });

    // Create new version
    await this.prisma.postVersion.create({
      data: {
        postId: id,
        version: nextVersion,
        title: updatedPost.title,
        description: updatedPost.description,
        content: updatedPost.content,
        contentJson: updatedPost.contentJson,
        editorId: actorId || updatedPost.authorId,
        authorName: updatedPost.authorName,
        source: updatedPost.source,
        language: updatedPost.language,
        seoTitle: updatedPost.seoTitle,
        seoDescription: updatedPost.seoDescription,
        seoKeywords: updatedPost.seoKeywords,
        changeNote: changeNote || 'Updated content',
      },
    });

    await this.auditService.log({
      postId: id,
      actorId: actorId || updatedPost.authorId,
      action: 'UPDATE_POST',
      entityId: id,
      metadata: { version: nextVersion, changeNote },
    });

    return updatedPost;
  }

  async remove(id: string, actorId?: string) {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await this.auditService.log({
      postId: id,
      actorId: actorId || 'system',
      action: 'DELETE_POST',
      entityId: id,
    });

    return post;
  }

  // Workflow wrappers
  async submit(id: string, actorId: string, note?: string) {
    return this.workflowService.submit(id, actorId, note);
  }

  async review(id: string, actorId: string, note?: string) {
    return this.workflowService.review(id, actorId, note);
  }

  async approve(id: string, actorId: string, note?: string) {
    return this.workflowService.approve(id, actorId, note);
  }

  async reject(id: string, actorId: string, note?: string) {
    return this.workflowService.reject(id, actorId, note);
  }

  async publish(id: string, actorId: string, note?: string) {
    return this.workflowService.publish(id, actorId, note);
  }

  async unpublish(id: string, actorId: string, note?: string) {
    return this.workflowService.unpublish(id, actorId, note);
  }

  async archive(id: string, actorId: string, note?: string) {
    return this.workflowService.archive(id, actorId, note);
  }

  async getHistory(id: string) {
    return this.prisma.postVersion.findMany({
      where: { postId: id },
      orderBy: { version: 'desc' },
    });
  }
}

