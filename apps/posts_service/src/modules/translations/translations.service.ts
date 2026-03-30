import { Injectable, Inject } from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { TranslationsRepository } from './repositories/translations.repository';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { PostTranslate } from '@prisma/client';
import { PostsRepository } from '../posts/repositories/posts.repository';

@Injectable()
export class TranslationService {
    constructor(
        private readonly translationsRepository: TranslationsRepository,
        private readonly postsRepository: PostsRepository,
        @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    ) { }

    async getTranslationsByPost(postId: string): Promise<PostTranslate[]> {
        return this.translationsRepository.findByPostId(postId);
    }

    async getTranslationDetail(id: string): Promise<PostTranslate> {
        const translation = await this.translationsRepository.findById(id);
        if (!translation) {
            throw new RpcException({ code: 5, message: 'Translation not found' });
        }
        return translation;
    }

    async updateTranslation(id: string, data: UpdateTranslationDto): Promise<PostTranslate> {
        await this.getTranslationDetail(id); // Check existence
        return this.translationsRepository.update(id, data);
    }

    async triggerTranslationManual(postId: string, targetLang: string) {
        const post = await this.postsRepository.findById(postId);
        if (!post) {
            throw new RpcException({ code: 5, message: 'Post not found' });
        }

        const existing = await this.translationsRepository.findByPostAndLang(postId, targetLang);

        if (!existing) {
            await this.translationsRepository.create({
                postId,
                language: targetLang,
                title: `[Draft] ${post.title}`,
                status: 'draft',
            } as CreateTranslationDto);
        }

        const payload = {
            postId: post.id,
            targetLanguages: [targetLang],
        };

        this.rabbitClient.emit('translation_request', payload);
        return { success: true, message: `Translation job for ${targetLang} queued.` };
    }

    async deleteTranslation(id: string): Promise<PostTranslate> {
        await this.getTranslationDetail(id); // Check existence
        return this.translationsRepository.delete(id);
    }
}
