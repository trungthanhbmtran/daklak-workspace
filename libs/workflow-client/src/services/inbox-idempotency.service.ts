import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { WorkflowCommand } from '../interfaces/workflow-command.interface';

@Injectable()
export class InboxIdempotencyService {
  private readonly logger = new Logger(InboxIdempotencyService.name);

  /**
   * Kiểm tra Command này đã từng được xử lý chưa để chống trùng lặp (Duplicate Event).
   * Phải được gọi TRƯỚC KHI thực thi business logic.
   */
  async checkAndRegisterCommand(
    prismaClient: any,
    command: WorkflowCommand,
    actionName: string
  ): Promise<void> {
    // 1. Kiểm tra xem commandId đã có trong bảng processed_commands chưa
    const existing = await prismaClient.processedCommand.findUnique({
      where: { commandId: command.commandId }
    });

    if (existing) {
      this.logger.warn(Command \ was already processed. Ignoring.);
      throw new ConflictException(Command \ already processed (Idempotency check).);
    }

    // 2. Nếu chưa có, đăng ký ngay lập tức để block các request trùng lặp đến cùng lúc
    await prismaClient.processedCommand.create({
      data: {
        commandId: command.commandId,
        workflowInstanceId: command.workflowInstanceId,
        action: actionName,
        status: 'SUCCESS'
      }
    });
  }
}
