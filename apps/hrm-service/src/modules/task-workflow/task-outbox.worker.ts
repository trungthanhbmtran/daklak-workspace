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

    // 2. Process each event
    for (const event of pendingEvents) {
      try {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'SYNCING' },
        });

        const payload = event.payload as any;

        if (event.commandType === 'START_WORKFLOW') {
          const res = await firstValueFrom<any>(
            this.shared.workflowService.StartWorkflow(payload)
          );
          
          if (res?.id) {
             // Cập nhật lại Task workflowInstId
             const businessId = payload.businessId;
             if (businessId) {
               await this.prisma.task.update({
                 where: { id: parseInt(businessId, 10) },
                 data: { workflowInstId: res.id }
               });
             }
          }
        } else if (event.commandType === 'VALIDATE_ACTION') {
           // Tương lai xử lý action submit 
        }

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'PROCESSED', processedAt: new Date() },
        });
      } catch (error: any) {
        this.logger.error(`Failed to process outbox event ${event.id}`, error);
        
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { 
            status: 'FAILED',
            retryCount: event.retryCount + 1,
            errorReason: error?.message || 'Unknown error'
          },
        });
      }
    }
  }
}
