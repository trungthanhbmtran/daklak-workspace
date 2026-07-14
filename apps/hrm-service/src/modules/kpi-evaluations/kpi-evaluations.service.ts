import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppCacheService } from '../../core/cache/app-cache.service';
import { paginateArray } from '@/utils/pagination.util';

@Injectable()
export class KpiEvaluationsService {
  constructor(private prisma: PrismaService, private cache: AppCacheService) { }

  // Giả lập lấy danh sách Domain của VTVL từ user-service
  private async fetchStaffingSlotDomains(staffingSlotId: number): Promise<number[]> {
    console.log(`[Integration] Fetching domains for StaffingSlot: ${staffingSlotId}`);
    return [1, 2, 3]; // Mock data
  }


  // Giả lập gọi RPC sang Integration Service
  private async fetchMetricFromIntegration(integrationCode: string, employeeCode: string): Promise<number> {
    // TODO: Triển khai gọi gRPC hoặc HTTP sang Integration Service (api-gateway)
    // Ví dụ: return await this.integrationClient.fetchKpiMetric({ code: integrationCode, employeeCode });
    console.log(`[Integration] Fetching metric for ${integrationCode} - Employee: ${employeeCode}`);
    return Math.floor(Math.random() * 100) + 50; // Trả về số giả lập (50 - 150)
  }

  async findPeriods(query?: any) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 0;

    const cached = await this.cache.get<any>('periods');
    let periods: any[] = [];
    if (cached) {
      periods = cached;
    } else {
      periods = await this.prisma.kpiPeriod.findMany({
        orderBy: { startDate: 'desc' },
      });
      await this.cache.set('periods', periods);
    }

    const paginated = paginateArray(periods, page, limit);

    return {
      success: true,
      message: 'Lấy danh sách kỳ đánh giá thành công',
      data: paginated.data.map((p: any) => ({
        ...p,
        startDate: p.startDate ? new Date(p.startDate).toISOString() : '',
        endDate: p.endDate ? new Date(p.endDate).toISOString() : '',
      })),
      meta: {
        ...paginated.meta
      }
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

    // Invalidate cache when data changes
    await this.cache.delete('periods');

    return {
      ...p,
      startDate: p.startDate?.toISOString() || '',
      endDate: p.endDate?.toISOString() || '',
    };
  }

  async findCriteria(query: any = {}) {
    const isAdmin = query?.isAdmin || false;
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 0;

    let criteria = await this.prisma.kpiCriteria.findMany({ orderBy: { createdAt: 'desc' }, include: { settings: true } });

    const paginated = paginateArray(criteria, page, limit);

    const mappedCriteria = paginated.data.map((c: any) => ({
      ...c,
      weight: c.settings?.weight || 1.0,
      baseScore: c.settings?.baseScore || 0,
      scoringMethod: c.settings?.scoringMethod || 'MANUAL',
      difficulty: c.settings?.difficulty || 'NORMAL',
      difficultyMultiplier: c.settings?.difficultyMultiplier || 1.0,
      bonusThresholdDays: c.settings?.bonusThresholdDays || 0,
      bonusPerDay: c.settings?.bonusPerDay || 0,
      penaltyPerDay: c.settings?.penaltyPerDay || 0,
      integrationCode: c.settings?.integrationCode || '',
      formula: c.settings?.formula || '',
    }));

    const allowedActions: string[] = [];
    if (isAdmin) {
      allowedActions.push('CREATE', 'EDIT', 'DELETE');
    }

    return {
      success: true,
      message: 'Lấy danh sách tiêu chí thành công',
      data: mappedCriteria,
      meta: {
        ...paginated.meta,
        allowedActions
      }
    };
  }

