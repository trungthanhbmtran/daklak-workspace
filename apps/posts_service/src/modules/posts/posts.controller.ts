import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @GrpcMethod('PostService', 'CreatePost')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPost(data: CreatePostDto & { author_id?: string }) {
    try {
      // Handle flexible authorId/author_id
      const payload = {
        ...data,
        authorId: data.authorId ?? data.author_id,
      };
      const post = await this.postsService.createPost(payload);
      return { data: post };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message || 'Error creating post',
      });
    }
  }

  @GrpcMethod('PostService', 'GetPost')
  async getPost(data: { id: string }) {
    try {
      const post = await this.postsService.findById(data.id);
      if (!post) {
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Post not found',
        });
      }
      return post;
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('PostService', 'ListPosts')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listPosts(data: QueryPostDto & { author_id?: string; category_id?: string; categoryId?: string }) {
    try {
      const payload = {
        ...data,
        authorId: data.authorId ?? data.author_id,
        categoryId: data.categoryId ?? data.category_id,
      };
      const { rows, count } = await this.postsService.getList(payload);
      return {
        data: rows,
        meta: {
          pagination: {
            total: count,
            page: data.page || 1,
            pageSize: data.limit || 10,
          },
        },
      };
    } catch (error: any) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('PostService', 'UpdatePost')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePost(data: UpdatePostDto & { id: string; category_id?: string; tag_ids?: string[] }) {
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId ?? data.category_id,
        tagIds: data.tagIds ?? data.tag_ids,
      };
      const post = await this.postsService.update(data.id, payload);
      return { data: post };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('PostService', 'DeletePost')
  async deletePost(data: { id: string }) {
    try {
      await this.postsService.delete(data.id);
      return { success: true };
    } catch (error: any) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('PostService', 'AddTagsToPost')
  async addTagsToPost(data: { postId?: string; post_id?: string; tagIds?: string[]; tag_ids?: string[] }) {
    try {
      const postId = data.postId ?? data.post_id;
      const tagIds = data.tagIds ?? data.tag_ids ?? [];
      if (!postId) throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'postId is required' });
      
      await this.postsService.addTagsToPost(postId, tagIds);
      return { success: true };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('PostService', 'RemoveTagFromPost')
  async removeTagFromPost(data: { postId?: string; post_id?: string; tagId?: string; tag_id?: string }) {
    try {
      const postId = data.postId ?? data.post_id;
      const tagId = data.tagId ?? data.tag_id;
      if (!postId || !tagId) throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'postId and tagId are required' });

      await this.postsService.removeTagFromPost(postId, tagId);
      return { success: true };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('PostService', 'GetTagsByPost')
  async getTagsByPost(data: { postId?: string; post_id?: string }) {
    try {
      const postId = data.postId ?? data.post_id;
      if (!postId) throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'postId is required' });

      const tags = await this.postsService.getTagsByPost(postId);
      return { tags };
    } catch (error: any) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('PostService', 'SetCategoryForPost')
  async setCategoryForPost(data: { postId?: string; post_id?: string; categoryId?: string; category_id?: string }) {
    try {
      const postId = data.postId ?? data.post_id;
      const categoryId = data.categoryId ?? data.category_id;
      if (!postId || !categoryId) throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'postId and categoryId are required' });

      await this.postsService.setCategoryForPost(postId, categoryId);
      return { success: true };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('PostService', 'GetPostBySlug')
  async getPostBySlug(data: { slug: string }) {
    try {
      const post = await this.postsService.findBySlug(data.slug);
      if (!post) throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Post not found' });
      return post;
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('PostService', 'GetPostsByCategorySlug')
  async getPostsByCategorySlug(data: { slug: string }) {
    try {
      return await this.postsService.getPostsByCategorySlug(data.slug);
    } catch (error: any) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('PostService', 'ReviewPost')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reviewPost(data: UpdatePostDto & { id: string; reviewer_id?: string; reviewerId?: string }) {
    try {
      const reviewerId = data.reviewerId ?? data.reviewer_id;
      const post = await this.postsService.reviewPost(data.id, { ...data, reviewerId });
      return { success: true, data: post };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }
  }
}
