import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../infra/prisma.service';
import { RabbitMQService } from '../infra/rabbitmq.service';

/** Trạng thái vòng đời của một OutboxEvent. */
export const OUTBOX_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PUBLISHED: 'PUBLISHED',
  DEAD_LETTER: 'DEAD_LETTER',
} as const;

const MAX_ERROR_LENGTH = 1000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;

/**
 * OutboxPublisher — relay transactional outbox -> RabbitMQ.
 *
 * Bảo đảm:
 *  - At-least-once: chỉ đánh dấu PUBLISHED sau khi broker dispatch thành công.
 *    Consumer PHẢI idempotent theo `eventId`/`commandId` (document-service đã có inbox).
 *  - Không giữ DB transaction trong lúc gọi broker (BLACKLIST: async call trong transaction).
 *  - Nhiều replica an toàn: claim bằng conditional update (compare-and-set trên status),
 *    lease hết hạn (`claimedAt`) sẽ được thu hồi nếu replica chết giữa chừng.
 *  - Bounded: batch giới hạn, backoff mũ có trần + jitter, dead-letter sau `maxRetries`.
 */
@Injectable()
export class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private timer: NodeJS.Timeout | null = null;
  private running: Promise<any> | null = null;

  private readonly enabled: boolean;
  private readonly pollMs: number;
  private readonly batchSize: number;
  private readonly leaseMs: number;
  private readonly baseBackoffMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMq: RabbitMQService,
    config: ConfigService,
  ) {
    this.enabled = config.get<string>('WORKFLOW_OUTBOX_ENABLED', 'true') !== 'false';
    this.pollMs = this.boundedInt(config.get('WORKFLOW_OUTBOX_POLL_MS'), 2000, 200, 60000);
    this.batchSize = this.boundedInt(config.get('WORKFLOW_OUTBOX_BATCH'), 50, 1, 500);
    this.leaseMs = this.boundedInt(config.get('WORKFLOW_OUTBOX_LEASE_MS'), 60000, 5000, 600000);
    this.baseBackoffMs = this.boundedInt(config.get('WORKFLOW_OUTBOX_BACKOFF_MS'), 2000, 100, 60000);
  }

  onModuleInit() {
    if (!this.enabled) {
      this.logger.warn('OutboxPublisher disabled (WORKFLOW_OUTBOX_ENABLED=false)');
      return;
    }
    this.timer = setInterval(() => {
      // Không chồng lấn: bỏ qua tick nếu lượt trước chưa xong.
      if (this.running) return;
      this.running = this.tick()
        .catch((err) => this.logger.error(`Outbox tick failed: ${err?.message}`))
        .finally(() => {
          this.running = null;
        });
    }, this.pollMs);
    this.logger.log(`OutboxPublisher started (poll=${this.pollMs}ms, batch=${this.batchSize})`);
  }

  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.running) await this.running;
  }

  /** Một lượt relay. Public để test/ops có thể gọi thủ công. */
  async tick(): Promise<{ published: number; failed: number }> {
    const now = new Date();
    const staleLease = new Date(now.getTime() - this.leaseMs);

    const candidates = await this.prisma.outboxEvent.findMany({
      where: {
        OR: [
          {
            status: OUTBOX_STATUS.PENDING,
            OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
          },
          { status: OUTBOX_STATUS.PROCESSING, claimedAt: { lt: staleLease } },
        ],
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
      take: this.batchSize,
    });

    let published = 0;
    let failed = 0;
    for (const { id } of candidates) {
      const event = await this.claim(id, now, staleLease);
      if (!event) continue; // replica khác đã claim

      try {
        await this.rabbitMq.publish(event.eventType || event.commandType, this.toMessage(event));
        await this.markPublished(event);
        published++;
      } catch (err: any) {
        await this.markFailed(event, err);
        failed++;
      }
    }

    if (published || failed) {
      this.logger.log(`Outbox relay: published=${published} failed=${failed}`);
    }
    return { published, failed };
  }

  private async claim(id: string, now: Date, staleLease: Date) {
    const claimed = await this.prisma.outboxEvent.updateMany({
      where: {
        id,
        OR: [
          { status: OUTBOX_STATUS.PENDING },
          { status: OUTBOX_STATUS.PROCESSING, claimedAt: { lt: staleLease } },
        ],
      },
      data: { status: OUTBOX_STATUS.PROCESSING, claimedAt: now },
    });
    if (claimed.count !== 1) return null;
    return this.prisma.outboxEvent.findUnique({ where: { id } });
  }

  private toMessage(event: any) {
    const payload = (event.payload ?? {}) as Record<string, any>;
    return {
      ...payload,
      eventId: payload.eventId ?? event.eventId ?? event.id,
      schemaVersion: payload.schemaVersion ?? event.schemaVersion,
      correlationId: payload.correlationId ?? event.correlationId ?? undefined,
    };
  }

  private async markPublished(event: any) {
    const commandId = (event.payload as any)?.commandId;
    await this.prisma.$transaction(async (tx) => {
      await tx.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: OUTBOX_STATUS.PUBLISHED,
          processedAt: new Date(),
          claimedAt: null,
          error: null,
        },
      });
      // Đồng bộ trạng thái command: PENDING -> SENT (không lùi trạng thái nếu đã ACKED).
      if (event.eventType === 'workflow.command.sent' && commandId) {
        await tx.workflowCommand.updateMany({
          where: { id: commandId, status: 'PENDING' },
          data: { status: 'SENT', sentAt: new Date() },
        });
      }
    });
  }

  private async markFailed(event: any, err: any) {
    const retryCount = (event.retryCount ?? 0) + 1;
    const maxRetries = event.maxRetries ?? 8;
    const message = String(err?.message ?? err).slice(0, MAX_ERROR_LENGTH);

    if (retryCount >= maxRetries) {
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: OUTBOX_STATUS.DEAD_LETTER,
          retryCount,
          error: message,
          claimedAt: null,
          deadLetteredAt: new Date(),
        },
      });
      // Không log payload (có thể chứa dữ liệu nghiệp vụ) — chỉ log định danh.
      this.logger.error(
        `Outbox event ${event.id} (${event.eventType ?? event.commandType}) dead-lettered after ${retryCount} attempts: ${message}`,
      );
      return;
    }

    const backoff = Math.min(this.baseBackoffMs * 2 ** (retryCount - 1), MAX_BACKOFF_MS);
    const jitter = Math.floor(Math.random() * Math.min(1000, backoff / 2));
    await this.prisma.outboxEvent.update({
      where: { id: event.id },
      data: {
        status: OUTBOX_STATUS.PENDING,
        retryCount,
        error: message,
        claimedAt: null,
        nextRetryAt: new Date(Date.now() + backoff + jitter),
      },
    });
    this.logger.warn(`Outbox event ${event.id} retry ${retryCount}/${maxRetries} in ${backoff + jitter}ms`);
  }

  private boundedInt(raw: unknown, fallback: number, min: number, max: number) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(Math.max(Math.trunc(n), min), max);
  }
}
