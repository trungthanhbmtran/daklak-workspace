import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OutboxWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxWorkerService.name);
  private timer: NodeJS.Timeout;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('INTEGRATION_EVENTS') private readonly rmqClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => this.processOutbox(), 5000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async processOutbox() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find up to 50 pending events
      const events = await this.prisma.apiOutbox.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });

      if (events.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(`Found ${events.length} pending outbox events.`);

      for (const event of events) {
        try {
          // Broadcast event to RabbitMQ
          this.rmqClient.emit(event.topic, event.payload);

          // Mark as sent
          await this.prisma.apiOutbox.update({
            where: { id: event.id },
            data: { status: 'SENT' },
          });
        } catch (error: any) {
          this.logger.error(
            `Failed to process event ${event.id}: ${error.message}`,
          );

          const retryCount = event.retryCount + 1;
          await this.prisma.apiOutbox.update({
            where: { id: event.id },
            data: {
              retryCount,
              status: retryCount >= 5 ? 'DEAD_LETTER' : 'PENDING',
            },
          });
        }
      }
    } catch (error: any) {
      this.logger.error(`Error in outbox worker polling: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
