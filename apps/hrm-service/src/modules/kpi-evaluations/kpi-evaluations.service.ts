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

  async calculatePersonalKpi(data: { periodId: number, employeeCode: string }) {
    const { periodId, employeeCode } = data;

    const period = await this.prisma.kpiPeriod.findUnique({ where: { id: periodId } });
    if (!period) {
      return { success: false, message: 'Kỳ đánh giá không tồn tại', totalScore: 0, tasks: [] };
    }

    // Find all completed tasks for this employee within the period
    const taskParticipants = await this.prisma.taskParticipant.findMany({
      where: {
        employeeCode: employeeCode,
        participantRole: 'ASSIGNEE',
        task: {
          status: 'DONE',
          completedAt: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      },
      include: {
        task: true
      }
    });

    let totalScore = 0;
    const calculatedTasks: any[] = [];

    for (const tp of taskParticipants) {
      const task = tp.task;
      const baseScore = task.baseScore || 0;
      let finalScore = baseScore;

      const bonusPerDay = task.bonusPerDay || 0;
      const penaltyPerDay = task.penaltyPerDay || 0;

      if (task.completedAt && task.dueDate) {
        // Calculate days difference
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = completedDate.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // Completed early
          finalScore += Math.abs(diffDays) * bonusPerDay;
        } else if (diffDays > 0) {
          // Completed late
          finalScore -= diffDays * penaltyPerDay;
        }
      }

      totalScore += finalScore;

      calculatedTasks.push({
        taskId: task.id,
        title: task.title,
        baseScore: baseScore,
        finalScore: finalScore,
        completedAt: task.completedAt ? task.completedAt.toISOString() : '',
        dueDate: task.dueDate ? task.dueDate.toISOString() : '',
        status: task.status
      });
    }

    // Upsert the KpiEvaluation record
    const existingEvaluation = await this.prisma.kpiEvaluation.findFirst({
      where: { employeeCode, periodId }
    });

    if (existingEvaluation) {
      if (existingEvaluation.status === 'DRAFT' || existingEvaluation.status === 'COMPUTING') {
        await this.prisma.kpiEvaluation.update({
          where: { id: existingEvaluation.id },
          data: { totalScore, status: 'COMPUTING' }
        });
      }
    }
    let evaluationId = existingEvaluation?.id;
    if (!existingEvaluation) {
      const newEval = await this.prisma.kpiEvaluation.create({
        data: {
          employeeCode,
          periodId,
          totalScore,
          status: 'COMPUTING'
        }
      });
      evaluationId = newEval.id;
    }

    return {
      success: true,
      message: 'Tính điểm KPI thành công',
      totalScore,
      evaluationId,
      tasks: calculatedTasks
    };
  }

  async getEvaluationDetail(id: number) {
    const evaluation = await this.prisma.kpiEvaluation.findUnique({
      where: { id },
      include: {
        employee: true,
        details: true
      }
    });

    if (!evaluation) {
      return { success: false, message: 'Không tìm thấy phiếu đánh giá', data: '' };
    }

    const allCriteria = await this.prisma.kpiCriteria.findMany({
      orderBy: { id: 'asc' }
    });
    
    // Auto-calculate tasks if status is DRAFT or COMPUTING
    const calcResult = await this.calculatePersonalKpi({ periodId: evaluation.periodId, employeeCode: evaluation.employeeCode });

    const finalDetails = allCriteria.map(crit => {
      const existingDetail = evaluation.details.find(d => d.criteriaId === crit.id);
      
      let autoScore: number | null = null;
      let notes = existingDetail?.notes || '';
      
      if (crit.scoringMethod === 'AUTOMATIC') {
         autoScore = calcResult.totalScore;
         notes = `Hệ thống tổng hợp từ ${calcResult.tasks.length} công việc đã hoàn thành.`;
      }

      return {
        id: existingDetail?.id || null,
        criteriaId: crit.id,
        criteriaName: crit.name,
        description: crit.description,
        scoringMethod: crit.scoringMethod,
        baseScore: crit.baseScore,
        weight: crit.weight,
        selfScore: existingDetail?.selfScore ?? (crit.scoringMethod === 'AUTOMATIC' ? autoScore : null),
        reviewerScore: existingDetail?.reviewerScore ?? null,
        notes: notes,
      };
    });

    const dataObj = {
      ...evaluation,
      details: finalDetails,
      tasks: calcResult.tasks
    };

    return {
      success: true,
      message: 'Lấy chi tiết thành công',
      data: JSON.stringify(dataObj)
    };
  }

  async submitSelfScore(id: number, payload: any) {
    const evaluation = await this.prisma.kpiEvaluation.findUnique({ where: { id } });
    if (!evaluation) return { success: false, message: 'Không tìm thấy phiếu đánh giá', data: '' };

    if (evaluation.status !== 'DRAFT' && evaluation.status !== 'COMPUTING') {
      return { success: false, message: 'Phiếu đã được nộp hoặc đã chốt', data: '' };
    }

    // Upsert details
    for (const d of payload.details) {
      if (d.id) {
        await this.prisma.kpiEvaluationDetail.update({
          where: { id: d.id },
          data: { selfScore: d.selfScore, notes: d.notes }
        });
      } else {
        await this.prisma.kpiEvaluationDetail.create({
          data: {
            evaluationId: id,
            criteriaId: d.criteriaId,
            selfScore: d.selfScore,
            notes: d.notes
          }
        });
      }
    }

    await this.prisma.kpiEvaluation.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });

    return { success: true, message: 'Nộp phiếu đánh giá thành công', data: JSON.stringify({ status: 'SUBMITTED' }) };
  }

  async approveReviewerScore(id: number, payload: any, reviewerCode: string) {
    const evaluation = await this.prisma.kpiEvaluation.findUnique({ where: { id } });
    if (!evaluation) return { success: false, message: 'Không tìm thấy phiếu đánh giá', data: '' };

    if (evaluation.status !== 'SUBMITTED') {
      return { success: false, message: 'Chỉ có thể duyệt phiếu ở trạng thái đã nộp', data: '' };
    }

    let finalTotalScore = 0;

    for (const d of payload.details) {
      if (d.id) {
        await this.prisma.kpiEvaluationDetail.update({
          where: { id: d.id },
          data: { reviewerScore: d.reviewerScore }
        });
        finalTotalScore += (d.reviewerScore || 0);
      } else {
        await this.prisma.kpiEvaluationDetail.create({
          data: {
            evaluationId: id,
            criteriaId: d.criteriaId,
            selfScore: d.selfScore,
            reviewerScore: d.reviewerScore,
            notes: d.notes
          }
        });
        finalTotalScore += (d.reviewerScore || 0);
      }
    }

    await this.prisma.kpiEvaluation.update({
      where: { id },
      data: { 
        status: 'APPROVED', 
        reviewerCode: reviewerCode,
        totalScore: finalTotalScore 
      }
    });

    return { success: true, message: 'Đã chốt phiếu đánh giá', data: JSON.stringify({ status: 'APPROVED', totalScore: finalTotalScore }) };
  }
}
