import { Injectable, Logger, Inject } from '@nestjs/common';
import { TaskRole } from '../../../src/generated/prisma/client'
import { PrismaService } from '../../database/prisma.service';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { TaskWorkflowService } from '../task-workflow/task-workflow.service';
import { TaskNotificationService } from '../task-workflow/task-notification.service';


@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TaskSharedService,
    private readonly wf: TaskWorkflowService,
    private readonly notif: TaskNotificationService,
    @Inject('REPORT_SERVICE_RMQ') private readonly reportClient: ClientProxy,
  ) { }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Include chuẩn khi load task từ DB */
  private readonly taskInclude = {
    participants: {
      include: {
        employee: { select: { fullName: true, employeeCode: true, departmentId: true, jobTitleId: true } }
      }
    },
    plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } },
    kpiSettings: true,
  } as const;

  /** Load task hoặc throw */
  private async findTaskOrFail(id: number) {
    const t = await this.prisma.task.findUnique({ where: { id }, include: this.taskInclude });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại');
    return t;
  }

  /** Enrich + format response */
  private async toResponse(raw: any, context?: any): Promise<any> {
    const [enriched] = await this.shared.enrichTasks([raw]);
    if (context) {
      enriched.allowedActions = await this.shared.computeAllowedActions(enriched, context);
    }
    return this.shared.toTaskResponse(enriched);
  }

  // ─── KPI helpers (dùng nội bộ khi tạo task) ──────────────────────────────

  private async resolveKpiSettings(data: any, planId: any): Promise<any> {
    let { baseScore, weight, scoringMethod = 'MANUAL', bonusPerDay, penaltyPerDay } = data;
    let autoKpiCriteriaId = data.kpiCriteriaId ? parseInt(data.kpiCriteriaId, 10) : null;

    if (!autoKpiCriteriaId) {
      const keyword = planId ? 'định mức' : 'đột xuất';
      const crit = await this.prisma.kpiCriteria.findFirst({ where: { name: { contains: keyword } } });
      if (crit) autoKpiCriteriaId = crit.id;
    }

    if (autoKpiCriteriaId) {
      const s = await this.prisma.kpiCriteriaSetting.findUnique({ where: { criteriaId: autoKpiCriteriaId } });
      if (s) {
        baseScore ??= s.baseScore ?? 100;
        weight ??= s.weight ?? 1.0;
        if (!data.scoringMethod) scoringMethod = s.scoringMethod ?? 'MANUAL';
        bonusPerDay ??= s.bonusPerDay ?? 0;
        penaltyPerDay ??= s.penaltyPerDay ?? 0;
      }
    }

    return { baseScore, weight, scoringMethod, bonusPerDay, penaltyPerDay, autoKpiCriteriaId };
  }

  private async checkCrossDomain(assigneeCode: string, domainId?: any): Promise<boolean> {
    if (!domainId || assigneeCode === 'UNASSIGNED') return false;
    const emp = await this.prisma.employee.findUnique({ where: { employeeCode: assigneeCode }, select: { userId: true } });
    if (!emp?.userId) return false;
    try {
      const res: any = await firstValueFrom(this.shared.userService.GetSubordinates({ userId: emp.userId }));
      const allowed: number[] = res?.allowedDomainIds || res?.allowed_domain_ids || [];
      return !allowed.includes(parseInt(domainId, 10));
    } catch {
      return false;
    }
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  private async buildListTasksWhereClause(query: any) {
    const where: any = {};
    const conditions: any[] = [];

    if (query.id) where.id = parseInt(query.id, 10);
    if (query.status && query.status !== 'ALL') where.status = query.status;
    else if (!query.statsFilter) where.isCompleted = false;

    if (query.role && query.currentEmployeeCode) {
      conditions.push({ participants: { some: { employeeCode: query.currentEmployeeCode, participantRole: query.role } } });
    }

    if (query.assigneeCode === 'UNASSIGNED') {
      conditions.push({
        OR: [
          { participants: { none: { participantRole: TaskRole.ASSIGNEE } } },
          { participants: { some: { employeeCode: 'UNASSIGNED', participantRole: TaskRole.ASSIGNEE } } },
        ]
      });
    }

    if (query.assigneeCode && query.assigneeCode !== 'UNASSIGNED') {
      conditions.push({ participants: { some: { employeeCode: query.assigneeCode, participantRole: query.isSupervisor ? TaskRole.APPROVER : TaskRole.ASSIGNEE } } });
    }

    if (query.assignerCode) {
      conditions.push({ participants: { some: { employeeCode: query.assignerCode, participantRole: TaskRole.OWNER } } });
    }

    const scopeWhere = await this.shared.buildScopingWhereClause(query);
    if (scopeWhere) conditions.push(scopeWhere);
    if (conditions.length > 0) where.AND = conditions;

    if (query.search) where.title = { contains: query.search };
    if (query.priority && query.priority !== 'ALL') where.priority = query.priority;
    if (query.planId) { where.planId = parseInt(query.planId, 10); delete where.isCompleted; delete where.status; }

    // statsFilter date ranges
    if (query.statsFilter) {
      const now = new Date(); now.setHours(0, 0, 0, 0);
      switch (query.statsFilter) {
        case 'doneInTime':
        case 'doneOverdue':
          where.isCompleted = true;
          break;
        case 'overdue':
          where.isCompleted = false;
          where.dueDate = { lt: now };
          break;
        case 'warning': {
          const t3 = new Date(now); t3.setDate(now.getDate() + 3);
          where.isCompleted = false;
          where.dueDate = { gte: now, lte: t3 };
          break;
        }
        case 'inTime': {
          const t3 = new Date(now); t3.setDate(now.getDate() + 3);
          where.isCompleted = false;
          where.dueDate = { gt: t3 };
          where.OR = [{ dueDate: { gt: t3 } }, { dueDate: null }];
          break;
        }
      }
    }
    return where;
  }

  private async applyPostDbFiltersAndPaginate(where: any, query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const isJsFilter = query.statsFilter === 'doneInTime' || query.statsFilter === 'doneOverdue';

    let skip: number | undefined;
    let take: number | undefined;
    let totalCount = 0;
    let limitNum = limit;

    if (!isJsFilter) {
      totalCount = await this.prisma.task.count({ where });
      limitNum = limit > 0 ? limit : (totalCount > 0 ? totalCount : 20);
      skip = limit > 0 ? (page - 1) * limitNum : undefined;
      take = limit > 0 ? limitNum : undefined;
    } else {
      const operator = query.statsFilter === 'doneOverdue' ? '>' : '<=';
      const lateIds = await this.prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM Task WHERE dueDate IS NOT NULL AND (completedAt > dueDate OR (completedAt IS NULL AND updatedAt > dueDate))`
      );
      const ids = lateIds.map(x => x.id);
      if (query.statsFilter === 'doneOverdue') {
        where.id = { ...where.id, in: ids };
      } else {
        where.id = { ...where.id, notIn: ids };
      }

      totalCount = await this.prisma.task.count({ where });
      limitNum = limit > 0 ? limit : (totalCount > 0 ? totalCount : 20);
      skip = limit > 0 ? (page - 1) * limitNum : undefined;
      take = limit > 0 ? limitNum : undefined;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true } }, _count: { select: { descendants: true } }, kpiSettings: true }
    });

    const paginatedMeta = {
      total: totalCount,
      page,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum)
    };

    return { tasks, paginatedMeta };
  }

  private buildTaskTree(mappedTasks: any[]) {
    const taskMap = new Map(mappedTasks.map(t => [t.id, t]));
    const roots: any[] = [];
    taskMap.forEach(t => {
      if (t.parentId && taskMap.has(t.parentId)) taskMap.get(t.parentId).children.push(t);
      else roots.push(t);
    });
    return roots;
  }

  async listTasks(query: any) {
    await this.shared.populateQueryHierarchy(query);
    const where = await this.buildListTasksWhereClause(query);
    const { tasks, paginatedMeta } = await this.applyPostDbFiltersAndPaginate(where, query);

    const enriched = await this.shared.enrichTasks(tasks);
    const batchActions = await this.shared.computeAllowedActionsBatch(enriched, query);
    const mapped = enriched.map((t: any) => ({
      ...this.shared.toTaskResponse(t),
      allowedActions: batchActions[t.id] || [],
      children: [],
    }));

    const roots = this.buildTaskTree(mapped);
    return { success: true, message: 'Lấy danh sách nhiệm vụ thành công', data: roots, meta: paginatedMeta };
  }

  async getTask(id: number, query: any) {
    await this.shared.populateQueryHierarchy(query);
    const t = await this.findTaskOrFail(id);
    const [enriched] = await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(enriched, query);
    if (!access.hasAccess) throw new RpcException('Bạn không có quyền xem nhiệm vụ này.');
    enriched.allowedActions = await this.shared.computeAllowedActions(enriched, query);
    return this.shared.toTaskResponse(enriched);
  }


  private buildStatsWhereClause(query: any) {
    const where: any = {};
    const conditions: any[] = [];

    switch (query.role) {
      case 'ASSIGNEE':
        if (query.assigneeCode) conditions.push({ participants: { some: { employeeCode: query.assigneeCode, participantRole: 'ASSIGNEE' } } });
        break;
      case 'OWNER':
        if (query.assignerCode) conditions.push({ participants: { some: { employeeCode: query.assignerCode, participantRole: 'OWNER' } } });
        break;
      case 'UNASSIGNED':
        conditions.push({
          OR: [
            { participants: { none: { participantRole: 'ASSIGNEE' } } },
            { participants: { some: { employeeCode: 'UNASSIGNED', participantRole: 'ASSIGNEE' } } },
          ]
        });
        break;
      default:
        if (query.assigneeCode === 'UNASSIGNED') {
          conditions.push({
            OR: [
              { participants: { none: { participantRole: 'ASSIGNEE' } } },
              { participants: { some: { employeeCode: 'UNASSIGNED', participantRole: 'ASSIGNEE' } } },
            ]
          });
        }
        break;
    }

    if (!query.role || query.role === 'ALL') {
      const perms = query.currentUserPermissions || [];
      const isAdmin = query.isAdmin || perms.includes('TASK:MANAGE');
      if (!isAdmin && query.currentEmployeeCode) {
        const scopingConditions: any[] = [
          { participants: { some: { employeeCode: query.currentEmployeeCode } } },
          { creatorEmployeeCode: query.currentEmployeeCode },
        ];
        if ((query.isLeader || perms.includes('TASK.ASSIGN')) && query.currentUserDept && query.isSupervisor) {
          scopingConditions.push({ plan: { departmentId: query.currentUserDept } });
          scopingConditions.push({ monitoredUnitId: query.currentUserDept });
        }
        conditions.push({ OR: scopingConditions });
      }
    }

    if (conditions.length > 0) where.AND = conditions;
    return where;
  }

  private calculateTaskStatistics(allTasks: any[]) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const nowTime = now.getTime();
    let overdue = 0, warning = 0, inTime = 0, doneInTime = 0, doneOverdue = 0;

    allTasks.forEach((t: any) => {
      const dueTime = t.dueDate ? new Date(t.dueDate).setHours(0, 0, 0, 0) : null;
      const isDone = t.isCompleted === true;

      if (isDone) {
        const completedTime = t.completedAt ? new Date(t.completedAt).setHours(0, 0, 0, 0) : (t.updatedAt ? new Date(t.updatedAt).setHours(0, 0, 0, 0) : nowTime);
        if (dueTime && completedTime > dueTime) { doneOverdue++; } else { doneInTime++; }
        return;
      }

      if (!dueTime) {
        inTime++;
        return;
      }

      const diff = Math.round((dueTime - nowTime) / 86_400_000);
      if (diff < 0) { overdue++; return; }
      if (diff <= 3) { warning++; return; }
      inTime++;
    });

    return { overdue, warning, inTime, doneInTime, doneOverdue };
  }

  async getTaskStats(query: any) {
    const where = this.buildStatsWhereClause(query);
    const allTasks = await this.prisma.task.findMany({
      where,
      select: {
        status: true, isCompleted: true, progress: true, dueDate: true, completedAt: true, updatedAt: true,
        participants: { where: { participantRole: { in: ['ASSIGNEE', 'OWNER'] } }, select: { employeeCode: true, participantRole: true } }
      },
    });

    const stats = this.calculateTaskStatistics(allTasks);
    return { success: true, message: 'Lấy thống kê nhiệm vụ thành công', data: stats };
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  private async validateTaskAssignee(assigneeCode: string) {
    if (assigneeCode !== 'UNASSIGNED') {
      const emp = await this.prisma.employee.findUnique({ where: { employeeCode: assigneeCode } });
      if (!emp) throw new RpcException('Người được giao không tồn tại trong hệ thống.');
    }
  }

  private async executeCreateTaskTransaction(data: any, kpi: any, isCrossDomain: boolean, planId: number | null, parentId: number | null, creatorCode: string) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          parentId,
          title: data.title || data.taskName || 'Nhiệm vụ không tên',
          description: data.description,
          status: data.status || (data.assigneeCode && data.assigneeCode !== 'UNASSIGNED' ? 'PENDING_ACCEPTANCE' : 'TODO'),
          priority: data.priority || 'MEDIUM',
          startDate: data.startDate ? new Date(data.startDate) : null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          creatorEmployeeCode: creatorCode,
          planId,
          domainId: data.domainId ? parseInt(data.domainId, 10) : null,
          monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : null,
          metadata: {
            taskType: data.metadata?.taskType || 'ONE_TIME',
            ...(data.metadata?.recurrence && { recurrence: data.metadata.recurrence })
          },
          kpiSettings: {
            create: {
              baseScore: kpi.baseScore,
              weight: kpi.weight,
              scoringMethod: kpi.scoringMethod,
              bonusPerDay: kpi.bonusPerDay,
              penaltyPerDay: kpi.penaltyPerDay,
              kpiCriteriaId: kpi.autoKpiCriteriaId,
              isCrossDomain,
              crossDomainMultiplier: isCrossDomain ? 1.5 : 1.0,
            },
          },
        },
      });

      const participantsData = this.shared.buildParticipantsData(task.id, data);
      if (participantsData.length > 0) {
        await tx.taskParticipant.createMany({ data: participantsData, skipDuplicates: true });
      }

      await tx.taskClosure.create({ data: { ancestorId: task.id, descendantId: task.id, depth: 0 } });
      if (parentId) {
        const ancestors = await tx.taskClosure.findMany({ where: { descendantId: parentId } });
        if (ancestors.length > 0) {
          await tx.taskClosure.createMany({ data: ancestors.map(a => ({ ancestorId: a.ancestorId, descendantId: task.id, depth: a.depth + 1 })) });
        }
      }

      await tx.taskHistory.create({
        data: {
          taskId: task.id,
          action: 'Khởi tạo công việc',
          actorCode: creatorCode,
          newValue: { title: task.title, assigneeCode: data.assigneeCode || 'UNASSIGNED' }
        }
      });

      return task;
    });
  }

  private async createTaskConversation(taskId: number, title: string, participants: string[]) {
    try {
      const uniqueParticipants = [...new Set(participants.filter(Boolean))];
      if (this.shared.chatService) {
        const conversationRes = await firstValueFrom<any>(
          this.shared.chatService.CreateConversation({
            type: 'TASK',
            title: `Task: ${title}`,
            participantIds: uniqueParticipants
          })
        );
        if (conversationRes && conversationRes.id) {
          await this.prisma.task.update({ where: { id: taskId }, data: { conversationId: conversationRes.id } });
          return conversationRes.id;
        }
      }
    } catch (e) {
      this.logger.error('Failed to create chat conversation for task ' + taskId, e);
    }
    return null;
  }

  private async handlePostCreateWorkflow(newTask: any, data: any, planId: number | null, parentId: number | null, creatorCode: string) {
    const assigneeCode = data.assigneeCode || 'UNASSIGNED';
    const workflowCode = await this.wf.resolveWorkflowCode(data, planId, parentId);
    const wfInit = workflowCode
      ? await this.wf.initWorkflow(newTask.id, workflowCode, { initiatorId: data.currentUserId?.toString() || creatorCode, assigneeCode, assignerCode: creatorCode })
      : null;

    if (wfInit) {
      const nodeData = await this.wf.getCurrentNodeData(wfInit.workflowId, wfInit.currentNodeId);
      const existingMetadata = newTask.metadata ? (typeof newTask.metadata === 'string' ? JSON.parse(newTask.metadata) : newTask.metadata) : {};
      const metadata = { ...existingMetadata, workflowId: wfInit.workflowId, workflowCode: wfInit.workflowCode, currentNodeId: wfInit.currentNodeId, ...(wfInit.workflowInstId && { workflowInstId: wfInit.workflowInstId }) };

      const updateData: any = { metadata };
      if (nodeData?.targetStatus) {
        updateData.status = nodeData.targetStatus;
      }

      await this.prisma.task.update({ where: { id: newTask.id }, data: updateData });
      await this.wf.seedStepsFromNode(newTask.id, nodeData);

      const notifCfg = this.wf.resolveNotificationConfig(nodeData);
      const createdTask = await this.toResponse(newTask, { currentEmployeeCode: creatorCode, currentUserPermissions: data.currentUserPermissions || [] });
      await this.notif.notifyNewTask(createdTask, { assigneeCode: data.assigneeCode, coassigneeCodes: data.coassigneeCodes, monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : undefined }, notifCfg);
      return createdTask;
    }

    const createdTask = await this.toResponse(newTask, { currentEmployeeCode: creatorCode, currentUserPermissions: data.currentUserPermissions || [] });
    await this.notif.notifyNewTask(createdTask, { assigneeCode: data.assigneeCode, coassigneeCodes: data.coassigneeCodes, monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : undefined }, { sendNotify: true, nodeLabel: 'Giao việc' });
    return createdTask;
  }

  async createTask(data: any) {
    let planId = data.planId || null;
    let parentId = data.parentId ? parseInt(data.parentId, 10) : null;

    if (parentId) {
      const parent = await this.prisma.task.findUnique({ where: { id: parentId }, select: { planId: true } });
      planId = parent?.planId || null;
    }

    const assigneeCode = data.assigneeCode || 'UNASSIGNED';
    const creatorCode = data.currentEmployeeCode || 'SYSTEM';

    await this.validateTaskAssignee(assigneeCode);

    const kpi = await this.resolveKpiSettings(data, planId);
    const isCrossDomain = await this.checkCrossDomain(assigneeCode, data.domainId);

    const newTask = await this.executeCreateTaskTransaction(data, kpi, isCrossDomain, planId, parentId, creatorCode);

    newTask.conversationId = await this.createTaskConversation(
      newTask.id,
      newTask.title,
      [creatorCode, assigneeCode, ...(data.coassigneeCodes || [])]
    );

    return this.handlePostCreateWorkflow(newTask, data, planId, parentId, creatorCode);
  }

  private async validateWorkflowTransition(enriched: any, action: string, context: any, actorCode?: string) {
    const hasChildren = (await this.prisma.taskClosure.count({ where: { ancestorId: enriched.id, depth: 1 } })) > 0;
    const access = await this.shared.checkTaskAccess(enriched, context);

    const transition = await this.wf.validateAndTransition(enriched, action, {
      actorCode: actorCode || context?.currentEmployeeCode,
      permissions: context?.currentUserPermissions || [],
      hasChildren,
      access,
    });

    if (!transition.allowed) {
      throw new RpcException(`Workflow không cho phép hành động ${action}${transition.reason ? ` (${transition.reason})` : ''}.`);
    }

    return transition;
  }

  private async recordTaskStatusHistory(id: number, rawTask: any, updateData: any, transition: any, action: string, actorCode?: string, rejectReason?: string) {
    const isReject = rejectReason && (updateData.status === 'RETURNED' || transition.nextNodeData?.sideEffects?.includes('RETURN_TASK') || updateData.status === 'REJECTED');
    if (isReject) {
      await this.prisma.taskHistory.create({ data: { taskId: id, action: 'Từ chối việc', actorCode, newValue: { reason: rejectReason } } });
    }

    const isStartProgress = !isReject && updateData.status === 'IN_PROGRESS' && action === 'IN_PROGRESS';
    if (isStartProgress) {
      await this.prisma.taskHistory.create({ data: { taskId: id, action: 'Nhận việc', actorCode } });
    }

    const isStatusChange = !isReject && !isStartProgress && rawTask.status !== updateData.status;
    if (isStatusChange) {
      await this.prisma.taskHistory.create({ data: { taskId: id, action: 'Chuyển trạng thái', actorCode, newValue: { status: updateData.status } } });
    }
  }

  private async handleStatusSideEffects(id: number, rawTask: any, resultTask: any, enriched: any, updateData: any, transition: any, context: any, actorCode?: string) {
    if (updateData.isCompleted) {
      this.reportClient.emit('task.completed', {
        taskId: resultTask.id,
        title: resultTask.title,
        completedAt: resultTask.completedAt,
        progress: resultTask.progress,
        assigneeId: resultTask.assigneeId
      });
    }

    if (updateData.isCompleted && context?.evidence && this.shared.chatService && rawTask.conversationId) {
      firstValueFrom(this.shared.chatService.SendMessage({
        conversationId: rawTask.conversationId,
        content: context.evidence,
        senderId: actorCode || context?.currentEmployeeCode || 'SYSTEM',
      })).catch(() => { });
    }

    if (transition.nextNodeData?.autoProgress !== undefined) {
      await this.updateTaskProgress(id, transition.nextNodeData.autoProgress, actorCode);
    }

    if (transition.nextNodeData?.autoProgress === undefined && updateData.isCompleted) {
      await this.updateTaskProgress(id, 100, actorCode);
    }

    if (transition.nextNodeId) {
      await this.wf.seedStepsFromNode(id, transition.nextNodeData);
    }

    await this.notif.notifyTransition(enriched, transition.nextNodeData, actorCode || context?.currentEmployeeCode);
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any, actionName?: string) {
    if (context) await this.shared.populateQueryHierarchy(context);

    const rawTask = await this.findTaskOrFail(id);
    if (rawTask.status === 'COMPLETED') {
      throw new RpcException('Nhiệm vụ này đã hoàn thành, không thể thay đổi.');
    }
    const [enriched] = await this.shared.enrichTasks([rawTask]);

    const action = actionName || status;
    const actor = actorCode || context?.currentEmployeeCode;
    const transition = await this.validateWorkflowTransition(enriched, action, context, actor);

    await this.notif.notifyApprovalRequired(enriched, transition.nextNodeData, actor);

    const updateData: any = { status: transition.targetStatus || status };
    if (transition.isCompleted !== undefined) {
      updateData.isCompleted = transition.isCompleted;
    }
    if (rejectReason !== undefined) updateData.rejectReason = rejectReason;
    if (updateData.isCompleted) updateData.completedAt = new Date();
    if (transition.nextNodeId) {
      updateData.metadata = { ...((rawTask.metadata as any) || {}), currentNodeId: transition.nextNodeId };
    }

    const resultTask = await this.prisma.task.update({ where: { id }, data: updateData });

    await this.recordTaskStatusHistory(id, rawTask, updateData, transition, action, actor, rejectReason);
    await this.handleStatusSideEffects(id, rawTask, resultTask, enriched, updateData, transition, context, actor);

    return this.toResponse(await this.findTaskOrFail(id), context);
  }

  private async executeAssignTaskTransaction(id: number, data: any, rawTask: any) {
    await this.prisma.$transaction(async (tx) => {
      const existingAssignee = rawTask.participants.find((p: any) => p.participantRole === 'ASSIGNEE');
      const existingOwner = rawTask.participants.find((p: any) => p.participantRole === 'OWNER');
      const existingCoordinators = rawTask.participants.filter((p: any) => p.participantRole === 'COORDINATOR');

      const participantsToCreate: any[] = [];
      const participantsToDelete: any[] = [];
      const participantsToUpdate: any[] = [];

      let resetTaskStatus = false;

      // 1. Assignee
      const newAssigneeCode = data.assigneeCode && data.assigneeCode !== 'UNASSIGNED' ? data.assigneeCode : null;
      if (newAssigneeCode) {
        if (!existingAssignee) {
          participantsToCreate.push({ taskId: id, employeeCode: newAssigneeCode, participantRole: 'ASSIGNEE', status: 'PENDING_ACCEPTANCE', contributionPercentage: data.assigneePercentage ?? 100 });
          resetTaskStatus = true;
        } else if (existingAssignee.employeeCode !== newAssigneeCode) {
          participantsToDelete.push(existingAssignee);
          participantsToCreate.push({ taskId: id, employeeCode: newAssigneeCode, participantRole: 'ASSIGNEE', status: 'PENDING_ACCEPTANCE', contributionPercentage: data.assigneePercentage ?? 100 });
          resetTaskStatus = true;
        } else if (existingAssignee.status === 'REJECTED') {
          participantsToUpdate.push({ where: { taskId_employeeCode_participantRole: { taskId: id, employeeCode: newAssigneeCode, participantRole: 'ASSIGNEE' } }, data: { status: 'PENDING_ACCEPTANCE', reason: null } });
          resetTaskStatus = true;
        }
      } else if (existingAssignee) {
        participantsToDelete.push(existingAssignee);
      }

      // 2. Owner
      const newAssignerCode = data.assignerCode && data.assignerCode !== 'UNASSIGNED' ? data.assignerCode : null;
      if (newAssignerCode) {
        if (!existingOwner) {
          participantsToCreate.push({ taskId: id, employeeCode: newAssignerCode, participantRole: 'OWNER', status: 'ACCEPTED' });
        } else if (existingOwner.employeeCode !== newAssignerCode) {
          participantsToDelete.push(existingOwner);
          participantsToCreate.push({ taskId: id, employeeCode: newAssignerCode, participantRole: 'OWNER', status: 'ACCEPTED' });
        }
      } else if (existingOwner) {
        participantsToDelete.push(existingOwner);
      }

      // 3. Coordinators
      const newCoordCodes = data.coAssigneeCodes || data.coassigneeCodes || [];
      const existingCoordMap = new Map<string, any>(existingCoordinators.map((c: any) => [c.employeeCode, c]));

      for (const code of newCoordCodes) {
        const existing = existingCoordMap.get(code);
        if (!existing) {
          participantsToCreate.push({ taskId: id, employeeCode: code, participantRole: 'COORDINATOR', status: 'PENDING_ACCEPTANCE' });
        } else {
          if (existing.status === 'REJECTED') {
            participantsToUpdate.push({ where: { taskId_employeeCode_participantRole: { taskId: id, employeeCode: code, participantRole: 'COORDINATOR' } }, data: { status: 'PENDING_ACCEPTANCE', reason: null } });
          }
          existingCoordMap.delete(code);
        }
      }

      for (const removed of existingCoordMap.values()) {
        participantsToDelete.push(removed);
      }

      // 4. Execute queries
      for (const p of participantsToDelete) {
        await tx.taskParticipant.delete({ where: { taskId_employeeCode_participantRole: { taskId: id, employeeCode: p.employeeCode, participantRole: p.participantRole } } });
      }
      if (participantsToCreate.length > 0) {
        await tx.taskParticipant.createMany({ data: participantsToCreate, skipDuplicates: true });
      }
      for (const u of participantsToUpdate) {
        await tx.taskParticipant.update({ where: u.where, data: u.data });
      }

      if (resetTaskStatus) {
        await tx.task.update({ where: { id }, data: { status: 'PENDING_ACCEPTANCE' } });
      }
    });
  }

  async assignTask(id: number, data: any) {
    if (data) await this.shared.populateQueryHierarchy(data);

    const rawTask = await this.prisma.task.findUnique({ where: { id }, include: { participants: true } });
    if (!rawTask) throw new RpcException('Nhiệm vụ không tồn tại');

    const [enriched] = await this.shared.enrichTasks([rawTask]);
    const access = await this.shared.checkTaskAccess(enriched, data);

    if (!access.isOwner && !access.isAdmin && !access.isDeptLeader) {
      const transition = await this.wf.validateAndTransition(enriched, 'ASSIGN', { actorCode: data?.currentEmployeeCode, permissions: data?.currentUserPermissions || [], access });
      if (!transition.allowed) throw new RpcException('Workflow không cho phép thực hiện phân công/giao việc.');
    }

    await this.executeAssignTaskTransaction(id, data, rawTask);

    await this.prisma.taskHistory.create({
      data: {
        taskId: id,
        action: 'Giao việc',
        actorCode: data?.currentEmployeeCode || null,
        newValue: { assigneeCode: data.assigneeCode, coassigneeCodes: data.coassigneeCodes, status: 'PENDING_ACCEPTANCE' }
      }
    });

    const result = await this.toResponse(await this.findTaskOrFail(id));

    if (data.assigneeCode) {
      this.shared.sendTaskNotification([data.assigneeCode], 'Có công việc mới được giao', `Bạn vừa được phân công nhiệm vụ: "${result.title}"`, result);
    }
    if (data.coassigneeCodes?.length) {
      this.shared.sendTaskNotification(data.coassigneeCodes, 'Có công việc phối hợp mới', `Bạn được phân công phối hợp nhiệm vụ: "${result.title}"`, result);
    }
    return result;
  }

  private async getParticipantOrThrow(taskId: number, actorCode: string | null) {
    if (!actorCode) throw new RpcException('Không xác định được người thao tác.');
    const participant = await this.prisma.taskParticipant.findFirst({
      where: { taskId, employeeCode: actorCode, participantRole: { in: ['ASSIGNEE', 'COORDINATOR'] } }
    });
    if (!participant) throw new RpcException('Bạn không phải là người xử lý hoặc người phối hợp của công việc này.');
    return participant;
  }

  private async handleAcceptTask(id: number, actorCode: string | null, participant: any) {
    await this.prisma.$transaction(async (tx) => {
      await tx.taskHistory.create({ data: { taskId: id, action: 'Tiếp nhận công việc', actorCode } });
      await tx.taskParticipant.update({
        where: { taskId_employeeCode_participantRole: { taskId: id, employeeCode: actorCode!, participantRole: participant.participantRole } },
        data: { status: 'ACCEPTED' }
      });
      if (participant.participantRole === 'ASSIGNEE') {
        await tx.task.update({ where: { id }, data: { status: 'IN_PROGRESS' } });
      }
    });
    return { success: true, message: 'Đã tiếp nhận công việc', data: await this.toResponse(await this.findTaskOrFail(id)) };
  }

  private async handleRejectTask(id: number, actorCode: string | null, participant: any, rejectReason?: string) {
    if (!rejectReason) throw new RpcException('Cần có lý do từ chối.');
    await this.prisma.$transaction(async (tx) => {
      await tx.taskHistory.create({ data: { taskId: id, action: 'Từ chối nhận việc', actorCode, newValue: { reason: rejectReason } } });
      await tx.taskParticipant.update({
        where: { taskId_employeeCode_participantRole: { taskId: id, employeeCode: actorCode!, participantRole: participant.participantRole } },
        data: { status: 'REJECTED', reason: rejectReason }
      });
      if (participant.participantRole === 'ASSIGNEE') {
        await tx.task.update({ where: { id }, data: { status: 'REJECTED', rejectReason } });
      }
    });
    return { success: true, message: 'Đã từ chối công việc', data: await this.toResponse(await this.findTaskOrFail(id)) };
  }

  private async handleRequestCoordinationTask(id: number, actorCode: string | null, participant: any, message?: string) {
    if (!message) throw new RpcException('Cần có lý do xin phối hợp.');
    await this.prisma.$transaction(async (tx) => {
      await tx.taskHistory.create({ data: { taskId: id, action: 'Xin phối hợp', actorCode, newValue: { message } } });
      await tx.taskParticipant.update({
        where: { taskId_employeeCode_participantRole: { taskId: id, employeeCode: actorCode!, participantRole: participant.participantRole } },
        data: { status: 'PENDING_COORDINATION', reason: message }
      });
      if (participant.participantRole === 'ASSIGNEE') {
        await tx.task.update({ where: { id }, data: { status: 'PENDING_COORDINATION' } });
      }
    });
    return { success: true, message: 'Đã gửi yêu cầu xin phối hợp', data: await this.toResponse(await this.findTaskOrFail(id)) };
  }

  async respondTask(id: number, data: { action: 'ACCEPT' | 'REJECT' | 'REQUEST_COORDINATION', rejectReason?: string, message?: string, currentEmployeeCode?: string }) {
    if (data) await this.shared.populateQueryHierarchy(data);
    const rawTask = await this.findTaskOrFail(id);

    const actorCode = data.currentEmployeeCode || null;
    const participant = await this.getParticipantOrThrow(id, actorCode);

    if (participant.status !== 'PENDING_ACCEPTANCE' && participant.status !== 'PENDING_COORDINATION') {
      throw new RpcException('Bạn đã phản hồi công việc này hoặc không ở trạng thái chờ phản hồi.');
    }

    if (data.action === 'ACCEPT') return this.handleAcceptTask(id, actorCode, participant);
    if (data.action === 'REJECT') return this.handleRejectTask(id, actorCode, participant, data.rejectReason);
    if (data.action === 'REQUEST_COORDINATION') return this.handleRequestCoordinationTask(id, actorCode, participant, data.message);

    throw new RpcException('Hành động không hợp lệ.');
  }

  private parseUpdateTaskData(data: any) {
    const { baseScore, weight, scoringMethod, bonusPerDay, penaltyPerDay, kpiCriteriaId, isCrossDomain, crossDomainMultiplier, id: _id, ...taskData } = data;

    if (taskData.startDate) taskData.startDate = new Date(taskData.startDate);
    if (taskData.dueDate) taskData.dueDate = new Date(taskData.dueDate);

    const kpiData: any = {};
    if (baseScore !== undefined) kpiData.baseScore = baseScore;
    if (weight !== undefined) kpiData.weight = weight;
    if (scoringMethod !== undefined) kpiData.scoringMethod = scoringMethod;
    if (bonusPerDay !== undefined) kpiData.bonusPerDay = bonusPerDay;
    if (penaltyPerDay !== undefined) kpiData.penaltyPerDay = penaltyPerDay;
    if (kpiCriteriaId !== undefined) kpiData.kpiCriteriaId = kpiCriteriaId;
    if (isCrossDomain !== undefined) kpiData.isCrossDomain = isCrossDomain;
    if (crossDomainMultiplier !== undefined) kpiData.crossDomainMultiplier = crossDomainMultiplier;

    return { taskData, kpiData };
  }

  private async executeUpdateTask(id: number, taskData: any, kpiData: any, actorCode: string | null) {
    const t = await this.prisma.task.update({
      where: { id },
      data: { ...taskData, ...(Object.keys(kpiData).length > 0 && { kpiSettings: { upsert: { create: kpiData, update: kpiData } } }) },
      include: this.taskInclude,
    });

    await this.prisma.taskHistory.create({
      data: {
        taskId: id,
        action: 'Cập nhật thông tin',
        actorCode,
        newValue: taskData
      }
    });

    return t;
  }

  async updateTask(id: number, data: any) {
    const rawTask = await this.findTaskOrFail(id);
    if (rawTask.status === 'COMPLETED') {
      throw new RpcException('Nhiệm vụ này đã hoàn thành, không thể thay đổi.');
    }

    const { taskData, kpiData } = this.parseUpdateTaskData(data);
    const actorCode = data?.currentEmployeeCode || null;
    
    const t = await this.executeUpdateTask(id, taskData, kpiData, actorCode);
    return this.toResponse(t);
  }

  async extendTask(id: number, dueDate: string, reason: string, actorCode: string) {
    const rawTask = await this.findTaskOrFail(id);
    if (rawTask.status === 'COMPLETED') {
      throw new RpcException('Nhiệm vụ này đã hoàn thành, không thể gia hạn.');
    }
    const newDueDate = new Date(dueDate);
    const t = await this.prisma.task.update({
      where: { id },
      data: { dueDate: newDueDate },
      include: this.taskInclude,
    });
    
    await this.prisma.taskHistory.create({
      data: {
        taskId: id,
        action: 'Gia hạn công việc',
        actorCode: actorCode || null,
        newValue: { dueDate: newDueDate.toISOString(), reason } as any
      }
    });

    return this.toResponse(t);
  }

  async updateTaskProgress(id: number, progress: number, actorCode?: string) {
    const p = Math.max(0, Math.min(100, Math.round(progress)));
    await this.prisma.task.update({ where: { id }, data: { progress: p } });

    await this.prisma.taskHistory.create({
      data: {
        taskId: id,
        action: 'Cập nhật tiến độ',
        actorCode: actorCode || null,
        newValue: { progress: p }
      }
    });

    const closure = await this.prisma.taskClosure.findFirst({ where: { descendantId: id, depth: 1 } });
    if (closure) {
      await this.autoComputeTaskProgress(closure.ancestorId, actorCode);
    }

    return this.toResponse(await this.findTaskOrFail(id));
  }

  private calculateStepsProgress(steps: any[]) {
    return steps.filter(s => s.status === 'COMPLETED').length;
  }

  private calculateSubtasksProgress(subtasks: any[]) {
    return subtasks.reduce((sum, st) => sum + (st.status === 'COMPLETED' || st.isCompleted ? 100 : (st.progress ?? 0)), 0);
  }

  async autoComputeTaskProgress(taskId: number, actorCode?: string) {
    const steps = await this.prisma.taskStep.findMany({ where: { taskId } });
    const children = await this.prisma.taskClosure.findMany({ where: { ancestorId: taskId, depth: 1 }, select: { descendantId: true } });
    const subtasks = await this.prisma.task.findMany({ where: { id: { in: children.map(c => c.descendantId) } }, select: { progress: true, status: true, isCompleted: true } });

    const totalSteps = steps.length;
    const totalSubtasks = subtasks.length;

    if (totalSteps === 0 && totalSubtasks === 0) return;

    const completedSteps = this.calculateStepsProgress(steps);
    const subtaskProgressSum = this.calculateSubtasksProgress(subtasks);

    const computedProgress = Math.round(((completedSteps * 100) + subtaskProgressSum) / (totalSteps + totalSubtasks));

    const currentTask = await this.prisma.task.findUnique({ where: { id: taskId }, select: { progress: true } });
    if (currentTask && currentTask.progress !== computedProgress) {
      await this.updateTaskProgress(taskId, computedProgress, actorCode);
    }
  }

  async deleteTask(id: number) {
    const t = await this.prisma.task.findUnique({ where: { id }, include: { participants: true } });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại');

    const assigneeP = t.participants.find(p => p.participantRole === TaskRole.ASSIGNEE);
    if (assigneeP && assigneeP.employeeCode !== 'UNASSIGNED') {
      throw new RpcException('Không thể xóa công việc đã được giao.');
    }

    const descendants = await this.prisma.taskClosure.findMany({ where: { ancestorId: id }, select: { descendantId: true, depth: true } });
    if (descendants.some(d => d.depth > 0)) throw new RpcException('Không thể xóa công việc đã có công việc con.');

    const ids = descendants.map(d => d.descendantId);
    if (ids.length > 0) await this.prisma.task.updateMany({ where: { id: { in: ids } }, data: { isDeleted: true } });

    return { success: true };
  }

  // ─── Hierarchy ────────────────────────────────────────────────────────────

  async createSubTask(id: number, data: any) {
    data.parentId = id;
    return this.createTask(data);
  }

  async breakdownTask(id: number, data: any) {
    await this.shared.populateQueryHierarchy(data);
    const t = await this.findTaskOrFail(id);
    const [enriched] = await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(enriched, data);
    if (!access.hasAccess) throw new RpcException('Bạn không có quyền xem nhiệm vụ này.');
    const actions = await this.shared.computeAllowedActions(enriched, data);
    if (!actions.includes('ADD_SUBTASK')) throw new RpcException('Bạn không có quyền phân rã nhiệm vụ này.');
    return this.createSubTask(id, data);
  }

  async getSubTasks(id: number, query: any) {
    await this.shared.populateQueryHierarchy(query);
    const parent = await this.findTaskOrFail(id);
    const [enrichedParent] = await this.shared.enrichTasks([parent]);
    const access = await this.shared.checkTaskAccess(enrichedParent, query);
    if (!access.hasAccess) throw new RpcException('Bạn không có quyền xem nhiệm vụ con này.');

    const childIds = (await this.prisma.taskClosure.findMany({ where: { ancestorId: id, depth: 1 }, select: { descendantId: true } })).map(c => c.descendantId);
    const where: any = { id: { in: childIds }, status: { not: 'TEMPLATE' } };
    const scope = await this.shared.buildScopingWhereClause(query);
    if (scope) where.AND = [scope];

    const tasks = await this.prisma.task.findMany({ where, include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } } });
    const enriched = await this.shared.enrichTasks(tasks);
    const batchActions = await this.shared.computeAllowedActionsBatch(enriched, query);
    const data2 = enriched.map((t: any) => {
      t.allowedActions = batchActions[t.id] || [];
      return this.shared.toDelegationNode(t);
    });
    return { success: true, data: data2 };
  }

  async getTaskTree(id: number, query: any) {
    const closureData = await this.prisma.taskClosure.findMany({ where: { ancestorId: id }, include: { descendant: { include: { participants: true } } }, orderBy: { depth: 'asc' } });
    const scope = await this.shared.buildScopingWhereClause(query);
    let validIds: Set<number> | null = null;
    if (scope) {
      const valid = await this.prisma.task.findMany({ where: scope, select: { id: true } });
      validIds = new Set(valid.map(t => t.id));
    }

    const descendants = closureData.filter(c => !validIds || validIds.has(c.descendantId)).map(c => ({ ...(c.descendant as any), depth: c.depth }));
    const enriched = await this.shared.enrichTasks(descendants);

    const map = new Map<number, any>();
    enriched.forEach(n => { n.children = []; map.set(n.id, n); });
    const roots: any[] = [];
    enriched.forEach(n => {
      if (n.parentId && map.has(n.parentId) && n.id !== id) map.get(n.parentId).children.push(n);
      else if (n.id === id) roots.push(n);
    });

    return { success: true, data: roots[0] };
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async addComment(id: number, data: any) {
    throw new Error('Chat functionality has been moved to Chat Service. Please use the task.conversationId.');
  }

  async getComments(id: number, query: any) {
    throw new Error('Chat functionality has been moved to Chat Service. Please use the task.conversationId.');
  }

  // ─── Steps (Checklist) ────────────────────────────────────────────────────

  async createStep(taskId: number, data: any) {
    const step = await this.prisma.taskStep.create({
      data: {
        taskId,
        title: data.title,
        order: data.order || 0,
        assigneeCode: data.assigneeCode,
        baseScore: data.baseScore !== undefined ? parseFloat(data.baseScore) : 0
      }
    });
    await this.autoComputeTaskProgress(taskId);
    return { success: true, message: 'Tạo bước thành công', data: step };
  }

  async updateStep(taskId: number, stepId: number, data: any) {
    const currentStep = await this.prisma.taskStep.findUnique({ where: { id: stepId, taskId } });
    if (!currentStep) throw new RpcException('Không tìm thấy bước này');
    if (currentStep.status === 'COMPLETED') {
      throw new RpcException('Bước này đã hoàn thành, không thể thay đổi.');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.assigneeCode !== undefined) updateData.assigneeCode = data.assigneeCode;
    if (data.baseScore !== undefined) updateData.baseScore = parseFloat(data.baseScore);

    if (data.status !== undefined) {
      if (data.status === 'COMPLETED' && currentStep.assigneeCode && currentStep.assigneeCode !== data.actorCode) {
        throw new RpcException('Chỉ người được giao phụ trách bước này mới có quyền nhấn hoàn thành.');
      }
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (data.status === 'TODO') {
        updateData.completedAt = null;
      }
    }

    const step = await this.prisma.taskStep.update({ where: { id: stepId, taskId }, data: updateData });
    await this.autoComputeTaskProgress(taskId);

    if (data.status === 'COMPLETED' && data.evidence && this.shared.chatService) {
      const task = await this.prisma.task.findUnique({ where: { id: taskId }, select: { conversationId: true } });
      if (task?.conversationId) {
        firstValueFrom(this.shared.chatService.SendMessage({
          conversationId: task.conversationId,
          content: data.evidence,
          senderId: data.actorCode || 'SYSTEM',
        })).catch(() => { });
      }
    }

    return { success: true, message: 'Cập nhật bước thành công', data: step };
  }

  async listSteps(taskId: number) {
    const steps = await this.prisma.taskStep.findMany({ where: { taskId }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
    return { success: true, data: steps };
  }

  async deleteStep(taskId: number, stepId: number) {
    await this.prisma.taskStep.updateMany({ where: { id: stepId, taskId }, data: { isDeleted: true } });
    await this.autoComputeTaskProgress(taskId);
    return { success: true, message: 'Xóa bước thành công' };
  }

  // ─── Misc ─────────────────────────────────────────────────────────────────

  private async getAssigneeScopeWhere(query: any, isAdmin: boolean) {
    const where: any = { employmentStatus: 'active' };
    if (query.excludeEmployeeCode) where.employeeCode = { not: query.excludeEmployeeCode };

    if (!isAdmin && query.currentUserId) {
      try {
        const res: any = await firstValueFrom(this.shared.userService.GetSubordinates({ userId: query.currentUserId }));
        query.allowedEmployeeCodes = res?.allowedEmployeeCodes || res?.allowed_employee_codes || [];
      } catch { /* ignore */ }
    }

    if (!isAdmin) {
      const allowed = query.allowedEmployeeCodes || [];
      if (allowed.length > 0) {
        where.employeeCode = { in: allowed };
      }

      if (allowed.length === 0 && query.currentEmployeeCode) {
        where.employeeCode = query.currentEmployeeCode;
      }
    }
    return where;
  }

  private async fetchEmployeeMetrics(where: any) {
    const [employees, loadCounts, evaluations] = await Promise.all([
      this.prisma.employee.findMany({ where }),
      this.prisma.taskParticipant.groupBy({ by: ['employeeCode'], where: { participantRole: 'ASSIGNEE', task: { isCompleted: false } }, _count: { taskId: true } }),
      this.prisma.kpiEvaluation.findMany({ orderBy: { createdAt: 'desc' }, select: { employeeCode: true, totalScore: true } }),
    ]);

    const loadMap = new Map(loadCounts.map((i: any) => [i.employeeCode, i._count.taskId]));
    const kpiMap = new Map(evaluations.map((i: any) => [i.employeeCode, i.totalScore || 75]));
    return { employees, loadMap, kpiMap };
  }

  private async scoreAndSortEmployees(employees: any[], loadMap: Map<string, number>, kpiMap: Map<string, number>, query: any) {
    const targetDomainId = query.domainId ? parseInt(query.domainId, 10) : null;
    const targetJobTitleId = query.jobTitleId ? parseInt(query.jobTitleId, 10) : null;
    let scopeCodes: string[] = [];

    if (targetDomainId || query.monitoredUnitId) {
      try {
        const res: any = await firstValueFrom(this.shared.userService.GetEmployeesByScope({ domainId: targetDomainId || 0, monitoredUnitId: query.monitoredUnitId ? parseInt(query.monitoredUnitId, 10) : 0 }));
        scopeCodes = res?.employeeCodes || res?.employee_codes || [];
      } catch { /* ignore */ }
    }

    const strategy = query.strategy || 'LOW_PERFORMANCE';
    return employees.map((emp: any) => ({
      id: emp.id, employeeCode: emp.employeeCode, fullName: emp.fullName, departmentId: emp.departmentId, jobTitleId: emp.jobTitleId,
      currentLoad: loadMap.get(emp.employeeCode) || 0,
      performanceScore: kpiMap.get(emp.employeeCode) || 75,
      matchScore: (targetJobTitleId && emp.jobTitleId === targetJobTitleId ? 50 : 0) + (scopeCodes.includes(emp.employeeCode) ? 30 : 0),
    })).sort((a: any, b: any) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (strategy === 'HIGH_PERFORMANCE') return b.performanceScore - a.performanceScore || a.currentLoad - b.currentLoad;
      if (strategy === 'UNDER_QUOTA') return a.currentLoad - b.currentLoad || b.performanceScore - a.performanceScore;
      return a.performanceScore - b.performanceScore || a.currentLoad - b.currentLoad;
    });
  }

  async recommendAssignees(query: any) {
    const perms = query.currentUserPermissions || [];
    const isAdmin = perms.includes('TASK:MANAGE');

    const where = await this.getAssigneeScopeWhere(query, isAdmin);
    const { employees, loadMap, kpiMap } = await this.fetchEmployeeMetrics(where);
    const scored = await this.scoreAndSortEmployees(employees, loadMap, kpiMap, query);

    return { success: true, data: { topEmployees: scored } };
  }

  private async validateCoordinationAccess(id: number, data: any) {
    const t = await this.findTaskOrFail(id);
    const [enriched] = await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(enriched, data);
    if (!access.hasAccess) throw new RpcException('Bạn không có quyền xem nhiệm vụ này.');
    const actions = await this.shared.computeAllowedActions(enriched, data);
    if (!actions.includes('COORDINATE')) throw new RpcException('Bạn không có quyền yêu cầu phối hợp.');
  }

  private async executeClearCoordination(id: number, requesterCode: string | null, message?: string) {
    if (message) {
      await this.prisma.taskHistory.create({ data: { taskId: id, action: 'Xin phối hợp', actorCode: requesterCode, newValue: { message } } });
    }
    await this.prisma.taskParticipant.deleteMany({
      where: { taskId: id, participantRole: { in: [TaskRole.ASSIGNEE, TaskRole.COORDINATOR] } }
    });
    await this.prisma.task.update({ where: { id }, data: { status: 'PENDING_ACCEPTANCE' } });
  }

  private async executeUpdateCoordination(id: number, leadCode: string | undefined, coordinatorCodes: string[], requesterCode: string | null, message?: string) {
    await this.prisma.taskHistory.create({
      data: {
        taskId: id,
        action: 'Xin phối hợp',
        actorCode: requesterCode,
        newValue: { message, leadCode, coordinatorCodes }
      }
    });

    await this.prisma.$transaction(async (tx) => {
      if (leadCode) {
        await tx.taskParticipant.deleteMany({ where: { taskId: id, participantRole: TaskRole.ASSIGNEE } });
        await tx.taskParticipant.create({ data: { taskId: id, employeeCode: leadCode, participantRole: TaskRole.ASSIGNEE } });
      }
      await tx.taskParticipant.deleteMany({ where: { taskId: id, participantRole: TaskRole.COORDINATOR } });
      if (coordinatorCodes.length > 0) {
        await tx.taskParticipant.createMany({ data: coordinatorCodes.map((code: string) => ({ taskId: id, employeeCode: code, participantRole: TaskRole.COORDINATOR })), skipDuplicates: true });
      }
      const st = await tx.task.findUnique({ where: { id }, select: { status: true } });
      if (st?.status === 'TEMPLATE' || st?.status === 'PENDING_COORDINATION') {
        await tx.task.update({ where: { id }, data: { status: 'PENDING_ACCEPTANCE' } });
      }
    });
  }

  async requestCoordination(id: number, data: any) {
    await this.shared.populateQueryHierarchy(data);
    await this.validateCoordinationAccess(id, data);

    const { leadCode, coordinatorCodes = [], message, requesterCode } = { leadCode: data.leadCode || data.leadId, coordinatorCodes: data.coordinatorCodes || data.coordinatorIds || [], message: data.message, requesterCode: data.requesterCode || null };

    if (!leadCode && coordinatorCodes.length === 0) {
      await this.executeClearCoordination(id, requesterCode, message);
      return { success: true, data: await this.toResponse(await this.findTaskOrFail(id), data) };
    }

    await this.executeUpdateCoordination(id, leadCode, coordinatorCodes, requesterCode, message);
    return { success: true, data: await this.toResponse(await this.findTaskOrFail(id), data) };
  }

  // Aliases
  async getTasks(query: any) { return this.listTasks(query); }
  async importTasks(_data: any[]) { return { success: true }; }
  async exportTasks(_query: any) { return { success: true }; }

  // Cache invalidation (vẫn cần expose ra ngoài vì tasks.cron.ts dùng)
  invalidateWorkflowCache(workflowId: string, newDefinition?: any) {
    this.shared.invalidateWorkflowCache(workflowId, newDefinition);
  }
}
