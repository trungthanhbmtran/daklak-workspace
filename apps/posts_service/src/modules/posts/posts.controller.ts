import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PostsService } from './posts.service';

@Controller()
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @GrpcMethod('PostService', 'CreatePost')
    async createPost(data: any) {
        try {
            const post = await this.postsService.createPost(data);
            return { success: true, data: post };
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @GrpcMethod('PostService', 'GetPost')
    async getPost(data: { id: string }) {
        return this.postsService.findById(data.id);
    }

    @GrpcMethod('PostService', 'ListPosts')
    async listPosts(data: any) {
        return this.postsService.getList(data);
    }

    @GrpcMethod('PostService', 'UpdatePost')
    async updatePost(data: any) {
        try {
            const post = await this.postsService.update(data.id, data);
            return { success: true, data: post };
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @GrpcMethod('PostService', 'DeletePost')
    async deletePost(data: { id: string }) {
        await this.postsService.delete(data.id);
        return { success: true };
    }

    @GrpcMethod('PostService', 'AddTagsToPost')
    async addTagsToPost(data: { postId: string; tagIds: string[] }) {
        const result = await this.postsService.addTagsToPost(data.postId, data.tagIds);
        return { success: true, data: result };
    }

    @GrpcMethod('PostService', 'RemoveTagFromPost')
    async removeTagFromPost(data: { postId: string; tagId: string }) {
        const result = await this.postsService.removeTagFromPost(data.postId, data.tagId);
        return { success: true, data: result };
    }

    @GrpcMethod('PostService', 'GetTagsByPost')
    async getTagsByPost(data: { postId: string }) {
        const tags = await this.postsService.getTagsByPost(data.postId);
        return { success: true, data: tags };
    }

    @GrpcMethod('PostService', 'SetCategoryForPost')
    async setCategoryForPost(data: { postId: string; categoryId: string }) {
        const result = await this.postsService.setCategoryForPost(data.postId, data.categoryId);
        return { success: true, data: result };
    }

    @GrpcMethod('PostService', 'GetPostBySlug')
    async getPostBySlug(data: { slug: string }) {
        return this.postsService.findBySlug(data.slug);
    }

    @GrpcMethod('PostService', 'GetPostsByCategorySlug')
    async getPostsByCategorySlug(data: { slug: string }) {
        return this.postsService.getPostsByCategorySlug(data.slug);
    }

    @GrpcMethod('PostService', 'ReviewPost')
    async reviewPost(data: any) {
        try {
            const post = await this.postsService.reviewPost(data.id, data);

            // Formatting to match proto requirements
            return {
                success: true,
                data: {
                    ...post,
                    publishedAt: post.publishedAt?.toISOString() || '',
                    createdAt: post.createdAt?.toISOString() || '',
                    updatedAt: post.updatedAt?.toISOString() || '',
                    contentJson: typeof post.contentJson === 'object' ? JSON.stringify(post.contentJson) : post.contentJson,
                    moderationNote: post.moderationNote || '',
                    category: post.category ? {
                        id: post.category.id,
                        name: post.category.name,
                        slug: post.category.slug
                    } : null,
                    tags: post.tags || []
                }
            };
        } catch (error) {
            throw new RpcException(error);
        }
    }
}
