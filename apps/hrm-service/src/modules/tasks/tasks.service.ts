import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { TaskRole } from '@generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { WorkflowEngine } from '@shared/workflow-core/workflow-engine';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { paginateArray } from '@/utils/pagination.util';

@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TasksService.name);
  private userService: any;
  private workflowService: any;

  private workflowCache: Map<string, any> = new Map();

  private async getWorkflowDefinition(workflowId: string): Promise<any> {
    if (this.workflowCache.has(workflowId)) {
      return this.workflowCache.get(workflowId);
    }
    try {
      const res = await firstValueFrom<any>(this.workflowService.FindOneWorkflow({ id: workflowId }));
      if (res && res.definition) {
        this.workflowCache.set(workflowId, res.definition);
        return res.definition;
      }
    } catch (e) {
      this.logger.error(`Failed to fetch workflow definition for ${workflowId}`, e);
    }
    return null;
  }

  public invalidateWorkflowCache(workflowId: string, newDefinition?: any) {
    if (newDefinition) {
      this.workflowCache.set(workflowId, newDefinition);
      this.logger.log(`Workflow ${workflowId} cache updated directly from event`);
    } else {
      this.workflowCache.delete(workflowId);
      this.logger.log(`Workflow ${workflowId} cache invalidated`);
    }
  }

  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject('USER_PACKAGE') private userClient: any,
    @Inject('WORKFLOW_PACKAGE') private workflowClient: any,
    private taskSharedService: TaskSharedService,
  ) { }

  onModuleInit() {
    this.userService = this.userClient.getService('UserService');
    this.workflowService = this.workflowClient.getService('WorkflowService');
  }

  onModuleDestroy() {
  }

  private sendTaskNotification(recipients: string[], title: string, message: string, taskData: any) {
    if (!recipients || recipients.length === 0) return;
    try {
      this.notificationClient.emit('send_notification', {
        title,
        message,
        type: 'SYSTEM',
        recipients,
        metadata: {
          module: (taskData.metadata && (taskData.metadata as any).module) ? (taskData.metadata as any).module : 'hrm',
          type: (taskData.metadata && (taskData.metadata as any).type) ? (taskData.metadata as any).type : 'work-plans/tasks',
          id: taskData.id
        },
      }).subscribe();
    } catch (e) {
      console.error(`Failed to send notification "${title}"`, e);
    }
  }

  async listTasks(query: any) {
    await this.taskSharedService.populateQueryHierarchy(query);
    const where: any = {};

    if (query.id) {
      where.id = parseInt(query.id, 10);
    }

    const conditions: any[] = [];

    // Optimized status filter using positive conditions (IN) instead of negative (NOT IN) for index performance
    const activeStatuses = ['TODO', 'IN_PROGRESS', 'REVIEWING', 'OVERDUE', 'RETURNED'];

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    } else if (!query.statsFilter) {
      where.status = { in: activeStatuses };
    }

    // Role filter
    if (query.role && query.currentEmployeeCode) {
      conditions.push({
        participants: {
          some: {
            employeeCode: query.currentEmployeeCode,
            participantRole: query.role
          }
        }
      });
    }

    // Assignee filter
    if (query.assigneeCode === 'UNASSIGNED') {
      conditions.push({
        OR: [
          { participants: { none: { participantRole: TaskRole.ASSIGNEE } } },
          { participants: { some: { employeeCode: 'UNASSIGNED', participantRole: TaskRole.ASSIGNEE } } }
        ]
      });
    } else if (query.assigneeCode) {
      conditions.push({
        participants: {
          some: {
            employeeCode: query.assigneeCode,
            participantRole: query.isSupervisor ? TaskRole.APPROVER : TaskRole.ASSIGNEE
          }
        }
      });
    }

    // Assigner/Owner filter
    if (query.assignerCode) {
      conditions.push({
        participants: {
          some: {
            employeeCode: query.assignerCode,
            participantRole: TaskRole.OWNER
          }
        }
      });
    }

    // Security Data Scoping constraints
    const scopeWhere = await this.taskSharedService.buildScopingWhereClause(query);
    if (scopeWhere) {
      conditions.push(scopeWhere);
    }

    // End of scoping constraint application


    if (conditions.length > 0) {
      where.AND = conditions;
    }

    if (query.search) where.title = { contains: query.search };
    if (query.priority && query.priority !== 'ALL') where.priority = query.priority;

    if (query.planId) {
      where.planId = parseInt(query.planId, 10);
      delete where.status;
    }


    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;

    // Apply statsFilter range conditions (Optimized: Lazy evaluation to avoid redundant Date allocations and unused objects)
    if (query.statsFilter) {
      if (query.statsFilter === 'doneInTime' || query.statsFilter === 'doneOverdue') {
        where.status = 'DONE';
      } else {
        // Only calculate dates if the filter actually needs them
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (query.statsFilter === 'overdue') {
          where.status = { in: activeStatuses };
          where.dueDate = { lt: now };
        } else {
          const threeDaysLater = new Date(now);
          threeDaysLater.setDate(now.getDate() + 3);

          if (query.statsFilter === 'warning') {
            where.status = { in: activeStatuses };
            where.dueDate = { gte: now, lte: threeDaysLater };
          } else if (query.statsFilter === 'inTime') {
            where.status = { in: activeStatuses };
            where.OR = [{ dueDate: { gt: threeDaysLater } }, { dueDate: null }];
          }
        }
      }
    }

    let finalWhere = { ...where };

    let tasks = await this.prisma.task.findMany({
      where: finalWhere,
      orderBy: { createdAt: 'desc' },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } },
        _count: { select: { descendants: true } },
        kpiSettings: true
      }
    });

    // Apply strict column-vs-column filter in JS if required
    let finalTasks = tasks;
    if (query.statsFilter === 'doneInTime' || query.statsFilter === 'doneOverdue') {
      finalTasks = tasks.filter((task: any) => {
        const due = task.dueDate ? new Date(task.dueDate) : null;
        if (due) due.setHours(0, 0, 0, 0);
        const completed = new Date(task.completedAt || task.updatedAt || Date.now());
        completed.setHours(0, 0, 0, 0);
        const late = due ? completed > due : false;
        return query.statsFilter === 'doneOverdue' ? late : !late;
      });
    }

    const paginated = paginateArray(finalTasks, page, limit);

    const enrichedTasks = await this.taskSharedService.enrichTasks(paginated.data);

    const mappedTasks = await Promise.all(enrichedTasks.map(async (t: any) => {
      const allowedActions = await this.taskSharedService.computeAllowedActions(t, query);

      return {
        ...t,
        dueDate: t.dueDate?.toISOString() || '',
        startDate: t.startDate?.toISOString() || '',
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
        allowedActions,
        children: []
      };
    }));

    const taskMap = new Map();
    mappedTasks.forEach((t) => {
      taskMap.set(t.id, t);
    });

    const roots: any[] = [];
    taskMap.forEach((task) => {
      if (task.parentId && taskMap.has(task.parentId)) {
        taskMap.get(task.parentId).children.push(task);
      } else {
        roots.push(task);
      }
    });

    const finalData = roots.map(t => this.taskSharedService.toTaskResponse(t));

    return {
      success: true,
      message: 'Lấy danh sách nhiệm vụ thành công',
      data: finalData,
      meta: {
        ...paginated.meta
      }
    };
  }

  async getTaskStats(query: any) {

    const where: any = {};
    const conditions: any[] = [];

    if (query.role === 'UNASSIGNED' || query.assigneeCode === 'UNASSIGNED') {
      conditions.push({
        OR: [
          { participants: { none: { participantRole: 'ASSIGNEE' } } },
          { participants: { some: { employeeCode: 'UNASSIGNED', participantRole: 'ASSIGNEE' } } }
        ]
      });
    } else if (query.role === 'ASSIGNEE' && query.assigneeCode) {
      conditions.push({
        participants: {
          some: {
            employeeCode: query.assigneeCode,
            participantRole: 'ASSIGNEE'
          }
        }
      });
    } else if (query.role === 'OWNER' && query.assignerCode) {
      conditions.push({
        participants: {
          some: {
            employeeCode: query.assignerCode,
            participantRole: 'OWNER'
          }
        }
      });
    }

    if (query.departmentId) {
      // Assuming plan.departmentId or monitoredUnitId is what departmentId means now
      conditions.push({
        OR: [
          { plan: { departmentId: parseInt(query.departmentId, 10) } },
          { monitoredUnitId: parseInt(query.departmentId, 10) }
        ]
      });
    }

    if (!query.role || query.role === 'ALL') {
      const perms = query.currentUserPermissions || [];
      const isAdmin = query.isAdmin || perms.includes('TASK:MANAGE');

      if (!isAdmin) {
        const scopingConditions: any[] = [];

        if (query.currentEmployeeCode) {
          scopingConditions.push({
            participants: {
              some: { employeeCode: query.currentEmployeeCode }
            }
          });
          scopingConditions.push({
            creatorEmployeeCode: query.currentEmployeeCode
          });
        }

        const isLeader = query.isLeader || perms.includes('TASK.ASSIGN') || perms.includes('TASK.*');
        if (isLeader) {
          if (query.currentUserDept && query.isSupervisor) {
            scopingConditions.push({ plan: { departmentId: query.currentUserDept } });
            scopingConditions.push({ monitoredUnitId: query.currentUserDept });
          }
        }

        if (scopingConditions.length > 0) {
          conditions.push({ OR: scopingConditions });
        } else {
          conditions.push({ id: -1 });
        }
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


    const allStatsTasks = await this.prisma.task.findMany({
      where,
      select: {
        status: true,
        progress: true,
        dueDate: true,
        completedAt: true,
        updatedAt: true,
        participants: {
          where: { participantRole: { in: ['ASSIGNEE', 'OWNER'] } },
          select: { employeeCode: true, participantRole: true }
        }
      }
    });

    let overdue = 0, warning = 0, inTime = 0, doneInTime = 0, doneOverdue = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const statsByUnitMap: Record<string, { completed: number, pending: number }> = {};
    const statsByLeaderMap: Record<string, number> = {};
    const empCodes = new Set<string>();
    allStatsTasks.forEach((t: any) => {
      t.participants?.forEach((p: any) => empCodes.add(p.employeeCode));
    });

    const empMap = new Map<string, any>();
    if (empCodes.size > 0) {
      const employees = await this.prisma.employee.findMany({
        where: { employeeCode: { in: Array.from(empCodes) } },
        select: { employeeCode: true, fullName: true, departmentId: true, jobTitleId: true }
      });
      employees.forEach(emp => {
        empMap.set(emp.employeeCode, {
          unit: emp.departmentId ? `Phòng ban ${emp.departmentId}` : (emp.jobTitleId ? `Chức danh ${emp.jobTitleId}` : "Chưa phân bổ"),
          fullName: emp.fullName
        });
      });
    }

    const nowTime = now.getTime();

    allStatsTasks.forEach((t: any) => {
      // Prisma returns Date objects. Avoid creating new Date() instances unnecessarily.
      const dueTime = t.dueDate ? new Date(t.dueDate).setHours(0, 0, 0, 0) : null;
      const isCompleted = t.status === 'DONE' || t.status === 'COMPLETED' || t.progress === 100;

      if (isCompleted) {
        const completedTime = t.completedAt ? new Date(t.completedAt).setHours(0, 0, 0, 0) : (t.updatedAt ? new Date(t.updatedAt).setHours(0, 0, 0, 0) : nowTime);
        if (dueTime && completedTime > dueTime) {
          doneOverdue++;
        } else {
          doneInTime++;
        }
      } else if (!dueTime) {
        inTime++;
      } else {
        const diffDays = Math.ceil((dueTime - nowTime) / 86_400_000);

        // Use early evaluation/ternary to eliminate deeply nested if-else
        diffDays < 0 ? overdue++ : (diffDays <= 3 ? warning++ : inTime++);
      }

      // Group by Unit & Leader
      let unit = "Chưa phân bổ";
      let leader = "Chưa phân bổ";
      const assignee = t.participants?.find((p: any) => p.participantRole === 'ASSIGNEE');
      const owner = t.participants?.find((p: any) => p.participantRole === 'OWNER');

      if (assignee && empMap.has(assignee.employeeCode)) {
        unit = empMap.get(assignee.employeeCode)!.unit;
      }
      if (owner && empMap.has(owner.employeeCode)) {
        leader = empMap.get(owner.employeeCode)!.fullName;
      } else if (assignee && empMap.has(assignee.employeeCode)) {
        leader = empMap.get(assignee.employeeCode)!.unit;
      }

      if (!statsByUnitMap[unit]) statsByUnitMap[unit] = { completed: 0, pending: 0 };
      if (isCompleted) {
        statsByUnitMap[unit].completed++;
      } else {
        statsByUnitMap[unit].pending++;
      }

      statsByLeaderMap[leader] = (statsByLeaderMap[leader] || 0) + 1;
    });

    const statsByUnit = Object.keys(statsByUnitMap).map(unitName => ({
      unitName: unitName.length > 15 ? unitName.substring(0, 15) + '...' : unitName,
      fullUnit: unitName,
      completed: statsByUnitMap[unitName].completed,
      pending: statsByUnitMap[unitName].pending
    })).sort((a, b) => (b.completed + b.pending) - (a.completed + a.pending)).slice(0, 7);

    const statsByLeader = Object.keys(statsByLeaderMap).map(leaderName => ({
      leaderName: leaderName.length > 20 ? leaderName.substring(0, 20) + '...' : leaderName,
      fullName: leaderName,
      value: statsByLeaderMap[leaderName]
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    return {
      success: true,
      message: 'Lấy thống kê nhiệm vụ thành công',
      data: { overdue, warning, inTime, doneInTime, doneOverdue, statsByUnit }
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

    const initialStatus = data.status || 'TODO';

    let creatorCode = data.currentEmployeeCode || 'SYSTEM';

    let isCrossDomain = false;
    let autoKpiCriteriaId = data.kpiCriteriaId ? parseInt(data.kpiCriteriaId, 10) : null;

    if (!autoKpiCriteriaId) {
      if (planId) {
        const crit = await this.prisma.kpiCriteria.findFirst({ where: { name: { contains: 'định mức' } } });
        if (crit) autoKpiCriteriaId = crit.id;
      } else {
        const crit = await this.prisma.kpiCriteria.findFirst({ where: { name: { contains: 'đột xuất' } } });
        if (crit) autoKpiCriteriaId = crit.id;
      }
    }

    let baseScore = data.baseScore;
    let weight = data.weight;
    let scoringMethod = data.scoringMethod || 'MANUAL';
    let bonusPerDay = data.bonusPerDay;
    let penaltyPerDay = data.penaltyPerDay;

    if (autoKpiCriteriaId) {
      const criteriaSettings = await this.prisma.kpiCriteriaSetting.findUnique({
        where: { criteriaId: autoKpiCriteriaId }
      });
      if (criteriaSettings) {
        if (baseScore === undefined || baseScore === null) baseScore = criteriaSettings.baseScore ?? 100;
        if (weight === undefined || weight === null) weight = criteriaSettings.weight ?? 1.0;
        if (data.scoringMethod === undefined || data.scoringMethod === null) scoringMethod = criteriaSettings.scoringMethod ?? 'MANUAL';
        if (bonusPerDay === undefined || bonusPerDay === null) bonusPerDay = criteriaSettings.bonusPerDay ?? 0;
        if (penaltyPerDay === undefined || penaltyPerDay === null) penaltyPerDay = criteriaSettings.penaltyPerDay ?? 0;
      }
    }

    const assigneeCode = data.assigneeCode || 'UNASSIGNED';
    if (assigneeCode !== 'UNASSIGNED' && data.domainId) {
      const assigneeEmp = await this.prisma.employee.findUnique({
        where: { employeeCode: assigneeCode },
        select: { userId: true }
      });
      if (assigneeEmp?.userId) {
        try {
          const subordinatesRes: any = await firstValueFrom(
            this.userService.GetSubordinates({ userId: assigneeEmp.userId })
          );
          const allowedDomains = subordinatesRes?.allowedDomainIds || subordinatesRes?.allowed_domain_ids || [];
          if (!allowedDomains.includes(parseInt(data.domainId, 10))) {
            isCrossDomain = true;
          }
        } catch (e) {
        }
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
          creatorEmployeeCode: creatorCode,
          planId,
          domainId: data.domainId ? parseInt(data.domainId, 10) : null,
          monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : null,
          kpiSettings: {
            create: {
              baseScore,
              weight,
              scoringMethod,
              bonusPerDay,
              penaltyPerDay,
              kpiCriteriaId: autoKpiCriteriaId,
              isCrossDomain,
              crossDomainMultiplier: isCrossDomain ? 1.5 : 1.0
            }
          }
        }
      });

      // Tạo participants using helper
      const participantsData = this.taskSharedService.buildParticipantsData(newTask.id, data);

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



    // Bắt đầu workflow chuẩn cho Task (Decentralized)
    try {
      const workflowId = 'TASK_PROCESSING_ID';
      const definition = await this.getWorkflowDefinition(workflowId);

      if (definition) {
        const engine = new WorkflowEngine(definition);
        const initialNodeId = engine.getInitialNodeId();

        if (initialNodeId) {
          await this.prisma.task.update({
            where: { id: t.id },
            data: {
              metadata: {
                ...((t.metadata as any) || {}),
                workflowId,
                currentNodeId: initialNodeId
              }
            }
          });
          const updatedMeta = (t.metadata as any) || {};
          updatedMeta.workflowId = workflowId;
          updatedMeta.currentNodeId = initialNodeId;
          t.metadata = updatedMeta;
        }
      }
    } catch (err) {
      this.logger.error('Failed to init local workflow for task ' + t.id, err);
    }

    const createdTask = await this.prisma.task.findUnique({
      where: { id: t.id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } },
        kpiSettings: true
      }
    });

    const enriched = await this.taskSharedService.enrichTasks([createdTask]);
    const enrichedTask = enriched[0];

    // Add allowed actions for the newly created task so the frontend can render buttons immediately
    const allowedActions = await this.taskSharedService.computeAllowedActions(enrichedTask, {
      currentEmployeeCode: creatorCode,
      currentUserPermissions: data.currentUserPermissions || [],
    });
    enrichedTask.allowedActions = allowedActions;

    const enrichedTaskResponse = this.taskSharedService.toTaskResponse(enrichedTask);

    const metadata = (enrichedTask.metadata as any) || {};
    const workflowId = metadata.workflowId;
    let sendNotify = true; // Fallback for tasks without workflow
    let nodeLabel = 'Giao việc';

    if (workflowId) {
      try {
        const definition = await this.getWorkflowDefinition(workflowId);
        if (definition) {
          const engine = new WorkflowEngine(definition);
          const initialNodeId = engine.getInitialNodeId();
          if (initialNodeId) {
            const node = engine.getNode(initialNodeId);
            if (node && node.data) {
              sendNotify = !!node.data.sendNotification;
              if (node.data.label) nodeLabel = node.data.label;
            }
          }
        }
      } catch (err) {
        this.logger.error('Lỗi khi đọc Workflow cấu hình thông báo cho Task mới', err);
      }
    }

    if (sendNotify) {
      if (data.assigneeCode) {
        this.sendTaskNotification(
          [data.assigneeCode],
          `Có công việc mới: ${nodeLabel}`,
          `Bạn vừa được giao nhiệm vụ: "${enrichedTaskResponse.title}"`,
          enrichedTaskResponse
        );
      }

      if (Array.isArray(data.coassigneeCodes) && data.coassigneeCodes.length > 0) {
        this.sendTaskNotification(
          data.coassigneeCodes,
          `Có công việc phối hợp mới: ${nodeLabel}`,
          `Bạn được phân công phối hợp thực hiện nhiệm vụ: "${enrichedTaskResponse.title}"`,
          enrichedTaskResponse
        );
      }

      if (data.monitoredUnitId) {
        try {
          const monitorsRes: any = await firstValueFrom(
            this.userService.GetEmployeesByScope({ monitored_unit_id: parseInt(data.monitoredUnitId, 10) })
          );
          const followerCodes = monitorsRes?.employeeCodes || monitorsRes?.employee_codes || [];
          if (followerCodes.length > 0) {
            this.sendTaskNotification(
              followerCodes,
              `Có công việc mới tại phòng ban theo dõi: ${nodeLabel}`,
              `Một nhiệm vụ mới ("${enrichedTaskResponse.title}") vừa được giao cho phòng ban bạn đang phụ trách theo dõi.`,
              enrichedTaskResponse
            );
          }
        } catch (e) {
          console.error('Failed to notify monitors', e);
        }
      }
    }

    return enrichedTaskResponse;
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any, actionNameForWorkflow?: string) {
    if (context) await this.taskSharedService.populateQueryHierarchy(context);
    const rawTask = await this.prisma.task.findUnique({ where: { id } });
    if (!rawTask) throw new RpcException('Nhiệm vụ không tồn tại');

    const actualActorCode = actorCode || context?.currentEmployeeCode;

    const tCheckArr = [rawTask];
    await this.taskSharedService.enrichTasks(tCheckArr);
    const tCheck: any = tCheckArr[0];

    // GỌI WORKFLOW ĐỂ VALIDATE VÀ NHẢY BƯỚC
    const metadata = (rawTask.metadata as any) || {};
    const activeWorkflowId = metadata.workflowId || rawTask.workflowInstId;
    let nextNodeIdToSave: string | undefined = undefined;

    if (activeWorkflowId && metadata.currentNodeId) {
      try {
        let actionName = actionNameForWorkflow || status;

        let hasChildren = false;
        const childrenCount = await this.prisma.taskClosure.count({ where: { ancestorId: rawTask.id, depth: 1 } });
        hasChildren = childrenCount > 0;

        const queryContext = { ...context, currentEmployeeCode: actualActorCode, currentUserId: context?.currentUserId };
        const access = await this.taskSharedService.checkTaskAccess(tCheck, queryContext);

        const businessData = {
          status: rawTask.status,
          hasChildren,
          isOwner: access.isOwner,
          isAssignee: access.isAssignee,
          isSupervisor: access.isSupervisor,
          isCoordinator: access.isCoordinator,
          isDeptLeader: access.isDeptLeader,
          isLowestLevel: access.isLowestLevel,
          allowedEmployeeCodes: context?.allowedEmployeeCodes || [],
        };

        const definition = await this.getWorkflowDefinition(activeWorkflowId);
        if (definition) {
          const engine = new WorkflowEngine(definition);
          const validateRes = engine.validateAction(
            metadata.currentNodeId,
            actionName,
            context?.currentUserPermissions || [],
            actualActorCode,
            businessData
          );

          if (!validateRes.allowed) {
            const reasonMsg = validateRes.reason ? ` (${validateRes.reason})` : '';
            throw new RpcException(`Workflow không cho phép thực hiện hành động ${actionName}${reasonMsg}.`);
          }

          // Nhảy bước
          const nextNodeId = engine.getNextNodeId(metadata.currentNodeId, actionName, { ...businessData, actionName });
          if (nextNodeId) {
            nextNodeIdToSave = nextNodeId;
          }
        }
      } catch (err) {
        if (err instanceof RpcException) throw err;
        this.logger.error('Lỗi tính toán ValidateAction qua local engine', err);
      }
    }

    let targetStatus = status;
    let nextNodeData: any = null;
    
    if (nextNodeIdToSave && activeWorkflowId) {
      const definition = await this.getWorkflowDefinition(activeWorkflowId);
      if (definition) {
        const engine = new WorkflowEngine(definition);
        const nextNode = engine.getNode(nextNodeIdToSave);
        if (nextNode && nextNode.data) {
          nextNodeData = nextNode.data;
          if (nextNodeData.targetStatus) {
            targetStatus = nextNodeData.targetStatus;
          }
        }
      }
    }

    const dataToUpdate: any = { status: targetStatus };
    if (rejectReason !== undefined) dataToUpdate.rejectReason = rejectReason;
    if (targetStatus === 'DONE') dataToUpdate.completedAt = new Date();
    if (nextNodeIdToSave) {
      dataToUpdate.metadata = { ...((rawTask.metadata as any) || {}), currentNodeId: nextNodeIdToSave };
    }

    const t = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: { participants: true }
    });

    if (rejectReason && (targetStatus === 'RETURNED' || (nextNodeData && nextNodeData.sideEffects?.includes('RETURN_TASK')))) {
      await this.prisma.taskComment.create({
        data: {
          taskId: id,
          authorCode: actualActorCode || null,
          content: `Đã trả lại công việc với lý do: ${rejectReason}`,
          isSystemMessage: true,
        }
      });
    }

    if (nextNodeData?.autoProgress !== undefined) {
      await this.updateTaskProgress(id, nextNodeData.autoProgress, actualActorCode);
    } else if (targetStatus === 'DONE') {
      await this.updateTaskProgress(id, 100, actualActorCode);
    }

    // Xử lý gửi thông báo tự động dựa trên cấu hình Workflow Engine (Node tiếp theo)
    if (nextNodeIdToSave && activeWorkflowId) {
      try {
        const definition = await this.getWorkflowDefinition(activeWorkflowId);
        if (definition) {
          const engine = new WorkflowEngine(definition);
          const nextNode = engine.getNode(nextNodeIdToSave);

          // Chỉ gửi nếu Node đích được cấu hình tick chọn Gửi thông báo
          if (nextNode && nextNode.data && nextNode.data.sendNotification) {
            let title = `Có cập nhật: ${nextNode.data.label}`;
            let message = `Công việc "${tCheck.title}" đã chuyển sang bước: ${nextNode.data.label}. ${nextNode.data.description || ''}`;
            let recipientCodes: string[] = [];

            // Ưu tiên sử dụng cấu hình Notification từ Workflow Node
            if (nextNode.data.notification) {
              const notifCfg = nextNode.data.notification;
              title = notifCfg.title || title;
              message = notifCfg.template ? notifCfg.template.replace('{{taskTitle}}', `"${tCheck.title}"`) : message;
              
              if (notifCfg.recipientExpression) {
                // Đánh giá biểu thức tìm danh sách người nhận (ví dụ: "[assigneeCode, supervisorCode]")
                try {
                  const evalContext = {
                     assignerCode: tCheck.assignerCode,
                     assigneeCode: tCheck.assigneeCode,
                     creatorEmployeeCode: tCheck.creatorEmployeeCode,
                     supervisorCode: tCheck.supervisorCode,
                     coordinatorCodes: tCheck.coassigneeCodes || []
                  };
                  const getRecipients = new Function('context', `
                    with (context) { return ${notifCfg.recipientExpression}; }
                  `);
                  const computedRecipients = getRecipients(evalContext);
                  if (Array.isArray(computedRecipients)) {
                    recipientCodes = computedRecipients.filter(Boolean);
                  }
                } catch(e) {
                   this.logger.error('Failed to parse recipientExpression', e);
                }
              }
            } else {
              // Template fallback (Hardcode cũ)
              if (targetStatus === 'RETURNED' || rejectReason) {
                title = 'Công việc bị trả lại';
                message = `Công việc "${tCheck.title}" của bạn đã bị trả lại.\nLý do: ${rejectReason}`;
              } else if (nextNode.data.actionName === 'APPROVE') {
                title = 'Yêu cầu nghiệm thu công việc';
                message = `Nhân sự đã báo cáo hoàn thành công việc "${tCheck.title}". Vui lòng kiểm tra và nghiệm thu.`;
              } else if (targetStatus === 'DONE' || nextNode.type === 'end') {
                title = 'Công việc đã được nghiệm thu';
                message = `Công việc "${tCheck.title}" của bạn đã được duyệt hoàn thành.`;
              }

              // Đối soát fallback cũ
              if (nextNode.data.role === 'MANAGER' || targetStatus === 'PENDING_APPROVAL') {
                recipientCodes.push(tCheck.supervisorCode, tCheck.assignerCode, tCheck.creatorEmployeeCode);
              } else {
                recipientCodes.push(tCheck.assigneeCode);
              }
            }

            // Lọc danh sách và loại trừ người đang thao tác
            const uniqueCodes = [...new Set(recipientCodes.filter(c => c && c !== actualActorCode))];

            for (const code of uniqueCodes) {
              const emp = await this.prisma.employee.findUnique({ where: { employeeCode: code }, select: { userId: true } });
              if (emp?.userId) {
                this.notificationClient.emit('send_notification', {
                  title,
                  message,
                  type: 'SYSTEM',
                  recipients: [emp.userId],
                  metadata: {
                    module: (tCheck.metadata as any)?.module || 'hrm',
                    type: (tCheck.metadata as any)?.type || 'work-plans/tasks',
                    id: id
                  },
                }).subscribe();
              }
            }
          }
        }
      } catch (err) {
        this.logger.error('Lỗi khi gửi thông báo tự động từ Workflow', err);
      }
    }

    const updatedTask = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } },
        kpiSettings: true
      }
    });
    const enriched = await this.taskSharedService.enrichTasks([updatedTask]);
    return this.taskSharedService.toTaskResponse(enriched[0]);
  }

  async assignTask(data: any) {
    const id = data.id;
    const context = data;
    const rawTaskForCheck = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true }
    });
    const metadataForCheck = (rawTaskForCheck?.metadata as any) || {};
    const activeWorkflowId = metadataForCheck.workflowId || rawTaskForCheck?.workflowInstId;
    if (activeWorkflowId && metadataForCheck.currentNodeId) {
      try {
        const tCheckArr = [rawTaskForCheck];
        await this.taskSharedService.enrichTasks(tCheckArr);
        const queryContext = { ...context, currentEmployeeCode: context?.currentEmployeeCode, currentUserId: context?.currentUserId };
        const access = await this.taskSharedService.checkTaskAccess(tCheckArr[0], queryContext);

        const definition = await this.getWorkflowDefinition(activeWorkflowId);
        if (definition) {
          const engine = new WorkflowEngine(definition);
          const validateRes = engine.validateAction(
            metadataForCheck.currentNodeId,
            'ASSIGN',
            context?.currentUserPermissions || [],
            context?.currentEmployeeCode,
            {
              status: rawTaskForCheck!.status,
              isOwner: access.isOwner,
              isAssignee: access.isAssignee,
              isSupervisor: access.isSupervisor,
              isDeptLeader: access.isDeptLeader,
              isCoordinator: access.isCoordinator,
              isLowestLevel: access.isLowestLevel,
              allowedEmployeeCodes: context?.allowedEmployeeCodes || [],
            }
          );

          if (!validateRes.allowed) {
            this.logger.error(`Validate Action blocked ASSIGN: ${validateRes.reason}, businessData: ${JSON.stringify({ isOwner: access.isOwner, creator: tCheckArr[0]?.creatorEmployeeCode, current: context?.currentEmployeeCode })}`);
            throw new RpcException(`Workflow không cho phép thực hiện hành động phân công/giao việc.`);
          }

          // Chú ý: action ASSIGN thường không làm nhảy bước workflow (không đổi trạng thái task)
          // nên ở đây ta không cần tìm getNextNodeId và update currentNodeId
        }
      } catch (err) {
        if (err instanceof RpcException) throw err;
        this.logger.error('Lỗi tính toán ValidateAction for ASSIGN qua local engine', err);
      }
    }

    const t = await this.prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findUnique({
        where: { id },
        include: { participants: true }
      });
      if (!currentTask) throw new RpcException('Nhiệm vụ không tồn tại');

      let currentAssigneeCode = 'UNASSIGNED';
      const currentAssigneeParticipant = currentTask.participants.find(p => p.participantRole === TaskRole.ASSIGNEE);
      if (currentAssigneeParticipant && currentAssigneeParticipant.employeeCode) {
        currentAssigneeCode = currentAssigneeParticipant.employeeCode;
      }

      const isUnassigned = currentAssigneeCode === 'UNASSIGNED' || currentTask.status === 'TEMPLATE';

      // Delete old participants for assignee, owner, coordinator
      await tx.taskParticipant.deleteMany({
        where: {
          taskId: id,
          participantRole: { in: [TaskRole.ASSIGNEE, TaskRole.OWNER, TaskRole.COORDINATOR] }
        }
      });

      // Re-create participants using helper
      const participantsData = this.taskSharedService.buildParticipantsData(id, data);
      if (participantsData.length > 0) {
        await tx.taskParticipant.createMany({ data: participantsData, skipDuplicates: true });
      }

      // Update status to TODO if it was TEMPLATE
      if (currentTask.status === 'TEMPLATE') {
        await tx.task.update({ where: { id }, data: { status: 'TODO' } });
      }

      return tx.task.findUnique({ where: { id }, include: { participants: true, kpiSettings: true } });
    });

    const enriched = await this.taskSharedService.enrichTasks([t]);
    const enrichedTaskResponse = this.taskSharedService.toTaskResponse(enriched[0]);

    if (data.assigneeCode) {
      this.sendTaskNotification(
        [data.assigneeCode],
        'Có công việc mới được giao',
        `Bạn vừa được phân công phụ trách nhiệm vụ: "${enrichedTaskResponse.title}"`,
        enrichedTaskResponse
      );
    }

    if (Array.isArray(data.coassigneeCodes) && data.coassigneeCodes.length > 0) {
      this.sendTaskNotification(
        data.coassigneeCodes,
        'Có công việc phối hợp mới',
        `Bạn được phân công phối hợp thực hiện nhiệm vụ: "${enrichedTaskResponse.title}"`,
        enrichedTaskResponse
      );
    }

    return enrichedTaskResponse;
  }




  async getTask(id: number, query: any) {
    await this.taskSharedService.populateQueryHierarchy(query);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } },
        kpiSettings: true
      }
    });
    if (!t) throw new RpcException('Không tìm thấy nhiệm vụ');

    const enriched = await this.taskSharedService.enrichTasks([t]);

    const access = await this.taskSharedService.checkTaskAccess(t, query);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.taskSharedService.computeAllowedActions(t, query);

    return this.taskSharedService.toTaskResponse({
      ...enriched[0],
      allowedActions
    });
  }

  async getSubTasks(id: number, query: any) {
    await this.taskSharedService.populateQueryHierarchy(query);
    const parentTask = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } }
      }
    });
    if (!parentTask) throw new RpcException('Nhiệm vụ không tồn tại');
    await this.taskSharedService.enrichTasks([parentTask]);
    const parentAccess = await this.taskSharedService.checkTaskAccess(parentTask, query);
    if (!parentAccess.hasAccess) {
      throw new RpcException('Bạn không có quyền xem nhiệm vụ con của công việc này.');
    }

    // Get all descendants from closure table with depth = 1 (direct children)
    const closureData = await this.prisma.taskClosure.findMany({
      where: { ancestorId: id, depth: 1 },
      select: { descendantId: true }
    });

    const childIds = closureData.map(c => c.descendantId);

    const where: any = { id: { in: childIds }, status: { not: 'TEMPLATE' } };

    // Apply scoping constraints to children to ensure unrelated people don't see others' subtasks
    const scopeWhere = await this.taskSharedService.buildScopingWhereClause(query);
    if (scopeWhere) {
      where.AND = [scopeWhere];
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });

    const enriched = await this.taskSharedService.enrichTasks(tasks);

    const data = await Promise.all(enriched.map(async (t: any) => {
      const allowedActions = await this.taskSharedService.computeAllowedActions(t, query);
      return this.taskSharedService.toDelegationNode({
        ...t,
        allowedActions
      });
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

    // Apply scoping constraints to the tree
    const scopeWhere = await this.taskSharedService.buildScopingWhereClause(query);
    let validIds: Set<number> | null = null;
    if (scopeWhere) {
      const validTasks = await this.prisma.task.findMany({
        where: scopeWhere,
        select: { id: true }
      });
      validIds = new Set(validTasks.map(t => t.id));
    }

    const descendants = closureData
      .filter(c => validIds === null || validIds.has(c.descendantId))
      .map(c => ({
        ...(c.descendant as any),
        depth: c.depth
      }));

    const enriched = await this.taskSharedService.enrichTasks(descendants);

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
          employeeCode: emp.employeeCode,
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
    const rawTask = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true }
    });
    if (!rawTask) throw new RpcException('Nhiệm vụ không tồn tại');

    const assigneeP = rawTask.participants.find(p => p.participantRole === TaskRole.ASSIGNEE);
    const isUnassigned = !assigneeP || assigneeP.employeeCode === 'UNASSIGNED';

    if (!isUnassigned) {
      throw new RpcException('Không thể xóa công việc đã được giao cho người khác');
    }

    // Xoá tất cả node con qua Closure
    const descendants = await this.prisma.taskClosure.findMany({
      where: { ancestorId: id },
      select: { descendantId: true, depth: true }
    });

    const hasChildren = descendants.some(d => d.depth > 0);
    if (hasChildren) {
      throw new RpcException('Không thể xóa công việc đã có công việc con');
    }

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
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: { progress: p },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });

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
    const enriched = await this.taskSharedService.enrichTasks([updatedTask]);
    return this.taskSharedService.toTaskResponse(enriched[0]);
  }

  async recommendAssignees(query: any) {
    try {
      const whereClause: any = { employmentStatus: 'active' };

      // 1. Phân quyền: Kiểm tra Admin
      const perms = query.currentUserPermissions || [];
      const isAdmin = perms.includes('TASK:MANAGE');

      if (query.excludeEmployeeCode) {
        whereClause.employeeCode = { not: query.excludeEmployeeCode };
      }

      // Lấy cấu trúc thẩm quyền trực tiếp từ user-service
      if (!isAdmin && query.currentUserId) {
        try {
          const subordinatesRes: any = await firstValueFrom(
            this.userService.GetSubordinates({ userId: query.currentUserId })
          );
          query.allowedDepartmentIds = subordinatesRes?.allowedDepartmentIds || subordinatesRes?.allowed_department_ids || [];
          query.allowedEmployeeCodes = subordinatesRes?.allowedEmployeeCodes || subordinatesRes?.allowed_employee_codes || [];
        } catch (e) {
          console.error('Failed to get subordinates for recommendAssignees:', e);
        }
      }

      // Giới hạn gợi ý theo Sơ đồ thẩm quyền từ user-service
      if (!isAdmin) {
        const allowedCodes = query.allowedEmployeeCodes || [];

        if (allowedCodes.length > 0) {
          whereClause.employeeCode = { in: allowedCodes };
        } else if (query.currentEmployeeCode) {
          // Chỉ thấy bản thân nếu không có quyền gì
          whereClause.employeeCode = query.currentEmployeeCode;
        }
      }

      const employees = await this.prisma.employee.findMany({
        where: whereClause,
      });

      const activeTasksCount = await this.prisma.taskParticipant.groupBy({
        by: ['employeeCode'],
        where: {
          participantRole: 'ASSIGNEE',
          task: { status: { not: 'DONE' } },
        },
        _count: { taskId: true },
      });

      const taskCountMap = new Map<string, number>();
      activeTasksCount.forEach(item => {
        if (item.employeeCode) taskCountMap.set(item.employeeCode, item._count.taskId);
      });

      const evaluations = await this.prisma.kpiEvaluation.findMany({
        orderBy: { createdAt: 'desc' },
        select: { employeeCode: true, totalScore: true },
      });
      const kpiMap = new Map(evaluations.map(item => [item.employeeCode, item.totalScore || 75]));

      // 2. Chấm điểm Gợi ý dựa trên Vị trí chức danh (JobTitle), Lĩnh vực (Domain) và Phòng ban theo dõi
      const targetDomainId = query.domainId ? parseInt(query.domainId, 10) : null;
      const targetMonitoredUnitId = query.monitoredUnitId ? parseInt(query.monitoredUnitId, 10) : null;
      const targetJobTitleId = query.jobTitleId ? parseInt(query.jobTitleId, 10) : null;

      let scopeEmployeeCodes: string[] = [];
      if (targetDomainId || targetMonitoredUnitId) {
        try {
          const scopeRes: any = await firstValueFrom(
            this.userService.GetEmployeesByScope({ domainId: targetDomainId || 0, monitoredUnitId: targetMonitoredUnitId || 0 })
          );
          scopeEmployeeCodes = scopeRes?.employeeCodes || scopeRes?.employee_codes || [];
        } catch (e) {
          console.error('Failed to get employees by scope:', e);
        }
      }

      const employeeList = employees.map(emp => {
        const taskCount = taskCountMap.get(emp.employeeCode) || 0;
        const kpiScore = kpiMap.get(emp.employeeCode) || 75;

        // Tính điểm Domain/Position Match Score
        let matchScore = 0;
        if (targetJobTitleId && emp.jobTitleId === targetJobTitleId) {
          matchScore += 50; // Ưu tiên tuyệt đối nếu đúng Vị trí chức danh yêu cầu
        }

        // Ưu tiên nếu nhân viên phụ trách Lĩnh vực hoặc Phòng ban tương ứng
        if (scopeEmployeeCodes.includes(emp.employeeCode)) {
          matchScore += 30;
        }

        return {
          id: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          fullName: emp.fullName,
          departmentId: emp.departmentId,
          jobTitleId: emp.jobTitleId,
          currentLoad: taskCount,
          performanceScore: kpiScore,
          matchScore: matchScore
        };
      });

      const strategy = query?.strategy || 'LOW_PERFORMANCE';

      // Sắp xếp: Ưu tiên MatchScore trước, sau đó đến Performance/Load
      employeeList.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

        if (strategy === 'HIGH_PERFORMANCE') {
          return b.performanceScore - a.performanceScore || a.currentLoad - b.currentLoad;
        } else if (strategy === 'UNDER_QUOTA') {
          return a.currentLoad - b.currentLoad || b.performanceScore - a.performanceScore;
        } else { // 'LOW_PERFORMANCE'
          return a.performanceScore - b.performanceScore || a.currentLoad - b.currentLoad;
        }
      });

      // Group by department for topDepartments
      const deptMap = new Map<number, { departmentId: number; employeeCount: number; currentLoad: number; performanceScore: number, matchScore: number }>();
      employeeList.forEach(emp => {
        if (!emp.departmentId) return;
        const deptId = emp.departmentId;
        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            departmentId: deptId,
            employeeCount: 0,
            currentLoad: 0,
            performanceScore: 0,
            matchScore: 0
          });
        }
        const dept = deptMap.get(deptId)!;
        dept.employeeCount += 1;
        dept.currentLoad += emp.currentLoad;
        dept.performanceScore += emp.performanceScore;
        dept.matchScore += emp.matchScore;
      });

      const topDepartments = Array.from(deptMap.values()).map(dept => ({
        ...dept,
        currentLoad: dept.currentLoad / dept.employeeCount,
        performanceScore: dept.performanceScore / dept.employeeCount,
        matchScore: dept.matchScore / dept.employeeCount
      }));

      topDepartments.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        if (strategy === 'HIGH_PERFORMANCE') return b.performanceScore - a.performanceScore;
        if (strategy === 'UNDER_QUOTA') return a.currentLoad - b.currentLoad;
        return a.performanceScore - b.performanceScore;
      });

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
    if (action === 'COMPLETE') {
      const raw = await this.prisma.task.findUnique({ where: { id } });
      const tArr = [raw];
      await this.taskSharedService.enrichTasks(tArr);
      const t: any = tArr[0];
      const requiresApproval = t?.assignerCode && t.assignerCode !== t.assigneeCode && t.assignerCode !== 'UNASSIGNED';
      const nextStatus = requiresApproval ? 'PENDING_APPROVAL' : 'DONE';
      return this.updateTaskStatus(id, nextStatus, undefined, body?.currentEmployeeCode, body, action);
    }
    if (action === 'APPROVE') return this.updateTaskStatus(id, 'DONE', undefined, body?.currentEmployeeCode, body, action);
    if (action === 'RETURN') return this.updateTaskStatus(id, 'RETURNED', body?.rejectReason, body?.currentEmployeeCode, body, action);
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

    const { baseScore, weight, scoringMethod, bonusPerDay, penaltyPerDay, kpiCriteriaId, isCrossDomain, crossDomainMultiplier, ...taskData } = updateData;

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
      data: {
        ...taskData,
        ...(Object.keys(kpiData).length > 0 && {
          kpiSettings: {
            upsert: {
              create: kpiData,
              update: kpiData
            }
          }
        })
      },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } },
        kpiSettings: true
      }
    });
    const enriched = await this.taskSharedService.enrichTasks([t]);
    return this.taskSharedService.toTaskResponse(enriched[0]);
  }
  async breakdownTask(id: number, data: any) {
    await this.taskSharedService.populateQueryHierarchy(data);
    const parentTask = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!parentTask) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.taskSharedService.enrichTasks([parentTask]);
    const access = await this.taskSharedService.checkTaskAccess(parentTask, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.taskSharedService.computeAllowedActions(parentTask, data);
    if (!allowedActions.includes('ADD_SUBTASK')) {
      throw new RpcException('Bạn không có quyền phân rã nhiệm vụ này.');
    }

    return this.createSubTask(id, data);
  }
  async addComment(id: number, data: any) {
    await this.taskSharedService.populateQueryHierarchy(data);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.taskSharedService.enrichTasks([t]);
    const access = await this.taskSharedService.checkTaskAccess(t, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.taskSharedService.computeAllowedActions(t, data);
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
          this.notificationClient.emit('send_notification', {
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
    await this.taskSharedService.populateQueryHierarchy(query);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.taskSharedService.enrichTasks([t]);
    const access = await this.taskSharedService.checkTaskAccess(t, query);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.taskSharedService.computeAllowedActions(t, query);
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
  async requestCoordination(id: number, data: any) {
    await this.taskSharedService.populateQueryHierarchy(data);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.taskSharedService.enrichTasks([t]);
    const access = await this.taskSharedService.checkTaskAccess(t, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.taskSharedService.computeAllowedActions(t, data);
    if (!allowedActions.includes('COORDINATE')) {
      throw new RpcException('Bạn không có quyền yêu cầu phối hợp trong công việc này.');
    }

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
            authorCode: requesterCode || null,
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
        const coData: any[] = [];
        coordinatorCodes.forEach((code: string) => {
          coData.push({
            taskId: id,
            employeeCode: code,
            participantRole: TaskRole.COORDINATOR
          });
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

  private async buildScopingWhereClause(query: any): Promise<any | null> {
    const perms = query.currentUserPermissions || [];
    const isAdmin = query.isAdmin || perms.includes('TASK:MANAGE');

    if (isAdmin) {
      return null; // Admin sees everything
    }

    const scopingConditions: any[] = [];

    // 1. Participant check
    if (query.currentEmployeeCode) {
      scopingConditions.push({
        participants: {
          some: {
            employeeCode: query.currentEmployeeCode
          }
        }
      });
      scopingConditions.push({
        creatorEmployeeCode: query.currentEmployeeCode
      });
    }

    // 2. Phân quyền theo Sơ đồ thẩm quyền
    const hasAllowedDepts = query.allowedDepartmentIds && query.allowedDepartmentIds.length > 0;
    const hasAllowedCodes = query.allowedEmployeeCodes && query.allowedEmployeeCodes.length > 0;

    if (hasAllowedDepts || hasAllowedCodes) {
      const leaderOrConditions: any[] = [];
      const allowedDepts = query.allowedDepartmentIds?.map(Number).filter(Boolean) || [];
      const allowedCodes = query.allowedEmployeeCodes || [];

      let allAllowedCodes = [...allowedCodes];

      if (allowedDepts.length > 0) {
        const empsInDepts = await this.prisma.employee.findMany({
          where: { departmentId: { in: allowedDepts } },
          select: { employeeCode: true }
        });
        const deptEmployeeCodes = empsInDepts.map(e => e.employeeCode).filter(Boolean);
        allAllowedCodes = Array.from(new Set([...allAllowedCodes, ...deptEmployeeCodes]));

        leaderOrConditions.push({
          plan: { departmentId: { in: allowedDepts } }
        });
        leaderOrConditions.push({
          monitoredUnitId: { in: allowedDepts }
        });
      }

      const allowedDomains = query.allowedDomainIds?.map(Number).filter(Boolean) || [];
      if (allowedDomains.length > 0) {
        leaderOrConditions.push({
          domainId: { in: allowedDomains }
        });
      }

      if (allAllowedCodes.length > 0) {
        leaderOrConditions.push({
          participants: {
            some: {
              employeeCode: { in: allAllowedCodes },
              participantRole: 'ASSIGNEE'
            }
          }
        });
        leaderOrConditions.push({
          creatorEmployeeCode: { in: allAllowedCodes }
        });
      }

      scopingConditions.push(...leaderOrConditions);
    }

    if (scopingConditions.length > 0) {
      return { OR: scopingConditions };
    }

    // If no scoping conditions can be resolved, prevent any query return
    return { id: -1 };
  }
}
