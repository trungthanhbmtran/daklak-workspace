import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaskTemplatesService {
  constructor(private prisma: PrismaService) { }

  async findAll(query: any) {
    const where: any = {};
    if (query.classification) where.classification = query.classification;
    if (query.rank) where.rank = query.rank;

    const templates = await this.prisma.taskRankTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      templates: templates.map(t => ({
        ...t,
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
      }))
    };
  }

  async create(data: any) {
    const t = await this.prisma.taskRankTemplate.create({
      data: {
        classification: data.classification,
        rank: data.rank,
        taskName: data.taskName,
        defaultUnit: data.defaultUnit,
        defaultWeight: data.defaultWeight,
      }
    });
    return {
      ...t,
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }

  async delete(id: number) {
    await this.prisma.taskRankTemplate.delete({ where: { id } });
    return { success: true };
  }
}
