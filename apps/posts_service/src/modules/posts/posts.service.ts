import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }

    async createPost(data: any) {
        const { tagIds, ...postData } = data;

        return this.prisma.post.create({
            data: {
                ...postData,
                tags: tagIds ? {
                    connect: tagIds.map((id: string) => ({ id }))
                } : undefined,
            },
            include: {
                category: true,
                tags: true,
            }
        });
    }

    async findById(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                category: true,
                tags: true,
            }
        });
        if (!post) {
            throw new RpcException({ code: 5, message: 'Post not found' });
        }
        return post;
    }

    async findBySlug(slug: string) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            include: {
                category: true,
                tags: true,
            }
        });
        if (!post) {
            throw new RpcException({ code: 5, message: 'Post not found' });
        }
        return post;
    }

    async getList(query: { page?: number; limit?: number; search?: string; categorySlug?: string }) {
        const skip = ((query.page || 1) - 1) * (query.limit || 10);
        const take = query.limit || 10;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { title: { contains: query.search } },
            ];
        }
        if (query.categorySlug) {
            where.category = { slug: query.categorySlug.startsWith('/') ? query.categorySlug : `/${query.categorySlug}` };
        }

        const [items, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take,
                include: {
                    category: true,
                    tags: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.post.count({ where }),
        ]);

        return {
            rows: items,
            count: total,
        };
    }

    async update(id: string, data: any) {
        const { tagIds, ...updateData } = data;
        return this.prisma.post.update({
            where: { id },
            data: {
                ...updateData,
                tags: tagIds ? {
                    set: tagIds.map((id: string) => ({ id }))
                } : undefined,
            },
        });
    }

    async delete(id: string) {
        return this.prisma.post.delete({ where: { id } });
    }

    async addTagsToPost(postId: string, tagIds: string[]) {
        return this.prisma.post.update({
            where: { id: postId },
            data: {
                tags: {
                    connect: tagIds.map(id => ({ id }))
                }
            }
        });
    }

    async removeTagFromPost(postId: string, tagId: string) {
        return this.prisma.post.update({
            where: { id: postId },
            data: {
                tags: {
                    disconnect: { id: tagId }
                }
            }
        });
    }

    async getTagsByPost(postId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { tags: true }
        });
        return post?.tags || [];
    }

    async setCategoryForPost(postId: string, categoryId: string) {
        return this.prisma.post.update({
            where: { id: postId },
            data: { categoryId }
        });
    }

    async getPostsByCategorySlug(slug: string) {
        return this.prisma.post.findMany({
            where: {
                category: { slug }
            },
            include: {
                category: true,
                tags: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async reviewPost(id: string, data: any) {
        // Logic similar to reviewPost in post.service.js
        const { status, note, reviewerId, ...otherData } = data;

        let moderationNote = note;
        if (status === 'published') {
            moderationNote = null;
        } else if (!note) {
            if (status === 'rejected') moderationNote = 'Nội dung bị từ chối bởi quản trị viên';
            else if (status === 'editing') moderationNote = 'Yêu cầu chỉnh sửa lại nội dung';
            else if (status === 'approved') moderationNote = 'Nội dung đã được thông qua';
            else if (status === 'pending') moderationNote = 'Đang chờ thẩm định';
        }

        return this.prisma.post.update({
            where: { id },
            data: {
                ...otherData,
                status,
                reviewerId,
                moderationNote,
                publishedAt: status === 'published' ? new Date() : undefined,
            },
            include: {
                category: true,
                tags: true,
            }
        });
    }
}