  async createCriterion(data: any) {
    const c = await this.prisma.kpiCriteria.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        settings: {
          create: {
            weight: data.weight || 1.0,
            baseScore: data.baseScore,
            scoringMethod: data.scoringMethod || 'MANUAL',
            difficulty: data.difficulty || 'NORMAL',
            difficultyMultiplier: data.difficultyMultiplier || 1.0,
            bonusThresholdDays: data.bonusThresholdDays || 0,
            bonusPerDay: data.bonusPerDay || 0,
            penaltyPerDay: data.penaltyPerDay || 0,
          }
        }
      }
    });

    // Invalidate cache
    await this.cache.delete('criteria');
    return c;
  }

  async updateCriterion(id: number, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const settingsData: any = {};
    if (data.weight !== undefined) settingsData.weight = data.weight;
    if (data.baseScore !== undefined) settingsData.baseScore = data.baseScore;
    if (data.scoringMethod) settingsData.scoringMethod = data.scoringMethod;
    if (data.difficulty) settingsData.difficulty = data.difficulty;
    if (data.difficultyMultiplier !== undefined) settingsData.difficultyMultiplier = data.difficultyMultiplier;
    if (data.bonusThresholdDays !== undefined) settingsData.bonusThresholdDays = data.bonusThresholdDays;
    if (data.bonusPerDay !== undefined) settingsData.bonusPerDay = data.bonusPerDay;
    if (data.penaltyPerDay !== undefined) settingsData.penaltyPerDay = data.penaltyPerDay;

    const c = await this.prisma.kpiCriteria.update({
      where: { id },
      data: {
        ...updateData,
        ...(Object.keys(settingsData).length > 0 && {
          settings: {
            upsert: {
              create: settingsData,
              update: settingsData
            }
          }
        })
      },
    });

    // Invalidate cache
    await this.cache.delete('criteria');
    return c;
  }

  async deleteCriterion(id: number) {
    await this.prisma.kpiCriteria.delete({ where: { id } });
    await this.cache.delete('criteria'); // Invalidate cache
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
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 0;
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

    const allEvaluations = await this.prisma.kpiEvaluation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { employee: true }
    });
    
    const paginated = paginateArray(allEvaluations, page, limit);

    return {
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: paginated.data.map((e: any) => ({
        ...e,
        employeeName: e.employee ? e.employee.fullName : e.employeeCode
      })),
      meta: {
        ...paginated.meta
      }
    };
  }

  async getEvaluationStats(query: any) {
    const where: any = {};
    if (query.periodId) {
      where.periodId = Number(query.periodId);
    }
    where.status = { in: ['SUBMITTED', 'APPROVED'] }; // Chỉ lấy phiếu đã nộp hoặc đã chốt

    if (query.callerDescendantUnitIds && query.callerDescendantUnitIds.length > 0) {
      const descendantIds = query.callerDescendantUnitIds.map(Number).filter(Boolean);
      where.employee = { departmentId: { in: descendantIds } };
    } else if (!query.isAdmin) {
      // Nếu không phải admin và không có quyền xem cấp dưới -> Không trả về gì hoặc trả về của chính mình
      // Ở dashboard tổng quan, chúng ta thường yêu cầu quyền quản lý.
    }

    const evaluations = await this.prisma.kpiEvaluation.findMany({
      where,
      include: { employee: true }
    });

    // Gom nhóm theo departmentId
    const statsMap = new Map<number, { count: number; totalScore: number }>();
    let totalCompanyScore = 0;
    let totalCompanyCount = 0;

    for (const ev of evaluations) {
      if (!ev.employee || ev.employee.departmentId === null) continue;
      const depId = ev.employee.departmentId;
      const score = ev.totalScore || 0;

      if (!statsMap.has(depId)) {
        statsMap.set(depId, { count: 0, totalScore: 0 });
      }
      const st = statsMap.get(depId)!;
      st.count += 1;
      st.totalScore += score;

      totalCompanyScore += score;
      totalCompanyCount += 1;
    }

    const statsByUnit = Array.from(statsMap.entries()).map(([departmentId, data]) => ({
      departmentId,
      totalEvaluations: data.count,
      avgScore: data.count > 0 ? parseFloat((data.totalScore / data.count).toFixed(2)) : 0
    }));

    return {
      success: true,
      data: {
        statsByUnit,
        companyAvgScore: totalCompanyCount > 0 ? parseFloat((totalCompanyScore / totalCompanyCount).toFixed(2)) : 0,
        totalEvaluations: totalCompanyCount
      }
    };
  }

  async calculatePersonalKpi(data: { periodId: number, employeeCode: string, staffingSlotId?: number }) {
    const { periodId, employeeCode, staffingSlotId } = data;



    const period = await this.prisma.kpiPeriod.findUnique({ where: { id: periodId } });
    if (!period) {
      return { success: false, message: 'Kỳ đánh giá không tồn tại', totalScore: 0, tasks: [] };
    }

    // Find all completed tasks for this employee within the period
    const taskParticipants = await this.prisma.taskParticipant.findMany({
      where: {
        employeeCode: employeeCode,
        participantRole: { in: ['ASSIGNEE', 'COORDINATOR'] },
        task: {
          isCompleted: true,
          completedAt: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      },
      include: {
        task: {
          include: { kpiSettings: true }
        }
      }
    });

    const coordCriteria = await this.prisma.kpiCriteria.findFirst({ where: { name: { contains: 'phối hợp' } } });
    const coordCriteriaId = coordCriteria?.id || null;

    let totalScore = 0;
    const calculatedTasks: any[] = [];
    const groupedScores: Record<number, number> = {};
    const groupedTasksCount: Record<number, number> = {};
    const groupedIntegrationData: Record<number, { actual: number, target: number }> = {};

    // 1. Tính toán điểm từ Tasks (Nội bộ)
    for (const tp of taskParticipants) {
      const task = tp.task;
      const baseScore = task.kpiSettings?.baseScore || 0;
      let finalScore = baseScore;

      const bonusPerDay = task.kpiSettings?.bonusPerDay || 0;
      const penaltyPerDay = task.kpiSettings?.penaltyPerDay || 0;

      if (task.completedAt && task.dueDate) {
        // Calculate days difference
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = completedDate.getTime() - dueDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // Completed early
          finalScore += Math.abs(diffDays) * bonusPerDay;
        } else if (diffDays > 0) {
          // Completed late
          finalScore -= diffDays * penaltyPerDay;
        }
      }

      if (task.kpiSettings?.isCrossDomain && task.kpiSettings?.crossDomainMultiplier) {
        finalScore = finalScore * task.kpiSettings.crossDomainMultiplier;
      }

      // Nhân tỷ lệ đóng góp
      const contribution = tp.contributionPercentage != null ? tp.contributionPercentage : 100.0;
      finalScore = finalScore * (contribution / 100.0);

      totalScore += finalScore;

      let criteriaId = task.kpiSettings?.kpiCriteriaId;
      if (tp.participantRole === 'COORDINATOR' && coordCriteriaId) {
        criteriaId = coordCriteriaId;
      }

      if (criteriaId) {
        if (!groupedScores[criteriaId]) {
          groupedScores[criteriaId] = 0;
          groupedTasksCount[criteriaId] = 0;
        }
        groupedScores[criteriaId] += finalScore;
        groupedTasksCount[criteriaId] += 1;
      }

      calculatedTasks.push({
        taskId: task.id,
        title: task.title,
        baseScore: baseScore,
        finalScore: finalScore,
        completedAt: task.completedAt ? task.completedAt.toISOString() : '',
        dueDate: task.dueDate ? task.dueDate.toISOString() : '',
        status: task.status,
        kpiCriteriaId: criteriaId
      });
    }

    // 1.5. Tính toán điểm từ các Bước Checklist (TaskStep)
    const completedSteps = await this.prisma.taskStep.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: period.startDate,
          lte: period.endDate
        },
        OR: [
          { assigneeCode: employeeCode },
          { 
            assigneeCode: null, 
            task: {
              participants: {
                some: { employeeCode, participantRole: 'ASSIGNEE' }
              }
            }
          }
        ]
      },
      include: { task: true }
    });

    const calculatedSteps: any[] = [];
    for (const step of completedSteps) {
      if (!step.baseScore) continue;
      
      const stepScore = step.baseScore;
      totalScore += stepScore;
      
      calculatedSteps.push({
        stepId: step.id,
        taskId: step.taskId,
        title: step.title,
        baseScore: stepScore,
        finalScore: stepScore,
        completedAt: step.completedAt ? step.completedAt.toISOString() : ''
      });
    }

    // 2. Tính toán điểm từ Integration API (Ngoại bộ như LGSP)
    const integrationCriteria = await this.prisma.kpiCriteria.findMany({
      where: { settings: { scoringMethod: 'INTEGRATION_API' } },
      include: { settings: true }
    });

    if (integrationCriteria.length > 0) {
      // Lấy danh sách chỉ tiêu nhân viên đã đăng ký
      const employeeTargets = await this.prisma.employeeKpiTarget.findMany({
        where: { employeeCode, periodId }
      });
      const targetMap = new Map<number, number>();
      for (const t of employeeTargets) {
        targetMap.set(t.criteriaId, t.targetValue);
      }

      for (const criteria of integrationCriteria) {
        const settings = criteria.settings;
        if (!settings || !settings.integrationCode) continue;

        // Gọi sang Integration Module để lấy dữ liệu thực tế
        const actualValue = await this.fetchMetricFromIntegration(settings.integrationCode, employeeCode);

        // Lấy chỉ tiêu, mặc định 1 nếu chưa đăng ký để tránh lỗi chia 0 (tuỳ nghiệp vụ)
        const targetValue = targetMap.get(criteria.id) || 1;

        // Tính điểm bằng công thức linh hoạt (evaluate string formula)
        let formulaScore = 0;
        const weight = settings.weight || 1.0;
        const baseScore = settings.baseScore || 0;
        const formulaStr = settings.formula;

        if (formulaStr) {
          try {
            // Replace biến số trong chuỗi công thức
            // VD: "(actual / target) * weight"
            const evalStr = formulaStr
              .replace(/actual/g, actualValue.toString())
              .replace(/target/g, targetValue.toString())
              .replace(/weight/g, weight.toString())
              .replace(/baseScore/g, baseScore.toString());

            // eslint-disable-next-line no-new-func
            formulaScore = new Function('return ' + evalStr)();
          } catch (err) {
            console.error('Error evaluating formula', formulaStr, err);
          }
        } else {
          // Công thức mặc định nếu không cấu hình
          formulaScore = (actualValue / targetValue) * (baseScore || weight * 10);
        }

        if (!groupedScores[criteria.id]) {
          groupedScores[criteria.id] = 0;
        }
        groupedScores[criteria.id] += formulaScore;
        totalScore += formulaScore;

        groupedIntegrationData[criteria.id] = { actual: actualValue, target: targetValue };
      }
    }

    // Upsert the KpiEvaluation record
    const existingEvaluation = await this.prisma.kpiEvaluation.findFirst({
      where: { employeeCode, periodId }
    });

    let evaluationId = existingEvaluation?.id;

    try {
      if (existingEvaluation) {
        if (existingEvaluation.status === 'DRAFT' || existingEvaluation.status === 'COMPUTING') {
          await this.prisma.kpiEvaluation.update({
            where: { id: existingEvaluation.id },
            data: { totalScore, status: 'COMPUTING' }
          });
        }
      } else {
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
    } catch (error: any) {
      if (error.code === 'P2003') {
        return { success: false, message: 'Nhân viên không tồn tại trong hệ thống', totalScore: 0, tasks: [] };
      }
      throw error;
    }

    return {
      success: true,
      message: 'Tính điểm KPI thành công',
      totalScore,
      evaluationId,
      tasks: calculatedTasks,
      steps: calculatedSteps,
      groupedScores,
      groupedTasksCount,
      groupedIntegrationData
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
      orderBy: { id: 'asc' },
      include: { settings: true }
    });

    // Auto-calculate tasks if status is DRAFT or COMPUTING
    const calcResult = await this.calculatePersonalKpi({ periodId: evaluation.periodId, employeeCode: evaluation.employeeCode, staffingSlotId: evaluation.staffingSlotId || undefined });

    const finalDetails = allCriteria.map(crit => {
      const existingDetail = evaluation.details.find(d => d.criteriaId === crit.id);

      let autoScore: number | null = null;
      let notes = existingDetail?.notes || '';

      if (crit.settings?.scoringMethod === 'AUTOMATIC') {
        autoScore = calcResult.groupedScores?.[crit.id] || 0;
        const count = calcResult.groupedTasksCount?.[crit.id] || 0;
        notes = `Hệ thống tổng hợp từ ${count} công việc đã hoàn thành.`;
      } else if (crit.settings?.scoringMethod === 'INTEGRATION_API') {
        autoScore = calcResult.groupedScores?.[crit.id] || 0;
        const data = calcResult.groupedIntegrationData?.[crit.id];
        if (data) {
          notes = `Dữ liệu liên thông: Đạt ${data.actual} / Chỉ tiêu ${data.target}`;
        } else {
          notes = `Đang chờ số liệu liên thông.`;
        }
      }

      return {
        id: existingDetail?.id || null,
        criteriaId: crit.id,
        criteriaName: crit.name,
        description: crit.description,
        scoringMethod: crit.settings?.scoringMethod,
        baseScore: crit.settings?.baseScore,
        weight: crit.settings?.weight,
        selfScore: existingDetail?.selfScore ?? (['AUTOMATIC', 'INTEGRATION_API'].includes(crit.settings?.scoringMethod || '') ? autoScore : null),
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
