import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { TaskSharedService } from '../task-shared/task-shared.service';

/**
 * Phiên bản mới (No-Code Workflow): 
 * Worker này sẽ đẩy các kiện bề mặt (ENTITY_CREATED, ENTITY_UPDATED)
 * qua hệ thống Message Broker chung thay vì gRPC cứng ngắc.
 * Hiện tại tạm dummy để đảm bảo xoá hết logic cũ theo yêu cầu.
 */
@Injectable()
export class TaskOutboxWorker {
  private readonly logger = new Logger(TaskOutboxWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TaskSharedService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutbox() {
    // 1. Fetch pending events
    const pendingEvents = await this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      take: 50,
      orderBy: { createdAt: 'asc' },
    });

    if (pendingEvents.length === 0) return;

    const eventIds = pendingEvents.map((e) => e.id);
    await this.prisma.outboxEvent.updateMany({
      where: { id: { in: eventIds } },
      data: { status: 'SYNCING' },
    });

    const processedIds: string[] = [];

    // 3. Process each event (Sẽ publish ra RabbitMQ thay vì gọi RPC trực tiếp)
    for (const event of pendingEvents) {
      try {
        // Tương lai: emit('workflow.auto_binding.trigger', event.payload)
        // Hiện tại: Chỉ mark là PROCESSED để không kẹt queue
        processedIds.push(event.id);
      } catch (error: any) {
        this.logger.error(`Failed to process outbox event ${event.id}`, error);
      }
    }

    if (processedIds.length > 0) {
      await this.prisma.outboxEvent.updateMany({
        where: { id: { in: processedIds } },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    }
  }
}
