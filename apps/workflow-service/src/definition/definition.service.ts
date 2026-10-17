import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../infra/prisma.service";
import { DefinitionValidatorService } from "./definition-validator.service";

export interface CreateDefinitionDto {
  code: string;
  name: string;
  description?: string;
  graph: any;
  organizationId?: string;
  ownerUnitCode?: string;
  createdBy?: string;
}

export interface UpdateDefinitionDto {
  code?: string;
  name?: string;
  description?: string;
  graph?: any;
  ownerUnitCode?: string;
}

@Injectable()
export class DefinitionService {
  private readonly definitionCache = new Map<string, { data: any; expiry: number }>();

  constructor(
    private prisma: PrismaService,
    private readonly validator: DefinitionValidatorService,
  ) {}

  private getCacheKey(identifier: string, organizationId?: string): string {
    return `${identifier}:${organizationId || "ALL"}`;
  }

  private purgeCache(id?: string, code?: string): void {
    if (id) {
      for (const key of this.definitionCache.keys()) {
        if (key.startsWith(`${id}:`)) this.definitionCache.delete(key);
      }
    }
    if (code) {
      for (const key of this.definitionCache.keys()) {
        if (key.startsWith(`${code}:`)) this.definitionCache.delete(key);
      }
    }
  }


  async createProcess(dto: CreateDefinitionDto) {
    // [P0 #12] Validate graph NGAY LÚC LƯU (giống publish): version DRAFT không hợp lệ
    // phải bị chặn từ createProcess, không đợi đến publish — reused DefinitionValidatorService.
    const validationResult = this.validator.validate(dto.graph || {});
    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Validation failed — process definition graph is invalid',
        errors: validationResult.errors,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const def = await tx.processDefinition.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          isActive: true,
          organizationId: dto.organizationId,
          ownerUnitCode: dto.ownerUnitCode,
          createdBy: dto.createdBy,
        },
      });

      const version = await tx.processVersion.create({
        data: {
          definitionId: def.id,
          version: 1,
          status: "DRAFT",
          graph: dto.graph || {},
        },
      });

      return { def, version };
    });
  }

  async updateProcess(id: string, dto: UpdateDefinitionDto, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const whereClause: any = { id };
      if (organizationId) whereClause.organizationId = organizationId;

      const def = await tx.processDefinition.findUnique({
        where: whereClause,
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      });

      if (!def)
        throw new NotFoundException(`Process definition ${id} not found`);

      const updatedDef = await tx.processDefinition.update({
        where: { id },
        data: {
          code: dto.code ?? def.code,
          name: dto.name ?? def.name,
          description: dto.description ?? def.description,
          ownerUnitCode: dto.ownerUnitCode ?? def.ownerUnitCode,
        },
      });

      if (!dto.graph) {
        return { def: updatedDef, version: def.versions[0] };
      }

      // [P0 #12] Validate graph NGAY LÚC LƯU (giống publish) — reused DefinitionValidatorService.validate(),
      // không viết logic mới; graph sai phải bị chặn trước khi vào DRAFT/PUBLISHED.
      const validationResult = this.validator.validate(dto.graph);
      if (!validationResult.valid) {
        throw new BadRequestException({
          message: 'Validation failed — process definition graph is invalid',
          errors: validationResult.errors,
        });
      }

      const latestVersion = def.versions[0];

      if (!latestVersion) {
        const newVersion = await tx.processVersion.create({
          data: {
            definitionId: id,
            version: 1,
            status: "DRAFT",
            graph: dto.graph,
          },
        });
        return { def: updatedDef, version: newVersion };
      }

      // Nếu bản mới nhất đã PUBLISHED → tạo draft version mới
      if (latestVersion.status === "PUBLISHED") {
        const newVersion = await tx.processVersion.create({
          data: {
            definitionId: id,
            version: latestVersion.version + 1,
            status: "DRAFT",
            graph: dto.graph,
          },
        });
        return { def: updatedDef, version: newVersion };
      }

      // DRAFT → cập nhật graph (chưa published → được phép sửa)
      const updatedVersion = await tx.processVersion.update({
        where: { id: latestVersion.id },
        data: { graph: dto.graph },
      });

      this.purgeCache(id, updatedDef.code);
      return { def: updatedDef, version: updatedVersion };
    });
  }

  /**
   * Validate graph mà KHÔNG publish — trả về lỗi có đường dẫn node/field để UI hiển thị.
   */
  async validateProcess(id: string, versionId?: string) {
    const def = await this.prisma.processDefinition.findUnique({
      where: { id },
      include: {
        versions: versionId
          ? { where: { id: versionId } }
          : { orderBy: { version: "desc" }, take: 1 },
      },
    });

    if (!def) throw new NotFoundException(`Process definition ${id} not found`);
    const version = def.versions[0];
    if (!version) throw new NotFoundException(`No version found for definition ${id}`);

    return this.validator.validate(version.graph as any);
  }

  /**
   * Publish version: validate → compile → lock (bất biến sau publish).
   *
   * Chỉ DRAFT mới có thể publish. PUBLISHED version không bị sửa.
   * Sau publish, instance cũ giữ version đã ghim; binding mới phải pin version mới.
   */
  async publishProcess(id: string, actorId: string = "SYSTEM") {
    return this.prisma.$transaction(async (tx) => {
      const def = await tx.processDefinition.findUnique({
        where: { id },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      });
      if (!def) throw new NotFoundException(`Process definition ${id} not found`);

      const latestVersion = def.versions[0];
      if (!latestVersion) throw new NotFoundException(`No versions found for process ${id}`);

      if (!def.ownerUnitCode) {
        throw new BadRequestException('Cần gán đơn vị sở hữu cho quy trình trước khi phát hành');
      }

      // Đã published → idempotent return
      if (latestVersion.status === "PUBLISHED") {
        return { def, version: latestVersion };
      }

      // Validate trước khi publish
      const validationResult = this.validator.validate(latestVersion.graph as any);
      if (!validationResult.valid) {
        throw new BadRequestException({
          message: "Validation failed — cannot publish",
          errors: validationResult.errors,
        });
      }

      // Compile graph sang canonical format
      const compiledGraph = this.validator.compile(latestVersion.graph as any);

      // Publish + lưu compiled graph và validation result
      const updated = await tx.processVersion.update({
        where: { id: latestVersion.id },
        data: {
          status: "PUBLISHED",
          compiledGraph,
          validationErrors: [],
          publishedBy: actorId,
          publishedAt: new Date(),
        },
      });

      this.purgeCache(def.id, def.code);
      return { def, version: updated };
    });
  }

  /**
   * @deprecated Dùng createBinding + bind actions riêng thay thế.
   * Giữ lại để backward-compat với code cũ — không thay đổi logic binding.
   */
  async applyModule(id: string, moduleCode: string) {
    return this.prisma.$transaction(async (tx) => {
      const updatedDef = await tx.processDefinition.update({
        where: { id },
        data: { code: moduleCode, isActive: true },
      });

      const latestVersion = await tx.processVersion.findFirst({
        where: { definitionId: id },
        orderBy: { version: "desc" },
      });

      if (!latestVersion || latestVersion.status === "PUBLISHED") {
        return { def: updatedDef, version: latestVersion };
      }

      await tx.processVersion.update({
        where: { id: latestVersion.id },
        data: { status: "PUBLISHED" },
      });
      latestVersion.status = "PUBLISHED";

      return { def: updatedDef, version: latestVersion };
    });
  }

  async getProcesses() {
    return this.prisma.processDefinition.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });
  }

  async listProcesses(params: {
    skip?: number;
    take?: number;
    search?: string;
    organizationId?: string;
    includeGraph?: boolean;
  }) {
    const skip = Math.max(0, Number(params.skip) || 0);
    const take = Math.min(100, Math.max(1, Number(params.take) || 20));
    const search = params.search?.trim().slice(0, 100);
    const includeGraph = params.includeGraph ?? false;

    const conditions: any[] = [];
    if (search) {
      conditions.push({
        OR: [{ name: { contains: search } }, { code: { contains: search } }],
      });
    }
    if (params.organizationId && params.organizationId !== "DEFAULT") {
      conditions.push({
        OR: [{ organizationId: params.organizationId }, { organizationId: null }],
      });
    }
    const where = conditions.length > 0 ? { AND: conditions } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.processDefinition.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          versions: {
            orderBy: { version: "desc" },
            take: 1,
            select: includeGraph
              ? {
                  version: true,
                  status: true,
                  createdAt: true,
                  publishedAt: true,
                  graph: true,
                  publishedBy: true,
                }
              : {
                  version: true,
                  status: true,
                  createdAt: true,
                  publishedAt: true,
                  publishedBy: true,
                },
          },
        },
      }),
      this.prisma.processDefinition.count({ where }),
    ]);

    return { items, total };
  }

  async getDefinition(code: string, organizationId?: string) {
    const cacheKey = this.getCacheKey(code, organizationId);
    const cached = this.definitionCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const whereClause: any = { code };
    if (organizationId && organizationId !== "DEFAULT") {
      whereClause.OR = [{ organizationId }, { organizationId: null }];
    }

    const def = await this.prisma.processDefinition.findFirst({
      where: whereClause,
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!def) throw new NotFoundException(`Process definition ${code} not found`);

    // Chỉ cache nếu version mới nhất là PUBLISHED (bất biến)
    if (def.versions[0]?.status === "PUBLISHED") {
      this.definitionCache.set(cacheKey, {
        data: def,
        expiry: Date.now() + 60_000, // 60 giây TTL
      });
    }

    return def;
  }

  async getDefinitionById(id: string, organizationId?: string) {
    const cacheKey = this.getCacheKey(id, organizationId);
    const cached = this.definitionCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const whereClause: any = { id };
    if (organizationId && organizationId !== "DEFAULT") {
      whereClause.OR = [{ organizationId }, { organizationId: null }];
    }

    const def = await this.prisma.processDefinition.findFirst({
      where: whereClause,
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!def) throw new NotFoundException(`Process definition id ${id} not found`);

    // Chỉ cache nếu version mới nhất là PUBLISHED (bất biến)
    if (def.versions[0]?.status === "PUBLISHED") {
      this.definitionCache.set(cacheKey, {
        data: def,
        expiry: Date.now() + 60_000, // 60 giây TTL
      });
    }

    return def;
  }

  async deleteProcess(id: string, organizationId?: string) {
    const whereClause: any = { id };
    if (organizationId && organizationId !== "DEFAULT") {
      whereClause.OR = [{ organizationId }, { organizationId: null }];
    }
    const def = await this.prisma.processDefinition.findFirst({ where: whereClause });
    if (!def) throw new NotFoundException(`Process definition ${id} not found`);

    const activeBindings = await this.prisma.processBinding.count({
      where: { definitionId: id, status: "ACTIVE" },
    });
    if (activeBindings > 0) {
      throw new BadRequestException("Không thể xóa quy trình đang có gắn kết nghiệp vụ (Binding) hoạt động");
    }

    this.purgeCache(id, def.code);
    return this.prisma.processDefinition.delete({ where: { id } });
  }

  // ==========================================
  // BINDING (Legacy — kept for backward-compat)
  // ==========================================

  async createBinding(data: {
    entityType: string;
    eventTrigger: string;
    workflowDefinitionId: string;
  }) {
    return this.prisma.workflowBinding.upsert({
      where: {
        entityType_eventTrigger: {
          entityType: data.entityType,
          eventTrigger: data.eventTrigger,
        },
      },
      update: {
        workflowDefinitionId: data.workflowDefinitionId,
        isActive: true,
      },
      create: {
        entityType: data.entityType,
        eventTrigger: data.eventTrigger,
        workflowDefinitionId: data.workflowDefinitionId,
        isActive: true,
      },
    });
  }

  async getBindings() {
    return this.prisma.workflowBinding.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteBinding(id: string) {
    return this.prisma.workflowBinding.delete({ where: { id } });
  }
}
