import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

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
  constructor(private prisma: PrismaService) {}

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
          status: 'DRAFT',
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
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
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
            status: 'DRAFT',
            graph: dto.graph,
          },
        });
        return { def: updatedDef, version: newVersion };
      }

      if (latestVersion.status === 'PUBLISHED') {
        const newVersion = await tx.processVersion.create({
          data: {
            definitionId: id,
            version: latestVersion.version + 1,
            status: 'DRAFT',
            graph: dto.graph,
          },
        });
        return { def: updatedDef, version: newVersion };
      }

      const updatedVersion = await tx.processVersion.update({
        where: { id: latestVersion.id },
        data: { graph: dto.graph },
      });

      return { def: updatedDef, version: updatedVersion };
    });
  }

  async publishProcess(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const def = await tx.processDefinition.findUnique({
        where: { id },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
      });
      if (!def)
        throw new NotFoundException(`Process definition ${id} not found`);

      const latestVersion = def.versions[0];
      if (!latestVersion)
        throw new NotFoundException(`No versions found for process ${id}`);

      if (latestVersion.status === 'PUBLISHED') {
        return { def, version: latestVersion };
      }

      await tx.processVersion.update({
        where: { id: latestVersion.id },
        data: { status: 'PUBLISHED' },
      });
      latestVersion.status = 'PUBLISHED';

      return { def, version: latestVersion };
    });
  }

  async applyModule(id: string, moduleCode: string) {
    return this.prisma.$transaction(async (tx) => {
      const updatedDef = await tx.processDefinition.update({
        where: { id },
        data: { code: moduleCode, isActive: true },
      });

      const latestVersion = await tx.processVersion.findFirst({
        where: { definitionId: id },
        orderBy: { version: 'desc' },
      });

      if (!latestVersion || latestVersion.status === 'PUBLISHED') {
        return { def: updatedDef, version: latestVersion };
      }

      await tx.processVersion.update({
        where: { id: latestVersion.id },
        data: { status: 'PUBLISHED' },
      });
      latestVersion.status = 'PUBLISHED';

      return { def: updatedDef, version: latestVersion };
    });
  }

  async getProcesses() {
    return this.prisma.processDefinition.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Danh sách quy trình cho màn quản trị: phân trang có giới hạn, tìm theo tên/mã.
   * Không trả `graph` (có thể rất lớn) – chi tiết sơ đồ lấy qua getDefinitionById.
   */
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
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
            select: { version: true, status: true, createdAt: true },
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
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!def) {
      throw new NotFoundException(`Process definition ${code} not found`);
    }

    return def;
  }

  async getDefinitionById(id: string) {
    const def = await this.prisma.processDefinition.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!def) {
      throw new NotFoundException(`Process definition id ${id} not found`);
    }

    return def;
  }
}
