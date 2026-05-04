import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { status } from '@grpc/grpc-js';

function sanitizePost(post: any): any {
  if (!post) return null;
  return {
    ...post,
    translations: post.translations ? JSON.stringify(post.translations) : '{}',
    publishedAt: post.publishedAt ? (typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt.toISOString()) : '',
    createdAt: post.createdAt ? (typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString()) : '',
    updatedAt: post.updatedAt ? (typeof post.updatedAt === 'string' ? post.updatedAt : post.updatedAt.toISOString()) : '',
  };
}

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @GrpcMethod('PostService', 'CreatePost')
  async createPost(data: any) {
    const result = await this.postsService.create(data);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'GetPost')
  async getPost(data: { id: string }) {
    const result = await this.postsService.findOne(data.id);
    if (!result) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Post with ID ${data.id} not found`,
      });
    }
    return sanitizePost(result);
  }

  @GrpcMethod('PostService', 'ListPosts')
  async listPosts(query: any) {
    const result = await this.postsService.findAll(query);
    return {
      data: (result.data || []).map(p => sanitizePost(p)),
      meta: result.meta,
    };
  }

  @GrpcMethod('PostService', 'UpdatePost')
  async updatePost(data: any) {
    const { id, ...rest } = data;
    const result = await this.postsService.update(id, rest);
    return { data: sanitizePost(result) };
  }



  @GrpcMethod('PostService', 'DeletePost')
  async deletePost(data: { id: string }) {
    await this.postsService.remove(data.id);
    return { success: true };
  }

  @GrpcMethod('PostService', 'GetPostBySlug')
  async getPostBySlug(data: { slug: string }) {
    const result = await this.postsService.findBySlug(data.slug);
    if (!result) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Post with slug ${data.slug} not found`,
      });
    }
    return sanitizePost(result);
  }

  @GrpcMethod('PostService', 'SubmitPost')
  async submitPost(data: { id: string, actorId: string, note?: string }) {
    const result = await this.postsService.submit(data.id, data.actorId, data.note);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'ReviewPost')
  async reviewPost(data: { id: string, reviewerId: string, note?: string }) {
    const result = await this.postsService.review(data.id, data.reviewerId, data.note);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'ApprovePost')
  async approvePost(data: { id: string, reviewerId: string, note?: string }) {
    const result = await this.postsService.approve(data.id, data.reviewerId, data.note);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'RejectPost')
  async rejectPost(data: { id: string, reviewerId: string, note?: string }) {
    const result = await this.postsService.reject(data.id, data.reviewerId, data.note);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'PublishPost')
  async publishPost(data: { id: string, actorId: string, note?: string }) {
    const result = await this.postsService.publish(data.id, data.actorId, data.note);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'UnpublishPost')
  async unpublishPost(data: { id: string, actorId: string, note?: string }) {
    const result = await this.postsService.unpublish(data.id, data.actorId, data.note);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'ArchivePost')
  async archivePost(data: { id: string, actorId: string, note?: string }) {
    const result = await this.postsService.archive(data.id, data.actorId, data.note);
    return { data: sanitizePost(result) };
  }

  @GrpcMethod('PostService', 'GetPostHistory')
  async getPostHistory(data: { id: string }) {
    const items = await this.postsService.getHistory(data.id);
    return { data: items };
  }
}

