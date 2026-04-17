import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { IPostRepository } from './domain/post.repository.interface';
import { Post, DomainPostStatus } from './domain/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { CensorService } from '../../shared/censor/censor.service';
import { TranslationService } from '../translations/translations.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: IPostRepository,
    private readonly censorService: CensorService,
    @Inject(forwardRef(() => TranslationService))
    private readonly translationService: TranslationService,
  ) {}

  async createPost(data: CreatePostDto): Promise<Post> {
    // 1. Kiểm duyệt nội dung tự động (Moderation)
    const titleCheck = this.censorService.checkContent(data.title);
    const contentCheck = this.censorService.checkContent(data.content || '');
    const descriptionCheck = this.censorService.checkContent(
      data.description || '',
    );

    const isSafe =
      titleCheck.isSafe && contentCheck.isSafe && descriptionCheck.isSafe;
    const flaggedWords = Array.from(
      new Set([
        ...titleCheck.flaggedWords,
        ...contentCheck.flaggedWords,
        ...descriptionCheck.flaggedWords,
      ]),
    );

    const isSafeStatus = isSafe ? 'SAFE' : 'FLAGGED';
    const moderationNote = isSafe
      ? 'Nội dung an toàn'
      : `Phát hiện từ ngữ nhạy cảm: ${flaggedWords.join(', ')}`;
    
    const postStatus = isSafe 
      ? (data.status as unknown as DomainPostStatus) || DomainPostStatus.pending 
      : DomainPostStatus.rejected;

    const post = Post.create({
      ...data,
      status: postStatus,
      autoModerationStatus: isSafeStatus,
      autoModerationNote: moderationNote,
      isFeatured: data.isFeatured || false,
      isNotification: data.isNotification || false,
    } as any);

    // 2. Lưu post vào DB
    const createdPost = await this.postsRepository.create(post);

    // 3. Tự động dịch nếu nội dung an toàn (Automatic Translation)
    if (isSafe && createdPost.props_copy.language === 'vi') {
      try {
        await this.translationService.triggerTranslationManual(createdPost.id, 'en');
        await this.postsRepository.update(createdPost.id, {
          isTranslated: true,
        } as any);
      } catch (error) {
        console.error(
          '❌ [PostsService] Lỗi khi kích hoạt tự động dịch:',
          error,
        );
      }
    }

    return createdPost;
  }

  async findById(id: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Post not found' });
    }
    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postsRepository.findBySlug(slug);
    if (!post) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Post not found' });
    }
    return post;
  }

  async getList(query: QueryPostDto) {
    return this.postsRepository.findAll(query);
  }

  async update(id: string, data: UpdatePostDto, userId?: string) {
    const post = await this.findById(id);
    
    // Check ownership if userId is provided
    if (userId && !post.isOwnedBy(userId)) {
      throw new RpcException({ 
        code: GrpcStatus.PERMISSION_DENIED, 
        message: 'You do not have permission to update this post' 
      });
    }

    return this.postsRepository.update(id, data as any);
  }

  async delete(id: string, userId?: string, isAdmin = false) {
    const post = await this.findById(id);
    
    if (!isAdmin && userId && !post.isOwnedBy(userId)) {
      throw new RpcException({ 
        code: GrpcStatus.PERMISSION_DENIED, 
        message: 'You do not have permission to delete this post' 
      });
    }

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
    const targetStatus = status as unknown as DomainPostStatus;

    if (targetStatus === DomainPostStatus.published) {
      finalNote = '';
    } else if (!note) {
      switch (targetStatus) {
        case DomainPostStatus.rejected:
          finalNote = 'Nội dung bị từ chối bởi quản trị viên';
          break;
        case DomainPostStatus.editing:
          finalNote = 'Yêu cầu chỉnh sửa lại nội dung';
          break;
        case DomainPostStatus.approved:
          finalNote = 'Nội dung đã được thông qua';
          break;
        case DomainPostStatus.pending:
          finalNote = 'Đang chờ thẩm định';
          break;
      }
    }

    const updatePayload: any = {
      ...otherData,
      status: targetStatus,
      reviewerId,
      moderationNote: finalNote,
    };

    if (targetStatus === DomainPostStatus.published) {
      updatePayload.publishedAt = new Date();
    }

    return this.postsRepository.update(id, updatePayload);
  }
}
