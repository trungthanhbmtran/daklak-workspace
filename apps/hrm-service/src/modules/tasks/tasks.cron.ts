import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/database/prisma.service';
import { TaskSharedService } from '../task-shared/task-shared.service';

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
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED', 'DONE', 'TEMPLATE'] },
            dueDate: { not: null },
            OR: [
              { isDeadlineWarned: false },
              { isRiskWarned: false }
            ]
          },
          take,
          ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
          orderBy: { id: 'asc' },
          include: { participants: true }
        });

        if (tasks.length === 0) { hasMore = false; break; }
        cursorId = tasks[tasks.length - 1].id;

        for (const task of tasks) {
          let warnType: 'DEADLINE' | 'RISK' | null = null;
          let warnTitle = '';
          let warnMessage = '';

          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          const startDate = task.startDate ? new Date(task.startDate) : null;

          if (dueDate) {
            if (!task.isDeadlineWarned && dueDate <= futureDate && dueDate >= now) {
              warnType = 'DEADLINE';
              warnTitle = 'Cảnh báo hạn chót công việc';
              warnMessage = `Công việc "${task.title}" sắp đến hạn vào ${dueDate.toLocaleDateString('vi-VN')}.`;
            } else if (!task.isRiskWarned && dueDate > futureDate && startDate && task.progress != null) {
              const totalDuration = dueDate.getTime() - startDate.getTime();
              const elapsed = now.getTime() - startDate.getTime();
              if (totalDuration > 0 && elapsed > 0) {
                const expectedProgress = (elapsed / totalDuration) * 100;
                if (expectedProgress > 50 && (expectedProgress - task.progress > 20)) {
                  warnType = 'RISK';
                  warnTitle = 'Cảnh báo nguy cơ chậm tiến độ';
                  warnMessage = `Công việc "${task.title}" có nguy cơ chậm tiến độ (Thời gian đã qua: ${Math.round(expectedProgress)}%, Tiến độ thực tế: ${task.progress}%).`;
                }
              }
            }
          }

          if (warnType) {
            const assigneeCodes = task.participants
              .filter(p => p.participantRole === 'ASSIGNEE')
              .map(p => p.employeeCode)
              .filter(Boolean) as string[];

            if (assigneeCodes.length > 0) {
              // Lookup userId batch — không gửi theo employeeCode
              const emps = await this.prisma.employee.findMany({
                where: { employeeCode: { in: assigneeCodes } },
                select: { userId: true }
              });
              const userIds = emps.map(e => e.userId).filter(Boolean) as string[];
              if (userIds.length > 0) {
                this.taskShared.sendTaskNotification(userIds, warnTitle, warnMessage, task);
              }
            }

            const updateData: any = {};
            if (warnType === 'DEADLINE') updateData.isDeadlineWarned = true;
            if (warnType === 'RISK') updateData.isRiskWarned = true;

            await this.prisma.task.update({ where: { id: task.id }, data: updateData });
            await this.prisma.taskComment.create({
              data: {
                taskId: task.id,
                authorCode: null,
                content: `Hệ thống đã tự động gửi cảnh báo: ${warnTitle}`,
                isSystemMessage: true,
              }
            });
          }
        }

        // Nhường lại event loop 50ms để các request khác không bị block
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      this.logger.log('Finished Due Task Scanner Cron Job.');
    } catch (err) {
      this.logger.error('Error in due task scanner', err);
    }
  }
}
