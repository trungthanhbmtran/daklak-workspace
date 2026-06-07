import { Injectable, Inject } from '@nestjs/common';
import { TaskRole } from '@generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TasksService implements OnModuleInit {
  private integrationService: any;

  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject('INTEGRATION_PACKAGE') private integrationClient: any,
  ) { }

  onModuleInit() {
    this.integrationService = this.integrationClient.getService('IntegrationService');
  }

  private async getDynamicConfig() {
    try {
      const res = await firstValueFrom<any>(this.integrationService.FindAll({ search: '' }));
      const data = res?.data || res || [];
      if (!Array.isArray(data)) return {};
      const config: Record<string, any> = {};
      for (const item of data) {
        if (item.isActive && item.configData) {
          try {
            const parsed = typeof item.configData === 'string' ? JSON.parse(item.configData) : item.configData;
            if (item.integrationCode === 'NOTIFY_TELEGRAM') config.telegram = parsed;
          } catch (e) { }
        }
      }
      return config;
    } catch (error) {
      return {};
    }
  }

  private parseParticipants(participants: any[]) {
    if (!participants) return { owner: null, assignee: null, approver: null, coordinators: [] };
    const owner = participants.find(p => p.participantRole === TaskRole.OWNER)?.userId || null;
    const assignee = participants.find(p => p.participantRole === TaskRole.ASSIGNEE)?.userId || null;
    const approver = participants.find(p => p.participantRole === TaskRole.APPROVER)?.userId || null;
    const coordinators = participants.filter(p => p.participantRole === TaskRole.COORDINATOR).map(p => p.userId);
    return { owner, assignee, approver, coordinators };
  }

  private async computeAllowedActions(t: any, query: any, isUserInTree: boolean = false): Promise<string[]> {
    if (!query || !query.currentUserId) return [];
    const isUserAdmin = query.isAdmin === true;
    const currentUserId = query.currentUserId;

    const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);

    const isAssigner = owner === currentUserId;
    const isAssignee = assignee === currentUserId;
    const isSupervisor = approver === currentUserId;
    const isCoordinator = coordinators.includes(currentUserId);

    const isPlanCreator = t.plan?.createdByCode === currentUserId;
    const canEdit = isUserAdmin || isAssigner || isAssignee || isPlanCreator;

    const allowedActions: string[] = [];
    if (canEdit) allowedActions.push('EDIT', 'ASSIGN', 'ADD_SUBTASK');
    if (isUserAdmin || isAssigner || isPlanCreator) allowedActions.push('DELETE');
    if (isAssignee && t.status !== 'DONE') {
      allowedActions.push('COMPLETE');
      if (t.status !== 'RETURNED') allowedActions.push('RETURN');
      allowedActions.push('COORDINATE');
    }

    let canChat = isUserAdmin || isAssigner || isAssignee || isSupervisor || isCoordinator || isUserInTree || isPlanCreator;

    if (!canChat && t.id) {
      // Check closure table if user is in ancestor tasks
      const ancestorIds = await this.prisma.taskClosure.findMany({
        where: { descendantId: t.id },
        select: { ancestorId: true }
      });
      const aIds = ancestorIds.map(a => a.ancestorId);
      if (aIds.length > 0) {
        const found = await this.prisma.taskParticipant.findFirst({
          where: {
            taskId: { in: aIds },
            userId: currentUserId
          }
        });
        if (found) canChat = true;
      }
    }

    if (canChat) allowedActions.push('CHAT');
    return allowedActions;
  }

  async listTasks(query: any) {
    const where: any = { status: { not: 'TEMPLATE' } };
    
    // Logic: find tasks where user has a specific role
    const participantCondition: any = {};
    if (query.assigneeId) {
      if (query.isSupervisor) {
        participantCondition.userId = query.assigneeId;
        participantCondition.participantRole = TaskRole.APPROVER;
      } else {
        participantCondition.userId = query.assigneeId;
        participantCondition.participantRole = TaskRole.ASSIGNEE;
      }
    }
    
    if (query.assignerId) {
      participantCondition.userId = query.assignerId;
      participantCondition.participantRole = TaskRole.OWNER;
    }

    if (Object.keys(participantCondition).length > 0) {
      where.participants = { some: participantCondition };
    }

    if (query.search) where.title = { contains: query.search };
    if (query.status && query.status !== 'ALL') where.status = query.status;
    if (query.priority && query.priority !== 'ALL') where.priority = query.priority;

    if (query.planId) {
      where.planId = parseInt(query.planId, 10);
      delete where.status;
    } else if (!query.assignerId && !query.isAdmin && query.currentUserId) {
      where.participants = {
        some: {
          userId: query.currentUserId
        }
      };
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });

    return {
      success: true,
      message: 'Lấy danh sách nhiệm vụ thành công',
      data: await Promise.all(tasks.map(async (t: any) => {
        const allowedActions = await this.computeAllowedActions(t, query);
        const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);

        return {
          ...t,
          assigneeId: assignee || 'UNASSIGNED',
          assignerId: owner || '',
          supervisorId: approver || '',
          coAssigneeIds: coordinators,
          dueDate: t.dueDate?.toISOString() || '',
          startDate: t.startDate?.toISOString() || '',
          createdAt: t.createdAt?.toISOString() || '',
          updatedAt: t.updatedAt?.toISOString() || '',
          allowedActions
        };
      })),
      meta: {
        pagination: { total: tasks.length, page: 1, pageSize: tasks.length, totalPages: 1 }
      }
    };
  }

  async createTask(data: any) {
    let planId = data.planId || null;
    let parentId = data.parentId ? parseInt(data.parentId, 10) : null;
    
    if (parentId) {
      const parent = await this.prisma.task.findUnique({
        where: { id: parentId },
        select: { planId: true }
      });
      planId = parent?.planId || null;
    }

    const initialStatus = parentId ? 'TEMPLATE' : (data.status || 'TODO');

    // Mở transaction để tạo Task, Participants và Closure
    const t = await this.prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          parentId,
          title: data.title || data.taskName || 'Nhiệm vụ không tên',
          description: data.description,
          status: initialStatus,
          priority: data.priority || 'MEDIUM',
          startDate: data.startDate ? new Date(data.startDate) : null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          baseScore: data.baseScore,
          weight: data.weight,
          scoringMethod: data.scoringMethod || 'MANUAL',
          bonusPerDay: data.bonusPerDay,
          penaltyPerDay: data.penaltyPerDay,
          creatorUserId: data.currentUserId || 'SYSTEM',
          planId
        }
      });

      // Tạo participants
      const participantsData: any[] = [];
      if (data.assigneeId && data.assigneeId !== 'UNASSIGNED') {
        participantsData.push({ taskId: newTask.id, userId: data.assigneeId, participantRole: TaskRole.ASSIGNEE });
      }
      if (data.assignerId) {
        participantsData.push({ taskId: newTask.id, userId: data.assignerId, participantRole: TaskRole.OWNER });
      }
      if (data.supervisorId) {
        participantsData.push({ taskId: newTask.id, userId: data.supervisorId, participantRole: TaskRole.APPROVER });
      }
      
      if (participantsData.length > 0) {
        await tx.taskParticipant.createMany({ data: participantsData, skipDuplicates: true });
      }

      // Closure table logic
      // Self-reference
      await tx.taskClosure.create({
        data: { ancestorId: newTask.id, descendantId: newTask.id, depth: 0 }
      });

      // Inherit ancestors from parent
      if (parentId) {
        const parentAncestors = await tx.taskClosure.findMany({
          where: { descendantId: parentId }
        });
        const newAncestors = parentAncestors.map(a => ({
          ancestorId: a.ancestorId,
          descendantId: newTask.id,
          depth: a.depth + 1
        }));
        if (newAncestors.length > 0) {
          await tx.taskClosure.createMany({ data: newAncestors });
        }
      }

      return newTask;
    });

    return t;
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorId?: string) {
    const dataToUpdate: any = { status };
    if (rejectReason !== undefined) dataToUpdate.rejectReason = rejectReason;
    if (status === 'DONE') dataToUpdate.completedAt = new Date();

    const t = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: { participants: true }
    });

    if (rejectReason && status === 'RETURNED') {
      await this.prisma.taskComment.create({
        data: {
          taskId: id,
          userId: actorId || null,
          content: `Đã trả lại công việc với lý do: ${rejectReason}`,
          isSystemMessage: true,
        }
      });
    }

    if (status === 'DONE') await this.updateTaskProgress(id, 100, actorId);

    return t;
  }

  async assignTask(id: number, assigneeId: string, coAssigneeIds?: string[], departmentId?: number, assignerId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findUnique({
        where: { id },
        include: { participants: true }
      });
      if (!currentTask) throw new RpcException('Nhiệm vụ không tồn tại');

      // Update assignee
      if (assigneeId) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.ASSIGNEE }
        });
        if (assigneeId !== 'UNASSIGNED') {
          await tx.taskParticipant.create({
            data: { taskId: id, userId: assigneeId, participantRole: TaskRole.ASSIGNEE }
          });
        }
      }

      // Update owner
      if (assignerId) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.OWNER }
        });
        await tx.taskParticipant.create({
          data: { taskId: id, userId: assignerId, participantRole: TaskRole.OWNER }
        });
      }

      // Update coordinators
      if (coAssigneeIds) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.COORDINATOR }
        });
        if (coAssigneeIds.length > 0) {
          const coData = coAssigneeIds.map(code => ({
            taskId: id, userId: code, participantRole: TaskRole.COORDINATOR
          }));
          await tx.taskParticipant.createMany({ data: coData, skipDuplicates: true });
        }
      }

      // Update status to TODO if it was TEMPLATE
      if (currentTask.status === 'TEMPLATE') {
        await tx.task.update({ where: { id }, data: { status: 'TODO' } });
      }

      return tx.task.findUnique({ where: { id }, include: { participants: true } });
    });
  }

  async getTask(id: number, query: any) {
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });
    if (!t) throw new RpcException('Không tìm thấy nhiệm vụ');

    const allowedActions = await this.computeAllowedActions(t, query);
    const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);

    return {
      success: true,
      data: {
        ...t,
        assigneeId: assignee || 'UNASSIGNED',
        assignerId: owner || '',
        supervisorId: approver || '',
        coAssigneeIds: coordinators,
        allowedActions
      }
    };
  }

  async getSubTasks(id: number, query: any) {
    // Get all descendants from closure table with depth = 1 (direct children)
    const closureData = await this.prisma.taskClosure.findMany({
      where: { ancestorId: id, depth: 1 },
      select: { descendantId: true }
    });

    const childIds = closureData.map(c => c.descendantId);

    const tasks = await this.prisma.task.findMany({
      where: { id: { in: childIds }, status: { not: 'TEMPLATE' } },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true } } }
    });

    const data = await Promise.all(tasks.map(async (t: any) => {
      const allowedActions = await this.computeAllowedActions(t, query);
      const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);
      return {
        ...t,
        assigneeId: assignee || 'UNASSIGNED',
        assignerId: owner || '',
        supervisorId: approver || '',
        coAssigneeIds: coordinators,
        allowedActions
      };
    }));

    return { success: true, data };
  }

  async getTaskTree(id: number, query: any) {
    // Get all descendants (depth > 0)
    const closureData = await this.prisma.taskClosure.findMany({
      where: { ancestorId: id },
      include: {
        descendant: {
          include: { participants: true }
        }
      },
      orderBy: { depth: 'asc' }
    });

    const nodes = await Promise.all(closureData.map(async c => {
      const t = c.descendant as any;
      const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);
      return {
        ...t,
        assigneeId: assignee || 'UNASSIGNED',
        assignerId: owner || '',
        supervisorId: approver || '',
        coAssigneeIds: coordinators,
        depth: c.depth
      };
    }));

    // Build tree
    const map = new Map<number, any>();
    const roots: any[] = [];
    nodes.forEach(n => {
      n.children = [];
      map.set(n.id, n);
    });

    nodes.forEach(n => {
      if (n.parentId && map.has(n.parentId) && n.id !== id) {
        map.get(n.parentId).children.push(n);
      } else if (n.id === id) {
        roots.push(n);
      }
    });

    return { success: true, data: roots[0] };
  }

  async addCoAssignees(id: number, coAssigneeIds: string[]) {
    if (!coAssigneeIds || coAssigneeIds.length === 0) return;
    const coData = coAssigneeIds.map(code => ({
      taskId: id, userId: code, participantRole: TaskRole.COORDINATOR
    }));
    await this.prisma.taskParticipant.createMany({ data: coData, skipDuplicates: true });
    return { success: true };
  }

  async createSubTask(id: number, data: any) {
    data.parentId = id;
    return this.createTask(data);
  }

  async deleteTask(id: number) {
    // Xoá tất cả node con qua Closure
    const descendants = await this.prisma.taskClosure.findMany({
      where: { ancestorId: id },
      select: { descendantId: true }
    });
    const idsToDelete = descendants.map(d => d.descendantId);

    if (idsToDelete.length > 0) {
      await this.prisma.task.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    return { success: true };
  }

  async updateTaskProgress(id: number, progress: number, actorId?: string) {
    const p = Math.max(0, Math.min(100, progress));
    await this.prisma.task.update({ where: { id }, data: { progress: p } });
    
    // Tìm parent để update
    const closure = await this.prisma.taskClosure.findFirst({
      where: { descendantId: id, depth: 1 }
    });
    if (closure && closure.ancestorId) {
      // Calculate avg progress of children
      const children = await this.prisma.taskClosure.findMany({
        where: { ancestorId: closure.ancestorId, depth: 1 },
        select: { descendantId: true }
      });
      const childIds = children.map(c => c.descendantId);
      const tasks = await this.prisma.task.findMany({ where: { id: { in: childIds } }, select: { progress: true } });
      const avg = tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;
      await this.updateTaskProgress(closure.ancestorId, avg, actorId);
    }
    return { success: true };
  }

  async recommendAssignees(query: any) { return { success: true, data: [] }; }
  async getTasks(query: any) { return this.listTasks(query); }
  async importTasks(data: any[]) { return { success: true }; }
  async exportTasks(query: any) { return { success: true }; }
  async resolveTask(id: number, action: string, body: any) {
    if (action === 'COMPLETE') return this.updateTaskStatus(id, 'DONE', undefined, body?.currentUserId);
    if (action === 'RETURN') return this.updateTaskStatus(id, 'RETURNED', body?.rejectReason, body?.currentUserId);
  }
  async updateTask(id: number, data: any) {
    const t = await this.prisma.task.update({ where: { id }, data });
    return { success: true, data: t };
  }
  async breakdownTask(id: number, data: any) {
    return this.createSubTask(id, data);
  }
  async addComment(id: number, data: any) {
    const c = await this.prisma.taskComment.create({
      data: { taskId: id, userId: data.currentUserId, content: data.content }
    });
    return { success: true, data: c };
  }
  async getComments(id: number, query: any) {
    const comments = await this.prisma.taskComment.findMany({ where: { taskId: id } });
    return { success: true, data: comments };
  }
  async requestCoordination(id: number, data: any) {
    return this.addCoAssignees(id, data.coAssigneeIds);
  }
}
