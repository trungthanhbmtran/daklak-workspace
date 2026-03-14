import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { TranslationService } from './translations.service';

@Controller()
export class TranslationsController {
    constructor(private readonly translationService: TranslationService) { }

    @GrpcMethod('TranslationService', 'GetTranslationsByPost')
    async getTranslationsByPost(data: { postId: string }) {
        const translations = await this.translationService.getTranslationsByPost(data.postId);
        return { success: true, data: translations };
    }

    @GrpcMethod('TranslationService', 'GetTranslationDetail')
    async getTranslationDetail(data: { id: string }) {
        try {
            const postData = await this.translationService.getTranslationDetail(data.id);

            const formattedTranslations = postData.translations.map(t => ({
                ...t,
                contentJson: typeof t.contentJson === 'object' ? JSON.stringify(t.contentJson) : t.contentJson
            }));

            return {
                success: true,
                data: {
                    ...postData,
                    contentJson: typeof postData.contentJson === 'object' ? JSON.stringify(postData.contentJson) : postData.contentJson,
                    translations: formattedTranslations
                }
            };
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @GrpcMethod('TranslationService', 'UpdateTranslation')
    async updateTranslation(data: any) {
        const updated = await this.translationService.updateTranslation(data.id, data);
        return { success: true, data: updated };
    }

    @GrpcMethod('TranslationService', 'TriggerTranslation')
    async triggerTranslation(data: { postId: string; targetLang: string }) {
        return this.translationService.triggerTranslationManual(data.postId, data.targetLang);
    }

    @GrpcMethod('TranslationService', 'DeleteTranslation')
    async deleteTranslation(data: { id: string }) {
        await this.translationService.deleteTranslation(data.id);
        return { success: true };
    }
}
