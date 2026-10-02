import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '@/database/prisma.service';
import type { RefreshSession } from '../../../../../shared/core/auth-session';
import { RefreshConflictError } from './auth-session.store';

@Injectable()
export class AuthDeviceStore {
  constructor(private readonly prisma: PrismaService) {}
  private hash(token: string) { return createHash('sha256').update(token).digest('hex'); }

  async create(token: string, session: RefreshSession) {
    await this.prisma.authDeviceSession.create({
      data: {
        id: session.sessionId, userId: session.userId, authVersion: session.authVersion,
        expiresAt: new Date(session.expiresAt * 1000),
        handles: { create: { hash: this.hash(token) } },
      },
    });
  }
  async read(token: string): Promise<RefreshSession | null> {
    const handle = await this.prisma.authRefreshHandle.findUnique({
      where: { hash: this.hash(token) }, include: { session: true },
    });
    if (!handle || handle.session.revokedAt || handle.session.expiresAt.getTime() <= Date.now()) return null;
    if (handle.status === 'USED') throw new RefreshConflictError();
    if (handle.status !== 'ACTIVE') return null;
    return {
      userId: handle.session.userId, sessionId: handle.sessionId,
      authVersion: handle.session.authVersion,
      expiresAt: Math.floor(handle.session.expiresAt.getTime() / 1000),
    };
  }
  async rotate(oldToken: string, newToken: string, session: RefreshSession): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const active = await tx.authDeviceSession.findFirst({
        where: { id: session.sessionId, userId: session.userId, revokedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!active) return false;
      const updated = await tx.authRefreshHandle.updateMany({
        where: { hash: this.hash(oldToken), sessionId: session.sessionId, status: 'ACTIVE' },
        data: { status: 'USED' },
      });
      if (!updated.count) return false;
      await tx.authRefreshHandle.create({ data: { hash: this.hash(newToken), sessionId: session.sessionId } });
      return true;
    });
  }
  async revoke(token: string): Promise<string | null> {
    const handle = await this.prisma.authRefreshHandle.findUnique({ where: { hash: this.hash(token) } });
    if (!handle) return null;
    await this.prisma.authDeviceSession.updateMany({
      where: { id: handle.sessionId, revokedAt: null }, data: { revokedAt: new Date() },
    });
    return handle.sessionId;
  }
}

