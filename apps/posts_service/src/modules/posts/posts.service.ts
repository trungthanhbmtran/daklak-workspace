import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PostsRepository } from './repositories/posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { PostStatus } from '@generated/prisma/client';

@Injectable()
export class PostsService {
    constructor(private readonly postsRepository: PostsRepository) { }

    async createPost(data: CreatePostDto) {
        return this.postsRepository.create(data);
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
                case PostStatus.rejected: finalNote = 'Nội dung bị từ chối bởi quản trị viên'; break;
                case PostStatus.editing: finalNote = 'Yêu cầu chỉnh sửa lại nội dung'; break;
                case PostStatus.approved: finalNote = 'Nội dung đã được thông qua'; break;
                case PostStatus.pending: finalNote = 'Đang chờ thẩm định'; break;
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
