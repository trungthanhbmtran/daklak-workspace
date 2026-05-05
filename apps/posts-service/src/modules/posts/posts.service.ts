import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowService, PostStatus } from '../workflow/workflow.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private workflowService: WorkflowService,
    @Inject('TRANSLATE_MQ_CLIENT') private mqClient: ClientProxy,
  ) { }

  private async triggerTranslation(post: any) {
    if (!post.content) return;

    // Danh sách ngôn ngữ đích cần dịch sang (ngoại trừ tiếng Việt)
    // Theo yêu cầu mới: chỉ dịch sang tiếng Anh
    const targetLanguages = ['en'];

    for (const langCode of targetLanguages) {
      // Đẩy vào queue translation_request
      this.mqClient.emit('translation_request', {
        postId: post.id,
        content: post.content,
        targetLang: langCode,
        title: post.title,
        description: post.description,
      });
      console.log(`[PostsService] Pushed translation request for post ${post.id} to ${langCode}`);
    }
  }

  async create(data: any) {
    const { tagIds, translations, ...rest } = data;
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

    // 1. Lưu bản dịch vào bảng PostTranslation
    if (translations) {
      const translationEntries = typeof translations === 'string' ? JSON.parse(translations) : translations;
      for (const [langCode, trans] of Object.entries(translationEntries)) {
        const t = trans as any;
        await this.prisma.postTranslation.create({
          data: {
            postId: post.id,
            langCode,
            title: t.title || post.title,
            slug: t.slug || "",
            description: t.description || "",
            content: t.content || "",
            version: 1,
            mainVersionRef: 1,
            isPublished: post.status === PostStatus.PUBLISHED
          }
        });
      }
    }

    // 2. Create initial version
    await this.prisma.postVersion.create({
      data: {
        postId: post.id,
        version: 1,
        title: post.title,
        description: post.description,
        content: post.content,
        contentJson: post.contentJson,
        editorId: post.authorId,
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

    await this.triggerTranslation(post);

    return post;
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
      include: {
        tags: true,
        category: true,
        translations_rel: {
          orderBy: { version: 'desc' }
        }
      },
    });
    if (!post) throw new NotFoundException('Post not found');

    // Format lại translations từ bảng PostTranslation để tương thích với Frontend
    const latestTranslations: any = {};
    if (post.translations_rel) {
      // Chỉ lấy bản mới nhất của từng ngôn ngữ
      post.translations_rel.forEach(trans => {
        if (!latestTranslations[trans.langCode]) {
          latestTranslations[trans.langCode] = trans;
        }
      });
    }

    return {
      ...post,
      translations: latestTranslations
    };
  }

  async update(id: string, data: any) {
    const { tagIds, actorId, changeNote, translations, ...rest } = data;

    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { translations_rel: true }
    });
    if (!post) throw new NotFoundException('Post not found');

    const nextVersion = post.currentVersion + 1;
    let parsedTranslations = translations;
    if (translations && typeof translations === 'string') {
      try {
        parsedTranslations = JSON.parse(translations);
      } catch (e) {
        console.error('Error parsing translations in post update:', e);
      }
    }

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

    // 1. Xử lý lưu bản dịch vào bảng PostTranslation với versioning
    if (parsedTranslations) {
      for (const [langCode, trans] of Object.entries(parsedTranslations)) {
        const t = trans as any;
        // Tìm bản dịch hiện tại của ngôn ngữ này
        const existingTrans = await this.prisma.postTranslation.findFirst({
          where: { postId: id, langCode },
          orderBy: { version: 'desc' }
        });

        // Kiểm tra xem có thay đổi nội dung dịch không
        const isChanged = !existingTrans ||
          existingTrans.title !== t.title ||
          existingTrans.content !== t.content ||
          existingTrans.description !== t.description;

        if (isChanged) {
          await this.prisma.postTranslation.create({
            data: {
              postId: id,
              langCode,
              title: t.title || updatedPost.title,
              slug: t.slug || "",
              description: t.description || "",
              content: t.content || "",
              version: existingTrans ? existingTrans.version + 1 : 1,
              mainVersionRef: nextVersion,
              isPublished: updatedPost.status === PostStatus.PUBLISHED
            }
          });
        }
      }
    }

    // 2. Create new version
    await this.prisma.postVersion.create({
      data: {
        postId: id,
        version: nextVersion,
        title: updatedPost.title,
        description: updatedPost.description,
        content: updatedPost.content,
        contentJson: updatedPost.contentJson,
        editorId: actorId || updatedPost.authorId,
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

    await this.triggerTranslation(updatedPost);

    return updatedPost;
  }
  async findBySlug(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, isDeleted: false, status: PostStatus.PUBLISHED },
      include: {
        tags: true,
        category: true,
        translations_rel: {
          orderBy: { version: 'desc' }
        }
      },
    });
    if (!post) return null;

    // Format translations
    const latestTranslations: any = {};
    if (post.translations_rel) {
      post.translations_rel.forEach(trans => {
        if (!latestTranslations[trans.langCode]) {
          latestTranslations[trans.langCode] = trans;
        }
      });
    }

    return { ...post, translations: latestTranslations };
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
          translations_rel: {
            select: { langCode: true, version: true } // Chỉ lấy thông tin cần thiết cho list
          }
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Format lại translations cho từng item để Frontend hiển thị được badge ngôn ngữ
    const formattedItems = items.map(post => {
      const translations: any = {};
      if (post.translations_rel) {
        post.translations_rel.forEach(trans => {
          if (!translations[trans.langCode]) {
            translations[trans.langCode] = trans;
          }
        });
      }
      return { ...post, translations };
    });

    return {
      data: formattedItems,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async updateTranslation(postId: string, langCode: string, data: { title?: string, description?: string, content?: string, slug?: string }) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { translations_rel: true }
    });
    if (!post) return;

    // Lấy bản dịch hiện tại
    const existingTrans = await this.prisma.postTranslation.findFirst({
      where: { postId, langCode },
      orderBy: { version: 'desc' }
    });

    const nextTransVersion = existingTrans ? existingTrans.version + 1 : 1;

    // Tạo bản dịch mới
    const newTrans = await this.prisma.postTranslation.create({
      data: {
        postId,
        langCode,
        title: data.title || (existingTrans?.title || post.title),
        slug: data.slug || existingTrans?.slug || "",
        description: data.description || existingTrans?.description || "",
        content: data.content || existingTrans?.content || "",
        version: nextTransVersion,
        mainVersionRef: post.currentVersion,
        isPublished: post.status === PostStatus.PUBLISHED
      }
    });

    return newTrans;
  }
}

