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
    const owner = participants.find(p => p.participantRole === TaskRole.OWNER)?.employeeCode || null;
    const assignee = participants.find(p => p.participantRole === TaskRole.ASSIGNEE)?.employeeCode || null;
    const approver = participants.find(p => p.participantRole === TaskRole.APPROVER)?.employeeCode || null;
    const coordinators = participants.filter(p => p.participantRole === TaskRole.COORDINATOR).map(p => p.employeeCode);
    return { owner, assignee, approver, coordinators };
  }

  private async enrichTasks(tasks: any[]) {
    if (!tasks || tasks.length === 0) return tasks;

    const employeeCodes = new Set<string>();
    const collectCodes = (t: any) => {
      if (t.participants) {
        const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);
        if (assignee && assignee !== 'UNASSIGNED') employeeCodes.add(assignee);
        if (owner) employeeCodes.add(owner);
        if (approver) employeeCodes.add(approver);
        if (coordinators) coordinators.forEach((c: string) => employeeCodes.add(c));
      }
      if (t.creatorEmployeeCode) {
        employeeCodes.add(t.creatorEmployeeCode);
      }
      if (t.children) t.children.forEach(collectCodes);
    };
    tasks.forEach(collectCodes);

    const codesArray = Array.from(employeeCodes).filter(Boolean);
    const employeeMap = new Map<string, string>();

    if (codesArray.length > 0) {
      const employees = await this.prisma.employee.findMany({
        where: { employeeCode: { in: codesArray } },
        select: { employeeCode: true, fullName: true }
      });
      employees.forEach(emp => employeeMap.set(emp.employeeCode, emp.fullName));
    }

    const mapNames = (t: any) => {
      if (t.creatorEmployeeCode) {
        t.creatorName = employeeMap.get(t.creatorEmployeeCode) || t.creatorEmployeeCode;
      }
      if (t.participants) {
        const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);
        t.assigneeCode = assignee || 'UNASSIGNED';
        t.assigneeName = assignee && assignee !== 'UNASSIGNED' ? (employeeMap.get(assignee) || assignee) : 'Chưa phân công';
        t.assignerCode = owner || '';
        t.assignerName = owner ? (employeeMap.get(owner) || owner) : (t.creatorName || '');
        t.supervisorCode = approver || '';
        t.supervisorName = approver ? (employeeMap.get(approver) || approver) : '';
        t.coassigneeCodes = coordinators;
      } else {
        t.assignerName = t.creatorName || '';
      }
      if (t.children) t.children.forEach(mapNames);
    };
    tasks.forEach(mapNames);

    return tasks;
  }

  private async computeAllowedActions(t: any, query: any, isUserInTree: boolean = false): Promise<string[]> {
    if (!query || !query.currentUserCode) return [];
    const isUserAdmin = query.isAdmin === true;
    const currentUserCode = query.currentUserCode;

    const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants);

    const isAssigner = owner === currentUserCode;
    const isAssignee = assignee === currentUserCode;
    const isSupervisor = approver === currentUserCode;
    const isCoordinator = coordinators.includes(currentUserCode);

    const isPlanCreator = t.plan?.createdByCode === currentUserCode;
    const canEdit = isUserAdmin || isAssigner || isAssignee || isPlanCreator || query.isLeader === true;

    const allowedActions: string[] = [];
    if (canEdit) allowedActions.push('EDIT', 'ASSIGN', 'ADD_SUBTASK');
    if (isUserAdmin || isAssigner || isPlanCreator || query.isLeader === true) allowedActions.push('DELETE');
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
            employeeCode: currentUserCode
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
    if (query.assigneeCode) {
      if (query.isSupervisor) {
        participantCondition.employeeCode = query.assigneeCode;
        participantCondition.participantRole = TaskRole.APPROVER;
      } else {
        participantCondition.employeeCode = query.assigneeCode;
        participantCondition.participantRole = TaskRole.ASSIGNEE;
      }
    }

    if (query.assignerCode) {
      participantCondition.employeeCode = query.assignerCode;
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
    }

    // Áp dụng bộ lọc PBAC nếu không phải admin
    if (!query.isAdmin && query.currentUserCode) {
      where.OR = [
        // Quy?n owner: việc mình t?o ho?c giao
        { creatorEmployeeCode: query.currentUserCode },
        // Quy?n assignee/coordinator: việc mình ???c giao/ph?i h?p
        { participants: { some: { employeeCode: query.currentUserCode } } },
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });

    const enrichedTasks = await this.enrichTasks(tasks);

    return {
      success: true,
      message: 'Lấy danh sách nhiệm vụ thành công',
      data: await Promise.all(enrichedTasks.map(async (t: any) => {
        const allowedActions = await this.computeAllowedActions(t, query);

        return {
          ...t,
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
          creatorEmployeeCode: data.currentUserCode || 'SYSTEM',
          planId
        }
      });

      // Tạo participants
      const participantsData: any[] = [];
      if (data.assigneeCode && data.assigneeCode !== 'UNASSIGNED') {
        participantsData.push({ taskId: newTask.id, employeeCode: data.assigneeCode, participantRole: TaskRole.ASSIGNEE });
      }
      if (data.assignerCode) {
        participantsData.push({ taskId: newTask.id, employeeCode: data.assignerCode, participantRole: TaskRole.OWNER });
      }
      if (data.supervisorCode) {
        participantsData.push({ taskId: newTask.id, employeeCode: data.supervisorCode, participantRole: TaskRole.APPROVER });
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

    const createdTask = await this.prisma.task.findUnique({
      where: { id: t.id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });

    const enriched = await this.enrichTasks([createdTask]);
    return enriched[0];
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string) {
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
          employeeCode: actorCode || null,
          content: `Đã trả lại công việc với lý do: ${rejectReason}`,
          isSystemMessage: true,
        }
      });
    }

    if (status === 'DONE') await this.updateTaskProgress(id, 100, actorCode);

    return t;
  }

  async assignTask(id: number, assigneeCode: string, coassigneeCodes?: string[], departmentId?: number, assignerCode?: string) {
    const t = await this.prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findUnique({
        where: { id },
        include: { participants: true }
      });
      if (!currentTask) throw new RpcException('Nhiệm vụ không tồn tại');

      // Update assignee
      if (assigneeCode !== undefined) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.ASSIGNEE }
        });
        if (assigneeCode && assigneeCode !== 'UNASSIGNED') {
          await tx.taskParticipant.create({
            data: { taskId: id, employeeCode: assigneeCode, participantRole: TaskRole.ASSIGNEE }
          });
        }
      }

      // Update owner
      if (assignerCode) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.OWNER }
        });
        await tx.taskParticipant.create({
          data: { taskId: id, employeeCode: assignerCode, participantRole: TaskRole.OWNER }
        });
      }

      // Update coordinators
      if (coassigneeCodes) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.COORDINATOR }
        });
        if (coassigneeCodes.length > 0) {
          const coData = coassigneeCodes.map(code => ({
            taskId: id, employeeCode: code, participantRole: TaskRole.COORDINATOR
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

    const enriched = await this.enrichTasks([t]);
    return enriched[0];
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
    const enriched = await this.enrichTasks([t]);

    return {
      success: true,
      data: {
        ...enriched[0],
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

    const enriched = await this.enrichTasks(tasks);

    const data = await Promise.all(enriched.map(async (t: any) => {
      const allowedActions = await this.computeAllowedActions(t, query);
      return {
        ...t,
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

    const descendants = closureData.map(c => ({
      ...(c.descendant as any),
      depth: c.depth
    }));

    const enriched = await this.enrichTasks(descendants);

    // Build tree
    const map = new Map<number, any>();
    const roots: any[] = [];
    enriched.forEach(n => {
      n.children = [];
      map.set(n.id, n);
    });

    enriched.forEach(n => {
      if (n.parentId && map.has(n.parentId) && n.id !== id) {
        map.get(n.parentId).children.push(n);
      } else if (n.id === id) {
        roots.push(n);
      }
    });

    return { success: true, data: roots[0] };
  }

  async addCoAssignees(id: number, coassigneeCodes: string[]) {
    if (!coassigneeCodes || coassigneeCodes.length === 0) return;
    const coData = coassigneeCodes.map(code => ({
      taskId: id, employeeCode: code, participantRole: TaskRole.COORDINATOR
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

  async updateTaskProgress(id: number, progress: number, actorCode?: string) {
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
      await this.updateTaskProgress(closure.ancestorId, avg, actorCode);
    }
    return { success: true };
  }

  async recommendAssignees(query: any) {
    try {
      const whereClause: any = { employmentStatus: 'active' };

      if (query.allowedDepartmentIds) {
        whereClause.departmentId = { in: query.allowedDepartmentIds };
      }
      
      if (query.allowedJobTitleIds) {
        whereClause.jobTitleId = { in: query.allowedJobTitleIds };
      }

      if (query.excludeEmployeeCode) {
        whereClause.employeeCode = { not: query.excludeEmployeeCode };
      }

      const employees = await this.prisma.employee.findMany({
        where: whereClause,
      });

      const activeTasksCount = await this.prisma.taskParticipant.groupBy({
        by: ['employeeCode'],
        where: {
          participantRole: 'ASSIGNEE',
          task: {
            status: { not: 'DONE' },
          },
        },
        _count: {
          taskId: true,
        },
      });
      const taskCountMap = new Map(activeTasksCount.map(item => [item.employeeCode, item._count.taskId]));

      const evaluations = await this.prisma.kpiEvaluation.findMany({
        orderBy: { createdAt: 'desc' },
        select: { employeeCode: true, totalScore: true },
      });
      const kpiMap = new Map(evaluations.map(item => [item.employeeCode, item.totalScore || 75]));

      const employeeList = employees.map(emp => {
        const taskCount = taskCountMap.get(emp.employeeCode) || 0;
        const kpiScore = kpiMap.get(emp.employeeCode) || 75;
        return {
          id: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          fullName: emp.fullName,
          departmentId: emp.departmentId,
          jobTitleId: emp.jobTitleId,
          currentLoad: taskCount,
          performanceScore: kpiScore,
        };
      });

      const strategy = query?.strategy || 'LOW_PERFORMANCE';
      if (strategy === 'HIGH_PERFORMANCE') {
        employeeList.sort((a, b) => b.performanceScore - a.performanceScore || a.currentLoad - b.currentLoad);
      } else if (strategy === 'UNDER_QUOTA') {
        employeeList.sort((a, b) => a.currentLoad - b.currentLoad || b.performanceScore - a.performanceScore);
      } else { // 'LOW_PERFORMANCE'
        employeeList.sort((a, b) => a.performanceScore - b.performanceScore || a.currentLoad - b.currentLoad);
      }

      // Group by department for topDepartments
      const deptMap = new Map<number, { departmentId: number; employeeCount: number; currentLoad: number; performanceScore: number }>();
      employeeList.forEach(emp => {
        if (!emp.departmentId) return;
        const deptId = emp.departmentId;
        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            departmentId: deptId,
            employeeCount: 0,
            currentLoad: 0,
            performanceScore: 0,
          });
        }
        const dept = deptMap.get(deptId)!;
        dept.employeeCount += 1;
        dept.currentLoad += emp.currentLoad;
        dept.performanceScore += emp.performanceScore;
      });

      const topDepartments = Array.from(deptMap.values()).map(dept => ({
        ...dept,
        currentLoad: dept.currentLoad / dept.employeeCount,
        performanceScore: dept.performanceScore / dept.employeeCount,
      }));

      if (strategy === 'HIGH_PERFORMANCE') {
        topDepartments.sort((a, b) => b.performanceScore - a.performanceScore);
      } else if (strategy === 'UNDER_QUOTA') {
        topDepartments.sort((a, b) => a.currentLoad - b.currentLoad);
      } else {
        topDepartments.sort((a, b) => a.performanceScore - b.performanceScore);
      }

      return {
        success: true,
        data: {
          topEmployees: employeeList,
          topDepartments,
        },
      };
    } catch (error: any) {
      console.error('recommendAssignees error:', error);
      return { success: false, message: error.message || 'Lỗi gợi ý cán bộ' };
    }
  }
  async getTasks(query: any) { return this.listTasks(query); }
  async importTasks(data: any[]) { return { success: true }; }
  async exportTasks(query: any) { return { success: true }; }
  async resolveTask(id: number, action: string, body: any) {
    if (action === 'COMPLETE') return this.updateTaskStatus(id, 'DONE', undefined, body?.currentUserCode);
    if (action === 'RETURN') return this.updateTaskStatus(id, 'RETURNED', body?.rejectReason, body?.currentUserCode);
  }
  async updateTask(id: number, data: any) {
    const updateData = { ...data };
    delete updateData.id; // Don't update the ID
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    const t = await this.prisma.task.update({ where: { id }, data: updateData });
    return { success: true, data: t };
  }
  async breakdownTask(id: number, data: any) {
    return this.createSubTask(id, data);
  }
  async addComment(id: number, data: any) {
    const actorCode = data.authorCode || data.currentUserCode || 'SYSTEM';
    const c = await this.prisma.taskComment.create({
      data: { taskId: id, employeeCode: actorCode, content: data.content, isSystemMessage: data.isSystemMessage || false }
    });

    const emp = await this.prisma.employee.findUnique({
      where: { employeeCode: actorCode },
      select: { fullName: true, avatar: true }
    });

    return {
      success: true,
      data: {
        id: c.id,
        taskId: c.taskId,
        authorCode: c.employeeCode || '',
        authorName: emp ? emp.fullName : (c.employeeCode || ''),
        authorAvatar: emp ? emp.avatar : '',
        content: c.content,
        isSystemMessage: c.isSystemMessage,
        createdAt: c.createdAt.toISOString(),
      }
    };
  }
  async getComments(id: number, query: any) {
    const comments = await this.prisma.taskComment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'asc' },
    });

    const employeeCodes = new Set<string>();
    comments.forEach(c => {
      if (c.employeeCode) employeeCodes.add(c.employeeCode);
    });

    const employees = await this.prisma.employee.findMany({
      where: { employeeCode: { in: Array.from(employeeCodes) } },
      select: { employeeCode: true, fullName: true, avatar: true }
    });

    const employeeMap = new Map<string, { fullName: string; avatar: string }>();
    employees.forEach(emp => {
      employeeMap.set(emp.employeeCode, {
        fullName: emp.fullName,
        avatar: emp.avatar || '',
      });
    });

    const data = comments.map(c => {
      const emp = c.employeeCode ? employeeMap.get(c.employeeCode) : null;
      return {
        id: c.id,
        taskId: c.taskId,
        authorCode: c.employeeCode || '',
        authorName: emp ? emp.fullName : (c.employeeCode || ''),
        authorAvatar: emp ? emp.avatar : '',
        content: c.content,
        isSystemMessage: c.isSystemMessage,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return { success: true, data };
  }
  async requestCoordination(id: number, data: any) {
    const leadCode = data.leadId || data.leadCode;
    const coordinatorCodes = data.coordinatorIds || data.coordinatorCodes || [];
    const message = data.message;
    const requesterCode = data.requesterCode;

    if (!leadCode && coordinatorCodes.length === 0) {
      // Just a request for coordination from the assignee
      if (message) {
        await this.prisma.taskComment.create({
          data: {
            taskId: id,
            employeeCode: requesterCode || null,
            content: `Gửi yêu cầu phối hợp: ${message}`,
            isSystemMessage: true,
          }
        });
      }
      return { success: true };
    }

    return this.prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findUnique({
        where: { id },
        select: { status: true }
      });

      // 1. Update Lead (ASSIGNEE role) if provided
      if (leadCode) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.ASSIGNEE }
        });
        await tx.taskParticipant.create({
          data: { taskId: id, employeeCode: leadCode, participantRole: TaskRole.ASSIGNEE }
        });
      }

      // 2. Update Coordinators (COORDINATOR role)
      await tx.taskParticipant.deleteMany({
        where: { taskId: id, participantRole: TaskRole.COORDINATOR }
      });
      if (coordinatorCodes.length > 0) {
        const coData = coordinatorCodes.map((code: string) => ({
          taskId: id,
          employeeCode: code,
          participantRole: TaskRole.COORDINATOR
        }));
        await tx.taskParticipant.createMany({ data: coData, skipDuplicates: true });
      }

      // Update status to TODO if it was TEMPLATE
      if (currentTask && currentTask.status === 'TEMPLATE') {
        await tx.task.update({ where: { id }, data: { status: 'TODO' } });
      }

      return { success: true };
    });
  }
}
