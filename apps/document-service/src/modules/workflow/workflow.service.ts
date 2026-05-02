import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) { }

  // --- Atomic Document Actions ---

  async receiveDocument(id: string, actorId?: string, actorName?: string) {
    const document = await this.prisma.document.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    await this.logDocumentAction(id, 'VÀO SỔ VĂN BẢN', 'Hệ thống tự động ghi nhận khi tiếp nhận.', actorId, actorName);
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
