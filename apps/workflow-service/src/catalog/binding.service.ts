import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../infra/prisma.service";
import { ProcessCatalogService } from "./process-catalog.service";

export interface CreateBindingDto {
  processTypeCode: string;
  definitionId: string;
  pinnedVersionId?: string;
  organizationId?: string;
  trigger: string;
  criteria?: Record<string, any>;
  priority?: number;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  createdBy: string;
  reason?: string;
}

export interface UpdateBindingDto {
  pinnedVersionId?: string;
  status?: string;
  priority?: number;
  effectiveTo?: Date;
  reason?: string;
  updatedBy: string;
}

export interface ResolveBindingResult {
  found: boolean;
  bindingId?: string;
  definitionId?: string;
  pinnedVersionId?: string;
  reason?: string;
}

/**
 * BindingService — quản lý ProcessBinding theo org scope/version pinning/priority.
 *
 * Resolver logic:
 *   1. Lọc binding theo processTypeId + trigger + status=ACTIVE + effective window
 *   2. Lọc theo organizationId (org-specific trước, global fallback sau)
 *   3. Trong ENFORCE: 0 kết quả = fail-closed, >1 kết quả = ambiguous (fail-closed)
 *   4. Trong OBSERVE: log warning, tiếp tục
 */
@Injectable()
export class BindingService {
  private readonly logger = new Logger(BindingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: ProcessCatalogService,
  ) {}

  async create(dto: CreateBindingDto) {
    // 1. Validate processType tồn tại và trigger hợp lệ
    await this.catalog.validateTrigger(dto.processTypeCode, dto.trigger);

    const processType = await this.catalog.findByCode(dto.processTypeCode);

    // 2. Validate pinnedVersionId nếu có — phải là PUBLISHED
    if (dto.pinnedVersionId) {
      const version = await this.prisma.processVersion.findUnique({
        where: { id: dto.pinnedVersionId },
      });
      if (!version || version.status !== "PUBLISHED") {
        throw new BadRequestException(
          `Version ${dto.pinnedVersionId} is not published. Only PUBLISHED versions can be pinned to a binding.`,
        );
      }
      if (version.definitionId !== dto.definitionId) {
        throw new BadRequestException(
          `Version ${dto.pinnedVersionId} does not belong to definition ${dto.definitionId}.`,
        );
      }
    }

    // 3. Tạo binding
    const binding = await this.prisma.$transaction(async (tx) => {
      const created = await tx.processBinding.create({
        data: {
          processTypeId: processType.id,
          definitionId: dto.definitionId,
          pinnedVersionId: dto.pinnedVersionId,
          organizationId: dto.organizationId ?? null,
          trigger: dto.trigger,
          criteria: dto.criteria,
          priority: dto.priority ?? 100,
          status: 'ACTIVE',
          effectiveFrom: dto.effectiveFrom ?? null,
          effectiveTo: dto.effectiveTo ?? null,
          createdBy: dto.createdBy,
          reason: dto.reason,
        },
      });

      // Audit log
      await tx.bindingAudit.create({
        data: {
          bindingId: created.id,
          action: 'CREATED',
          actorId: dto.createdBy,
          reason: dto.reason,
          snapshot: created as any,
        },
      });

      return created;
    });

    this.logger.log(
      `Created binding ${binding.id} for processType=${dto.processTypeCode} org=${dto.organizationId ?? "GLOBAL"} trigger=${dto.trigger}`,
    );
    return binding;
  }

  async findById(id: string, organizationId?: string) {
    const binding = await this.prisma.processBinding.findFirst({
      where: { id, ...(organizationId ? { organizationId } : {}) },
      include: { processType: true, definition: true, pinnedVersion: true },
    });
    if (!binding) throw new NotFoundException(`Binding ${id} not found`);
    return binding;
  }

