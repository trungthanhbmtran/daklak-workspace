import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { TaskSharedService } from '../task-shared/task-shared.service';

@Injectable()
export class TaskCommentsService {
  private readonly logger = new Logger(TaskCommentsService.name);
  constructor(public prisma: PrismaService, private shared: TaskSharedService) {}
  async addComment(id: number, data: any) {
    await this.shared.populateQueryHierarchy(data);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(t, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.shared.computeAllowedActions(t, data);
    if (!allowedActions.includes('CHAT')) {
      throw new RpcException('Bạn không có quyền tham gia trao đổi trong công việc này.');
    }

    const actorCode = data.authorCode || data.currentEmployeeCode || 'SYSTEM';

    const c = await this.prisma.taskComment.create({
      data: { taskId: id, authorCode: actorCode === 'SYSTEM' ? null : actorCode, content: data.content, isSystemMessage: data.isSystemMessage || false }
    });

    const emp = await this.prisma.employee.findUnique({
      where: { employeeCode: actorCode },
      select: { fullName: true, avatar: true }
    });

    // Handle @mentions
    if (!data.isSystemMessage && data.content) {
      const mentionRegex = /@\[.*?\]\(([^)]+)\)/g;
      const mentionedCodes = new Set<string>();
      let match;
      while ((match = mentionRegex.exec(data.content)) !== null) {
        if (match[1] !== actorCode) {
          mentionedCodes.add(match[1]);
        }
      }

      if (mentionedCodes.size > 0) {
        const mentionedEmployees = await this.prisma.employee.findMany({
          where: { employeeCode: { in: Array.from(mentionedCodes) } },
          select: { userId: true }
        });

        const userIds = mentionedEmployees.map(e => e.userId).filter(Boolean);

        if (userIds.length > 0) {
          const actorName = emp?.fullName || actorCode;
          this.shared.notificationClient.emit('send_notification', {
            title: 'Bạn được nhắc đến trong bình luận',
            message: `${actorName} đã nhắc đến bạn trong bình luận của công việc "${t.title}"`,
            type: 'SYSTEM',
            recipients: userIds,
            metadata: {
              module: (t.metadata && (t.metadata as any).module) ? (t.metadata as any).module : 'hrm',
              type: (t.metadata && (t.metadata as any).type) ? (t.metadata as any).type : 'work-plans/tasks',
              id: t.id
            },
          }).subscribe();
        }
      }
    }

    return {
      success: true,
      data: {
        id: c.id,
        taskId: c.taskId,
        authorCode: actorCode,
        authorName: emp ? emp.fullName : actorCode,
        authorAvatar: emp ? emp.avatar : '',
        content: c.content,
        isSystemMessage: c.isSystemMessage,
        createdAt: c.createdAt.toISOString(),
      }
    };
  }
  async getComments(id: number, query: any) {
    await this.shared.populateQueryHierarchy(query);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(t, query);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.shared.computeAllowedActions(t, query);
    if (!allowedActions.includes('CHAT')) {
      throw new RpcException('Bạn không có quyền tham gia trao đổi trong công việc này.');
    }

    const comments = await this.prisma.taskComment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'asc' },
    });

    const authorCodes = new Set<string>();
    comments.forEach(c => {
      if (c.authorCode) authorCodes.add(c.authorCode);
    });

    const employees = await this.prisma.employee.findMany({
      where: { employeeCode: { in: Array.from(authorCodes) } },
      select: { employeeCode: true, fullName: true, avatar: true }
    });

    const userMap = new Map<string, { employeeCode: string; fullName: string; avatar: string }>();
    employees.forEach(emp => {
      userMap.set(emp.employeeCode, {
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        avatar: emp.avatar || '',
      });
    });

    const data = comments.map(c => {
      const emp = c.authorCode ? userMap.get(c.authorCode) : null;
      return {
        id: c.id,
        taskId: c.taskId,
        authorCode: emp ? emp.employeeCode : 'SYSTEM',
        authorName: emp ? emp.fullName : 'SYSTEM',
        authorAvatar: emp ? emp.avatar : '',
        content: c.content,
        isSystemMessage: c.isSystemMessage,
        createdAt: c.createdAt.toISOString(),
        isMine: emp ? emp.employeeCode === query.currentEmployeeCode : false,
      };
    });

    return { success: true, data };
  }
}
