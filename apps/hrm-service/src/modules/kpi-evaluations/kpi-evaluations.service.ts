import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class KpiEvaluationsService {
  private cache = new Map<string, { data: any, expiresAt: number }>();
  private readonly CACHE_TTL_MS = 3600 * 1000; // 1 hour

  constructor(private prisma: PrismaService) { }

  async findPeriods() {
    const cached = this.cache.get('periods');
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const periods = await this.prisma.kpiPeriod.findMany({
      orderBy: { startDate: 'desc' },
    });
    
    const result = {
      success: true,
      message: 'Lấy danh sách kỳ đánh giá thành công',
      data: periods.map(p => ({
        ...p,
        startDate: p.startDate?.toISOString() || '',
        endDate: p.endDate?.toISOString() || '',
      })),
      meta: {
        pagination: {
          total: periods.length,
          page: 1,
          pageSize: periods.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    };

    this.cache.set('periods', { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
    return result;
  }

  async createPeriod(data: any) {
    const p = await this.prisma.kpiPeriod.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }
    });

    // Invalidate cache when data changes
    this.cache.delete('periods');

    return {
      ...p,
      startDate: p.startDate?.toISOString() || '',
      endDate: p.endDate?.toISOString() || '',
    };
  }

  async findCriteria(query: any = {}) {
    const isAdmin = query?.isAdmin || false;
    const cached = this.cache.get('criteria');
    let dataToReturn: any;

    if (cached && cached.expiresAt > Date.now()) {
      dataToReturn = cached.data;
    } else {
      const criteria = await this.prisma.kpiCriteria.findMany();
      dataToReturn = {
        success: true,
        message: 'Lấy danh sách tiêu chí thành công',
        data: criteria,
        meta: {
          pagination: {
            total: criteria.length,
            page: 1,
            pageSize: criteria.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      };
      this.cache.set('criteria', { data: dataToReturn, expiresAt: Date.now() + this.CACHE_TTL_MS });
    }

    const allowedActions: string[] = [];
    if (isAdmin) {
      allowedActions.push('CREATE', 'EDIT', 'DELETE');
    }

    return {
      ...dataToReturn,
      meta: {
        ...dataToReturn.meta,
        allowedActions
      }
    };
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

    // Invalidate cache
    this.cache.delete('criteria');
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

    // Invalidate cache
    this.cache.delete('criteria');
    return c;
  }

  async deleteCriterion(id: number) {
    await this.prisma.kpiCriteria.delete({ where: { id } });
    this.cache.delete('criteria'); // Invalidate cache
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

  async findEvaluations(query: any) {
    const where: any = {};
    const employeeCode = typeof query === 'object' ? query.employeeCode : query;

    if (employeeCode) where.employeeCode = employeeCode;

    if (typeof query === 'object' && !query.isAdmin) {
      if (!query.isFetchingOwn) {
        // Must belong to descendant unit
        const descendantIds = Array.isArray(query.callerDescendantUnitIds)
          ? query.callerDescendantUnitIds.map(Number).filter(Boolean)
          : [];
          
        if (descendantIds.length > 0) {
          where.employee = { departmentId: { in: descendantIds } };
        } else {
          // No descendants -> can't view others
          where.employeeCode = query.currentEmployeeCode;
        }
      }
    }

    const evaluations = await this.prisma.kpiEvaluation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { employee: true }
    });
    return {
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: evaluations.map(e => ({
        ...e,
        employeeName: e.employee ? e.employee.fullName : e.employeeCode
      })),
      meta: {
        pagination: {
          total: evaluations.length,
          page: 1,
          pageSize: evaluations.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    };
  }
}
