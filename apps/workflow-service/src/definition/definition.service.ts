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

      if (!def) throw new NotFoundException(`Process definition ${id} not found`);

      const updatedDef = await tx.processDefinition.update({
        where: { id },
        data: {
          code: dto.code ?? def.code,
          name: dto.name ?? def.name,
          description: dto.description ?? def.description,
        },
      });

      let latestVersion = def.versions[0];

      if (dto.graph) {
        if (latestVersion && latestVersion.status === 'PUBLISHED') {
          latestVersion = await tx.processVersion.create({
            data: {
              definitionId: id,
              version: latestVersion.version + 1,
              status: 'DRAFT',
              graph: dto.graph,
            },
          });
        } else if (latestVersion) {
          latestVersion = await tx.processVersion.update({
            where: { id: latestVersion.id },
            data: { graph: dto.graph },
          });
        } else {
           latestVersion = await tx.processVersion.create({
            data: {
              definitionId: id,
              version: 1,
              status: 'DRAFT',
              graph: dto.graph,
            },
          });
        }
      }

      return { def: updatedDef, version: latestVersion };
    });
  }

  async publishProcess(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const def = await tx.processDefinition.findUnique({
        where: { id },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
      });
      if (!def) throw new NotFoundException(`Process definition ${id} not found`);

      const latestVersion = def.versions[0];
      if (!latestVersion) throw new NotFoundException(`No versions found for process ${id}`);

      if (latestVersion.status !== 'PUBLISHED') {
        await tx.processVersion.update({
          where: { id: latestVersion.id },
          data: { status: 'PUBLISHED' },
        });
        latestVersion.status = 'PUBLISHED';
      }

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

      if (latestVersion && latestVersion.status !== 'PUBLISHED') {
        await tx.processVersion.update({
          where: { id: latestVersion.id },
          data: { status: 'PUBLISHED' },
        });
        latestVersion.status = 'PUBLISHED';
      }

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
