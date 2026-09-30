import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { firstValueFrom } from 'rxjs';

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

    // 2. Đánh dấu tất cả là SYNCING trong 1 query (Batch Update - Tránh N+1)
    const eventIds = pendingEvents.map((e) => e.id);
    await this.prisma.outboxEvent.updateMany({
      where: { id: { in: eventIds } },
      data: { status: 'SYNCING' },
    });

    const processedIds: string[] = [];
    const failedEvents: { id: string; error: string; retryCount: number }[] = [];
    const taskUpdates: { taskId: number; workflowInstId: string }[] = [];

    // 3. Process each event (Chỉ gọi gRPC, gom DB Operations vào RAM)
    for (const event of pendingEvents) {
      try {
        const payload = event.payload as any;

        if (event.commandType === 'START_WORKFLOW') {
          const res = await firstValueFrom<any>(
            this.shared.workflowService.StartWorkflow(payload)
          );
          
          if (res?.id && payload.businessId) {
             taskUpdates.push({
               taskId: parseInt(payload.businessId, 10),
               workflowInstId: res.id
             });
          }
        } else if (event.commandType === 'VALIDATE_ACTION') {
           // Tương lai xử lý action submit 
        }

        processedIds.push(event.id);
      } catch (error: any) {
        this.logger.error(`Failed to process outbox event ${event.id}`, error);
        failedEvents.push({
          id: event.id,
          error: error?.message || 'Unknown error',
          retryCount: event.retryCount + 1,
        });
      }
    }

    // 4. Thực thi Cập nhật hàng loạt (Batch Commit) bằng Transaction
    const txOperations: any[] = [];

    for (const tu of taskUpdates) {
      txOperations.push(
        this.prisma.task.update({
          where: { id: tu.taskId },
          data: { workflowInstId: tu.workflowInstId }
        })
      );
    }

    if (processedIds.length > 0) {
      txOperations.push(
        this.prisma.outboxEvent.updateMany({
          where: { id: { in: processedIds } },
          data: { status: 'PROCESSED', processedAt: new Date() },
        })
      );
    }

    for (const fail of failedEvents) {
      txOperations.push(
        this.prisma.outboxEvent.update({
          where: { id: fail.id },
          data: { 
            status: 'FAILED',
            retryCount: fail.retryCount,
            errorReason: fail.error
          }
        })
      );
    }

    if (txOperations.length > 0) {
      await this.prisma.$transaction(txOperations);
    }
  }
}
