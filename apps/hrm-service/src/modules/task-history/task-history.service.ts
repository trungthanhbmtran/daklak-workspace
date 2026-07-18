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

    const employeeCodes = new Set<string>();
    history.forEach(h => {
      if (h.actorCode) employeeCodes.add(h.actorCode);
      const val = h.newValue as any;
      if (val?.assigneeCode) employeeCodes.add(val.assigneeCode);
      if (val?.coassigneeCodes) val.coassigneeCodes.forEach((c: string) => employeeCodes.add(c));
    });

    const employees = await this.prisma.employee.findMany({
      where: { employeeCode: { in: Array.from(employeeCodes) } },
      select: { employeeCode: true, fullName: true, avatar: true }
    });
    const empMap = new Map(employees.map(e => [e.employeeCode, e]));

    const mappedHistory = history.map(h => {
      const val = h.newValue as any;
      const assigneeName = val?.assigneeCode ? empMap.get(val.assigneeCode)?.fullName || val.assigneeCode : null;
      const coassigneeNames = val?.coassigneeCodes ? val.coassigneeCodes.map((c: string) => empMap.get(c)?.fullName || c) : null;

      return {
        ...h,
        actorName: h.actorCode ? empMap.get(h.actorCode)?.fullName : null,
        actorAvatar: h.actorCode ? empMap.get(h.actorCode)?.avatar : null,
        assigneeName,
        coassigneeNames
      };
    });

    return {
      success: true,
      message: 'Lấy lịch sử công việc thành công',
      data: mappedHistory
    };
  }
}
