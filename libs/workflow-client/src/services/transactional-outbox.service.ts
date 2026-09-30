import { Injectable, Logger } from '@nestjs/common';
import { WorkflowCommand } from '../interfaces/workflow-command.interface';

@Injectable()
export class TransactionalOutboxService {
  private readonly logger = new Logger(TransactionalOutboxService.name);

  /**
   * Khởi tạo Prisma Transaction, thực thi business logic và insert OutboxEvent.
   * Đây là Pattern cốt lõi để đảm bảo dữ liệu không bị thất thoát khi rớt mạng.
   */
  async executeWithOutbox<T>(
    prismaClient: any,
    command: WorkflowCommand,
    businessLogic: (tx: any) => Promise<T>
  ): Promise<T> {
    return prismaClient.$transaction(async (tx: any) => {
      // 1. Thực thi nghiệp vụ Local (Cập nhật dữ liệu DB)
      this.logger.debug(Executing business logic for command \);
      const result = await businessLogic(tx);

      // 2. Insert OutboxEvent trong cùng Transaction
      this.logger.debug(Inserting OutboxEvent for command \);
      await tx.outboxEvent.create({
        data: {
          workflowInstanceId: command.workflowInstanceId,
          processVersion: command.processVersion,
          nodeId: command.nodeId,
          commandType: command.commandType,
          payload: command.payload,
          status: 'PENDING',
        },
      });

      return result;
    });
  }
}
