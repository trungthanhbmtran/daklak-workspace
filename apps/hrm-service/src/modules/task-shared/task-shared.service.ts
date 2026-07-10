import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { firstValueFrom } from 'rxjs';
import { WorkflowEngine } from '@shared/workflow-core/workflow-engine';
import * as fs from 'fs';
import * as path from 'path';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { TaskRole } from '@generated/prisma/client';
import { AppCacheService } from '../../core/cache/app-cache.service';


@Injectable()
export class TaskSharedService {
  private readonly logger = new Logger(TaskSharedService.name);

  constructor(
    public prisma: PrismaService,
    @Inject('NOTIFICATION_SERVICE') public notificationClient: ClientProxy,
    @Inject('USER_PACKAGE') public userClient: any,
    @Inject('WORKFLOW_PACKAGE') public workflowClient: any,
    public cache: AppCacheService,
    
  ) {}
  private userService: any;
  private workflowService: any;
  onModuleInit() {
    this.userService = this.userClient.getService('UserService');
    this.workflowService = this.workflowClient.getService('WorkflowService');
  }

  public async resolveAssigneeCodes(tasks: any[]): Promise<Map<number, string>> {
    const userIds = new Set<number>();
    tasks.forEach(t => {
      t.participants?.forEach((p: any) => {
        if (p.userId) userIds.add(p.userId);
      });
    });

    const userToCodeMap = new Map<number, string>();
    if (userIds.size > 0) {
      const emps = await this.prisma.employee.findMany({
        where: { userId: { in: Array.from(userIds).map(String) } },
        select: { userId: true, employeeCode: true }
      });
      emps.forEach(emp => {
        if (emp.userId) userToCodeMap.set(parseInt(emp.userId, 10), emp.employeeCode);
      });
    }
    return userToCodeMap;
  }

  public async invalidateWorkflowCache(workflowId: string, newDefinition?: any) {
    const cacheKey = `workflow:def:${workflowId}`;
    if (newDefinition) {
      await this.cache.set(cacheKey, newDefinition, 3600 * 1000 * 24);
    } else {
      await this.cache.delete(cacheKey);
    }
  }

  public async getWorkflowIdByTrigger(trigger: string): Promise<string | null> {
    const cacheKey = `workflow:trigger:${trigger}`;
    const cachedId = await this.cache.get<string>(cacheKey);
    if (cachedId) return cachedId;

    try {
      const res = await firstValueFrom<any>(this.workflowService.FindWorkflowByCode({ code: trigger }));
      if (res && res.id) {
        await this.cache.set(cacheKey, res.id, 3600 * 1000 * 24); // Cache 24h
        return res.id;
      }
    } catch (e) {
      this.logger.error(`Failed to fetch workflow id for code ${trigger}`, e);
    }
    return null;
  }

  public async getWorkflowDefinition(workflowId: string): Promise<any> {
    const cacheKey = `workflow:def:${workflowId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const res = await firstValueFrom<any>(this.workflowService.FindOneWorkflow({ id: workflowId }));
      if (res) {
        const definition = {
          nodes: (res.nodes || []).map((n: any) => ({
             id: n.id,
             type: n.type,
             data: n.properties || {}
          })),
          edges: (res.edges || []).map((e: any) => ({
             source: e.sourceNodeId,
             target: e.targetNodeId,
             label: e.condition || ''
          }))
        };
        await this.cache.set(cacheKey, definition, 3600 * 1000 * 24); // Cache 24h
        return definition;
      }
    } catch (e) {
      this.logger.error(`Failed to fetch workflow definition for ${workflowId}`, e);
    }
    return null;
  }

  public sendTaskNotification(recipients: string[], title: string, message: string, taskData: any) {
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

  public parseParticipants(participants: any[]) {
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

  public buildParticipantsData(taskId: number, data: any): any[] {
    const participantsData: any[] = [];

    // Assignee
    const assigneeCode = data.assigneeCode || 'UNASSIGNED';
    const assigneePct = typeof data.assigneePercentage === 'number' ? data.assigneePercentage : 100.0;
    if (assigneeCode) {
      participantsData.push({
        taskId,
        employeeCode: assigneeCode,
        participantRole: TaskRole.ASSIGNEE,
        contributionPercentage: assigneePct
      });
    }

    // Owner (Assigner)
    const assignerCode = data.assignerCode || 'UNASSIGNED';
    if (assignerCode) {
      participantsData.push({ taskId, employeeCode: assignerCode, participantRole: TaskRole.OWNER });
    }

    // Supervisor (Approver)
    if (data.supervisorCode) {
      participantsData.push({ taskId, employeeCode: data.supervisorCode, participantRole: TaskRole.APPROVER });
    }

    // Co-assignees (Coordinators)
    const coassigneeCodes = data.coassigneeCodes || [];
    const coassigneePcts = data.coassigneePercentages || {};
    for (const coCode of coassigneeCodes) {
      if (coCode) {
        const coPct = typeof coassigneePcts[coCode] === 'number' ? coassigneePcts[coCode] : 0;
        participantsData.push({
          taskId,
          employeeCode: coCode,
          participantRole: TaskRole.COORDINATOR,
          contributionPercentage: coPct
        });
      }
    }

    return participantsData;
  }

  public async enrichTasks(tasks: any[]) {
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

  public async populateQueryHierarchy(query: any) {
    if (!query.isAdmin && query.currentUserId) {
      try {
        const subordinatesRes: any = await firstValueFrom(
          this.userService.GetSubordinates({ userId: query.currentUserId })
        );
        query.allowedDepartmentIds = subordinatesRes?.allowedDepartmentIds || subordinatesRes?.allowed_department_ids || [];
        query.allowedEmployeeCodes = subordinatesRes?.allowedEmployeeCodes || subordinatesRes?.allowed_employee_codes || [];
      } catch (e) {
      }
    }
  }

  public async checkTaskAccess(t: any, query: any): Promise<{
    isOwner: boolean;
    isAssignee: boolean;
    isSupervisor: boolean;
    isCoordinator: boolean;
    isDeptLeader: boolean;
    isLowestLevel: boolean;
    hasAccess?: boolean;
    isAdmin?: boolean;
  }> {
    const cacheKey = `task_access:${t.id}:${query.currentEmployeeCode || 'anon'}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;
    const access = await this._checkTaskAccessInternal(t, query);
    await this.cache.set(cacheKey, access, 5 * 60 * 1000); // 5 mins cache
    return access;
  }

