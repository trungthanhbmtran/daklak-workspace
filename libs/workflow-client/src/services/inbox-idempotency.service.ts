import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { WorkflowCommand } from '../interfaces/workflow-command.interface';

@Injectable()
export class InboxIdempotencyService {
  private readonly logger = new Logger(InboxIdempotencyService.name);

  /**
   * Pattern Inbox Idempotency hoàn chỉnh chống Duplicate Event (at-least-once delivery):
   *   CHECK đã processed → business logic → GHI processed, TẤT CẢ trong 1 transaction duy nhất.
   *
   * Lý do bắt buộc ghi processedCommand SAU khi business logic thành công và trong CÙNG
   * transaction: nếu ghi success TRƯỚC khi (hoặc ngoài) transaction, một message retry
   * hợp lệ (logic trước đó thất bại giữa chừng) sẽ bị chặn vĩnh viễn → mất sự kiện.
   * Khi business logic throw, transaction rollback → command KHÔNG bị đánh dấu processed
   * và có thể được retry an toàn bởi workflow-service.
   *
   * Lưu ý schema: model `ProcessedCommand` tham chiếu schema Prisma của workflow-service
   * (apps/workflow-service/prisma/schema/main.prisma) với `id @id` là commandId —
   * không có field `commandId` riêng. `status` mặc định `PROCESSED`.
   */
  async executeIdempotent<T>(
    prismaClient: any,
    command: WorkflowCommand,
    businessLogic: (tx: any) => Promise<T>
  ): Promise<T> {
    return prismaClient.$transaction(async (tx: any) => {
      // 1. Guard chống message trùng lặp arriving concurrently (trong cùng lock transaction)
      const existing = await tx.processedCommand.findUnique({
        where: { id: command.commandId },
      });

      if (existing) {
        this.logger.warn(`Command ${command.commandId} was already processed. Ignoring.`);
        throw new ConflictException(
          `Command ${command.commandId} already processed (Idempotency check).`
        );
      }

      // 2. Thực thi nghiệp vụ domain TRƯỚC — có thể throw/rollback thoải mái
      this.logger.debug(`Executing business logic for command ${command.commandId}`);
      const result = await businessLogic(tx);

      // 3. Chỉ SAU khi logic thành công mới đánh dấu processed — cùng transaction,
      //    nên nếu step 2 throw thì bước này cuộn theo và command còn khả retry.
      this.logger.debug(`Marking command ${command.commandId} as PROCESSED`);
      await tx.processedCommand.create({
        data: {
          id: command.commandId,
          status: 'PROCESSED',
        },
      });

      return result;
    });
  }

  /**
   * CHECK-ONLY: kiểm tra command đã xử lý chưa mà KHÔNG ghi gì vào DB.
   * Gọi TRƯỚC business logic; việc ghi processedCommand thuộc về executeIdempotent
   * (cùng transaction với logic) — tuyệt đối không ghi success ở bước này.
   */
  async assertNotProcessed(prismaClient: any, command: WorkflowCommand): Promise<void> {
    const existing = await prismaClient.processedCommand.findUnique({
      where: { id: command.commandId },
    });

    if (existing) {
      this.logger.warn(`Command ${command.commandId} was already processed. Ignoring.`);
      throw new ConflictException(
        `Command ${command.commandId} already processed (Idempotency check).`
      );
    }
  }

  /**
   * GHI processedCommand = PROCESSED trong cùng transaction với business logic.
   * Truyền `tx` (Prisma TransactionClient) khi gọi bên trong $transaction của
   * executeWithOutbox; nếu không truyền sẽ dùng prismaClient gốc (case tối thiểu).
   */
  async markProcessed(
    prismaClient: any,
    command: WorkflowCommand,
    tx?: any
  ): Promise<void> {
    const client = tx ?? prismaClient;
    await client.processedCommand.create({
      data: {
        id: command.commandId,
        status: 'PROCESSED',
      },
    });
  }
}
