import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/database/prisma.service';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { Task } from '../../generated/prisma';

type TaskWithParticipants = Task & { participants: { employeeCode: string; participantRole: string }[] };

interface TaskWarning {
  taskId: number;
  warnType: 'DEADLINE' | 'OVERDUE' | 'RISK';
  title: string;
  message: string;
  assigneeCodes: string[];
}

@Injectable()
export class TasksCronService {
  private readonly logger = new Logger(TasksCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly taskShared: TaskSharedService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDueTaskScanner() {
    this.logger.log('Started Due Task Scanner Cron Job...');
    try {
      const now = new Date();
      const days = 3;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      let cursorId: number | undefined = undefined;
      const take = 200;
      let hasMore = true;

      while (hasMore) {
        const tasks = await this.prisma.task.findMany({
          where: {
            isDeleted: false,
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED', 'DONE', 'TEMPLATE'] },
            dueDate: { not: null },
            OR: [
              { isDeadlineWarned: false },
              { isOverdueWarned: false },
              { isRiskWarned: false }
            ]
          },
          take,
          ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
          orderBy: { id: 'asc' },
          include: { 
            participants: { 
              select: { employeeCode: true, participantRole: true } 
            } 
          }
        });

        if (tasks.length === 0) {
          hasMore = false;
          break;
        }
        cursorId = tasks[tasks.length - 1].id;

        await this.processTaskBatch(tasks as unknown as TaskWithParticipants[], now, futureDate);

        // Nhường lại event loop 50ms để các request khác không bị block
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      this.logger.log('Finished Due Task Scanner Cron Job.');
    } catch (err) {
      this.logger.error('Error in due task scanner', err);
    }
  }

  private async processTaskBatch(tasks: TaskWithParticipants[], now: Date, futureDate: Date) {
    const warnings: TaskWarning[] = [];

    // 1. Phân tích trên RAM (O(N)) - Sử dụng Early Return
    for (const task of tasks) {
      const warning = this.evaluateTaskWarning(task, now, futureDate);
      if (warning) {
        warnings.push(warning);
      }
    }

    if (warnings.length === 0) return;

    // 2. Thu thập User ID bằng 1 query duy nhất (Giải quyết N+1)
    const allAssigneeCodes = [...new Set(warnings.flatMap(w => w.assigneeCodes))];
    const emps = await this.prisma.employee.findMany({
      where: { employeeCode: { in: allAssigneeCodes } },
      select: { employeeCode: true, userId: true }
    });
    
    // Hash map O(1) lookup
    const userMap = new Map(emps.filter(e => e.userId).map(e => [e.employeeCode, e.userId as string]));

    // 3. Chuẩn bị Transaction Cập nhật DB Hàng loạt (Batch Query)
    const deadlineIds = warnings.filter(w => w.warnType === 'DEADLINE').map(w => w.taskId);
    const overdueIds = warnings.filter(w => w.warnType === 'OVERDUE').map(w => w.taskId);
    const riskIds = warnings.filter(w => w.warnType === 'RISK').map(w => w.taskId);

    const txs: any[] = [];
    if (deadlineIds.length > 0) txs.push(this.prisma.task.updateMany({ where: { id: { in: deadlineIds } }, data: { isDeadlineWarned: true } }));
    if (overdueIds.length > 0) txs.push(this.prisma.task.updateMany({ where: { id: { in: overdueIds } }, data: { isOverdueWarned: true } }));
    if (riskIds.length > 0) txs.push(this.prisma.task.updateMany({ where: { id: { in: riskIds } }, data: { isRiskWarned: true } }));

    txs.push(this.prisma.taskHistory.createMany({
      data: warnings.map(w => ({
        taskId: w.taskId,
        action: 'SYSTEM_WARNING',
        actorCode: 'SYSTEM',
        newValue: { content: `Hệ thống đã tự động gửi cảnh báo: ${w.title}` },
      }))
    }));

    await this.prisma.$transaction(txs);

    // 4. Gửi Notification
    for (const w of warnings) {
      const userIds = w.assigneeCodes.map(code => userMap.get(code)).filter(Boolean) as string[];
      if (userIds.length > 0) {
        const taskObj = tasks.find(t => t.id === w.taskId);
        this.taskShared.sendTaskNotification(userIds, w.title, w.message, taskObj);
      }
    }
  }

  private evaluateTaskWarning(task: TaskWithParticipants, now: Date, futureDate: Date): TaskWarning | null {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const startDate = task.startDate ? new Date(task.startDate) : null;

    // A. Kiểm tra Trễ hạn (Overdue)
    if (!task.isOverdueWarned && dueDate < now) {
      return this.buildWarning(task, 'OVERDUE', 'Cảnh báo công việc trễ hạn', `Công việc "${task.title}" đã trễ hạn từ ${dueDate.toLocaleDateString('vi-VN')}.`);
    }

    // B. Kiểm tra Sắp đến hạn (Deadline)
    if (!task.isDeadlineWarned && dueDate <= futureDate && dueDate >= now) {
      return this.buildWarning(task, 'DEADLINE', 'Cảnh báo hạn chót công việc', `Công việc "${task.title}" sắp đến hạn vào ${dueDate.toLocaleDateString('vi-VN')}.`);
    }

    // C. Kiểm tra Risk (Nguy cơ chậm tiến độ)
    if (!task.isRiskWarned && dueDate > futureDate && startDate && task.progress != null) {
      const totalDuration = dueDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      
      if (totalDuration > 0 && elapsed > 0) {
        const expectedProgress = (elapsed / totalDuration) * 100;
        if (expectedProgress > 50 && (expectedProgress - task.progress > 20)) {
          return this.buildWarning(task, 'RISK', 'Cảnh báo nguy cơ chậm tiến độ', `Công việc "${task.title}" có nguy cơ chậm tiến độ (Thời gian đã qua: ${Math.round(expectedProgress)}%, Tiến độ thực tế: ${task.progress}%).`);
        }
      }
    }

    return null; // Không vi phạm điều kiện nào -> Early return
  }

  private buildWarning(task: TaskWithParticipants, warnType: 'DEADLINE' | 'OVERDUE' | 'RISK', title: string, message: string): TaskWarning {
    const assigneeCodes = task.participants
      .filter(p => p.participantRole === 'ASSIGNEE')
      .map(p => p.employeeCode)
      .filter(Boolean);

    return {
      taskId: task.id,
      warnType,
      title,
      message,
      assigneeCodes
    };
  }
}
