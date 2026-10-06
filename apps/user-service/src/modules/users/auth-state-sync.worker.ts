import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AuthSessionStore } from './auth-session.store';

@Injectable()
export class AuthStateSyncWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private busy = false;
  private readonly logger = new Logger(AuthStateSyncWorker.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: AuthSessionStore,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.flush();
    }, 10000);
    this.timer.unref();
  }
  async flush() {
    if (this.busy) return;
    this.busy = true;
    try {
      const jobs = await this.prisma.authStateSync.findMany({
        where: { status: 'PENDING' },
        orderBy: { updatedAt: 'asc' },
        take: 100,
      });
      if (jobs.length > 0) {
        await Promise.all(jobs.map(job => this.sessions.revokeAllForUser(job.userId, job.authVersion)));
        await this.prisma.authStateSync.updateMany({
          where: { userId: { in: jobs.map(j => j.userId) }, status: 'PENDING' },
          data: { status: 'PROCESSED' }
        });
      }
      const revoked = await this.prisma.authDeviceSession.findMany({
        where: { revokedAt: { not: null }, redisCleaned: false },
        take: 100,
      });
      if (revoked.length > 0) {
        await Promise.all(revoked.map(session => this.sessions.revokeSession(session.id)));
        await this.prisma.authDeviceSession.updateMany({
          where: { id: { in: revoked.map(s => s.id) }, revokedAt: { not: null } },
          data: { redisCleaned: true }
        });
      }
    } catch {
      this.logger.warn(
        'Auth state synchronization pending; durable account version remains authoritative',
      );
    } finally {
      this.busy = false;
    }
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
