import { Injectable, Logger } from '@nestjs/common';
import { TaskRole } from '@generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { WorkflowEngine } from '@shared/workflow-core/workflow-engine';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { paginateArray } from '@/utils/pagination.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  /** Shorthand — delegate sang shared cache */
  private async getWorkflowDefinition(workflowId: string): Promise<any> {
    return this.taskSharedService.getWorkflowDefinition(workflowId);
  }

  public invalidateWorkflowCache(workflowId: string, newDefinition?: any) {
    this.taskSharedService.invalidateWorkflowCache(workflowId, newDefinition);
  }

  constructor(
    private prisma: PrismaService,
    private taskSharedService: TaskSharedService,
  ) {}

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

    if (assigneeCode !== 'UNASSIGNED') {
      const assigneeEmp = await this.prisma.employee.findUnique({
        where: { employeeCode: assigneeCode }
      });
      if (!assigneeEmp) {
        throw new RpcException('Người được giao không tồn tại trong hệ thống HRM.');
      }

      if (data.departmentId) {
        if (assigneeEmp.departmentId !== parseInt(data.departmentId, 10)) {
          throw new RpcException('Logic định biên: Người được giao không thuộc phòng ban được chỉ định.');
        }
      }

      if (data.jobTitleId) {
        if (assigneeEmp.jobTitleId !== parseInt(data.jobTitleId, 10)) {
          throw new RpcException('Logic định biên: Người được giao không có chức danh phù hợp.');
        }
      }
    }

    if (assigneeCode !== 'UNASSIGNED' && data.domainId) {
      const assigneeEmp = await this.prisma.employee.findUnique({
        where: { employeeCode: assigneeCode },
        select: { userId: true }
      });
      if (assigneeEmp?.userId) {
        try {
          const subordinatesRes: any = await firstValueFrom(
            this.taskSharedService.userService.GetSubordinates({ userId: assigneeEmp.userId })
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



    // Bắt đầu workflow — Tra cứu workflow động (không hardcode)
    try {
      const workflowCode = await this._resolveWorkflowCode(data, planId, parentId);
      const workflowId = workflowCode
        ? await this.taskSharedService.getWorkflowIdByTrigger(workflowCode)
        : null;

      if (workflowId) {
        const initiatorId = data.currentUserId?.toString() || data.creatorCode || creatorCode || 'system';
        let workflowInst: any = null;

        try {
          workflowInst = await firstValueFrom<any>(
            this.taskSharedService.workflowService.StartWorkflow({
              workflowId,
              initiatorId,
              businessId: t.id.toString(),
              businessType: 'TASK',
              initialContext: {
                taskId: t.id,
                assigneeCode: data.assigneeCode || 'UNASSIGNED',
                assignerCode: creatorCode,
              }
            })
          );
        } catch (wfErr) {
          this.logger.warn('Workflow StartWorkflow failed, falling back to local engine', wfErr);
        }

        const initialNodeId = workflowInst?.currentNodeId || await this._getLocalInitialNodeId(workflowId);

        if (initialNodeId || workflowInst) {
          const metaUpdate: any = {
            ...((t.metadata as any) || {}),
            workflowId,
            workflowCode, // Lưu code để subtask kế thừa không cần hardcode
            currentNodeId: initialNodeId,
          };
          if (workflowInst?.id) {
            metaUpdate.workflowInstId = workflowInst.id;
          }

          await this.prisma.task.update({
            where: { id: t.id },
            data: { metadata: metaUpdate }
          });
          t.metadata = metaUpdate;
        }
      } else {
        // workflowCode được resolve nhưng không tìm thấy trong DB
        this.logger.warn(`Workflow code "${workflowCode ? workflowCode : 'N/A'}" không tìm thấy trong DB. Task ${t.id} không có workflow.`);
      }

    } catch (err) {
      this.logger.error('Failed to init workflow for task ' + t.id, err);
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
        this.taskSharedService.sendTaskNotification(
          [data.assigneeCode],
          `Có công việc mới: ${nodeLabel}`,
          `Bạn vừa được giao nhiệm vụ: "${enrichedTaskResponse.title}"`,
          enrichedTaskResponse
        );
      }

      if (Array.isArray(data.coassigneeCodes) && data.coassigneeCodes.length > 0) {
        this.taskSharedService.sendTaskNotification(
          data.coassigneeCodes,
          `Có công việc phối hợp mới: ${nodeLabel}`,
          `Bạn được phân công phối hợp thực hiện nhiệm vụ: "${enrichedTaskResponse.title}"`,
          enrichedTaskResponse
        );
      }

      if (data.monitoredUnitId) {
        try {
          const monitorsRes: any = await firstValueFrom(
            this.taskSharedService.userService.GetEmployeesByScope({ monitored_unit_id: parseInt(data.monitoredUnitId, 10) })
          );
          const followerCodes = monitorsRes?.employeeCodes || monitorsRes?.employee_codes || [];
          if (followerCodes.length > 0) {
            this.taskSharedService.sendTaskNotification(
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


  /**
   * Tra cứu workflow code theo thứ tự ưu tiên — KHÔNG hardcode bất kỳ string nào.
   * 1. data.workflowCode — caller truyền rõ ràng (ưu tiên cao nhất)
   * 2. plan.metadata.workflowCode — kế hoạch đã cấu hình workflow riêng
   * 3. parent task metadata.workflowCode — subtask kế thừa từ task cha
   * 4. null — không có workflow, dùng local fallback engine
   */
  private async _resolveWorkflowCode(data: any, planId: any, parentId: any): Promise<string | null> {
    // 1. Caller truyền rõ ràng
    if (data.workflowCode) return data.workflowCode;

    // 2. Từ kế hoạch (MasterPlan)
    if (planId) {
      try {
        const plan = await this.prisma.masterPlan.findUnique({
          where: { id: parseInt(planId.toString(), 10) }
        }) as any;
        const planMeta = plan?.metadata;
        if (planMeta?.workflowCode) return planMeta.workflowCode;
      } catch (_e) { }
    }

    // 3. Từ task cha (subtask kế thừa workflow của cha)
    if (parentId) {
      try {
        const parent = await this.prisma.task.findUnique({
          where: { id: parseInt(parentId.toString(), 10) },
          select: { metadata: true }
        });
        const parentMeta = parent?.metadata as any;
        if (parentMeta?.workflowCode) return parentMeta.workflowCode;
      } catch (_e) { }
    }

    // 4. Default: luôn dùng workflow xử lý công việc chung (không hardcode ID, dùng code)
    return 'TASK_PROCESSING_ID';
  }


  private async _getLocalInitialNodeId(workflowId: string): Promise<string | null> {

    try {
      const definition = await this.getWorkflowDefinition(workflowId);
      if (definition) {
        const engine = new WorkflowEngine(definition);
        return engine.getInitialNodeId() || null;
      }
    } catch (err) {
      this.logger.warn('_getLocalInitialNodeId failed for ' + workflowId, err);
    }
    return null;
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any, actionNameForWorkflow?: string) {

    if (context) await this.taskSharedService.populateQueryHierarchy(context);
    const rawTask = await this.prisma.task.findUnique({ where: { id } });
    if (!rawTask) throw new RpcException('Nhiệm vụ không tồn tại');

    const actualActorCode = actorCode || context?.currentEmployeeCode;
    const actionName = actionNameForWorkflow || status;

    const tCheckArr = [rawTask];
    await this.taskSharedService.enrichTasks(tCheckArr);
    const tCheck: any = tCheckArr[0];

    const metadata = (rawTask.metadata as any) || {};
    const activeWorkflowId = metadata.workflowId || rawTask.workflowInstId;

    // --- Tải workflow engine 1 lần duy nhất ---
    let engine: WorkflowEngine | null = null;
    if (activeWorkflowId) {
      const definition = await this.getWorkflowDefinition(activeWorkflowId);
      if (definition) engine = new WorkflowEngine(definition);
    }

    // --- Validate + nhảy bước ---
    let nextNodeIdToSave: string | undefined = undefined;
    if (engine && metadata.currentNodeId) {
      try {
        const childrenCount = await this.prisma.taskClosure.count({ where: { ancestorId: rawTask.id, depth: 1 } });
        const queryContext = { ...context, currentEmployeeCode: actualActorCode, currentUserId: context?.currentUserId };
        const access = await this.taskSharedService.checkTaskAccess(tCheck, queryContext);

        const businessData = {
          status: rawTask.status,
          hasChildren: childrenCount > 0,
          isOwner: access.isOwner,
          isAssignee: access.isAssignee,
          isSupervisor: access.isSupervisor,
          isCoordinator: access.isCoordinator,
          isDeptLeader: access.isDeptLeader,
          isLowestLevel: access.isLowestLevel,
          allowedEmployeeCodes: context?.allowedEmployeeCodes || [],
        };

        const validateRes = engine.validateAction(
          metadata.currentNodeId, actionName, context?.currentUserPermissions || [], actualActorCode, businessData
        );
        if (!validateRes.allowed) {
          const reasonMsg = validateRes.reason ? ` (${validateRes.reason})` : '';
          throw new RpcException(`Workflow không cho phép thực hiện hành động ${actionName}${reasonMsg}.`);
        }

        const nextNodeId = engine.getNextNodeId(metadata.currentNodeId, actionName, { ...businessData, actionName });
        if (nextNodeId) nextNodeIdToSave = nextNodeId;
      } catch (err) {
        if (err instanceof RpcException) throw err;
        this.logger.error('Lỗi tính toán ValidateAction qua local engine', err);
      }
    }

    // --- Đọc node tiếp theo ---
    let targetStatus = status;
    let nextNodeData: any = null;
    if (nextNodeIdToSave && engine) {
      const nextNode = engine.getNode(nextNodeIdToSave);
      if (nextNode?.data) {
        nextNodeData = nextNode.data;
        targetStatus = nextNodeData.targetStatus || nextNodeIdToSave;
      }
    }

    // --- Gửi thông báo phê duyệt khi COMPLETE → node approvalRequired ---
    if (nextNodeData?.approvalRequired && actionName === 'COMPLETE') {
      try {
        const ownerParticipant = await this.prisma.taskParticipant.findFirst({
          where: { taskId: id, participantRole: 'OWNER' }, select: { employeeCode: true }
        });
        const approverCode = ownerParticipant?.employeeCode || tCheck.creatorEmployeeCode || tCheck.assignerCode;
        if (approverCode && approverCode !== actualActorCode) {
          const [approverEmp, assigneeEmp] = await Promise.all([
            this.prisma.employee.findUnique({ where: { employeeCode: approverCode }, select: { userId: true } }),
            this.prisma.employee.findUnique({ where: { employeeCode: tCheck.assigneeCode }, select: { fullName: true } }),
          ]);
          if (approverEmp?.userId) {
            const tmpl = nextNodeData.approvalNotificationTemplate;
            const notifMsg = tmpl
              ? tmpl.replace(/\{\{assigneeName\}\}/g, assigneeEmp?.fullName || tCheck.assigneeCode)
                .replace(/\{\{taskTitle\}\}/g, tCheck.title || '')
              : `${assigneeEmp?.fullName || tCheck.assigneeCode} đã hoàn thành "${tCheck.title}". Vui lòng kiểm tra và phê duyệt.`;
            this.taskSharedService.sendTaskNotification([approverEmp.userId], 'Yêu cầu phê duyệt kết quả công việc', notifMsg, { id, metadata: tCheck.metadata });
          }
        }
      } catch (e) {
        this.logger.error('Lỗi gửi thông báo phê duyệt', e);
      }
    }

    // --- Cập nhật DB ---
    const dataToUpdate: any = { status: targetStatus };
    if (rejectReason !== undefined) dataToUpdate.rejectReason = rejectReason;
    if (targetStatus === 'DONE' || targetStatus === 'COMPLETED') dataToUpdate.completedAt = new Date();
    if (nextNodeIdToSave) {
      dataToUpdate.metadata = { ...((rawTask.metadata as any) || {}), currentNodeId: nextNodeIdToSave };

      // Dynamic Assignment via engine
      if (engine && nextNodeData) {
        try {
          const currentAssignee = (rawTask as any).participants?.find((p: any) => p.participantRole === 'ASSIGNEE')?.employeeCode;
          const currentOwner = (rawTask as any).participants?.find((p: any) => p.participantRole === 'OWNER')?.employeeCode;
          const newAssignees = engine.resolveAssignments(nextNodeIdToSave, {
            creatorCode: rawTask.creatorEmployeeCode, assignerCode: currentOwner,
            assigneeCode: currentAssignee, currentActorCode: actualActorCode,
            status: rawTask.status, targetStatus, taskContext: context
          });
          if (Array.isArray(newAssignees) && newAssignees.length > 0) {
            await this.prisma.taskParticipant.upsert({
              where: { taskId_employeeCode_participantRole: { taskId: id, employeeCode: newAssignees[0], participantRole: 'ASSIGNEE' } },
              update: {},
              create: { taskId: id, employeeCode: newAssignees[0], participantRole: 'ASSIGNEE' }
            });
            this.logger.log(`Workflow dynamically assigned task ${id} to ${newAssignees[0]}`);
          }
        } catch (e) { this.logger.error('Error resolving dynamic assignments', e); }
      }
    }

    await this.prisma.task.update({ where: { id }, data: dataToUpdate, include: { participants: true } });

    if (rejectReason && (targetStatus === 'RETURNED' || nextNodeData?.sideEffects?.includes('RETURN_TASK'))) {
      await this.prisma.taskComment.create({
        data: { taskId: id, authorCode: actualActorCode || null, content: `Đã trả lại công việc với lý do: ${rejectReason}`, isSystemMessage: true }
      });
    }

    if (nextNodeData?.autoProgress !== undefined) {
      await this.updateTaskProgress(id, nextNodeData.autoProgress, actualActorCode);
    } else if (targetStatus === 'DONE') {
      await this.updateTaskProgress(id, 100, actualActorCode);
    }

    // --- Side Effects ---
    if (nextNodeIdToSave && engine) {
      try {
        const sideEffects = engine.evaluateSideEffects(nextNodeIdToSave);
        for (const effect of sideEffects || []) {
          this.logger.log(`Executing side effect ${effect.type} on task ${id}`);
          if (effect.type === 'WEBHOOK' && effect.url) {
            this.logger.log(`Simulating Webhook to ${effect.url}`);
          }
        }
      } catch (e) { this.logger.error('Error executing side effects', e); }
    }

    // --- Gửi thông báo workflow tự động ---
    if (nextNodeIdToSave && engine && nextNodeData?.sendNotification) {
      try {
        let title = `Có cập nhật: ${nextNodeData.label || ''}`;
        let message = `Công việc "${tCheck.title}" đã chuyển sang bước: ${nextNodeData.label || ''}. ${nextNodeData.description || ''}`;
        let recipientCodes: string[] = [];

        if (nextNodeData.notification) {
          const cfg = nextNodeData.notification;
          title = cfg.title || title;
          message = cfg.template ? cfg.template.replace('{{taskTitle}}', `"${tCheck.title}"`) : message;

          // Ánh xạ khai báo (không dùng eval): key → giá trị thực từ task
          if (cfg.recipients && Array.isArray(cfg.recipients)) {
            // cfg.recipients: mảng key như ['assigneeCode', 'assignerCode']
            const roleMap: Record<string, string | string[]> = {
              assigneeCode: tCheck.assigneeCode,
              assignerCode: tCheck.assignerCode,
              creatorEmployeeCode: tCheck.creatorEmployeeCode,
              supervisorCode: tCheck.supervisorCode,
              coordinatorCodes: tCheck.coassigneeCodes || [],
            };
            for (const key of cfg.recipients) {
              const val = roleMap[key];
              if (Array.isArray(val)) recipientCodes.push(...val);
              else if (val) recipientCodes.push(val);
            }
          }
        } else {
          title = `Có công việc cần xử lý: ${nextNodeData.label || ''}`;
          message = `Công việc "${tCheck.title}" vừa được chuyển đến bước: ${nextNodeData.label || ''}. Vui lòng kiểm tra và xử lý.`;
          if (nextNodeData.role === 'MANAGER') {
            recipientCodes.push(tCheck.supervisorCode, tCheck.assignerCode, tCheck.creatorEmployeeCode);
          } else {
            recipientCodes.push(tCheck.assigneeCode);
          }
        }

        const uniqueCodes = [...new Set(recipientCodes.filter(c => c && c !== actualActorCode))];
        // Lookup userId batch rồi gửi 1 lần qua shared
        const recipientEmps = await this.prisma.employee.findMany({
          where: { employeeCode: { in: uniqueCodes } },
          select: { userId: true }
        });
        const recipientUserIds = recipientEmps.map(e => e.userId).filter(Boolean) as string[];
        if (recipientUserIds.length > 0) {
          this.taskSharedService.sendTaskNotification(recipientUserIds, title, message, { id, metadata: tCheck.metadata });
        }
      } catch (err) { this.logger.error('Lỗi khi gửi thông báo tự động từ Workflow', err); }
    }

    const updatedTask = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true } }, kpiSettings: true }
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
            // Bypass for structural roles to ensure they can always delegate tasks
            if (access.isOwner || access.isAdmin || access.isDeptLeader) {
              this.logger.debug(`Bypassed ASSIGN workflow validation for ${context?.currentEmployeeCode} due to having structural role.`);
            } else {
              this.logger.error(`Validate Action blocked ASSIGN: ${validateRes.reason}, businessData: ${JSON.stringify({ isOwner: access.isOwner, creator: tCheckArr[0]?.creatorEmployeeCode, current: context?.currentEmployeeCode })}`);
              throw new RpcException(`Workflow không cho phép thực hiện hành động phân công/giao việc.`);
            }
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
      this.taskSharedService.sendTaskNotification(
        [data.assigneeCode],
        'Có công việc mới được giao',
        `Bạn vừa được phân công phụ trách nhiệm vụ: "${enrichedTaskResponse.title}"`,
        enrichedTaskResponse
      );
    }

    if (Array.isArray(data.coassigneeCodes) && data.coassigneeCodes.length > 0) {
      this.taskSharedService.sendTaskNotification(
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
            this.taskSharedService.userService.GetSubordinates({ userId: query.currentUserId })
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
            this.taskSharedService.userService.GetEmployeesByScope({ domainId: targetDomainId || 0, monitoredUnitId: targetMonitoredUnitId || 0 })
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

        const userIds = mentionedEmployees.map(e => e.userId).filter(Boolean) as string[];

        if (userIds.length > 0) {
          const actorName = emp?.fullName || actorCode;
          this.taskSharedService.sendTaskNotification(
            userIds,
            'Bạn được nhắc đến trong bình luận',
            `${actorName} đã nhắc đến bạn trong bình luận của công việc "${t.title}"`,
            t
          );
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
}

