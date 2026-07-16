import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaskHistoryService {
  constructor(private prisma: PrismaService) {}

  async logAction(taskId: number, action: string, actorCode?: string, oldValue?: any, newValue?: any) {
    await this.prisma.taskHistory.create({
      data: {
        taskId,
        action,
        actorCode,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      }
    });
  }

  async getTaskHistory(taskId: number) {
    const history = await this.prisma.taskHistory.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    });

    const actorCodes = [...new Set(history.map(h => h.actorCode).filter(Boolean))] as string[];
    const employees = await this.prisma.employee.findMany({
      where: { employeeCode: { in: actorCodes } },
      select: { employeeCode: true, fullName: true }
    });
    const empMap = new Map(employees.map(e => [e.employeeCode, e.fullName]));

    const mappedHistory = history.map(h => ({
      ...h,
      actorName: h.actorCode ? empMap.get(h.actorCode) : null
    }));

    return {
      success: true,
      message: 'Lấy lịch sử công việc thành công',
      data: mappedHistory
    };
  }
}
