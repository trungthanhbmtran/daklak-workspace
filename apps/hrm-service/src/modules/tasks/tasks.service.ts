import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async listTasks(query: any) {
    const where: any = {};
    if (query.assigneeCode) where.assigneeCode = query.assigneeCode;

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { assignee: true }
    });

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
      }
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
}
