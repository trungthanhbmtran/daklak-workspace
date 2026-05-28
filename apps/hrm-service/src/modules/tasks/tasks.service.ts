import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async getTaskStats(assigneeCode?: string) {
    const statsWhere = assigneeCode ? { assigneeCode } : {};
    const baseWhere = { ...statsWhere, status: { notIn: ['DONE', 'ARCHIVED'] } };
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);

    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const [overdueCount, dueIn3DaysCount, dueIn7DaysCount, dueOver7DaysCount] = await Promise.all([
      this.prisma.task.count({
        where: {
          ...baseWhere,
          OR: [
            { status: 'OVERDUE' },
            { dueDate: { lt: now } }
          ]
        }
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ['DONE', 'ARCHIVED', 'OVERDUE'] },
          dueDate: { gte: now, lte: in3Days }
        }
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ['DONE', 'ARCHIVED', 'OVERDUE'] },
          dueDate: { gt: in3Days, lte: in7Days }
        }
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ['DONE', 'ARCHIVED', 'OVERDUE'] },
          OR: [
            { dueDate: { gt: in7Days } },
            { dueDate: null }
          ]
        }
      })
    ]);

    return { overdueCount, dueIn3DaysCount, dueIn7DaysCount, dueOver7DaysCount };
  }

  private applyDateFilter(filter: string, where: any) {
    if (!filter) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);

    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    // Bắt buộc loại bỏ DONE, ARCHIVED khi có filter ngày
    where.status = { notIn: ['DONE', 'ARCHIVED'] };

    switch (filter) {
      case 'overdue':
        where.OR = [
          { status: 'OVERDUE' },
          { dueDate: { lt: now } }
        ];
        break;
      case 'dueIn3Days':
        where.status = { notIn: ['DONE', 'ARCHIVED', 'OVERDUE'] };
        where.dueDate = { gte: now, lte: in3Days };
        break;
      case 'dueIn7Days':
        where.status = { notIn: ['DONE', 'ARCHIVED', 'OVERDUE'] };
        where.dueDate = { gt: in3Days, lte: in7Days };
        break;
      case 'dueOver7Days':
        where.status = { notIn: ['DONE', 'ARCHIVED', 'OVERDUE'] };
        where.OR = [
          { dueDate: { gt: in7Days } },
          { dueDate: null }
        ];
        break;
    }
  }

  async listTasks(query: any) {
    const where: any = {};
    if (query.assigneeCode) where.assigneeCode = query.assigneeCode;
    if (query.search) {
      where.title = { contains: query.search };
    }

    this.applyDateFilter(query.filter, where);

    const [tasks, stats] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { assignee: true }
      }),
      this.getTaskStats(query.assigneeCode)
    ]);

    return {
      success: true,
      message: 'Lấy danh sách nhiệm vụ thành công',
      data: tasks.map((t: any) => ({
        ...t,
        assigneeName: t.assignee ? `${t.assignee.firstname} ${t.assignee.lastname}` : t.assigneeCode,
        dueDate: t.dueDate?.toISOString() || '',
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
      })),
      meta: {
        pagination: {
          total: tasks.length,
          page: 1,
          pageSize: tasks.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      stats
    };
  }

  async createTask(data: any) {
    const t = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        assigneeCode: data.assigneeCode || '',
        assignerCode: data.assignerCode || '',
        status: 'TODO',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        baseScore: data.baseScore,
        weight: data.weight,
        scoringMethod: data.scoringMethod || 'MANUAL',
        bonusPerDay: data.bonusPerDay,
        penaltyPerDay: data.penaltyPerDay,
        supervisorCode: data.supervisorCode,
        planId: data.planId,
      }
    });

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }

  async updateTaskStatus(id: number, status: string) {
    const t = await this.prisma.task.update({
      where: { id },
      data: { status }
    });

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }

  async recommendAssignees(query: { rankCode: string, strategy: string }) {
    const { rankCode, strategy } = query;
    const where: any = {};
    if (rankCode && rankCode !== 'ALL') {
      where.rankCode = rankCode;
    }

    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        tasksReceived: {
          where: { status: { in: ['TODO', 'IN_PROGRESS', 'OVERDUE'] } }
        },
        kpiEvaluations: {
          where: { status: 'APPROVED' },
          orderBy: { periodId: 'desc' },
          take: 3
        }
      }
    });

    const recommendations = employees.map((emp: any) => {
      const currentLoad = emp.tasksReceived.reduce((sum: number, t: any) => sum + (t.weight || 10), 0);
      
      let performanceScore = 50; // default
      if (emp.kpiEvaluations && emp.kpiEvaluations.length > 0) {
        const total = emp.kpiEvaluations.reduce((sum: number, e: any) => sum + (e.totalScore || 0), 0);
        performanceScore = total / emp.kpiEvaluations.length;
      } else {
        // Fallback mock if no evaluations yet
        performanceScore = 60 + Math.random() * 30;
      }

      // Match Score Calculation
      // We want to prioritize LOW load. 
      // If HIGH_PERFORMANCE -> prioritize HIGH performanceScore
      // If LOW_PERFORMANCE -> prioritize LOW performanceScore (to give them a chance to improve)
      
      let loadFactor = Math.max(0, 100 - currentLoad); // Less load = higher factor
      let perfFactor = performanceScore;
      if (strategy === 'LOW_PERFORMANCE') {
        perfFactor = 100 - performanceScore;
      } else if (strategy === 'UNDER_QUOTA') {
        // Hạn mức quy định tạm tính là 40 điểm
        if (currentLoad < 40) {
          loadFactor = 100; // Tối đa điểm cho người chưa đủ hạn mức
        } else {
          loadFactor = 0; // Không ưu tiên người đã đủ hoặc vượt hạn mức
        }
      }

      const matchScore = (loadFactor * 0.6) + (perfFactor * 0.4);

      return {
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstname} ${emp.lastname}`,
        currentLoad,
        performanceScore,
        matchScore
      };
    });

    // Sort by matchScore DESC
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return {
      success: true,
      message: 'Gợi ý nhân sự thành công',
      data: recommendations.slice(0, 5) // Top 5
    };
  }

  async assignTask(id: number, assigneeCode: string) {
    const t = await this.prisma.task.update({
      where: { id },
      data: { assigneeCode }
    });

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }
}
