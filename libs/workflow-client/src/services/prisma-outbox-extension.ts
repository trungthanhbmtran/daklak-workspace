import { Prisma } from '@prisma/client/extension';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

/**
 * ALLOWLIST các model workflow được phép phát sự kiện Outbox khi create/update.
 *
 * Lý do (chống event storm): trước đây extension phát outbox cho MỌI model
 * create/update → mỗi mutation nghiệp vụ bất kỳ gây 1 dòng OutboxEvent, trong khi
 * chỉ các model tham gia điều phối workflow mới cần relay qua outbox. Các model
 * ngoài danh sách được bỏ qua hoàn toàn.
 *
 * Nguồn danh sách: apps/workflow-service/prisma/schema/main.prisma (các model
 * workflow/runtime). Loại trừ rõ ràng:
 *  - `OutboxEvent`: chính là bảng outbox — ghi event cho event outbox sẽ tự nhân bản
 *    (event loop/event storm).
 *  - `ProcessedCommand`: là inbox idempotency — mỗi command xử lý xong đều ghi 1 dòng,
 *    phát outbox cho nó tạo أجل tròn vô nghĩa (processed → outbox → publish → ...).
 */
export const WORKFLOW_OUTBOX_ALLOWED_MODELS: ReadonlySet<string> = new Set([
  'WorkflowCommand', // lệnh điều phối workflow-service ↔ domain service
  'WorkflowEvent',
  'WorkflowMessage',
  'WorkflowTask',
  'WorkflowTransition',
  'WorkflowBinding',
  'DomainAck', // ACK từ domain service về kết quả xử lý lệnh
  'ProcessInstance',
  'ProcessBinding', // gắn kết domain entity ↔ process definition
]);

const logger = new Logger('WorkflowOutboxExtension');

export const withWorkflowOutbox = () => {
  return Prisma.defineExtension((client) => {
    const publishOutboxEvent = async (
      model: string,
      operation: string,
      result: any,
      commandType: string
    ) => {
      // Chỉ model trong allowlist workflow mới được phát sự kiện (xem chú thích allowlist).
      if (
        !WORKFLOW_OUTBOX_ALLOWED_MODELS.has(model) ||
        !(client as any).outboxEvent
      ) {
        return;
      }

      // Ghi sự kiện vào bảng OutboxEvent (giả sử client.outboxEvent có sẵn)
      try {
        await (client as any).outboxEvent.create({
          data: {
            id: uuidv4(),
            workflowInstanceId: 'auto-binding', // Sẽ được match ở WorkflowEngine
            processVersion: 0,
            nodeId: 'trigger',
            commandType,
            payload: {
              entity: model,
              operation: operation,
              data: result,
            },
            status: 'PENDING',
          },
        });
      } catch (err) {
        // Nuốt lỗi có chủ đích: lỗi outbox không được phá vỡ business logic đã commit.
        // Sử dụng Nest Logger thay cho console.error (ràng buộc Vệ sinh Mã nguồn).
        logger.error(
          `Failed to publish outbox event for ${operation} on ${model}: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    };

    return client.$extends({
      name: 'workflow-outbox-publisher',
      query: {
        $allModels: {
          async create({ model, operation, args, query }) {
            // Thực thi operation gốc
            const result = await query(args);
            await publishOutboxEvent(model!, operation, result, 'ENTITY_CREATED');
            return result;
          },

          async update({ model, operation, args, query }) {
            const result = await query(args);
            await publishOutboxEvent(model!, operation, result, 'ENTITY_UPDATED');
            return result;
          },
        },
      },
    });
  });
};
