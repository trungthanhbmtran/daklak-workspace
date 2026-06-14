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
  private userService: any;
  private workflowService: any;

  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject('INTEGRATION_PACKAGE') private integrationClient: any,
    @Inject('USER_PACKAGE') private userClient: any,
    @Inject('WORKFLOW_PACKAGE') private workflowClient: any,
  ) { }

  onModuleInit() {
    this.integrationService = this.integrationClient.getService('IntegrationService');
    this.userService = this.userClient.getService('UserService');
    this.workflowService = this.workflowClient.getService('WorkflowService');
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

  private parseParticipants(participants: any[], userToCodeMap: Map<number, string>) {
    if (!participants) return { owner: null, assignee: null, approver: null, coordinators: [] };
    const getCode = (uid?: number | null) => uid ? (userToCodeMap.get(uid) || '') : '';

    const ownerId = participants.find(p => p.participantRole === TaskRole.OWNER)?.userId;
    const assigneeId = participants.find(p => p.participantRole === TaskRole.ASSIGNEE)?.userId;
    const approverId = participants.find(p => p.participantRole === TaskRole.APPROVER)?.userId;

    const owner = ownerId ? getCode(ownerId) : null;
    const assignee = assigneeId ? getCode(assigneeId) : null;
    const approver = approverId ? getCode(approverId) : null;

    const coordinators = participants
      .filter(p => p.participantRole === TaskRole.COORDINATOR)
      .map(p => getCode(p.userId))
      .filter(Boolean);

    return { owner, assignee, approver, coordinators };
  }

  private async enrichTasks(tasks: any[]) {
    if (!tasks || tasks.length === 0) return tasks;

    const userIds = new Set<number>();
    const collectUserIds = (t: any) => {
      if (t.participants) {
        t.participants.forEach((p: any) => {
          if (p.userId) userIds.add(p.userId);
        });
      }
      if (t.creatorUserId) {
        userIds.add(t.creatorUserId);
      }
      if (t.children) t.children.forEach(collectUserIds);
    };
    tasks.forEach(collectUserIds);

    const userIdsArray = Array.from(userIds).filter(Boolean);
    const employeeMap = new Map<string, string>(); // employeeCode -> fullName
    const userToCodeMap = new Map<number, string>(); // userId -> employeeCode

    if (userIdsArray.length > 0) {
      const employees = await this.prisma.employee.findMany({
        where: { userId: { in: userIdsArray.map(String) } },
        select: { userId: true, employeeCode: true, fullName: true }
      });
      employees.forEach(emp => {
        if (emp.userId) {
          const uid = parseInt(emp.userId, 10);
          userToCodeMap.set(uid, emp.employeeCode);
          employeeMap.set(emp.employeeCode, emp.fullName);
        }
      });
    }

    const mapNames = (t: any) => {
      const creatorCode = t.creatorUserId ? (userToCodeMap.get(t.creatorUserId) || '') : '';
      if (creatorCode) {
        t.creatorEmployeeCode = creatorCode;
        t.creatorName = employeeMap.get(creatorCode) || creatorCode;
      } else {
        t.creatorEmployeeCode = 'SYSTEM';
        t.creatorName = 'SYSTEM';
      }

      if (t.participants) {
        const { owner, assignee, approver, coordinators } = this.parseParticipants(t.participants, userToCodeMap);
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
    return ['EDIT', 'ASSIGN', 'ADD_SUBTASK', 'DELETE', 'COMPLETE', 'RETURN', 'COORDINATE', 'CHAT'];
  }

  async listTasks(query: any) {
    const where: any = {};

    // Resolve currentUserId by currentUserCode
    let currentUserId: number | undefined = undefined;
    if (query.currentUserCode) {
      const currentEmp = await this.prisma.employee.findUnique({
        where: { employeeCode: query.currentUserCode },
        select: { userId: true }
      });
      if (currentEmp?.userId) {
        currentUserId = parseInt(currentEmp.userId, 10);
      }
    }

    const conditions: any[] = [];

    // Default status filter
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    } else {
      where.status = { not: 'TEMPLATE' };
    }

    // Role filter
    if (query.role && currentUserId) {
      conditions.push({
        participants: {
          some: {
            userId: currentUserId,
            participantRole: query.role
          }
        }
      });
    }

    // Assignee filter
    if (query.assigneeCode) {
      if (query.assigneeCode === 'UNASSIGNED') {
        conditions.push({
          OR: [
            {
              participants: {
                none: {
                  participantRole: TaskRole.ASSIGNEE
                }
              }
            },
            {
              participants: {
                some: {
                  userId: 0,
                  participantRole: TaskRole.ASSIGNEE
                }
              }
            }
          ]
        });
      } else {
        const emp = await this.prisma.employee.findUnique({
          where: { employeeCode: query.assigneeCode },
          select: { userId: true }
        });
        if (emp?.userId) {
          conditions.push({
            participants: {
              some: {
                userId: parseInt(emp.userId, 10),
                participantRole: query.isSupervisor ? TaskRole.APPROVER : TaskRole.ASSIGNEE
              }
            }
          });
        } else {
          conditions.push({ id: -1 });
        }
      }
    }

    // Assigner/Owner filter
    if (query.assignerCode) {
      const emp = await this.prisma.employee.findUnique({
        where: { employeeCode: query.assignerCode },
        select: { userId: true }
      });
      if (emp?.userId) {
        conditions.push({
          participants: {
            some: {
              userId: parseInt(emp.userId, 10),
              participantRole: TaskRole.OWNER
            }
          }
        });
      } else {
        conditions.push({ id: -1 });
      }
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    if (query.search) where.title = { contains: query.search };
    if (query.priority && query.priority !== 'ALL') where.priority = query.priority;

    if (query.planId) {
      where.planId = parseInt(query.planId, 10);
      delete where.status;
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

    // Resolve creatorUserId
    let creatorUserId = 0;
    if (data.currentUserCode) {
      const emp = await this.prisma.employee.findUnique({
        where: { employeeCode: data.currentUserCode },
        select: { userId: true }
      });
      if (emp?.userId) {
        creatorUserId = parseInt(emp.userId, 10);
      }
    }

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
          creatorUserId,
          planId
        }
      });

      // Look up userIds for assignee, assigner, supervisor codes
      const codesToLookup = [
        data.assigneeCode || 'UNASSIGNED',
        data.assignerCode || 'UNASSIGNED',
        data.supervisorCode || null
      ].filter(Boolean) as string[];

      const employees = await tx.employee.findMany({
        where: { employeeCode: { in: codesToLookup } },
        select: { employeeCode: true, userId: true }
      });
      const codeToUidMap = new Map<string, number>();
      employees.forEach(emp => {
        if (emp.userId) codeToUidMap.set(emp.employeeCode, parseInt(emp.userId, 10));
      });

      // Tạo participants
      const participantsData: any[] = [];
      const assigneeCode = data.assigneeCode || 'UNASSIGNED';
      const assigneeUid = codeToUidMap.get(assigneeCode);
      if (assigneeUid !== undefined && assigneeUid !== null) {
        participantsData.push({ taskId: newTask.id, userId: assigneeUid, participantRole: TaskRole.ASSIGNEE });
      }

      const assignerCode = data.assignerCode || 'UNASSIGNED';
      const assignerUid = codeToUidMap.get(assignerCode);
      if (assignerUid !== undefined && assignerUid !== null) {
        participantsData.push({ taskId: newTask.id, userId: assignerUid, participantRole: TaskRole.OWNER });
      }

      if (data.supervisorCode) {
        const supervisorUid = codeToUidMap.get(data.supervisorCode);
        if (supervisorUid !== undefined && supervisorUid !== null) {
          participantsData.push({ taskId: newTask.id, userId: supervisorUid, participantRole: TaskRole.APPROVER });
        }
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

    let workflowInstId = null;
    try {
      const wfRes: any = await firstValueFrom(this.workflowService.TriggerWorkflow({
        trigger: 'TASK_PROCESSING',
        initiatorId: data.currentUserCode || '',
        businessId: t.id.toString(),
        businessType: 'TASK',
        initialContext: { taskId: t.id, creatorCode: data.currentUserCode || '' }
      }));
      if (wfRes && wfRes.id) {
        workflowInstId = wfRes.id;
        await this.prisma.task.update({ where: { id: t.id }, data: { workflowInstId } });
      }
    } catch (e) {
      console.error('Failed to trigger workflow for task:', t.id, e);
    }

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

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any) {
    const tCheck = await this.prisma.task.findUnique({ where: { id } });
    if (!tCheck) throw new RpcException('Nhiệm vụ không tồn tại');



    const dataToUpdate: any = { status };
    if (rejectReason !== undefined) dataToUpdate.rejectReason = rejectReason;
    if (status === 'DONE') dataToUpdate.completedAt = new Date();

    const t = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: { participants: true }
    });

    if (rejectReason && status === 'RETURNED') {
      let actorUserId: number | null = null;
      if (actorCode) {
        const emp = await this.prisma.employee.findUnique({
          where: { employeeCode: actorCode },
          select: { userId: true }
        });
        if (emp?.userId) actorUserId = parseInt(emp.userId, 10);
      }

      await this.prisma.taskComment.create({
        data: {
          taskId: id,
          userId: actorUserId,
          content: `Đã trả lại công việc với lý do: ${rejectReason}`,
          isSystemMessage: true,
        }
      });
    }

    if (status === 'DONE') await this.updateTaskProgress(id, 100, actorCode);

    return t;
  }

  async assignTask(
    id: number,
    assigneeCode: string,
    coassigneeCodes?: string[],
    departmentId?: number,
    assignerCode?: string,
    context?: { currentUserRoles?: string[]; currentUserPermissions?: string[]; currentUserId?: number; currentUserCode?: string }
  ) {
    const t = await this.prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findUnique({
        where: { id },
        include: { participants: true }
      });
      if (!currentTask) throw new RpcException('Nhiệm vụ không tồn tại');

      let currentAssigneeCode = 'UNASSIGNED';
      const currentAssigneeId = currentTask.participants.find(p => p.participantRole === TaskRole.ASSIGNEE)?.userId;
      if (currentAssigneeId) {
        const emp = await tx.employee.findFirst({
          where: { userId: String(currentAssigneeId) },
          select: { employeeCode: true }
        });
        if (emp) currentAssigneeCode = emp.employeeCode;
      }

      const isUnassigned = currentAssigneeCode === 'UNASSIGNED' || currentTask.status === 'TEMPLATE';



      // Look up userIds for assignee, assigner, coassignee codes
      const codesToLookup: string[] = ['UNASSIGNED'];
      if (assigneeCode) codesToLookup.push(assigneeCode);
      if (assignerCode) codesToLookup.push(assignerCode);
      if (coassigneeCodes && coassigneeCodes.length > 0) codesToLookup.push(...coassigneeCodes);

      const employees = await tx.employee.findMany({
        where: { employeeCode: { in: codesToLookup } },
        select: { employeeCode: true, userId: true }
      });
      const codeToUidMap = new Map<string, number>();
      employees.forEach(emp => {
        if (emp.userId) codeToUidMap.set(emp.employeeCode, parseInt(emp.userId, 10));
      });

      const getUserId = (code: string) => codeToUidMap.get(code);

      // Update assignee
      if (assigneeCode !== undefined) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.ASSIGNEE }
        });
        const uid = getUserId(assigneeCode || 'UNASSIGNED');
        if (uid !== undefined && uid !== null) {
          await tx.taskParticipant.create({
            data: { taskId: id, userId: uid, participantRole: TaskRole.ASSIGNEE }
          });
        }
      }

      // Update owner
      if (assignerCode) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.OWNER }
        });
        const uid = getUserId(assignerCode);
        if (uid !== undefined && uid !== null) {
          await tx.taskParticipant.create({
            data: { taskId: id, userId: uid, participantRole: TaskRole.OWNER }
          });
        }
      }

      // Update coordinators
      if (coassigneeCodes) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.COORDINATOR }
        });
        const coData: any[] = [];
        coassigneeCodes.forEach(code => {
          const uid = getUserId(code);
          if (uid) {
            coData.push({ taskId: id, userId: uid, participantRole: TaskRole.COORDINATOR });
          }
        });
        if (coData.length > 0) {
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
    const employees = await this.prisma.employee.findMany({
      where: { employeeCode: { in: coassigneeCodes } },
      select: { employeeCode: true, userId: true }
    });
    const coData: any[] = [];
    employees.forEach(emp => {
      if (emp.userId) {
        coData.push({
          taskId: id,
          userId: parseInt(emp.userId, 10),
          participantRole: TaskRole.COORDINATOR
        });
      }
    });
    if (coData.length > 0) {
      await this.prisma.taskParticipant.createMany({ data: coData, skipDuplicates: true });
    }
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

      // 1. Phân quyền: Kiểm tra Admin
      const roles = query.currentUserRoles || [];
      const perms = query.currentUserPermissions || [];
      const isAdmin = roles.includes('SUPER_ADMIN') || perms.includes('TASK:MANAGE');

      if (query.excludeEmployeeCode) {
        whereClause.employeeCode = { not: query.excludeEmployeeCode };
      }

      const employees = await this.prisma.employee.findMany({
        where: whereClause,
      });

      const activeTasksCount = await this.prisma.taskParticipant.groupBy({
        by: ['userId'],
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

      const uidToCodeMap = new Map<number, string>();
      employees.forEach(emp => {
        if (emp.userId) uidToCodeMap.set(parseInt(emp.userId, 10), emp.employeeCode);
      });

      const taskCountMap = new Map<string, number>();
      activeTasksCount.forEach(item => {
        const empCode = uidToCodeMap.get(item.userId);
        if (empCode) {
          taskCountMap.set(empCode, item._count.taskId);
        }
      });

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
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');
    const allowedActions = await this.computeAllowedActions(t, data);
    if (!allowedActions.includes('CHAT')) {
      throw new RpcException('Bạn không có quyền tham gia trao đổi trong công việc này.');
    }

    const actorCode = data.authorCode || data.currentUserCode || 'SYSTEM';
    let actorUserId: number | null = null;
    if (actorCode && actorCode !== 'SYSTEM') {
      const emp = await this.prisma.employee.findUnique({
        where: { employeeCode: actorCode },
        select: { userId: true }
      });
      if (emp?.userId) actorUserId = parseInt(emp.userId, 10);
    }

    const c = await this.prisma.taskComment.create({
      data: { taskId: id, userId: actorUserId, content: data.content, isSystemMessage: data.isSystemMessage || false }
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
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');
    const allowedActions = await this.computeAllowedActions(t, query);
    if (!allowedActions.includes('CHAT')) {
      throw new RpcException('Bạn không có quyền tham gia trao đổi trong công việc này.');
    }

    const comments = await this.prisma.taskComment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'asc' },
    });

    const userIds = new Set<number>();
    comments.forEach(c => {
      if (c.userId) userIds.add(c.userId);
    });

    const employees = await this.prisma.employee.findMany({
      where: { userId: { in: Array.from(userIds).map(String) } },
      select: { userId: true, employeeCode: true, fullName: true, avatar: true }
    });

    const userMap = new Map<number, { employeeCode: string; fullName: string; avatar: string }>();
    employees.forEach(emp => {
      if (emp.userId) {
        userMap.set(parseInt(emp.userId, 10), {
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          avatar: emp.avatar || '',
        });
      }
    });

    const data = comments.map(c => {
      const emp = c.userId ? userMap.get(c.userId) : null;
      return {
        id: c.id,
        taskId: c.taskId,
        authorCode: emp ? emp.employeeCode : 'SYSTEM',
        authorName: emp ? emp.fullName : 'SYSTEM',
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
        let requesterUserId: number | null = null;
        if (requesterCode) {
          const emp = await this.prisma.employee.findUnique({
            where: { employeeCode: requesterCode },
            select: { userId: true }
          });
          if (emp?.userId) requesterUserId = parseInt(emp.userId, 10);
        }
        await this.prisma.taskComment.create({
          data: {
            taskId: id,
            userId: requesterUserId,
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

      const codesToLookup: string[] = [];
      if (leadCode) codesToLookup.push(leadCode);
      if (coordinatorCodes.length > 0) codesToLookup.push(...coordinatorCodes);

      const employees = await tx.employee.findMany({
        where: { employeeCode: { in: codesToLookup } },
        select: { employeeCode: true, userId: true }
      });
      const codeToUidMap = new Map<string, number>();
      employees.forEach(emp => {
        if (emp.userId) codeToUidMap.set(emp.employeeCode, parseInt(emp.userId, 10));
      });

      // 1. Update Lead (ASSIGNEE role) if provided
      if (leadCode) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.ASSIGNEE }
        });
        const uid = codeToUidMap.get(leadCode);
        if (uid) {
          await tx.taskParticipant.create({
            data: { taskId: id, userId: uid, participantRole: TaskRole.ASSIGNEE }
          });
        }
      }

      // 2. Update Coordinators (COORDINATOR role)
      await tx.taskParticipant.deleteMany({
        where: { taskId: id, participantRole: TaskRole.COORDINATOR }
      });
      if (coordinatorCodes.length > 0) {
        const coData: any[] = [];
        coordinatorCodes.forEach((code: string) => {
          const uid = codeToUidMap.get(code);
          if (uid) {
            coData.push({
              taskId: id,
              userId: uid,
              participantRole: TaskRole.COORDINATOR
            });
          }
        });
        if (coData.length > 0) {
          await tx.taskParticipant.createMany({ data: coData, skipDuplicates: true });
        }
      }

      // Update status to TODO if it was TEMPLATE
      if (currentTask && currentTask.status === 'TEMPLATE') {
        await tx.task.update({ where: { id }, data: { status: 'TODO' } });
      }

      return { success: true };
    });
  }
}
