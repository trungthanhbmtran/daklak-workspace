import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TaskTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { classification?: string; rank?: string }) {
    const where: any = {};
    if (params.classification) where.classification = params.classification;
    if (params.rank) where.rank = params.rank;

    const templates = await this.prisma.taskRankTemplate.findMany({ where });
    return { templates };
  }

  async create(data: { classification: string; rank: string; taskName: string; defaultUnit: string; defaultWeight?: number }) {
    const template = await this.prisma.taskRankTemplate.create({
      data: {
        classification: data.classification,
        rank: data.rank,
        taskName: data.taskName,
        defaultUnit: data.defaultUnit,
        defaultWeight: data.defaultWeight,
      },
    });
    return template;
  }

  async delete(data: { id: number }) {
    await this.prisma.taskRankTemplate.delete({
      where: { id: data.id },
    });
    return { success: true };
  }
}
