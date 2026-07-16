import { Injectable, Logger } from '@nestjs/common';
import { TaskRole } from '@generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { TaskWorkflowService } from '../task-workflow/task-workflow.service';
import { TaskNotificationService } from '../task-workflow/task-notification.service';
import { paginateArray } from '@/utils/pagination.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TaskSharedService,
    private readonly wf: TaskWorkflowService,
    private readonly notif: TaskNotificationService,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Include chuẩn khi load task từ DB */
  private readonly taskInclude = {
    participants: true,
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

  async listTasks(query: any) {
    await this.shared.populateQueryHierarchy(query);

    const where: any = {};
    const conditions: any[] = [];

    if (query.id) where.id = parseInt(query.id, 10);
    if (query.status && query.status !== 'ALL') where.status = query.status;
    else if (!query.statsFilter) where.isCompleted = false;

    if (query.role && query.currentEmployeeCode) {
      conditions.push({ participants: { some: { employeeCode: query.currentEmployeeCode, participantRole: query.role } } });
    }

    if (query.assigneeCode === 'UNASSIGNED') {
      conditions.push({ OR: [
        { participants: { none: { participantRole: TaskRole.ASSIGNEE } } },
        { participants: { some: { employeeCode: 'UNASSIGNED', participantRole: TaskRole.ASSIGNEE } } },
      ] });
    } else if (query.assigneeCode) {
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
      if (query.statsFilter === 'doneInTime' || query.statsFilter === 'doneOverdue') {
        where.isCompleted = true;
      } else if (query.statsFilter === 'overdue') {
        where.isCompleted = false; where.dueDate = { lt: now };
      } else {
        const t3 = new Date(now); t3.setDate(now.getDate() + 3);
        where.isCompleted = false;
        where.dueDate = query.statsFilter === 'warning' ? { gte: now, lte: t3 } : { gt: t3 };
        if (query.statsFilter === 'inTime') where.OR = [{ dueDate: { gt: t3 } }, { dueDate: null }];
      }
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;

    let tasks = await this.prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true } }, _count: { select: { descendants: true } }, kpiSettings: true } });

    // JS-side filter for done in/overdue (column-vs-column comparison)
    if (query.statsFilter === 'doneInTime' || query.statsFilter === 'doneOverdue') {
      tasks = tasks.filter((t: any) => {
        const dueTime = t.dueDate ? new Date(t.dueDate).setHours(0, 0, 0, 0) : null;
        const completedTime = new Date(t.completedAt || t.updatedAt || Date.now()).setHours(0, 0, 0, 0);
        const late = dueTime ? completedTime > dueTime : false;
        return query.statsFilter === 'doneOverdue' ? late : !late;
      });
    }

    const paginated = paginateArray(tasks, page, limit);
    const enriched = await this.shared.enrichTasks(paginated.data);

    const mapped = await Promise.all(enriched.map(async (t: any) => ({
      ...this.shared.toTaskResponse(t),
      allowedActions: await this.shared.computeAllowedActions(t, query),
      children: [],
    })));

    // Build tree
    const taskMap = new Map(mapped.map(t => [t.id, t]));
    const roots: any[] = [];
    taskMap.forEach(t => {
      if (t.parentId && taskMap.has(t.parentId)) taskMap.get(t.parentId).children.push(t);
      else roots.push(t);
    });

    return { success: true, message: 'Lấy danh sách nhiệm vụ thành công', data: roots, meta: paginated.meta };
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

  async getTaskStats(query: any) {
    const where: any = {};
    const conditions: any[] = [];

    if (query.role === 'ASSIGNEE' && query.assigneeCode) {
      conditions.push({ participants: { some: { employeeCode: query.assigneeCode, participantRole: 'ASSIGNEE' } } });
    } else if (query.role === 'OWNER' && query.assignerCode) {
      conditions.push({ participants: { some: { employeeCode: query.assignerCode, participantRole: 'OWNER' } } });
    } else if (query.role === 'UNASSIGNED' || query.assigneeCode === 'UNASSIGNED') {
      conditions.push({ OR: [
        { participants: { none: { participantRole: 'ASSIGNEE' } } },
        { participants: { some: { employeeCode: 'UNASSIGNED', participantRole: 'ASSIGNEE' } } },
      ] });
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

    const allTasks = await this.prisma.task.findMany({
      where,
      select: { status: true, isCompleted: true, progress: true, dueDate: true, completedAt: true, updatedAt: true,
        participants: { where: { participantRole: { in: ['ASSIGNEE', 'OWNER'] } }, select: { employeeCode: true, participantRole: true } } },
    });

    const now = new Date(); now.setHours(0, 0, 0, 0);
    const nowTime = now.getTime();
    let overdue = 0, warning = 0, inTime = 0, doneInTime = 0, doneOverdue = 0;

    allTasks.forEach((t: any) => {
      const dueTime = t.dueDate ? new Date(t.dueDate).setHours(0, 0, 0, 0) : null;
      const isDone = t.isCompleted === true;
      if (isDone) {
        const completedTime = t.completedAt ? new Date(t.completedAt).setHours(0, 0, 0, 0) : (t.updatedAt ? new Date(t.updatedAt).setHours(0, 0, 0, 0) : nowTime);
        (dueTime && completedTime > dueTime) ? doneOverdue++ : doneInTime++;
      } else if (!dueTime) {
        inTime++;
      } else {
        const diff = Math.round((dueTime - nowTime) / 86_400_000);
        diff < 0 ? overdue++ : (diff <= 3 ? warning++ : inTime++);
      }
    });

    return { success: true, message: 'Lấy thống kê nhiệm vụ thành công', data: { overdue, warning, inTime, doneInTime, doneOverdue } };
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  async createTask(data: any) {
    let planId = data.planId || null;
    let parentId = data.parentId ? parseInt(data.parentId, 10) : null;

    if (parentId) {
      const parent = await this.prisma.task.findUnique({ where: { id: parentId }, select: { planId: true } });
      planId = parent?.planId || null;
    }

    const assigneeCode = data.assigneeCode || 'UNASSIGNED';
    const creatorCode = data.currentEmployeeCode || 'SYSTEM';

    // Validate assignee nếu có
    if (assigneeCode !== 'UNASSIGNED') {
      const emp = await this.prisma.employee.findUnique({ where: { employeeCode: assigneeCode } });
      if (!emp) throw new RpcException('Người được giao không tồn tại trong hệ thống.');
    }

    const kpi = await this.resolveKpiSettings(data, planId);
    const isCrossDomain = await this.checkCrossDomain(assigneeCode, data.domainId);

    // Tạo task + participants + closure trong transaction
    const newTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          parentId,
          title: data.title || data.taskName || 'Nhiệm vụ không tên',
          description: data.description,
          status: data.status || 'TODO',
          priority: data.priority || 'MEDIUM',
          startDate: data.startDate ? new Date(data.startDate) : null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          creatorEmployeeCode: creatorCode,
          planId,
          domainId: data.domainId ? parseInt(data.domainId, 10) : null,
          monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : null,
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

      return task;
    });

    // Khởi động workflow — workflow điều hướng mọi hành động tiếp theo
    const workflowCode = await this.wf.resolveWorkflowCode(data, planId, parentId);
    const wfInit = workflowCode
      ? await this.wf.initWorkflow(newTask.id, workflowCode, { initiatorId: data.currentUserId?.toString() || creatorCode, assigneeCode, assignerCode: creatorCode })
      : null;

    if (wfInit) {
      const metadata = { workflowId: wfInit.workflowId, workflowCode: wfInit.workflowCode, currentNodeId: wfInit.currentNodeId, ...(wfInit.workflowInstId && { workflowInstId: wfInit.workflowInstId }) };
      await this.prisma.task.update({ where: { id: newTask.id }, data: { metadata } });

      // Seed checklist steps từ workflow node (nếu workflow designer đã cấu hình)
      const nodeData = await this.wf.getCurrentNodeData(wfInit.workflowId, wfInit.currentNodeId);
      await this.wf.seedStepsFromNode(newTask.id, nodeData);

      // Gửi thông báo theo cấu hình của workflow node
      const notifCfg = this.wf.resolveNotificationConfig(nodeData);
      const createdTask = await this.toResponse(newTask, { currentEmployeeCode: creatorCode, currentUserPermissions: data.currentUserPermissions || [] });
      await this.notif.notifyNewTask(createdTask, { assigneeCode: data.assigneeCode, coassigneeCodes: data.coassigneeCodes, monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : undefined }, notifCfg);
      return createdTask;
    }

    // Không có workflow → vẫn trả về task và notify mặc định
    const createdTask = await this.toResponse(newTask, { currentEmployeeCode: creatorCode, currentUserPermissions: data.currentUserPermissions || [] });
    await this.notif.notifyNewTask(createdTask, { assigneeCode: data.assigneeCode, coassigneeCodes: data.coassigneeCodes, monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : undefined }, { sendNotify: true, nodeLabel: 'Giao việc' });
    return createdTask;
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any, actionName?: string) {
    if (context) await this.shared.populateQueryHierarchy(context);

    const rawTask = await this.findTaskOrFail(id);
    const [enriched] = await this.shared.enrichTasks([rawTask]);
    const access = await this.shared.checkTaskAccess(enriched, context);
    const hasChildren = (await this.prisma.taskClosure.count({ where: { ancestorId: id, depth: 1 } })) > 0;

    const action = actionName || status;
    const transition = await this.wf.validateAndTransition(enriched, action, {
      actorCode: actorCode || context?.currentEmployeeCode,
      permissions: context?.currentUserPermissions || [],
      hasChildren,
      access,
    });

    if (!transition.allowed) {
      throw new RpcException(`Workflow không cho phép hành động ${action}${transition.reason ? ` (${transition.reason})` : ''}.`);
    }

    // Notify trước khi update (cần task data cũ)
    await this.notif.notifyApprovalRequired(enriched, transition.nextNodeData, actorCode || context?.currentEmployeeCode);

    // Update DB
    const updateData: any = { status: transition.targetStatus || status };
    if (transition.isCompleted !== undefined) {
      updateData.isCompleted = transition.isCompleted;
    }
    if (rejectReason !== undefined) updateData.rejectReason = rejectReason;
    if (updateData.isCompleted) updateData.completedAt = new Date();
    if (transition.nextNodeId) {
      updateData.metadata = { ...((rawTask.metadata as any) || {}), currentNodeId: transition.nextNodeId };
    }

    await this.prisma.task.update({ where: { id }, data: updateData });

    if (rejectReason && (updateData.status === 'RETURNED' || transition.nextNodeData?.sideEffects?.includes('RETURN_TASK'))) {
      await this.prisma.taskComment.create({ data: { taskId: id, authorCode: actorCode || null, content: `Đã trả lại với lý do: ${rejectReason}`, isSystemMessage: true } });
    }

    // Auto-progress từ workflow node hoặc default khi DONE
    if (transition.nextNodeData?.autoProgress !== undefined) {
      await this.updateTaskProgress(id, transition.nextNodeData.autoProgress, actorCode);
    } else if (updateData.isCompleted) {
      await this.updateTaskProgress(id, 100, actorCode);
    }

    // Seed steps từ node mới (nếu workflow designer cấu hình)
    if (transition.nextNodeId) {
      await this.wf.seedStepsFromNode(id, transition.nextNodeData);
    }

    // Notify chuyển trạng thái
    await this.notif.notifyTransition(enriched, transition.nextNodeData, actorCode || context?.currentEmployeeCode);

    return this.toResponse(await this.findTaskOrFail(id), context);
  }

  async assignTask(id: number, data: any) {
    if (data) await this.shared.populateQueryHierarchy(data);

    const rawTask = await this.prisma.task.findUnique({ where: { id }, include: { participants: true } });
    if (!rawTask) throw new RpcException('Nhiệm vụ không tồn tại');

    const [enriched] = await this.shared.enrichTasks([rawTask]);
    const access = await this.shared.checkTaskAccess(enriched, data);

    // Validate ASSIGN action qua workflow (bypass nếu là owner/admin)
    if (!access.isOwner && !access.isAdmin && !access.isDeptLeader) {
      const transition = await this.wf.validateAndTransition(enriched, 'ASSIGN', { actorCode: data?.currentEmployeeCode, permissions: data?.currentUserPermissions || [], access });
      if (!transition.allowed) throw new RpcException('Workflow không cho phép thực hiện phân công/giao việc.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.taskParticipant.deleteMany({ where: { taskId: id, participantRole: { in: [TaskRole.ASSIGNEE, TaskRole.OWNER, TaskRole.COORDINATOR] } } });
      const participants = this.shared.buildParticipantsData(id, data);
      if (participants.length > 0) await tx.taskParticipant.createMany({ data: participants, skipDuplicates: true });
      if (rawTask.status === 'TEMPLATE') await tx.task.update({ where: { id }, data: { status: 'TODO' } });
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

  async updateTask(id: number, data: any) {
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

    const t = await this.prisma.task.update({
      where: { id },
      data: { ...taskData, ...(Object.keys(kpiData).length > 0 && { kpiSettings: { upsert: { create: kpiData, update: kpiData } } }) },
      include: this.taskInclude,
    });
    return this.toResponse(t);
  }

  async updateTaskProgress(id: number, progress: number, actorCode?: string) {
    const p = Math.max(0, Math.min(100, progress));
    await this.prisma.task.update({ where: { id }, data: { progress: p } });

    const closure = await this.prisma.taskClosure.findFirst({ where: { descendantId: id, depth: 1 } });
    if (closure) {
      const children = await this.prisma.taskClosure.findMany({ where: { ancestorId: closure.ancestorId, depth: 1 }, select: { descendantId: true } });
      const tasks = await this.prisma.task.findMany({ where: { id: { in: children.map(c => c.descendantId) } }, select: { progress: true } });
      const avg = tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;
      await this.updateTaskProgress(closure.ancestorId, avg, actorCode);
    }

    return this.toResponse(await this.findTaskOrFail(id));
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
    if (ids.length > 0) await this.prisma.task.deleteMany({ where: { id: { in: ids } } });

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
    const data2 = await Promise.all(enriched.map(async (t: any) => {
      t.allowedActions = await this.shared.computeAllowedActions(t, query);
      return this.shared.toDelegationNode(t);
    }));
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
    await this.shared.populateQueryHierarchy(data);
    const t = await this.findTaskOrFail(id);
    const [enriched] = await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(enriched, data);
    if (!access.hasAccess) throw new RpcException('Bạn không có quyền xem nhiệm vụ này.');
    const actions = await this.shared.computeAllowedActions(enriched, data);
    if (!actions.includes('CHAT')) throw new RpcException('Bạn không có quyền trao đổi trong công việc này.');

    const actorCode = data.authorCode || data.currentEmployeeCode || 'SYSTEM';
    const c = await this.prisma.taskComment.create({ data: { taskId: id, authorCode: actorCode === 'SYSTEM' ? null : actorCode, content: data.content, isSystemMessage: data.isSystemMessage || false } });
    const emp = await this.prisma.employee.findUnique({ where: { employeeCode: actorCode }, select: { fullName: true, avatar: true } });

    if (!data.isSystemMessage && data.content) {
      await this.notif.notifyMention(enriched, data.content, actorCode, emp?.fullName || actorCode);
    }

    return { success: true, data: { id: c.id, taskId: c.taskId, authorCode: actorCode, authorName: emp?.fullName || actorCode, authorAvatar: emp?.avatar || '', content: c.content, isSystemMessage: c.isSystemMessage, createdAt: c.createdAt.toISOString() } };
  }

  async getComments(id: number, query: any) {
    await this.shared.populateQueryHierarchy(query);
    const t = await this.findTaskOrFail(id);
    const [enriched] = await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(enriched, query);
    if (!access.hasAccess) throw new RpcException('Bạn không có quyền xem nhiệm vụ này.');

    const comments = await this.prisma.taskComment.findMany({ where: { taskId: id }, orderBy: { createdAt: 'asc' } });
    const codes = [...new Set(comments.map(c => c.authorCode).filter(Boolean))];
    const emps = await this.prisma.employee.findMany({ where: { employeeCode: { in: codes as string[] } }, select: { employeeCode: true, fullName: true, avatar: true } });
    const empMap = new Map(emps.map(e => [e.employeeCode, e]));

    return { success: true, data: comments.map(c => {
      const e = c.authorCode ? empMap.get(c.authorCode) : null;
      return { id: c.id, taskId: c.taskId, authorCode: e?.employeeCode || 'SYSTEM', authorName: e?.fullName || 'SYSTEM', authorAvatar: e?.avatar || '', content: c.content, isSystemMessage: c.isSystemMessage, createdAt: c.createdAt.toISOString(), isMine: e ? e.employeeCode === query.currentEmployeeCode : false };
    }) };
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
    return { success: true, message: 'Tạo bước thành công', data: step };
  }

  async updateStep(taskId: number, stepId: number, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.assigneeCode !== undefined) updateData.assigneeCode = data.assigneeCode;
    if (data.baseScore !== undefined) updateData.baseScore = parseFloat(data.baseScore);
    
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (data.status === 'TODO') {
        updateData.completedAt = null;
      }
    }

    const step = await this.prisma.taskStep.update({ where: { id: stepId, taskId }, data: updateData });
    return { success: true, message: 'Cập nhật bước thành công', data: step };
  }

  async listSteps(taskId: number) {
    const steps = await this.prisma.taskStep.findMany({ where: { taskId }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
    return { success: true, data: steps };
  }

  async deleteStep(taskId: number, stepId: number) {
    await this.prisma.taskStep.delete({ where: { id: stepId, taskId } });
    return { success: true, message: 'Xóa bước thành công' };
  }

  // ─── Misc ─────────────────────────────────────────────────────────────────

  async recommendAssignees(query: any) {
    const perms = query.currentUserPermissions || [];
    const isAdmin = perms.includes('TASK:MANAGE');
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
      if (allowed.length > 0) where.employeeCode = { in: allowed };
      else if (query.currentEmployeeCode) where.employeeCode = query.currentEmployeeCode;
    }

    const [employees, loadCounts, evaluations] = await Promise.all([
      this.prisma.employee.findMany({ where }),
      this.prisma.taskParticipant.groupBy({ by: ['employeeCode'], where: { participantRole: 'ASSIGNEE', task: { isCompleted: false } }, _count: { taskId: true } }),
      this.prisma.kpiEvaluation.findMany({ orderBy: { createdAt: 'desc' }, select: { employeeCode: true, totalScore: true } }),
    ]);

    const loadMap = new Map(loadCounts.map(i => [i.employeeCode, i._count.taskId]));
    const kpiMap = new Map(evaluations.map(i => [i.employeeCode, i.totalScore || 75]));

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
    const scored = employees.map(emp => ({
      id: emp.id, employeeCode: emp.employeeCode, fullName: emp.fullName, departmentId: emp.departmentId, jobTitleId: emp.jobTitleId,
      currentLoad: loadMap.get(emp.employeeCode) || 0,
      performanceScore: kpiMap.get(emp.employeeCode) || 75,
      matchScore: (targetJobTitleId && emp.jobTitleId === targetJobTitleId ? 50 : 0) + (scopeCodes.includes(emp.employeeCode) ? 30 : 0),
    })).sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (strategy === 'HIGH_PERFORMANCE') return b.performanceScore - a.performanceScore || a.currentLoad - b.currentLoad;
      if (strategy === 'UNDER_QUOTA') return a.currentLoad - b.currentLoad || b.performanceScore - a.performanceScore;
      return a.performanceScore - b.performanceScore || a.currentLoad - b.currentLoad;
    });

    return { success: true, data: { topEmployees: scored } };
  }

  async requestCoordination(id: number, data: any) {
    await this.shared.populateQueryHierarchy(data);
    const t = await this.findTaskOrFail(id);
    const [enriched] = await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(enriched, data);
    if (!access.hasAccess) throw new RpcException('Bạn không có quyền xem nhiệm vụ này.');
    const actions = await this.shared.computeAllowedActions(enriched, data);
    if (!actions.includes('COORDINATE')) throw new RpcException('Bạn không có quyền yêu cầu phối hợp.');

    const { leadCode, coordinatorCodes = [], message, requesterCode } = { leadCode: data.leadCode || data.leadId, coordinatorCodes: data.coordinatorCodes || data.coordinatorIds || [], message: data.message, requesterCode: data.requesterCode };

    if (!leadCode && coordinatorCodes.length === 0) {
      if (message) await this.prisma.taskComment.create({ data: { taskId: id, authorCode: requesterCode || null, content: `Gửi yêu cầu phối hợp: ${message}`, isSystemMessage: true } });
      return { success: true, data: await this.toResponse(await this.findTaskOrFail(id), data) };
    }

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
      if (st?.status === 'TEMPLATE') await tx.task.update({ where: { id }, data: { status: 'TODO' } });
    });

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
