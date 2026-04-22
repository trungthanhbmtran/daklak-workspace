import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    postId?: string;
    actorId: string;
    action: string;
    entityId: string;
    entityType?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        postId: data.postId,
        actorId: data.actorId,
        action: data.action,
        entityId: data.entityId,
        entityType: data.entityType || 'POST',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getLogsByPost(postId: string) {
    return this.prisma.auditLog.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