  async list(params: { processTypeCode?: string; organizationId?: string; status?: string; skip?: number; take?: number }) {
    const skip = Math.max(0, params.skip ?? 0);
    const take = Math.min(100, params.take ?? 20);

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.processTypeCode) {
      where.processType = { code: params.processTypeCode };
    }
    if (params.organizationId !== undefined) {
      where.organizationId = params.organizationId ?? null;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.processBinding.findMany({
        where,
        skip,
        take,
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        include: { processType: true, pinnedVersion: { select: { version: true, status: true } } },
      }),
      this.prisma.processBinding.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, dto: UpdateBindingDto) {
    return this.prisma.$transaction(async (tx) => {
      const binding = await tx.processBinding.findUnique({ where: { id } });
      if (!binding) throw new NotFoundException(`Binding ${id} not found`);

      // Validate pinnedVersionId nếu được thay đổi
      if (dto.pinnedVersionId && dto.pinnedVersionId !== binding.pinnedVersionId) {
        const version = await tx.processVersion.findUnique({
          where: { id: dto.pinnedVersionId },
        });
        if (!version || version.status !== 'PUBLISHED') {
          throw new BadRequestException(
            `Version ${dto.pinnedVersionId} is not published. Only PUBLISHED versions can be pinned.`,
          );
        }
        if (version.definitionId !== binding.definitionId) {
          throw new BadRequestException(
            `Version ${dto.pinnedVersionId} does not belong to definition ${binding.definitionId}.`,
          );
        }
      }

      const updateData: any = {};
      if (dto.pinnedVersionId !== undefined) updateData.pinnedVersionId = dto.pinnedVersionId;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.priority !== undefined) updateData.priority = dto.priority;
      if (dto.effectiveTo !== undefined) updateData.effectiveTo = dto.effectiveTo;
      if (dto.reason !== undefined) updateData.reason = dto.reason;
      updateData.updatedAt = new Date();

      const updated = await tx.processBinding.update({
        where: { id },
        data: updateData,
      });

      await tx.bindingAudit.create({
        data: {
          bindingId: id,
          action: 'UPDATED',
          actorId: dto.updatedBy,
          reason: dto.reason,
          snapshot: updated as any,
        },
      });

      return updated;
    });
  }

  async deactivate(
    id: string,
    actorId: string,
    reason?: string,
    organizationId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const binding = await tx.processBinding.findFirst({
        where: { id, ...(organizationId ? { organizationId } : {}) },
      });
      if (!binding) throw new NotFoundException(`Binding ${id} not found`);
      if (binding.status === 'INACTIVE') return binding;

      const updated = await tx.processBinding.update({
        where: { id },
        data: { status: 'INACTIVE', updatedAt: new Date() },
      });

      await tx.bindingAudit.create({
        data: {
          bindingId: id,
          action: 'DEACTIVATED',
          actorId,
          reason,
          snapshot: updated as any,
        },
      });

      return updated;
    });
  }

  /**
   * Resolve binding xác định cho (processTypeCode, organizationId, trigger).
   *
   * Quy tắc ưu tiên:
   *   1. Binding theo organization (org-specific, nhỏ priority hơn trước)
   *   2. Fallback binding global (organizationId = null)
   *   3. Chỉ chọn duy nhất 1 kết quả; ambiguous = fail
   */
  async resolveBinding(params: {
    processTypeCode: string;
    organizationId: string;
    trigger: string;
    context?: Record<string, any>;
  }): Promise<ResolveBindingResult> {
    const processType = await this.prisma.processType.findUnique({
      where: { code: params.processTypeCode },
    });

    if (!processType) {
      return { found: false, reason: "PROCESS_TYPE_NOT_FOUND" };
    }

    const now = new Date();
    const baseWhere = {
      processTypeId: processType.id,
      trigger: params.trigger,
      status: "ACTIVE",
      AND: [
        { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }] },
        { OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }] },
      ],
    };

    // Thử org-specific trước
    const orgBindings = await this.prisma.processBinding.findMany({
      where: { ...baseWhere, organizationId: params.organizationId },
      orderBy: [{ priority: "asc" }],
    });

    if (orgBindings.length === 1) {
      return this._buildResult(orgBindings[0]);
    }

    if (orgBindings.length > 1) {
      this.logger.warn(
        `AMBIGUOUS binding: ${orgBindings.length} active bindings for processType=${params.processTypeCode} org=${params.organizationId} trigger=${params.trigger}`,
      );
      return { found: false, reason: "AMBIGUOUS" };
    }

    // Fallback: global binding
    const globalBindings = await this.prisma.processBinding.findMany({
      where: { ...baseWhere, organizationId: null },
      orderBy: [{ priority: "asc" }],
    });

    if (globalBindings.length === 1) {
      return this._buildResult(globalBindings[0]);
    }

    if (globalBindings.length > 1) {
      this.logger.warn(
        `AMBIGUOUS global binding: ${globalBindings.length} for processType=${params.processTypeCode} trigger=${params.trigger}`,
      );
      return { found: false, reason: "AMBIGUOUS" };
    }

    this.logger.warn(
      `NO_BINDING for processType=${params.processTypeCode} org=${params.organizationId} trigger=${params.trigger}`,
    );
    return { found: false, reason: "NO_BINDING" };
  }

  private _buildResult(binding: any): ResolveBindingResult {
    return {
      found: true,
      bindingId: binding.id,
      definitionId: binding.definitionId,
      pinnedVersionId: binding.pinnedVersionId ?? undefined,
    };
  }
}
