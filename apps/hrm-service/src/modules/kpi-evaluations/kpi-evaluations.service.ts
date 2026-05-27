import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class KpiEvaluationsService {
  constructor(private prisma: PrismaService) { }

  async findPeriods() {
    const periods = await this.prisma.kpiPeriod.findMany({
      orderBy: { startDate: 'desc' },
    });
    return {
      periods: periods.map(p => ({
        ...p,
        startDate: p.startDate?.toISOString() || '',
        endDate: p.endDate?.toISOString() || '',
      }))
    };
  }

  async createPeriod(data: any) {
    const p = await this.prisma.kpiPeriod.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }
    });
    return {
      ...p,
      startDate: p.startDate?.toISOString() || '',
      endDate: p.endDate?.toISOString() || '',
    };
  }

  async findCriteria() {
    const criteria = await this.prisma.kpiCriteria.findMany();
    return { criteria };
  }

  async createCriterion(data: any) {
    const c = await this.prisma.kpiCriteria.create({
      data: {
        name: data.name,
        description: data.description,
        weight: data.weight || 1.0,
        baseScore: data.baseScore,
        scoringMethod: data.scoringMethod || 'MANUAL',
        difficulty: data.difficulty || 'NORMAL',
        difficultyMultiplier: data.difficultyMultiplier || 1.0,
        bonusThresholdDays: data.bonusThresholdDays || 0,
        bonusPerDay: data.bonusPerDay || 0,
        penaltyPerDay: data.penaltyPerDay || 0,
        categoryId: data.categoryId,
      }
    });
    return c;
  }

  async updateCriterion(id: number, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.baseScore !== undefined) updateData.baseScore = data.baseScore;
    if (data.scoringMethod) updateData.scoringMethod = data.scoringMethod;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (data.difficultyMultiplier !== undefined) updateData.difficultyMultiplier = data.difficultyMultiplier;
    if (data.bonusThresholdDays !== undefined) updateData.bonusThresholdDays = data.bonusThresholdDays;
    if (data.bonusPerDay !== undefined) updateData.bonusPerDay = data.bonusPerDay;
    if (data.penaltyPerDay !== undefined) updateData.penaltyPerDay = data.penaltyPerDay;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const c = await this.prisma.kpiCriteria.update({
      where: { id },
      data: updateData,
    });
    return c;
  }

  async deleteCriterion(id: number) {
    await this.prisma.kpiCriteria.delete({ where: { id } });
    return { success: true };
  }

  async createEvaluation(data: any) {
    const evalData = await this.prisma.kpiEvaluation.create({
      data: {
        employeeCode: data.employeeCode,
        periodId: data.periodId,
        status: 'DRAFT',
        details: {
          create: data.details.map((d: any) => ({
            criteriaId: d.criteriaId,
            selfScore: d.selfScore,
            notes: d.notes,
          }))
        }
      }
    });
    return evalData;
  }

  async findEvaluations(employeeCode?: string) {
    const where: any = {};
    if (employeeCode) where.employeeCode = employeeCode;

    const evaluations = await this.prisma.kpiEvaluation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { evaluations };
  }
}
