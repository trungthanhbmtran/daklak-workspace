import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PostsRepository } from './repositories/posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { PostStatus } from '@generated/prisma/client';
import { CensorService } from './censor.service';
import { TranslationService } from '../translations/translations.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly censorService: CensorService,
    @Inject(forwardRef(() => TranslationService))
    private readonly translationService: TranslationService,
  ) { }

  async createPost(data: CreatePostDto) {
    // 1. Kiểm duyệt nội dung tự động (Moderation)
    const titleCheck = this.censorService.checkContent(data.title);
    const contentCheck = this.censorService.checkContent(data.content || '');
    const descriptionCheck = this.censorService.checkContent(data.description || '');

    const isSafe = titleCheck.isSafe && contentCheck.isSafe && descriptionCheck.isSafe;
    const flaggedWords = Array.from(new Set([
      ...titleCheck.flaggedWords,
      ...contentCheck.flaggedWords,
      ...descriptionCheck.flaggedWords,
    ]));

    const processedData = {
      ...data,
      autoModerationStatus: isSafe ? 'SAFE' : 'FLAGGED',
      autoModerationNote: isSafe
        ? 'Nội dung an toàn'
        : `Phát hiện từ ngữ nhạy cảm: ${flaggedWords.join(', ')}`,
      status: isSafe ? (data.status || PostStatus.pending) : PostStatus.rejected,
    };

    // 2. Lưu post vào DB
    const post = await this.postsRepository.create(processedData as any);

    // 3. Tự động dịch nếu nội dung an toàn (Automatic Translation)
    if (isSafe && post.language === 'vi') {
      try {
        await this.translationService.triggerTranslationManual(post.id, 'en');
        await this.postsRepository.update(post.id, { isTranslated: true } as any);
      } catch (error) {
        console.error('❌ [PostsService] Lỗi khi kích hoạt tự động dịch:', error);
      }
    }

    return post;
  }

  async findById(id: string) {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new RpcException({ code: 5, message: 'Post not found' });
    }
    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.postsRepository.findBySlug(slug);
    if (!post) {
      throw new RpcException({ code: 5, message: 'Post not found' });
    }
    return post;
  }

  async getList(query: QueryPostDto) {
    return this.postsRepository.findMany(query);
  }

  async update(id: string, data: UpdatePostDto) {
    await this.findById(id); // Check existence
    return this.postsRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id); // Check existence
    return this.postsRepository.delete(id);
  }

  async addTagsToPost(postId: string, tagIds: string[]) {
    await this.findById(postId);
    return this.postsRepository.addTags(postId, tagIds);
  }

  async removeTagFromPost(postId: string, tagId: string) {
    await this.findById(postId);
    return this.postsRepository.removeTag(postId, tagId);
  }

  async getTagsByPost(postId: string) {
    await this.findById(postId);
    return this.postsRepository.getTags(postId);
  }

  async setCategoryForPost(postId: string, categoryId: string) {
    await this.findById(postId);
    return this.postsRepository.setCategory(postId, categoryId);
  }

  async getPostsByCategorySlug(slug: string) {
    return this.postsRepository.findByCategorySlug(slug);
  }

  async reviewPost(id: string, data: UpdatePostDto) {
    const post = await this.findById(id);
    const { status, moderationNote: note, reviewerId, ...otherData } = data;

    let finalNote = note;
    if (status === PostStatus.published) {
      finalNote = '';
    } else if (!note) {
      switch (status) {
        case PostStatus.rejected:
          finalNote = 'Nội dung bị từ chối bởi quản trị viên';
          break;
        case PostStatus.editing:
          finalNote = 'Yêu cầu chỉnh sửa lại nội dung';
          break;
        case PostStatus.approved:
          finalNote = 'Nội dung đã được thông qua';
          break;
        case PostStatus.pending:
          finalNote = 'Đang chờ thẩm định';
          break;
      }
    }

    return this.postsRepository.update(id, {
      ...otherData,
      status,
      reviewerId,
      moderationNote: finalNote,
      publishedAt: status === PostStatus.published ? new Date() : undefined,
    } as UpdatePostDto);
  }
}
