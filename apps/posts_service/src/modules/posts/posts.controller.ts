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
  async createPost(data: CreatePostDto) {
    try {
      const post = await this.postsService.createPost(data);
      return { data: post };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
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
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'ListPosts')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listPosts(data: QueryPostDto) {
    try {
      const { rows, count } = await this.postsService.getList(data);

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
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'UpdatePost')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePost(data: UpdatePostDto & { id: string }) {
    try {
      const { id, ...payload } = data;
      const post = await this.postsService.update(id, payload);
      return { data: post };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'DeletePost')
  async deletePost(data: { id: string }) {
    try {
      await this.postsService.delete(data.id);
      return { success: true };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'AddTagsToPost')
  async addTagsToPost(data: { postId: string; tagIds: string[] }) {
    try {
      await this.postsService.addTagsToPost(data.postId, data.tagIds);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'RemoveTagFromPost')
  async removeTagFromPost(data: { postId: string; tagId: string }) {
    try {
      await this.postsService.removeTagFromPost(data.postId, data.tagId);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'GetTagsByPost')
  async getTagsByPost(data: { postId: string }) {
    try {
      const tags = await this.postsService.getTagsByPost(data.postId);
      return { tags };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'SetCategoryForPost')
  async setCategoryForPost(data: { postId: string; categoryId: string }) {
    try {
      await this.postsService.setCategoryForPost(data.postId, data.categoryId);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'GetPostBySlug')
  async getPostBySlug(data: { slug: string }) {
    try {
      const post = await this.postsService.findBySlug(data.slug);
      if (!post)
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Post not found',
        });
      return post;
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'GetPostsByCategorySlug')
  async getPostsByCategorySlug(data: { slug: string }) {
    try {
      return await this.postsService.getPostsByCategorySlug(data.slug);
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('PostService', 'ReviewPost')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reviewPost(data: UpdatePostDto & { id: string }) {
    try {
      const { id, ...rest } = data;
      const post = await this.postsService.reviewPost(id, rest);
      return { success: true, data: post };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }
}
