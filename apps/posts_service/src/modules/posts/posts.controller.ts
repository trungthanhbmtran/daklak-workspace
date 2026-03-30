import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Controller()
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @GrpcMethod('PostService', 'CreatePost')
    @UsePipes(new ValidationPipe({ transform: true }))
    async createPost(data: CreatePostDto) {
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
    @UsePipes(new ValidationPipe({ transform: true }))
    async listPosts(data: QueryPostDto) {
        return this.postsService.getList(data);
    }

    @GrpcMethod('PostService', 'UpdatePost')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updatePost(data: UpdatePostDto & { id: string }) {
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
    @UsePipes(new ValidationPipe({ transform: true }))
    async reviewPost(data: UpdatePostDto & { id: string }) {
        try {
            const post = await this.postsService.reviewPost(data.id, data);
            return { success: true, data: post };
        } catch (error) {
            throw new RpcException(error);
        }
    }
}
