import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { TranslationService } from './translations.service';
import { UpdateTranslationDto } from './dto/update-translation.dto';

@Controller()
export class TranslationsController {
  constructor(private readonly translationService: TranslationService) {}

  @GrpcMethod('TranslationService', 'GetTranslationsByPost')
  async getTranslationsByPost(data: { postId: string }) {
    const translations = await this.translationService.getTranslationsByPost(
      data.postId,
    );
    return { success: true, data: translations };
  }

  @GrpcMethod('TranslationService', 'GetTranslationDetail')
  async getTranslationDetail(data: { id: string }) {
    try {
      const translation = await this.translationService.getTranslationDetail(
        data.id,
      );
      return { success: true, data: translation };
    } catch (error: unknown) {
      throw new RpcException((error as Error).message);
    }
  }

  @GrpcMethod('TranslationService', 'UpdateTranslation')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTranslation(data: UpdateTranslationDto & { id: string }) {
    try {
      const updated = await this.translationService.updateTranslation(
        data.id,
        data,
      );
      return { success: true, data: updated };
    } catch (error: unknown) {
      throw new RpcException((error as Error).message);
    }
  }

  @GrpcMethod('TranslationService', 'TriggerTranslation')
  async triggerTranslation(data: { postId: string; targetLang: string }) {
    return this.translationService.triggerTranslationManual(
      data.postId,
      data.targetLang,
    );
  }

  @GrpcMethod('TranslationService', 'DeleteTranslation')
  async deleteTranslation(data: { id: string }) {
    await this.translationService.deleteTranslation(data.id);
    return { success: true };
  }
}
