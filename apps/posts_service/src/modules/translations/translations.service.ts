import { Injectable, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TranslationService {
    constructor(
        private prisma: PrismaService,
        @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    ) { }

    async getTranslationsByPost(postId: string) {
        return this.prisma.postTranslate.findMany({
            where: { postId },
            orderBy: { language: 'asc' },
        });
    }

    async getTranslationDetail(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                translations: true,
            },
        });
        if (!post) throw new RpcException({ code: 5, message: 'Post not found' });
        return post;
    }

    async updateTranslation(id: string, data: any) {
        const { title, description, contentJson, contentHtml, status } = data;
        return this.prisma.postTranslate.update({
            where: { id },
            data: {
                title,
                description,
                contentJson,
                content: contentHtml,
                status,
            },
        });
    }

    async triggerTranslationManual(postId: string, targetLang: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new RpcException({ code: 5, message: 'Post not found' });

        const existing = await this.prisma.postTranslate.findUnique({
            where: { postId_language: { postId, language: targetLang } }
        });

        if (!existing) {
            await this.prisma.postTranslate.create({
                data: {
                    post: { connect: { id: postId } },
                    language: targetLang,
                    title: `[Draft] ${post.title}`,
                    status: 'draft',
                }
            });
        }

        const payload = {
            postId: post.id,
            targetLanguages: [targetLang],
        };

        this.rabbitClient.emit('translation_request', payload);
        return { success: true, message: `Translation job for ${targetLang} queued.` };
    }

    async deleteTranslation(id: string) {
        return this.prisma.postTranslate.delete({ where: { id } });
    }
}
