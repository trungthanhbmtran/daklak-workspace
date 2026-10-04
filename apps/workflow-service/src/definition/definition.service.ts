import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../infra/prisma.service";
import { DefinitionValidatorService } from "./definition-validator.service";

export interface CreateDefinitionDto {
  code: string;
  name: string;
  description?: string;
  graph: any;
}

export interface UpdateDefinitionDto {
  code?: string;
  name?: string;
  description?: string;
  graph?: any;
}

@Injectable()
export class DefinitionService {
  constructor(
    private prisma: PrismaService,
    private readonly validator: DefinitionValidatorService,
  ) {}

  async createProcess(dto: CreateDefinitionDto) {
    return this.prisma.$transaction(async (tx) => {
      const def = await tx.processDefinition.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          isActive: true,
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

  async updateProcess(id: string, dto: UpdateDefinitionDto) {
    return this.prisma.$transaction(async (tx) => {
      const def = await tx.processDefinition.findUnique({
        where: { id },
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
        },
      });

      if (!dto.graph) {
        return { def: updatedDef, version: def.versions[0] };
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

  async listProcesses(params: { skip?: number; take?: number; search?: string }) {
    const skip = Math.max(0, Number(params.skip) || 0);
    const take = Math.min(100, Math.max(1, Number(params.take) || 20));
    const search = params.search?.trim().slice(0, 100);
    const where = search
      ? { OR: [{ name: { contains: search } }, { code: { contains: search } }] }
      : {};

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
            select: { version: true, status: true, createdAt: true, publishedAt: true },
          },
        },
      }),
      this.prisma.processDefinition.count({ where }),
    ]);

    return { items, total };
  }

  async getDefinition(code: string) {
    const def = await this.prisma.processDefinition.findUnique({
      where: { code },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!def) throw new NotFoundException(`Process definition ${code} not found`);
    return def;
  }

  async getDefinitionById(id: string) {
    const def = await this.prisma.processDefinition.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!def) throw new NotFoundException(`Process definition id ${id} not found`);
    return def;
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
