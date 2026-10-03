import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateUpstreamDto, UpdateUpstreamDto } from './dto/upstream.dto';
import { Prisma } from '@generated/prisma';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class IntegrationConfigService {
  private readonly logger = new Logger(IntegrationConfigService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('INTEGRATION_EVENTS') private rmqClient: ClientProxy,
  ) {}

  async createUpstream(dto: CreateUpstreamDto, userId: string) {
    const upstream = await this.prisma.integrationUpstream.create({
      data: {
        name: dto.name,
        type: dto.type,
        baseUrl: dto.baseUrl,
        allowedPaths: dto.allowedPaths as any,
        allowedMethods: dto.allowedMethods as any,
        auth: dto.auth as any,
        timeoutMs: dto.timeoutMs,
        retry: dto.retry as any,
        cacheTtlSec: dto.cacheTtlSec,
        rateLimit: dto.rateLimit as any,
        roles: dto.roles as any,
        scopes: dto.scopes as any,
        requestSchema: dto.requestSchema,
        responseLimit: dto.responseLimit,
        metadata: (dto as any).metadata,
        enabled: dto.enabled ?? true,
        version: 1,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.logAudit(
      upstream.name,
      'CREATE',
      userId,
      { after: upstream },
      upstream.version,
    );
    this.emitRegistryChanged(upstream);

    return upstream;
  }

  async updateUpstream(id: string, dto: UpdateUpstreamDto, userId: string) {
    const existing = await this.prisma.integrationUpstream.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Upstream not found');
    }

    const nextVersion = existing.version + 1;

    const upstream = await this.prisma.integrationUpstream.update({
      where: { id },
      data: {
        ...dto,
        version: nextVersion,
        updatedBy: userId,
      } as any,
    });

    await this.logAudit(
      upstream.name,
      'UPDATE',
      userId,
      { before: existing, after: upstream },
      upstream.version,
    );
    this.emitRegistryChanged(upstream);

    return upstream;
  }

  async getAllUpstreams() {
    return this.prisma.integrationUpstream.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUpstreamById(id: string) {
    const upstream = await this.prisma.integrationUpstream.findUnique({
      where: { id },
    });
    if (!upstream) throw new NotFoundException('Upstream not found');
    return upstream;
  }

  async deleteUpstream(id: string, userId: string) {
    const existing = await this.prisma.integrationUpstream.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Upstream not found');
    }

    await this.prisma.integrationUpstream.delete({ where: { id } });

    await this.logAudit(
      existing.name,
      'DELETE',
      userId,
      { before: existing },
      existing.version + 1,
    );

    // Emit event that it was deleted
    this.rmqClient.emit('registry.changed', {
      version: existing.version + 1,
      upstream: existing.name,
      action: 'DELETE',
      at: new Date().toISOString(),
    });

    return { success: true };
  }

  private emitRegistryChanged(upstream: any) {
    this.rmqClient.emit('registry.changed', {
      version: upstream.version,
      upstream: upstream.name,
      action: 'UPSERT',
      at: new Date().toISOString(),
    });
    this.logger.log(
      `Emitted registry.changed event for upstream: ${upstream.name}`,
    );
  }

  private async logAudit(
    upstreamName: string,
    action: string,
    changedBy: string,
    changes: any,
    version: number,
  ) {
    const safeChanges = JSON.parse(JSON.stringify(changes));
    if (safeChanges.before?.auth?.secretRef)
      safeChanges.before.auth.secretRef = '***';
    if (safeChanges.after?.auth?.secretRef)
      safeChanges.after.auth.secretRef = '***';

    await this.prisma.integrationUpstreamAudit.create({
      data: {
        upstreamName,
        action,
        changedBy,
        changes: safeChanges,
        version,
      },
    });
  }
}
