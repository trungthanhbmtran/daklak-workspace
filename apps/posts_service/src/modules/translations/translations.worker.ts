import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Controller()
export class TranslationsWorker {
  constructor(private prisma: PrismaService) {}

  @EventPattern('translation_results')
  async handleTranslationResults(@Payload() data: any) {
    try {
      console.log(
        '📥 [Translation Worker] Processing translation result:',
        data,
      );

      const payload = data.data || data; // Handle both direct and wrapped payloads

      if (!payload || !payload.postId) {
        console.error('❌ [Translation Worker] Invalid payload:', payload);
        return;
      }

      const dataToSave = {
        postId: payload.postId,
        language: payload.lang,
        description: payload.description,
        title: payload.title,
        contentJson: payload.content,
        status: 'pending_review',
      };

      await this.prisma.postTranslate.upsert({
        where: {
          postId_language: {
            postId: payload.postId,
            language: payload.lang,
          },
        },
        update: {
          description: payload.description,
          title: payload.title,
          contentJson: payload.content,
          status: 'pending_review',
        },
        create: {
          post: { connect: { id: payload.postId } },
          language: payload.lang,
          description: payload.description,
          title: payload.title,
          contentJson: payload.content,
          status: 'pending_review',
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
