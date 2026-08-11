import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../../database/prisma.service';

/**
 * WorkflowController — l?ng nghe các events t? workflow-service qua RabbitMQ.
 *
 * Nh?n s? ki?n và c?p nh?t tr?ng thái Document tuong ?ng.
 * Không ch?a business logic — ch? d?ng b? tr?ng thái t? workflow-service.
 */
@Controller()
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Nh?n s? ki?n khi workflow instance v?a du?c t?o và b?t d?u ch?y.
   * ? Luu workflowInstanceId vào document d? có th? resume sau.
   */
  @EventPattern('workflow.instance.started')
  async handleWorkflowStarted(@Payload() data: {
    instanceId: string;
    businessKey?: string;  // = documentId
  }) {
    this.logger.log(`workflow.instance.started: instanceId=${data.instanceId}, businessKey=${data.businessKey}`);

    if (!data.businessKey) {
      this.logger.warn('workflow.instance.started received without businessKey — skipping document update');
      return;
    }

    try {
      await this.prisma.document.updateMany({
        where: { id: data.businessKey },
        data: {
          workflowInstanceId: data.instanceId,
          status: 'RECEIVED',
        },
      });
      this.logger.log(`Document ${data.businessKey} updated: workflowInstanceId=${data.instanceId}, status=RECEIVED`);
    } catch (error: any) {
      this.logger.error(`Failed to update document on workflow.instance.started: ${error.message}`);
    }
  }

  /**
   * Nh?n s? ki?n khi m?t workflow task du?c t?o (userTask node).
   * ? C?p nh?t workflowCurrentNode trên document d? bi?t dang ? bu?c nào.
   */
  @EventPattern('workflow.task.created')
  async handleWorkflowTaskCreated(@Payload() data: {
    taskId: string;
    instanceId: string;
    nodeCode?: string;
    title?: string;
  }) {
    this.logger.log(`workflow.task.created: taskId=${data.taskId}, instanceId=${data.instanceId}, node=${data.nodeCode}`);

    try {
      // Tìm document liên k?t v?i instance này
      await this.prisma.document.updateMany({
        where: { workflowInstanceId: data.instanceId },
        data: {
          workflowCurrentNode: data.nodeCode || null,
          status: 'PROCESSING',
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to update document on workflow.task.created: ${error.message}`);
    }
  }

  /**
   * Nh?n s? ki?n khi toàn b? workflow instance hoàn t?t.
   * ? Ð?t document status = COMPLETED.
   */
  @EventPattern('workflow.instance.completed')
  async handleWorkflowCompleted(@Payload() data: {
    instanceId: string;
  }) {
    this.logger.log(`workflow.instance.completed: instanceId=${data.instanceId}`);

    try {
      await this.prisma.document.updateMany({
        where: { workflowInstanceId: data.instanceId },
        data: {
          status: 'PUBLISHED',
          workflowCurrentNode: null,
        },
      });
      this.logger.log(`Document(s) linked to instance ${data.instanceId} marked as PUBLISHED`);
    } catch (error: any) {
      this.logger.error(`Failed to update document on workflow.instance.completed: ${error.message}`);
    }
  }

  /**
   * Nh?n s? ki?n khi workflow instance th?t b?i.
   * ? Log l?i d? team v?n hành bi?t c?n can thi?p th? công.
   */
  @EventPattern('workflow.instance.failed')
  async handleWorkflowFailed(@Payload() data: {
    instanceId: string;
    reason?: string;
  }) {
    this.logger.error(`workflow.instance.failed: instanceId=${data.instanceId}, reason=${data.reason}`);
    // Không t? d?ng thay d?i status document khi workflow fail
    // d? tránh m?t tr?ng thái dang x? lý — c?n v?n hành can thi?p
  }

  /**
   * Nh?n s? ki?n Saga compensation — ghi log d? truy v?t.
   */
  @EventPattern('workflow.saga.compensation_triggered')
  async handleSagaCompensation(@Payload() data: {
    instanceId: string;
    failedNodeCode?: string;
  }) {
    this.logger.warn(
      `workflow.saga.compensation_triggered: instanceId=${data.instanceId}, failedNode=${data.failedNodeCode}`,
    );
  }
}
