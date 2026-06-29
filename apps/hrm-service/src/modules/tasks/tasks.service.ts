import { Injectable, Inject } from '@nestjs/common';
import { TaskRole } from '@generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TasksService.name);
  private userService: any;
  private workflowService: any;
  private scanInterval: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject('USER_PACKAGE') private userClient: any,
    @Inject('WORKFLOW_PACKAGE') private workflowClient: any,
  ) { }

  onModuleInit() {
    this.userService = this.userClient.getService('UserService');
    this.workflowService = this.workflowClient.getService('WorkflowService');
    this.startDueTaskScanner();
  }

  onModuleDestroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
  }

  private parseParticipants(participants: any[]) {
    if (!participants) return { owner: null, assignee: null, approver: null, coordinators: [] };

    const owner = participants.find(p => p.participantRole === TaskRole.OWNER)?.employeeCode || null;
    const assignee = participants.find(p => p.participantRole === TaskRole.ASSIGNEE)?.employeeCode || null;
    const approver = participants.find(p => p.participantRole === TaskRole.APPROVER)?.employeeCode || null;

    const coordinators = participants
      .filter(p => p.participantRole === TaskRole.COORDINATOR)
      .map(p => p.employeeCode)
      .filter(Boolean);

    return { owner, assignee, approver, coordinators };
  }

  private async enrichTasks(tasks: any[]) {
    if (!tasks || tasks.length === 0) return tasks;

    const empCodes = new Set<string>();
    const collectCodes = (t: any) => {
      if (t.participants) {
        t.participants.forEach((p: any) => {
          if (p.employeeCode) empCodes.add(p.employeeCode);
        });
      }
      if (t.creatorEmployeeCode) {
        empCodes.add(t.creatorEmployeeCode);
      }
      if (t.children) t.children.forEach(collectCodes);
    };
    tasks.forEach(collectCodes);

    const empCodesArray = Array.from(empCodes).filter(Boolean);
    const employeeMap = new Map<string, string>(); // employeeCode -> fullName

    if (empCodesArray.length > 0) {
      const employees = await this.prisma.employee.findMany({
        where: { employeeCode: { in: empCodesArray } },
        select: { employeeCode: true, fullName: true }
      });
      employees.forEach(emp => {
        employeeMap.set(emp.employeeCode, emp.fullName);
      });
    }

    const mapNames = (t: any) => {
      let creatorCode = t.creatorEmployeeCode;

      if (creatorCode) {
        t.creatorEmployeeCode = creatorCode; // ensure it is set
        t.creatorName = employeeMap.get(creatorCode) || creatorCode;
      } else {
        t.creatorEmployeeCode = 'SYSTEM';
        t.creatorName = 'SYSTEM';
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
        t.coassigneeNames = (coordinators || []).map((code: string) => employeeMap.get(code) || code);
      } else {
        t.assignerName = t.creatorName || '';
      }
      if (t.children) t.children.forEach(mapNames);
    };
    tasks.forEach(mapNames);

    return tasks;
  }




  private async populateQueryHierarchy(query: any) {

    // Lấy sơ đồ thẩm quyền trực tiếp từ user-service
    if (!query.isAdmin && query.currentUserId) {
      try {
        const subordinatesRes: any = await firstValueFrom(
          this.userService.GetSubordinates({ userId: query.currentUserId })
        );
        query.allowedDepartmentIds = subordinatesRes?.allowedDepartmentIds || subordinatesRes?.allowed_department_ids || [];
        query.allowedEmployeeCodes = subordinatesRes?.allowedEmployeeCodes || subordinatesRes?.allowed_employee_codes || [];
        console.log('[DEBUG HRM] GetSubordinates response:', JSON.stringify(subordinatesRes));
        console.log('[DEBUG HRM] Allowed Depts:', query.allowedDepartmentIds);
        console.log('[DEBUG HRM] Allowed Codes:', query.allowedEmployeeCodes);
      } catch (e) {
        console.error('[DEBUG HRM] Failed to get subordinates in hrm-service:', e);
      }
    }
  }

  private async checkTaskAccess(t: any, query: any): Promise<{
    hasAccess: boolean;
    isAdmin: boolean;
    isOwner: boolean;
    isAssignee: boolean;
    isSupervisor: boolean;
    isCoordinator: boolean;
    isDeptLeader: boolean;
  }> {
    if (!query) {
      return {
        hasAccess: true,
        isAdmin: true,
        isOwner: true,
        isAssignee: true,
        isSupervisor: true,
        isCoordinator: true,
        isDeptLeader: true,
      };
    }

    const perms = query.currentUserPermissions || [];
    const isAdmin = query.isAdmin || perms.includes('TASK:MANAGE');
    const currentEmployeeCode = query.currentEmployeeCode;

    if (!currentEmployeeCode) {
      return {
        hasAccess: isAdmin, // If they are admin, they have access, but no direct roles
        isAdmin,
        isOwner: false,
        isAssignee: false,
        isSupervisor: false,
        isCoordinator: false,
        isDeptLeader: false,
      };
    }

    const isOwner = t.assignerCode === currentEmployeeCode || t.creatorEmployeeCode === currentEmployeeCode;
    const isAssignee = t.assigneeCode === currentEmployeeCode;
    const isSupervisor = t.supervisorCode === currentEmployeeCode;
    const isCoordinator = Array.isArray(t.coassigneeCodes) && t.coassigneeCodes.includes(currentEmployeeCode);

    let isDeptLeader = false;
    const isLeader = query.isLeader || perms.includes('TASK.ASSIGN') || perms.includes('TASK.*');

    if (query.allowedDomainIds?.length > 0) {
      const allowedDomains = query.allowedDomainIds.map(Number).filter(Boolean);
      if (t.domainId && allowedDomains.includes(Number(t.domainId))) {
        isDeptLeader = true;
      }
    }

    if (query.allowedDepartmentIds?.length > 0 || query.allowedEmployeeCodes?.length > 0) {
      const allowedDepts = query.allowedDepartmentIds?.map(Number).filter(Boolean) || [];
      const allowedCodes = query.allowedEmployeeCodes || [];

      if (t.plan?.departmentId && allowedDepts.includes(Number(t.plan.departmentId))) {
        isDeptLeader = true;
      } else if (t.monitoredUnitId && allowedDepts.includes(Number(t.monitoredUnitId))) {
        isDeptLeader = true;
      } else {
        const assigneeCode = t.assigneeCode;
        if (assigneeCode && allowedCodes.includes(assigneeCode)) {
          isDeptLeader = true;
        } else if (assigneeCode && assigneeCode !== 'UNASSIGNED') {
          const assigneeEmp = await this.prisma.employee.findUnique({
            where: { employeeCode: assigneeCode },
            select: { departmentId: true }
          });
          if (assigneeEmp?.departmentId && allowedDepts.includes(Number(assigneeEmp.departmentId))) {
            isDeptLeader = true;
          }
        }
      }
    }
    const hasAccess = isAdmin || isOwner || isAssignee || isSupervisor || isCoordinator || isDeptLeader;

    return {
      hasAccess,
      isAdmin,
      isOwner,
      isAssignee,
      isSupervisor,
      isCoordinator,
      isDeptLeader,
    };
  }

  private async computeAllowedActions(t: any, query: any): Promise<string[]> {
    const access = await this.checkTaskAccess(t, query);
    if (!access.hasAccess) {
      return [];
    }

    let hasChildren = false;
    if (t.children && t.children.length > 0) {
      hasChildren = true;
    } else if (t._count && typeof t._count.children === 'number') {
      hasChildren = t._count.children > 0;
    } else {
      const childrenCount = await this.prisma.taskClosure.count({ where: { ancestorId: t.id, depth: 1 } });
      hasChildren = childrenCount > 0;
    }

    let isTreeParticipant = access.isOwner || access.isAssignee || access.isSupervisor || access.isCoordinator;

    if (!isTreeParticipant && access.isDeptLeader) {
      const closures = await this.prisma.taskClosure.findMany({
        where: {
          OR: [
            { descendantId: t.id },
            { ancestorId: t.id }
          ]
        },
        select: { ancestorId: true, descendantId: true }
      });
      const relatedTaskIds = new Set<number>();
      closures.forEach(c => {
        if (c.ancestorId !== t.id) relatedTaskIds.add(c.ancestorId);
        if (c.descendantId !== t.id) relatedTaskIds.add(c.descendantId);
      });

      if (relatedTaskIds.size > 0) {
        const relatedTasks = await this.prisma.task.findMany({
          where: { id: { in: Array.from(relatedTaskIds) } },
          include: { participants: true }
        });
        await this.enrichTasks(relatedTasks);
        for (const relT of relatedTasks as any[]) {
          if (
            relT.assignerCode === query.currentEmployeeCode ||
            relT.creatorEmployeeCode === query.currentEmployeeCode ||
            relT.assigneeCode === query.currentEmployeeCode ||
            relT.supervisorCode === query.currentEmployeeCode ||
            (Array.isArray(relT.coassigneeCodes) && relT.coassigneeCodes.includes(query.currentEmployeeCode))
          ) {
            isTreeParticipant = true;
            break;
          }
        }
      }
    }

    let actions: string[] = [];

    // Tích hợp Workflow để lấy Allowed Actions
    if (t.workflowInstId && this.workflowService) {
      try {
        const allowedRes = await firstValueFrom<any>(this.workflowService.GetAllowedActions({
          instanceId: t.workflowInstId,
          userRoles: query.currentUserPermissions || [],
          userId: query.currentEmployeeCode,
          businessData: {
            status: t.status,
            hasChildren,
            isOwner: access.isOwner,
            isAssignee: access.isAssignee,
            isSupervisor: access.isSupervisor,
            isCoordinator: access.isCoordinator,
            isDeptLeader: access.isDeptLeader,
          }
        }));
        if (allowedRes && allowedRes.allowedActions) {
          actions = allowedRes.allowedActions;
        }
      } catch (err) {
        this.logger.error('Failed to get allowed actions from workflow for task ' + t.id, err);
      }
      
      // Vẫn giữ lại các action nội bộ không thuộc quy trình workflow như EDIT, DELETE, CHAT
      if (access.isOwner && !actions.includes('EDIT')) actions.push('EDIT', 'DELETE', 'ADD_SUBTASK');
      if (!actions.includes('CHAT')) actions.push('CHAT');
    } else {
      // Fallback cho task cũ không có workflow
      if (access.isOwner) {
        actions.push('EDIT', 'ASSIGN', 'ADD_SUBTASK', 'DELETE', 'CHAT');
        if (t.status === 'PENDING_APPROVAL') {
          actions.push('APPROVE', 'RETURN');
        }
      }

      if (access.isAssignee) {
        actions.push('ADD_SUBTASK', 'CHAT');
        if (!hasChildren && t.status !== 'PENDING_APPROVAL') actions.push('COMPLETE', 'COORDINATE');
      }

      if (access.isSupervisor || access.isDeptLeader) {
        actions.push('CHAT');
        if (!hasChildren && t.status !== 'PENDING_APPROVAL') actions.push('COMPLETE', 'RETURN');
        if (t.status === 'PENDING_APPROVAL') actions.push('APPROVE', 'RETURN');
      }

      if (access.isCoordinator) {
        actions.push('CHAT');
      }

      if (actions.length === 0 && (access.isAdmin || (access.isDeptLeader && isTreeParticipant))) {
        actions.push('CHAT');
      }
    }

    return Array.from(new Set(actions));
  }

  private toTaskResponse(t: any): any {
    if (!t) return null;
    return {
      id: t.id ?? 0,
      title: t.title ?? '',
      description: t.description ?? '',
      assigneeCode: t.assigneeCode ?? '',
      assignerCode: t.assignerCode ?? '',
      status: t.status ?? '',
      dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : (t.dueDate || ''),
      startDate: t.startDate instanceof Date ? t.startDate.toISOString() : (t.startDate || ''),
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : (t.createdAt || ''),
      updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : (t.updatedAt || ''),
      baseScore: t.baseScore ?? 0,
      weight: t.weight ?? 0,
      scoringMethod: t.scoringMethod ?? '',
      bonusPerDay: t.bonusPerDay ?? 0,
      penaltyPerDay: t.penaltyPerDay ?? 0,
      supervisorCode: t.supervisorCode ?? '',
      planId: t.planId ?? 0,
      assigneeName: t.assigneeName ?? '',
      departmentId: t.departmentId ?? 0,
      parentId: t.parentId ?? 0,
      rejectReason: t.rejectReason ?? '',
      assignerName: t.assignerName ?? '',
      priority: t.priority ?? '',
      supervisorName: t.supervisorName ?? '',
      coassigneeCodes: t.coassigneeCodes || [],
      allowedActions: t.allowedActions || [],
      plan: t.plan ? { id: t.plan.id ?? 0, title: t.plan.title ?? '' } : undefined,
      rootTaskId: t.rootTaskId ?? 0,
      progress: t.progress ?? 0,
      coassigneeNames: t.coassigneeNames || [],
      children: Array.isArray(t.children) ? t.children.map((child: any) => this.toTaskResponse(child)) : [],
    };
  }

  private toDelegationNode(t: any): any {
    if (!t) return null;
    return {
      id: t.id ?? 0,
      title: t.title ?? '',
      status: t.status ?? '',
      priority: t.priority ?? '',
      assigneeCode: t.assigneeCode ?? '',
      assigneeName: t.assigneeName ?? '',
      assignerCode: t.assignerCode ?? '',
      assignerName: t.assignerName ?? '',
      departmentId: t.departmentId ?? 0,
      parentId: t.parentId ?? 0,
      dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : (t.dueDate || ''),
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : (t.createdAt || ''),
      isParent: t.isParent ?? false,
      isCurrent: t.isCurrent ?? false,
      isChild: t.isChild ?? false,
      isGrandChild: t.isGrandChild ?? false,
      level: t.level ?? 0,
      allowedActions: t.allowedActions || [],
      description: t.description ?? '',
      supervisorCode: t.supervisorCode ?? '',
      supervisorName: t.supervisorName ?? '',
      coassigneeCodes: t.coassigneeCodes || [],
      planId: t.planId ?? 0,
      plan: t.plan ? { id: t.plan.id ?? 0, title: t.plan.title ?? '' } : undefined,
      rootTaskId: t.rootTaskId ?? 0,
    };
  }

  async listTasks(query: any) {
    await this.populateQueryHierarchy(query);
    const where: any = {};

    const conditions: any[] = [];

    // Default status filter
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    } else {
      where.status = { not: 'TEMPLATE' };
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
                  employeeCode: 'UNASSIGNED',
                  participantRole: TaskRole.ASSIGNEE
                }
              }
            }
          ]
        });
      } else {
        conditions.push({
          participants: {
            some: {
              employeeCode: query.assigneeCode,
              participantRole: query.isSupervisor ? TaskRole.APPROVER : TaskRole.ASSIGNEE
            }
          }
        });
      }
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
    const perms = query.currentUserPermissions || [];
    const isAdmin = query.isAdmin || perms.includes('TASK:MANAGE');

    if (!isAdmin) {
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

      // 2. Phân quyền theo Sơ đồ thẩm quyền (từ user-service)
      const isLeader = query.isLeader || perms.includes('TASK.ASSIGN') || perms.includes('TASK.*');
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
        console.log('[DEBUG HRM] Applied Scoping Conditions:', JSON.stringify(scopingConditions));
        conditions.push({
          OR: scopingConditions
        });
      } else {
        console.log('[DEBUG HRM] NO SCOPING CONDITIONS. Returning empty data.');
        // If no scoping conditions can be resolved, prevent any query return
        conditions.push({ id: -1 });
      }
    }

    console.log('[DEBUG HRM] Final Prisma Where Conditions:', JSON.stringify(conditions));

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
    const skip = (page - 1) * limit;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(now.getDate() + 3);

    // Apply statsFilter range conditions
    if (query.statsFilter) {
      if (query.statsFilter === 'overdue') {
        where.status = { not: 'DONE' };
        where.dueDate = { lt: now };
      } else if (query.statsFilter === 'warning') {
        where.status = { not: 'DONE' };
        where.dueDate = { gte: now, lte: threeDaysLater };
      } else if (query.statsFilter === 'inTime') {
        where.status = { not: 'DONE' };
        // dueDate can be greater than threeDaysLater, or null
        where.OR = [
          { dueDate: { gt: threeDaysLater } },
          { dueDate: null }
        ];
      } else if (query.statsFilter === 'doneInTime') {
        where.status = 'DONE';
      } else if (query.statsFilter === 'doneOverdue') {
        where.status = 'DONE';
      }
    }

    let finalWhere = { ...where };

    const [total, tasks] = await Promise.all([
      this.prisma.task.count({ where: finalWhere }),
      this.prisma.task.findMany({
        where: finalWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          participants: true,
          plan: { select: { id: true, title: true, createdByCode: true } },
          _count: { select: { descendants: true } }
        }
      })
    ]);

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

    console.log('[DEBUG HRM] PRISMA TASKS RETURNED:', finalTasks.length, 'TOTAL:', total);

    const enrichedTasks = await this.enrichTasks(finalTasks);

    const mappedTasks = await Promise.all(enrichedTasks.map(async (t: any) => {
      const allowedActions = await this.computeAllowedActions(t, query);

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

    const finalData = roots.map(t => this.toTaskResponse(t));
    console.log('[DEBUG HRM] FINAL DATA LENGTH TO RETURN:', finalData.length);

    return {
      success: true,
      message: 'Lấy danh sách nhiệm vụ thành công',
      data: finalData,
      meta: {
        pagination: {
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  }

  async getTaskStats(query: any) {
    console.log('[DEBUG HRM] getTaskStats with Query:', JSON.stringify(query));

    const where: any = {
      ...(query.assigneeCode ? { assigneeCode: query.assigneeCode } : {}),
    };

    if (query.role === 'UNASSIGNED') {
      where.assigneeCode = 'UNASSIGNED';
    } else if (query.role === 'ASSIGNEE') {
      where.assigneeCode = query.assigneeCode || undefined;
    } else if (query.role === 'OWNER') {
      where.assignerCode = query.assignerCode || undefined;
    }

    if (query.departmentId) {
      where.departmentId = parseInt(query.departmentId, 10);
    }

    if (!query.role || query.role === 'ALL') {
      const conditions: any[] = [];
      const scopingConditions: any[] = [];

      const adminOrLeaderConditions: any[] = [];
      if (query.isAdmin || query.isLeader) {
        if (query.departmentId) {
          adminOrLeaderConditions.push({ departmentId: parseInt(query.departmentId, 10) });
        } else {
          adminOrLeaderConditions.push({}); // Full access or global view based on original logic
        }
      }

      if (adminOrLeaderConditions.length > 0) {
        scopingConditions.push(...adminOrLeaderConditions);
      } else if (query.currentEmployeeCode) {
        const leaderOrConditions: any[] = [
          { assignerCode: query.currentEmployeeCode },
          { assigneeCode: query.currentEmployeeCode },
          { participants: { some: { employeeCode: query.currentEmployeeCode } } }
        ];

        if (query.currentUserDept && query.isSupervisor) {
          leaderOrConditions.push({ departmentId: query.currentUserDept });
        }
        scopingConditions.push(...leaderOrConditions);
      }

      if (scopingConditions.length > 0) {
        conditions.push({ OR: scopingConditions });
      } else {
        conditions.push({ id: -1 });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }
    }

    if (query.search) where.title = { contains: query.search };
    if (query.priority && query.priority !== 'ALL') where.priority = query.priority;

    if (query.planId) {
      where.planId = parseInt(query.planId, 10);
      delete where.status;
    }

    console.log('[DEBUG HRM] Final Prisma Where Conditions (Stats):', JSON.stringify(where));

    const allStatsTasks = await this.prisma.task.findMany({
      where,
      select: { status: true, dueDate: true, completedAt: true, updatedAt: true }
    });

    let overdue = 0, warning = 0, inTime = 0, doneInTime = 0, doneOverdue = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    allStatsTasks.forEach((t: any) => {
      const due = t.dueDate ? new Date(t.dueDate) : null;
      if (due) due.setHours(0, 0, 0, 0);

      if (t.status === 'DONE') {
        const completedDate = new Date(t.completedAt || t.updatedAt || Date.now());
        completedDate.setHours(0, 0, 0, 0);
        if (due && completedDate > due) {
          doneOverdue++;
        } else {
          doneInTime++;
        }
      } else {
        if (!due) { inTime++; }
        else {
          const diff = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
          if (diff < 0) overdue++;
          else if (diff <= 3) warning++;
          else inTime++;
        }
      }
    });

    return {
      success: true,
      message: 'Lấy thống kê nhiệm vụ thành công',
      data: { overdue, warning, inTime, doneInTime, doneOverdue }
    };
  }

  async createTask(data: any) {
    console.log('[DEBUG HRM] CREATE TASK PAYLOAD:', JSON.stringify(data));
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
          creatorEmployeeCode: creatorCode,
          planId,
          domainId: data.domainId ? parseInt(data.domainId, 10) : null,
          monitoredUnitId: data.monitoredUnitId ? parseInt(data.monitoredUnitId, 10) : null
        }
      });

      // Tạo participants
      const participantsData: any[] = [];
      const assigneeCode = data.assigneeCode || 'UNASSIGNED';
      if (assigneeCode) {
        participantsData.push({ taskId: newTask.id, employeeCode: assigneeCode, participantRole: TaskRole.ASSIGNEE });
      }

      const assignerCode = data.assignerCode || 'UNASSIGNED';
      if (assignerCode) {
        participantsData.push({ taskId: newTask.id, employeeCode: assignerCode, participantRole: TaskRole.OWNER });
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



    // Bắt đầu workflow cho Task
    try {
      if (this.workflowService) {
        const startWorkflowRes = await firstValueFrom<any>(this.workflowService.StartWorkflow({
          workflowId: 'TASK_PROCESSING_ID',
          initiatorId: creatorCode,
          businessId: t.id.toString(),
          businessType: 'TASK',
          initialContext: {
            assigneeId: data.assigneeCode,
            reviewerId: data.supervisorCode,
            requiresApproval: !!data.supervisorCode
          }
        }));
        if (startWorkflowRes && startWorkflowRes.id) {
          await this.prisma.task.update({
            where: { id: t.id },
            data: { workflowInstId: startWorkflowRes.id }
          });
          t.workflowInstId = startWorkflowRes.id;
        }
      }
    } catch (err) {
      this.logger.error('Failed to start workflow for task ' + t.id, err);
    }

    const createdTask = await this.prisma.task.findUnique({
      where: { id: t.id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });

    const enriched = await this.enrichTasks([createdTask]);
    const enrichedTask = enriched[0];
    const enrichedTaskResponse = this.toTaskResponse(enrichedTask);

    if (data.assigneeCode) {
      try {
        this.notificationClient.emit('send_notification', {
          channel: 'console',
          recipient: data.assigneeCode,
          subject: 'Có công việc mới được giao',
          body: `Bạn vừa được giao nhiệm vụ: "${enrichedTaskResponse.title}"`
        });
      } catch (e) {
        console.error('Failed to send in-app notification', e);
      }
    }

    return enrichedTaskResponse;
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any, actionNameForWorkflow?: string) {
    if (context) await this.populateQueryHierarchy(context);
    const rawTask = await this.prisma.task.findUnique({ where: { id } });
    if (!rawTask) throw new RpcException('Nhiệm vụ không tồn tại');
    
    const tCheckArr = [rawTask];
    await this.enrichTasks(tCheckArr);
    const tCheck: any = tCheckArr[0];

    // GỌI WORKFLOW ĐỂ VALIDATE
    if (rawTask.workflowInstId && this.workflowService) {
      try {
        let actionName = actionNameForWorkflow || status;
        
        // Cần truyền trạng thái gốc của task trước khi update để workflow đánh giá
        let hasChildren = false;
        const childrenCount = await this.prisma.taskClosure.count({ where: { ancestorId: rawTask.id, depth: 1 } });
        hasChildren = childrenCount > 0;
        
        // Tính toán các access level
        const queryContext = { ...context, currentEmployeeCode: actorCode, currentUserId: context?.currentUserId };
        const access = await this.checkTaskAccess(tCheck, queryContext);

        const validateRes = await firstValueFrom<any>(this.workflowService.ValidateAction({
          instanceId: rawTask.workflowInstId,
          actionName: actionName,
          userRoles: context?.currentUserPermissions || [],
          userId: actorCode,
          businessData: {
            status: rawTask.status, // Current status, not the next one
            hasChildren,
            isOwner: access.isOwner,
            isAssignee: access.isAssignee,
            isSupervisor: access.isSupervisor,
            isCoordinator: access.isCoordinator,
            isDeptLeader: access.isDeptLeader,
          }
        }));
        if (validateRes && !validateRes.allowed) {
          throw new RpcException(`Workflow không cho phép thực hiện hành động ${actionName}.`);
        }
      } catch (err) {
        if (err instanceof RpcException) throw err;
        this.logger.error('Lỗi gọi workflow ValidateAction', err);
      }
    }

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
          authorCode: actorCode || null,
          content: `Đã trả lại công việc với lý do: ${rejectReason}`,
          isSystemMessage: true,
        }
      });
    }

    if (status === 'DONE') await this.updateTaskProgress(id, 100, actorCode);

    // Send notifications for Approval workflow
    if (status === 'PENDING_APPROVAL') {
      const recipientCode = tCheck.supervisorCode || tCheck.assignerCode || tCheck.creatorEmployeeCode;
      if (recipientCode && recipientCode !== actorCode) {
        const emp = await this.prisma.employee.findUnique({ where: { employeeCode: recipientCode }, select: { userId: true } });
        if (emp?.userId) {
          this.notificationClient.emit('send_notification', {
            title: 'Yêu cầu nghiệm thu công việc',
            message: `Nhân sự đã báo cáo hoàn thành công việc "${tCheck.title}". Vui lòng kiểm tra và nghiệm thu.`,
            type: 'SYSTEM',
            recipients: [emp.userId],
            metadata: { taskId: id },
          });
        }
      }
    } else if (status === 'RETURNED' && actorCode !== tCheck.assigneeCode) {
      const emp = await this.prisma.employee.findUnique({ where: { employeeCode: tCheck.assigneeCode }, select: { userId: true } });
      if (emp?.userId) {
        this.notificationClient.emit('send_notification', {
          title: 'Công việc bị trả lại',
          message: `Công việc "${tCheck.title}" của bạn đã bị trả lại. Lý do: ${rejectReason}`,
          type: 'SYSTEM',
          recipients: [emp.userId],
          metadata: { taskId: id },
        });
      }
    } else if (status === 'DONE' && tCheck.status === 'PENDING_APPROVAL' && actorCode !== tCheck.assigneeCode) {
      const emp = await this.prisma.employee.findUnique({ where: { employeeCode: tCheck.assigneeCode }, select: { userId: true } });
      if (emp?.userId) {
        this.notificationClient.emit('send_notification', {
          title: 'Công việc đã được nghiệm thu',
          message: `Công việc "${tCheck.title}" của bạn đã được duyệt hoàn thành.`,
          type: 'SYSTEM',
          recipients: [emp.userId],
          metadata: { taskId: id },
        });
      }
    }

    const updatedTask = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });
    const enriched = await this.enrichTasks([updatedTask]);
    return this.toTaskResponse(enriched[0]);
  }

  async assignTask(
    id: number,
    assigneeCode: string,
    coassigneeCodes?: string[],
    departmentId?: number,
    assignerCode?: string,
    context?: { currentUserPermissions?: string[]; currentUserId?: number; currentEmployeeCode?: string }
  ) {
    const rawTaskForCheck = await this.prisma.task.findUnique({ 
      where: { id },
      include: { participants: true }
    });
    if (rawTaskForCheck?.workflowInstId && this.workflowService) {
      try {
        const tCheckArr = [rawTaskForCheck];
        await this.enrichTasks(tCheckArr);
        const queryContext = { ...context, currentEmployeeCode: context?.currentEmployeeCode, currentUserId: context?.currentUserId };
        const access = await this.checkTaskAccess(tCheckArr[0], queryContext);

        const validateRes = await firstValueFrom<any>(this.workflowService.ValidateAction({
          instanceId: rawTaskForCheck.workflowInstId,
          actionName: 'ASSIGN',
          userRoles: context?.currentUserPermissions || [],
          userId: context?.currentEmployeeCode,
          businessData: {
            status: rawTaskForCheck.status,
            isOwner: access.isOwner,
            isAssignee: access.isAssignee,
            isSupervisor: access.isSupervisor,
            isDeptLeader: access.isDeptLeader,
            isCoordinator: access.isCoordinator
          }
        }));
        if (validateRes && !validateRes.allowed) {
          throw new RpcException(`Workflow không cho phép thực hiện hành động phân công/giao việc.`);
        }
      } catch (err) {
        if (err instanceof RpcException) throw err;
        this.logger.error('Lỗi gọi workflow ValidateAction for ASSIGN', err);
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

      // Update assignee
      if (assigneeCode !== undefined) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.ASSIGNEE }
        });
        const finalAssigneeCode = assigneeCode || 'UNASSIGNED';
        await tx.taskParticipant.create({
          data: { taskId: id, employeeCode: finalAssigneeCode, participantRole: TaskRole.ASSIGNEE }
        });
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
        const coData: any[] = [];
        coassigneeCodes.forEach(code => {
          if (code) {
            coData.push({ taskId: id, employeeCode: code, participantRole: TaskRole.COORDINATOR });
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
    const enrichedTaskResponse = this.toTaskResponse(enriched[0]);

    if (assigneeCode) {
      try {
        this.notificationClient.emit('send_notification', {
          channel: 'console',
          recipient: assigneeCode,
          subject: 'Có công việc mới được giao',
          body: `Bạn vừa được phân công phụ trách nhiệm vụ: "${enrichedTaskResponse.title}"`
        });
      } catch (e) {
        console.error('Failed to send in-app notification', e);
      }
    }

    return enrichedTaskResponse;
  }


  async startDueTaskScanner() {
    const scanPeriodHours = 1;
    this.logger.log(`Starting due task scanner every ${scanPeriodHours} hour(s)`);
    
    this.scanInterval = setInterval(async () => {
      try {
        const days = 3;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const tasks = await this.prisma.task.findMany({
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED', 'DONE', 'TEMPLATE'] },
            dueDate: { lte: futureDate, gte: new Date() },
          },
          include: {
            participants: true,
            comments: {
              where: { content: { startsWith: 'Hệ thống đã tự động gửi cảnh báo' } }
            }
          }
        });

        for (const task of tasks) {
          if (task.comments && task.comments.length > 0) continue; // Already warned

          const assignees = task.participants
            .filter(p => p.participantRole === 'ASSIGNEE')
            .map(p => p.employeeCode)
            .filter(Boolean);

          for (const code of assignees) {
            try {
              // Gửi sang Notification Service (Email, Telegram...)
              // Lưu ý: Cần tra cứu email từ employeeCode nếu Notification Service yêu cầu email
              this.notificationClient.emit('send_notification', {
                channel: 'console', // Cấu hình gửi mail hoặc telegram tại đây
                recipient: code,
                subject: 'Cảnh báo hạn chót công việc',
                body: `Công việc "${task.title}" sắp đến hạn vào ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'vài ngày tới'}.`
              });
            } catch (e) {
              this.logger.error(`Error sending warning for task ${task.id} to ${code}`, e);
            }
          }

          // Mark as warned
          await this.prisma.taskComment.create({
            data: {
              taskId: task.id,
              authorCode: null,
              content: `Hệ thống đã tự động gửi cảnh báo sắp hết hạn`,
              isSystemMessage: true,
            }
          });
        }
      } catch (err) {
        this.logger.error('Error in due task scanner', err);
      }
    }, scanPeriodHours * 60 * 60 * 1000); // Mặc định chạy 1 tiếng 1 lần
  }


  async getTask(id: number, query: any) {
    await this.populateQueryHierarchy(query);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } }
      }
    });
    if (!t) throw new RpcException('Không tìm thấy nhiệm vụ');

    const enriched = await this.enrichTasks([t]);

    const access = await this.checkTaskAccess(t, query);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.computeAllowedActions(t, query);

    return this.toTaskResponse({
      ...enriched[0],
      allowedActions
    });
  }

  async getSubTasks(id: number, query: any) {
    await this.populateQueryHierarchy(query);
    const parentTask = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } }
      }
    });
    if (!parentTask) throw new RpcException('Nhiệm vụ không tồn tại');
    await this.enrichTasks([parentTask]);
    const parentAccess = await this.checkTaskAccess(parentTask, query);
    if (!parentAccess.hasAccess) {
      throw new RpcException('Bạn không có quyền xem nhiệm vụ con của công việc này.');
    }

    // Get all descendants from closure table with depth = 1 (direct children)
    const closureData = await this.prisma.taskClosure.findMany({
      where: { ancestorId: id, depth: 1 },
      select: { descendantId: true }
    });

    const childIds = closureData.map(c => c.descendantId);

    const tasks = await this.prisma.task.findMany({
      where: { id: { in: childIds }, status: { not: 'TEMPLATE' } },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });

    const enriched = await this.enrichTasks(tasks);

    const data = await Promise.all(enriched.map(async (t: any) => {
      const allowedActions = await this.computeAllowedActions(t, query);
      return this.toDelegationNode({
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
    const enriched = await this.enrichTasks([updatedTask]);
    return this.toTaskResponse(enriched[0]);
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
      await this.enrichTasks(tArr);
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
    const t = await this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } }
      }
    });
    const enriched = await this.enrichTasks([t]);
    return this.toTaskResponse(enriched[0]);
  }
  async breakdownTask(id: number, data: any) {
    await this.populateQueryHierarchy(data);
    const parentTask = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!parentTask) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.enrichTasks([parentTask]);
    const access = await this.checkTaskAccess(parentTask, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.computeAllowedActions(parentTask, data);
    if (!allowedActions.includes('ADD_SUBTASK')) {
      throw new RpcException('Bạn không có quyền phân rã nhiệm vụ này.');
    }

    return this.createSubTask(id, data);
  }
  async addComment(id: number, data: any) {
    await this.populateQueryHierarchy(data);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.enrichTasks([t]);
    const access = await this.checkTaskAccess(t, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.computeAllowedActions(t, data);
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
            metadata: { taskId: t.id },
          });
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
    await this.populateQueryHierarchy(query);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.enrichTasks([t]);
    const access = await this.checkTaskAccess(t, query);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.computeAllowedActions(t, query);
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
      };
    });

    return { success: true, data };
  }
  async requestCoordination(id: number, data: any) {
    await this.populateQueryHierarchy(data);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.enrichTasks([t]);
    const access = await this.checkTaskAccess(t, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.computeAllowedActions(t, data);
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
