import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

export interface CreateDefinitionDto {
  code: string;
  name: string;
  description?: string;
  graph: any;
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
          status: 'PUBLISHED',
          graph: dto.graph,
        },
      });

      return { def, version };
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
      throw new NotFoundException(`Process definition code ${code} not found`);
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
