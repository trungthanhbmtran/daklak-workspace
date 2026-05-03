import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WorkflowService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowService.name);
  private engine: any;

  constructor(
    private prisma: PrismaService,
    @Inject('WORKFLOW_SERVICE') private client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.engine = this.client.getService<any>('WorkflowService');
  }

  /**
   * Kích hoạt quy trình động qua gRPC Workflow Engine
   */
  async triggerDynamicWorkflow(trigger: string, context: any) {
    if (!this.engine) {
      this.logger.warn('Workflow Engine service not initialized');
      return;
    }
    try {
      this.logger.log(`Triggering workflow: ${trigger}`);
      const result = await firstValueFrom(this.engine.TriggerWorkflow({ trigger, initialContext: context }));
      return result;
    } catch (e) {
      this.logger.error(`Failed to trigger workflow ${trigger}: ${e.message}`);
    }
  }

  // --- Atomic Document Actions ---

  async receiveDocument(id: string, actorId?: string, actorName?: string) {
    const document = await this.prisma.document.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    await this.logDocumentAction(id, 'VÀO SỔ VĂN BẢN', 'Hệ thống tự động ghi nhận khi tiếp nhận.', actorId, actorName);

    // Kích hoạt quy trình động (nếu có định nghĩa)
    await this.triggerDynamicWorkflow('DOC_RECEIVED', {
      documentId: document.id,
      documentNumber: document.documentNumber,
      abstract: document.abstract,
      initiatorId: actorId || 'system',
      initiatorName: actorName || 'System',
    });

    return document;
  }

  async processDocument(id: string, actorId: string, actorName: string, note?: string) {
    const document = await this.prisma.document.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    await this.logDocumentAction(id, 'XỬ LÝ VĂN BẢN', note || 'Cập nhật tiến độ xử lý.', actorId, actorName);
    return document;
  }

  async finalizeDocument(id: string, actorId: string, actorName: string, note?: string) {
    const document = await this.prisma.document.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    await this.logDocumentAction(id, 'KẾT THÚC / LƯU HỒ SƠ', note || 'Văn bản đã được hoàn tất xử lý.', actorId, actorName);
    return document;
  }

  // --- Atomic Consultation Actions ---

  async submitConsultationResponse(consultationId: string, unitId: string, content: string, fileId?: string) {
    return this.prisma.consultationResponse.updateMany({
      where: { consultationId, unitId },
      data: {
        content,
        fileId,
        status: 'RESPONDED',
        respondedAt: new Date(),
      },
    });
  }

  async moderateComment(commentId: string, status: string, actorId: string) {
    return this.prisma.publicComment.update({
      where: { id: commentId },
      data: {
        status,
        moderatedBy: actorId,
        moderatedAt: new Date()
      }
    });
  }

  // --- Helpers ---

  private async logDocumentAction(documentId: string, action: string, note?: string, userId?: string, userName?: string) {
    return this.prisma.documentLog.create({
      data: {
        documentId,
        action,
        note,
        userId,
        userName,
      },
    });
  }
}
