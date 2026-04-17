import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CensorService } from '../../shared/censor/censor.service';
import { PrismaService } from '@/database/prisma.service';
import { TranslationStatus } from '@generated/prisma/client';

interface TranslationPayload {
  data?: TranslationPayload;
  postId?: string;
  lang?: string;
  title?: string;
  description?: string;
  content?: string | object;
}

@Controller()
export class TranslationsWorker {
  constructor(
    private prisma: PrismaService,
    private censorService: CensorService,
  ) {}

  @EventPattern('translation_results')
  async handleTranslationResults(
    @Payload()
    data: TranslationPayload,
  ) {
    try {
      console.log(
        '📥 [Translation Worker] Processing translation result:',
        data,
      );

      const payload = data.data || data;

      if (!payload || !payload.postId) {
        console.error('❌ [Translation Worker] Invalid payload:', payload);
        return;
      }

      // 1. Kiểm duyệt nội dung dịch (Moderation for translation)
      const titleCheck = this.censorService.checkContent(payload.title || '');
      const contentCheck = this.censorService.checkContent(
        payload.description || '',
      );

      const isSafe = titleCheck.isSafe && contentCheck.isSafe;

      const dataToSave = {
        postId: payload.postId,
        language: payload.lang || 'en',
        description: payload.description || '',
        title: payload.title || '',
        contentJson: payload.content || {},
        status: isSafe
          ? TranslationStatus.pending_review
          : TranslationStatus.rejected,
        moderationStatus: isSafe ? 'SAFE' : 'FLAGGED',
        moderationNote: isSafe
          ? 'Dịch thuật an toàn'
          : 'Phát hiện từ ngữ nhạy cảm trong bản dịch',
      };

      await this.prisma.postTranslate.upsert({
        where: {
          postId_language: {
            postId: dataToSave.postId,
            language: dataToSave.language,
          },
        },
        update: {
          description: dataToSave.description,
          title: dataToSave.title,
          contentJson: dataToSave.contentJson,
          status: dataToSave.status,
          moderationStatus: dataToSave.moderationStatus,
          moderationNote: dataToSave.moderationNote,
        },
        create: {
          post: { connect: { id: dataToSave.postId } },
          language: dataToSave.language,
          description: dataToSave.description,
          title: dataToSave.title,
          contentJson: dataToSave.contentJson,
          status: dataToSave.status,
          moderationStatus: dataToSave.moderationStatus,
          moderationNote: dataToSave.moderationNote,
        },
      });

      console.log(
        `✅ [Translation Worker] Saved translation for Post ${payload.postId} (${payload.lang})`,
      );
    } catch (error) {
      console.error('❌ [Translation Worker] Error processing result:', error);
    }
  }
}
