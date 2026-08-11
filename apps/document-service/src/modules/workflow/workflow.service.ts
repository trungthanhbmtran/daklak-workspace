import { Injectable, BadRequestException, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { PrismaService } from '../../database/prisma.service';
import { firstValueFrom } from 'rxjs';

export const WORKFLOW_RMQ_CLIENT = 'WORKFLOW_RMQ_CLIENT';
export const WORKFLOW_PACKAGE = 'WORKFLOW_PACKAGE';

/**
 * WorkflowService — bridge gi?a document-service và workflow-service.
 *
 * Lu?ng chu?n:
 *  1. Khi t?o document m?i   ? g?i startDocumentWorkflow() ? gRPC TriggerWorkflow
 *  2. Khi user x? lý van b?n ? g?i resumeDocumentWorkflow() ? gRPC ResumeWorkflow
 *  3. Workflow events (RabbitMQ) du?c x? lý b?i WorkflowController, KHÔNG ? dây
 */
@Injectable()
export class WorkflowService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowService.name);
  private workflowGrpcService: any;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(WORKFLOW_PACKAGE) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.workflowGrpcService = this.grpcClient.getService<any>('WorkflowService');
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  /**
   * Kh?i t?o workflow instance cho m?t document v?a du?c t?o.
   * G?i gRPC TriggerWorkflow v?i trigger code = 'DOC_RECEIVED' (ho?c code du?c truy?n vào).
   *
   * @returns { instanceId, currentNodeId } d? caller luu vào Document record
   */
  async startDocumentWorkflow(
    documentId: string,
    trigger: string,
    context: {
      initiatorId?: string;
      documentNumber?: string;
      abstract?: string;
      [key: string]: any;
    },
  ): Promise<{ instanceId: string; currentNodeId: string | null }> {
    try {
      this.logger.log(`Starting workflow '${trigger}' for document ${documentId}`);

      const response = await firstValueFrom<any>(
        this.workflowGrpcService.TriggerWorkflow({
          trigger,
          businessId: documentId,
          businessType: 'DOCUMENT',
          initiatorId: context.initiatorId || 'system',
          initialContext: {
            documentId,
            ...context,
          },
        }),
      );

      if (!response || !response.id) {
        throw new BadRequestException(`workflow-service did not return a valid instance for trigger '${trigger}'`);
      }

      this.logger.log(`Workflow instance created: ${response.id} (node: ${response.currentNodeId})`);
      return {
        instanceId: response.id,
        currentNodeId: response.currentNodeId || null,
      };
    } catch (error: any) {
      this.logger.error(`Failed to start workflow '${trigger}' for document ${documentId}: ${error.message}`);
      // Non-fatal: log the error but do not block document creation
      return { instanceId: '', currentNodeId: null };
    }
  }

  /**
   * Ti?p t?c th?c thi workflow instance khi user th?c hi?n m?t action (PROCESS, FINALIZE, v.v.)
   * G?i gRPC ResumeWorkflow.
   */
  async resumeDocumentWorkflow(
    documentId: string,
    action: string,
    actorId: string,
    actorName: string,
    note?: string,
  ): Promise<void> {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new BadRequestException('Document not found');

    if (!doc.workflowInstanceId) {
      this.logger.warn(`Document ${documentId} has no workflowInstanceId — skipping ResumeWorkflow`);
      return;
    }

    try {
      this.logger.log(`Resuming workflow instance ${doc.workflowInstanceId} with action '${action}'`);

      await firstValueFrom<any>(
        this.workflowGrpcService.ResumeWorkflow({
          instanceId: doc.workflowInstanceId,
          nodeId: doc.workflowCurrentNode || undefined,
          actionData: {
            action,
            actorId,
            actorName,
            note: note || '',
          },
        }),
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to resume workflow instance ${doc.workflowInstanceId} with action '${action}': ${error.message}`,
      );
      throw new BadRequestException(`Workflow resume failed: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // DOCUMENT ACTIONS (g?i b?i DocumentService / DocumentController)
  // ---------------------------------------------------------------------------

  /**
   * X? lý van b?n — ngu?i dùng nh?n nhi?m v? và b?t d?u x? lý.
   */
  async processDocument(id: string, actorId: string, actorName: string, note?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new BadRequestException('Document not found');

    await this.resumeDocumentWorkflow(id, 'PROCESS', actorId, actorName, note);

    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    await this.logDocumentAction(id, 'X? LÝ VAN B?N', note || 'C?p nh?t ti?n d? x? lý.', actorId, actorName);
    return updated;
  }

  /**
   * K?t thúc x? lý van b?n — luu h? so.
   */
  async finalizeDocument(id: string, actorId: string, actorName: string, note?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new BadRequestException('Document not found');

    await this.resumeDocumentWorkflow(id, 'FINALIZE', actorId, actorName, note);

    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    await this.logDocumentAction(id, 'K?T THÚC / LUU H? SO', note || 'Van b?n dã du?c hoàn t?t x? lý.', actorId, actorName);
    return updated;
  }

  // ---------------------------------------------------------------------------
  // CONSULTATION & COMMENT ACTIONS
  // ---------------------------------------------------------------------------

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
        moderatedAt: new Date(),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  async logDocumentAction(documentId: string, action: string, note?: string, userId?: string, userName?: string) {
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