  private async _checkTaskAccessInternal(t: any, query: any): Promise<{
    hasAccess: boolean;
    isAdmin: boolean;
    isOwner: boolean;
    isAssignee: boolean;
    isSupervisor: boolean;
    isCoordinator: boolean;
    isDeptLeader: boolean;
    isLowestLevel: boolean;
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
        isLowestLevel: false,
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
        isLowestLevel: false,
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
    const allowedCodesForLowestLevel = query.allowedEmployeeCodes || [];
    const allowedDeptsForLowestLevel = query.allowedDepartmentIds || [];
    const hasSubordinates = allowedCodesForLowestLevel.filter((c: string) => c !== currentEmployeeCode).length > 0 || allowedDeptsForLowestLevel.length > 0;
    const isLowestLevel = !isAdmin && !hasSubordinates;

    const hasAccess = isAdmin || isOwner || isAssignee || isSupervisor || isCoordinator || isDeptLeader;

    return {
      hasAccess,
      isAdmin,
      isOwner,
      isAssignee,
      isSupervisor,
      isCoordinator,
      isDeptLeader,
      isLowestLevel,
    };
  }

  public async computeAllowedActions(t: any, query: any): Promise<string[]> {
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
    const isUnassigned = !t.assigneeCode || t.assigneeCode === 'UNASSIGNED';
    const metadata = (t.metadata as any) || {};
    const activeWorkflowId = metadata.workflowId || t.workflowInstId;

    let definition = null;
    let currentNodeId = metadata.currentNodeId;

    if (activeWorkflowId && currentNodeId) {
       definition = await this.getWorkflowDefinition(activeWorkflowId);
    } else {
       // Load Default Workflow
       try {
         const defPath = path.join(__dirname, 'default-task-workflow.json');
         if (fs.existsSync(defPath)) {
            definition = JSON.parse(fs.readFileSync(defPath, 'utf8'));
            currentNodeId = t.status || 'IN_PROGRESS';
         }
       } catch (err) {
         this.logger.error('Failed to load default task workflow', err);
       }
    }

    if (definition && currentNodeId) {
      try {
        const cacheKey = activeWorkflowId ? String(activeWorkflowId) : 'default-task-workflow';
        const engine = new WorkflowEngine(definition, cacheKey);
        actions = engine.getAllowedActions(
          currentNodeId,
          query.currentUserPermissions || [],
          query.currentEmployeeCode,
          {
            status: t.status,
            hasChildren,
            isAdmin: access.isAdmin,
            isCreator: t.creatorEmployeeCode === query.currentEmployeeCode,
            isOwner: access.isOwner,
            isAssignee: access.isAssignee,
            isSupervisor: access.isSupervisor,
            isCoordinator: access.isCoordinator,
            isDeptLeader: access.isDeptLeader,
            isLowestLevel: access.isLowestLevel,
            allowedEmployeeCodes: query.allowedEmployeeCodes || [],
            isUnassigned,
          }
        );
      } catch (err) {
        this.logger.error('Failed to calculate allowed actions from WorkflowEngine for task ' + t.id, err);
      }
    }

    if (actions.length === 0 && (isTreeParticipant || t.creatorEmployeeCode === query.currentEmployeeCode)) {
      actions.push('CHAT');
    }

    return Array.from(new Set(actions));
  }

  
  public async getWorkflowInitialNode(workflowId?: string): Promise<{ initialNodeId?: string; nodeData?: any }> {
    let definition = null;
    if (workflowId) {
      definition = await this.getWorkflowDefinition(workflowId);
    } else {
      try {
        const defPath = path.join(__dirname, 'default-task-workflow.json');
        if (fs.existsSync(defPath)) {
          definition = JSON.parse(fs.readFileSync(defPath, 'utf8'));
        }
      } catch (err) {
        this.logger.error('Failed to load default task workflow', err);
      }
    }

    if (definition) {
      try {
        const cacheKey = workflowId ? String(workflowId) : 'default-task-workflow';
        const engine = new WorkflowEngine(definition, cacheKey);
        const initialNodeId = engine.getInitialNodeId();
        if (initialNodeId) {
          const node = engine.getNode(initialNodeId);
          return { initialNodeId, nodeData: node?.data };
        }
      } catch (err) {
        this.logger.error('Failed to get initial node from WorkflowEngine', err);
      }
    }
    return {};
  }

