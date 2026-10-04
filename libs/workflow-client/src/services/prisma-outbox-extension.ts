import { Prisma } from '@prisma/client/extension';
import { v4 as uuidv4 } from 'uuid';

export const withWorkflowOutbox = () => {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: 'workflow-outbox-publisher',
      query: {
        $allModels: {
          async create({ model, operation, args, query }) {
            // Thực thi operation gốc
            const result = await query(args);

            // Bỏ qua nếu model là các bảng hệ thống
            if (
              model === 'OutboxEvent' ||
              model === 'ProcessedCommand' ||
              model.startsWith('Workflow')
            ) {
              return result;
            }

            // Ghi sự kiện vào bảng OutboxEvent (giả sử client.outboxEvent có sẵn)
            try {
              if ((client as any).outboxEvent) {
                await (client as any).outboxEvent.create({
                  data: {
                    id: uuidv4(),
                    workflowInstanceId: 'auto-binding', // Sẽ được match ở WorkflowEngine
                    processVersion: 0,
                    nodeId: 'trigger',
                    commandType: 'ENTITY_CREATED',
                    payload: {
                      entity: model,
                      operation: operation,
                      data: result,
                    },
                    status: 'PENDING',
                  },
                });
              }
            } catch (err) {
              // Ignore or log error silently - don't break business logic if Outbox fails
              console.error(`Failed to publish outbox event for ${model}.create`);
            }
            return result;
          },

          async update({ model, operation, args, query }) {
            const result = await query(args);
            if (
              model === 'OutboxEvent' ||
              model === 'ProcessedCommand' ||
              model.startsWith('Workflow')
            ) {
              return result;
            }
            try {
              if ((client as any).outboxEvent) {
                await (client as any).outboxEvent.create({
                  data: {
                    id: uuidv4(),
                    workflowInstanceId: 'auto-binding',
                    processVersion: 0,
                    nodeId: 'trigger',
                    commandType: 'ENTITY_UPDATED',
                    payload: {
                      entity: model,
                      operation: operation,
                      data: result,
                    },
                    status: 'PENDING',
                  },
                });
              }
            } catch (err) {
              console.error(`Failed to publish outbox event for ${model}.update`);
            }
            return result;
          },
        },
      },
    });
  });
};
