import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowService, PostStatus } from '../workflow/workflow.service';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { generateSlug } from '../../utils/slug.util';
import { paginateArray } from '../../../../../shared/utils/pagination.util';

@Injectable()
export class PostsService implements OnModuleInit {
  private categoryService: any;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private workflowService: WorkflowService,
    @Inject('TRANSLATE_MQ_CLIENT') private mqClient: ClientProxy,
    @Inject('CATEGORY_PACKAGE') private client: ClientGrpc,
  ) {
    console.log('[PostsService] Constructor called');
  }

  onModuleInit() {
    this.categoryService = this.client.getService<any>('CategoryService');
    const methods = Object.keys(this.categoryService || {});
    console.log('[PostsService] CategoryService initialized. Available methods:', methods);
    if (!this.categoryService.getByGroup) {
      console.error('[PostsService] CRITICAL: getByGroup method NOT FOUND in CategoryService. This might be a gRPC naming collision!');
    }
  }

  /**
   * Chuyển đổi cấu trúc Lexical JSON sang HTML cơ bản để render ở Portal
   */
  private lexicalToHtml(jsonString: string): string {
    if (!jsonString) return '';

    const trimmed = jsonString.trim();
    // Nếu là HTML nguyên bản (bắt đầu bằng < hoặc chứa thẻ HTML điển hình), trả về nguyên trạng
    if (trimmed.startsWith('<') || trimmed.includes('<html') || trimmed.includes('<div') || trimmed.includes('<p') || trimmed.includes('<section')) {
      return jsonString;
    }

    try {
      // Nếu không phải JSON (văn bản thuần), trả về chính nó bọc trong thẻ p
      if (!trimmed.startsWith('{')) return `<p>${jsonString}</p>`;

      const data = JSON.parse(jsonString);
      if (!data.root || !data.root.children) return '';

      const renderNode = (node: any): string => {
        if (node.type === 'text') {
          let text = node.text || '';
          // Xử lý format (1: Bold, 2: Italic, 8: Underline, 16: Strikethrough)
          if (node.format & 1) text = `<strong>${text}</strong>`;
          if (node.format & 2) text = `<em>${text}</em>`;
          if (node.format & 8) text = `<span style="text-decoration: underline;">${text}</span>`;
          if (node.format & 16) text = `<strike>${text}</strike>`;
          return text;
        }

        if (node.children) {
          const childrenHtml = node.children.map((child: any) => renderNode(child)).join('');

          switch (node.type) {
            case 'paragraph': return `<p>${childrenHtml}</p>`;
            case 'list': return node.tag === 'ol' ? `<ol>${childrenHtml}</ol>` : `<ul>${childrenHtml}</ul>`;
            case 'listitem': return `<li>${childrenHtml}</li>`;
            case 'heading': return `<${node.tag}>${childrenHtml}</${node.tag}>`;
            case 'quote': return `<blockquote>${childrenHtml}</blockquote>`;
            case 'link': return `<a href="${node.url}">${childrenHtml}</a>`;
            default: return childrenHtml;
          }
        }
        return '';
      };

      return data.root.children.map((node: any) => renderNode(node)).join('');
    } catch (e) {
      console.error('[PostsService] Error converting Lexical to HTML:', e);
      return jsonString; // Trả về gốc nếu lỗi
    }
  }

  /**
   * Translates only the content inside <text>...</text> tags in a string using a provided translate function.
   * If no <text> tags are present, it falls back to translating the entire string block.
   */
  public async translateOnlyTextTags(text: string, translateFn: (s: string) => Promise<string>): Promise<string> {
    if (!text) return text;

    const pattern = /(<text\b[^>]*>)(.*?)(<\/text>)/gs;
    const matches = [...text.matchAll(pattern)];

    if (matches.length === 0) {
      // Fallback to translating the whole string block if no <text> tags are found
      return translateFn(text);
    }

    let result = text;
    // Replace each match individually so we can do async translation
    for (const match of matches) {
      const fullMatch = match[0];
      const openTag = match[1];
      const content = match[2];
      const closeTag = match[3];

      if (content.trim()) {
        const translatedContent = await translateFn(content);
        result = result.replace(fullMatch, `${openTag}${translatedContent}${closeTag}`);
      }
    }
    return result;
  }

  /**
   * Recursively traverses Lexical JSON tree and translates any text node using translateOnlyTextTags.
   */
  public async translateLexicalRecursive(data: any, translateFn: (s: string) => Promise<string>): Promise<any> {
    if (!data) return data;

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        data[i] = await this.translateLexicalRecursive(data[i], translateFn);
      }
    } else if (typeof data === 'object') {
      if (data.type === 'text' && typeof data.text === 'string') {
        data.text = await this.translateOnlyTextTags(data.text, translateFn);
      }

      for (const key of Object.keys(data)) {
        if (typeof data[key] === 'object' && data[key] !== null) {
          data[key] = await this.translateLexicalRecursive(data[key], translateFn);
        }
      }
    }

    return data;
  }

  private async getTargetLanguages(): Promise<string[]> {
    try {
      // Gọi gRPC sang user-service để lấy danh mục ngôn ngữ
      const response: any = await firstValueFrom(
        this.categoryService.getByGroup({ group: 'LANGUAGE' })
      );

      // Đảm bảo lấy được mảng data, nếu không có thì trả về mảng rỗng
      const langs = response?.data || [];

      // Lọc bỏ tiếng Việt (ngôn ngữ gốc) và chỉ lấy ngôn ngữ đang active
      return langs
        .filter((l: any) => l && l.code && l.code !== 'vi' && (l.active === 1 || l.active === true))
        .map((l: any) => l.code);
    } catch (error) {
      console.error('[PostsService] Error fetching languages from user-service gRPC:', error);
      // Fallback về các ngôn ngữ mặc định nếu gRPC lỗi
      return ['en', 'ede'];
    }
  }

  private async triggerTranslation(post: any) {
    if (!post.content) return;

    // Lấy danh sách ngôn ngữ đích từ danh mục dùng chung
    const targetLanguages = await this.getTargetLanguages();

    for (const langCode of targetLanguages) {
      // Đẩy nội dung (Lexical JSON hoặc Text) vào queue translation_request
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
    const slug = rest.slug || generateSlug(rest.title);

    const post = await this.prisma.post.create({
      data: {
        title: rest.title,
        description: rest.description,
        content: rest.content,
        contentHtml: this.lexicalToHtml(rest.content || ''),
        thumbnail: rest.thumbnail,
        authorId: rest.authorId || rest.actorId || '1', // Default to '1' if not provided
        categoryId: rest.categoryId,
        isFeatured: rest.isFeatured ?? false,
        isNotification: rest.isNotification ?? false,
        isCommentAllowed: rest.isCommentAllowed ?? true,
        slug,
        status: rest.status || PostStatus.DRAFT,
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
      const targetLangs = await this.getTargetLanguages();

      for (const [langCode, trans] of Object.entries(translationEntries)) {
        const t = trans as any;
        const isAuto = targetLangs.includes(langCode);

        await this.prisma.postTranslation.create({
          data: {
            postId: post.id,
            langCode,
            // Nếu là ngôn ngữ tự động dịch và để trống -> dùng nhãn chờ, ngược lại mới fallback VN
            title: t.title || (isAuto ? `[Đang dịch ${langCode}...]` : post.title),
            slug: t.slug || generateSlug(t.title || post.title),
            description: t.description || (isAuto ? "" : post.description),
            content: t.content || (isAuto ? '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}' : post.content),
            contentHtml: this.lexicalToHtml(t.content || (isAuto ? '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}' : post.content)),
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

    // 4. Nếu trạng thái là SUBMITTED, kích hoạt workflow
    if (post.status === PostStatus.SUBMITTED) {
      await this.submit(post.id, post.authorId, 'Auto-submitted on creation');
    }

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
    const slug = rest.slug || (rest.title ? generateSlug(rest.title) : post.slug);
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
        title: rest.title,
        description: rest.description,
        content: rest.content,
        contentHtml: this.lexicalToHtml(rest.content || ''),
        thumbnail: rest.thumbnail,
        categoryId: rest.categoryId,
        isFeatured: rest.isFeatured,
        isNotification: rest.isNotification,
        isCommentAllowed: rest.isCommentAllowed,
        slug: slug,
        status: rest.status,
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
      const targetLangs = await this.getTargetLanguages();
      for (const [langCode, trans] of Object.entries(parsedTranslations)) {
        const t = trans as any;
        const isAuto = targetLangs.includes(langCode);

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
              title: t.title || (existingTrans?.title || (isAuto ? `[Đang dịch ${langCode}...]` : updatedPost.title)),
              slug: t.slug || generateSlug(t.title || existingTrans?.title || updatedPost.title),
              description: t.description || existingTrans?.description || (isAuto ? "" : updatedPost.description),
              content: t.content || (existingTrans?.content || (isAuto ? '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}' : updatedPost.content)),
              contentHtml: this.lexicalToHtml(t.content || (existingTrans?.content || (isAuto ? '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}' : updatedPost.content))),
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

    // 4. Nếu trạng thái chuyển sang SUBMITTED, kích hoạt workflow
    if (updatedPost.status === PostStatus.SUBMITTED && post.status !== PostStatus.SUBMITTED) {
      await this.submit(updatedPost.id, actorId || updatedPost.authorId, changeNote || 'Submitted via update');
    }

    return updatedPost;
  }
  async findBySlug(slug: string) {
    // 1. Tìm trong bảng Post trước
    let post = await this.prisma.post.findFirst({
      where: { slug, isDeleted: false, status: PostStatus.PUBLISHED },
      include: {
        tags: true,
        category: true,
        translations_rel: {
          orderBy: { version: 'desc' }
        }
      },
    });

    // 2. Nếu không thấy, tìm trong bảng PostTranslation
    if (!post) {
      const translation = await this.prisma.postTranslation.findFirst({
        where: { slug, isPublished: true },
        include: {
          post: {
            include: {
              tags: true,
              category: true,
              translations_rel: {
                orderBy: { version: 'desc' }
              }
            }
          }
        }
      });

      if (translation && translation.post) {
        // "Merge" dữ liệu bản dịch vào post chính để Portal dùng được luôn
        const mainPost = translation.post;
        post = {
          ...mainPost,
          title: translation.title,
          description: translation.description || mainPost.description,
          content: translation.content || mainPost.content,
          contentHtml: translation.contentHtml || mainPost.contentHtml,
          slug: translation.slug || mainPost.slug, // Dùng slug của bản dịch hoặc gốc
          langCode: translation.langCode // Đánh dấu ngôn ngữ hiện tại
        } as any;
      }
    }

    if (!post) return null;

    // Format translations object cho tương thích
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
    const { authorId, categoryId, search, status, lang, isFeatured, sortBy, sortOrder } = query;
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

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
    if (isFeatured !== undefined && isFeatured !== '') {
      where.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Dynamic sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      orderBy = { [sortBy]: sortOrder || 'desc' };
    }

    const allPosts = await this.prisma.post.findMany({
      where,
      orderBy,
      include: {
        tags: true,
        category: true,
        translations_rel: {
          // Nếu có lang, ưu tiên lấy bản dịch của ngôn ngữ đó
          where: lang ? { langCode: lang, isPublished: true } : undefined,
          orderBy: { version: 'desc' },
          take: 1
        }
      },
    });

    const paginated = paginateArray(allPosts, page, limit);
    const items = paginated.data;

    // Format và Merge bản dịch nếu được yêu cầu
    const formattedItems = items.map(post => {
      let finalPost = { ...post };

      // Nếu yêu cầu ngôn ngữ cụ thể và có bản dịch tương ứng
      if (lang && post.translations_rel && post.translations_rel.length > 0) {
        const trans = post.translations_rel[0];
        finalPost = {
          ...finalPost,
          title: trans.title,
          description: trans.description || post.description,
          slug: trans.slug || post.slug,
          // Lưu ý: Content thường không trả về ở list để tối ưu, nhưng nếu có thì merge luôn
          content: trans.content || post.content,
          contentHtml: trans.contentHtml || post.contentHtml
        };
      }

      // Vẫn giữ lại object translations để UI hiển thị các ngôn ngữ khả dụng khác
      const translations: any = {};
      // Re-fetch translations if we filtered them above, or just keep as is for list
      // For list, we usually only care about the current lang or availability
      return { ...finalPost, translations };
    });

    return {
      data: formattedItems,
      meta: {
        ...paginated.meta
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
    const result = await this.workflowService.approve(id, actorId, note);

    // Tự động tạo HTML khi bài viết được duyệt
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (post && post.content) {
      await this.prisma.post.update({
        where: { id },
        data: { contentHtml: this.lexicalToHtml(post.content || '') }
      });
      console.log(`[PostsService] Generated HTML for approved post ${id}`);
    }

    return result;
  }

  async reject(id: string, actorId: string, note?: string) {
    return this.workflowService.reject(id, actorId, note);
  }

  async publish(id: string, actorId: string, note?: string) {
    const result = await this.workflowService.publish(id, actorId, note);

    // Đảm bảo có HTML khi xuất bản
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (post && post.content) {
      await this.prisma.post.update({
        where: { id },
        data: { contentHtml: this.lexicalToHtml(post.content || '') }
      });
    }

    return result;
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

    // Lấy bản dịch của phiên bản hiện tại (mainVersionRef) để tránh race condition khi cập nhật nhiều trường đồng thời
    const existingTrans = await this.prisma.postTranslation.findFirst({
      where: { 
        postId, 
        langCode,
        mainVersionRef: post.currentVersion
      },
      orderBy: { version: 'desc' }
    });

    if (existingTrans) {
      // Nếu đã có bản dịch cho phiên bản hiện tại, chỉ cập nhật các trường được truyền vào
      const updateData: any = {};
      if (data.title !== undefined) {
        updateData.title = data.title;
        updateData.slug = data.slug ?? generateSlug(data.title);
      }
      if (data.description !== undefined) {
        updateData.description = data.description;
      }
      if (data.content !== undefined) {
        updateData.content = data.content;
        updateData.contentHtml = this.lexicalToHtml(data.content);
      }
      
      const updated = await this.prisma.postTranslation.update({
        where: { id: existingTrans.id },
        data: updateData
      });
      console.log(`[PostsService] Updated existing translation for post ${postId} (${langCode}) in-place`);
      return updated;
    } else {
      // Nếu chưa có bản dịch cho phiên bản hiện tại, lấy bản dịch gần nhất trước đó để kế thừa các trường khác
      const lastTrans = await this.prisma.postTranslation.findFirst({
        where: { postId, langCode },
        orderBy: { version: 'desc' }
      });

      const nextTransVersion = lastTrans ? lastTrans.version + 1 : 1;

      const newTrans = await this.prisma.postTranslation.create({
        data: {
          postId,
          langCode,
          title: data.title ?? lastTrans?.title ?? post.title,
          slug: data.slug ?? generateSlug(data.title ?? lastTrans?.title ?? post.title),
          description: data.description ?? lastTrans?.description ?? "",
          content: data.content ?? lastTrans?.content ?? post.content,
          contentHtml: this.lexicalToHtml(data.content ?? lastTrans?.content ?? post.content ?? ''),
          version: nextTransVersion,
          mainVersionRef: post.currentVersion,
          isPublished: post.status === PostStatus.PUBLISHED
        }
      });
      console.log(`[PostsService] Created new translation version ${nextTransVersion} for post ${postId} (${langCode})`);
      return newTrans;
    }
  }

  async incrementViewCount(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * Thống kê tổng hợp bài viết — backend tính, client chỉ render.
   * Thay thế pattern client fetch limit:1000 để đếm.
   */
  async getStats(query: { categoryId?: string; authorId?: string } = {}) {
    const base: any = { isDeleted: false };
    if (query.categoryId) base.categoryId = query.categoryId;
    if (query.authorId)   base.authorId   = query.authorId;

    // Sử dụng thuật toán Single-Pass Bucketing thông qua Prisma groupBy
    const stats = await this.prisma.post.groupBy({
      by: ['status'],
      where: base,
      _count: { _all: true },
      _sum: { viewCount: true },
    });

    let total = 0, published = 0, draft = 0, pending = 0, reviewing = 0, rejected = 0, totalViews = 0;

    for (const group of stats) {
      const count = group._count._all;
      total += count;
      totalViews += group._sum.viewCount ?? 0;

      switch (group.status) {
        case 'PUBLISHED': published += count; break;
        case 'DRAFT': draft += count; break;
        case 'SUBMITTED': pending += count; break;
        case 'REVIEWING': reviewing += count; break;
        case 'REJECTED': rejected += count; break;
      }
    }

    return {
      total,
      published,
      draft,
      pending,
      reviewing,
      rejected,
      totalViews,
    };
  }
}