  public async getWorkflowActionContext(t: any, query: any, actionName: string): Promise<{
    allowed: boolean;
    reason?: string;
    nextNodeId?: string;
    nextNodeData?: any;
    definition?: any;
  }> {
    const access = await this.checkTaskAccess(t, query);

    let hasChildren = false;
    if (t.children && t.children.length > 0) {
      hasChildren = true;
    } else if (t._count && typeof t._count.children === 'number') {
      hasChildren = t._count.children > 0;
    } else {
      const childrenCount = await this.prisma.taskClosure.count({ where: { ancestorId: t.id, depth: 1 } });
      hasChildren = childrenCount > 0;
    }

    const isUnassigned = !t.assigneeCode || t.assigneeCode === 'UNASSIGNED';
    const metadata = (t.metadata as any) || {};
    const activeWorkflowId = metadata.workflowId || t.workflowInstId;

    let definition = null;
    let currentNodeId = metadata.currentNodeId;

    if (activeWorkflowId && currentNodeId) {
       definition = await this.getWorkflowDefinition(activeWorkflowId);
    } else {
       try {
         const defPath = path.join(__dirname, 'default-task-workflow.json');
         if (fs.existsSync(defPath)) {
            definition = JSON.parse(fs.readFileSync(defPath, 'utf8'));
            currentNodeId = t.status || 'IN_PROGRESS';
         }
       } catch (err) {}
    }

    if (!definition || !currentNodeId) {
      return { allowed: false, reason: 'Không tìm thấy cấu hình Workflow' };
    }

    try {
      const cacheKey = activeWorkflowId ? String(activeWorkflowId) : 'default-task-workflow';
      const engine = new WorkflowEngine(definition, cacheKey);
      const businessData = {
        status: t.status,
        hasChildren,
        isOwner: access.isOwner,
        isAssignee: access.isAssignee,
        isSupervisor: access.isSupervisor,
        isCoordinator: access.isCoordinator,
        isDeptLeader: access.isDeptLeader,
        isLowestLevel: access.isLowestLevel,
        allowedEmployeeCodes: query.allowedEmployeeCodes || [],
        isUnassigned,
        actionName
      };

      const validateRes = engine.validateAction(
        currentNodeId,
        actionName,
        query.currentUserPermissions || [],
        query.currentEmployeeCode,
        businessData
      );

      if (!validateRes.allowed) {
        return { allowed: false, reason: validateRes.reason };
      }

      const nextNodeId = engine.getNextNodeId(currentNodeId, actionName, businessData);
      let nextNodeData: any = undefined;
      if (nextNodeId) {
        const nextNode = engine.getNode(nextNodeId);
        if (nextNode && nextNode.data) {
          nextNodeData = nextNode.data;
        }
      }

      return {
        allowed: true,
        nextNodeId: nextNodeId || undefined,
        nextNodeData,
        definition
      };
    } catch (err) {
      this.logger.error('Failed to validate action via WorkflowEngine', err);
      return { allowed: false, reason: 'Lỗi hệ thống khi phân tích quy trình' };
    }
  }

  public toTaskResponse(t: any): any {
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
      baseScore: t.kpiSettings?.baseScore ?? 0,
      weight: t.kpiSettings?.weight ?? 0,
      scoringMethod: t.kpiSettings?.scoringMethod ?? '',
      bonusPerDay: t.kpiSettings?.bonusPerDay ?? 0,
      penaltyPerDay: t.kpiSettings?.penaltyPerDay ?? 0,
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
      kpiCriteriaId: t.kpiSettings?.kpiCriteriaId || undefined,
      workflowInstId: t.workflowInstId || (t.metadata ? t.metadata.workflowId : undefined),
      metadata: t.metadata || undefined
    };
  }

  public toDelegationNode(t: any): any {
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

  public async buildScopingWhereClause(query: any): Promise<any | null> {
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
