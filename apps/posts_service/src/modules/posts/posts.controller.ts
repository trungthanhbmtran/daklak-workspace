import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { PostMapper } from './mapper/post.mapper';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @GrpcMethod('PostService', 'CreatePost')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPost(data: CreatePostDto) {
    try {
      const post = await this.postsService.createPost(data);
      return { data: PostMapper.toResponse(post) };
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
      return { data: PostMapper.toResponse(post) };
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
        data: rows.map(PostMapper.toResponse),
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
      return { data: PostMapper.toResponse(post) };
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
      if (error instanceof RpcException) throw error;
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
      return { success: true, data: PostMapper.toResponse(post) };
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
      return { data: PostMapper.toResponse(post) };
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
      const posts = await this.postsService.getPostsByCategorySlug(data.slug);
      return { data: posts.map(PostMapper.toResponse) };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }
}
