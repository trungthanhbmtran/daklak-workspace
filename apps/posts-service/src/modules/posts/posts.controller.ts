import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PostsService } from './posts.service';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @GrpcMethod('PostService', 'CreatePost')
  async createPost(data: any) {
    const result = await this.postsService.create(data);
    return { data: result };
  }

  @GrpcMethod('PostService', 'GetPost')
  async getPost(data: { id: string }) {
    const result = await this.postsService.findOne(data.id);
    return result; // Wrapper is in response proto? No, proto says "returns (Post)"
  }

  @GrpcMethod('PostService', 'ListPosts')
  async listPosts(query: any) {
    const { items, total } = await this.postsService.findAll(query);
    return {
      data: items,
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
      }
    };
  }

  @GrpcMethod('PostService', 'UpdatePost')
  async updatePost(data: any) {
    const { id, ...rest } = data;
    const result = await this.postsService.update(id, rest);
    return { data: result };
  }

  @GrpcMethod('PostService', 'DeletePost')
  async deletePost(data: { id: string }) {
    await this.postsService.remove(data.id);
    return { success: true };
  }

  @GrpcMethod('PostService', 'GetPostBySlug')
  async getPostBySlug(data: { slug: string }) {
    const result = await this.postsService.findBySlug(data.slug);
    return result;
  }

  @GrpcMethod('PostService', 'ReviewPost')
  async reviewPost(data: any) {
    const result = await this.postsService.review(data);
    return { success: true, data: result };
  }
}
