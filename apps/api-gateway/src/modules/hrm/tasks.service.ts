import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';
import { Metadata } from '@grpc/grpc-js';
import { normalizeTask } from '../../common/utils/language-normalization.util';

@Injectable()
export class TasksService implements OnModuleInit {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    if (typeof message === 'string') {
      if (message.toLowerCase().includes('không có quyền')) throw new ForbiddenException(message);
      if (message.toLowerCase().includes('không tồn tại')) throw new NotFoundException(message);
    }
    throw new InternalServerErrorException(message);
  }

  private taskService: any;
  private userService: any;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
    private readonly issuer: TokenIssuerService,
  ) {}

  onModuleInit() {
    this.taskService = this.client.getService(MICROSERVICES.TASK.SERVICE);
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  // ── High Performance In-Memory User Directory Cache ──
  private userCacheMap = new Map<string, any>();
  private userCacheExpiresAt = 0;
  private readonly USER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes TTL

  async populateUsers(tasks: any[]) {
    if (!tasks || tasks.length === 0) return tasks;

    const empCodes = new Set<string>();
    const userIds = new Set<number>();

    const collectCodes = (task: any) => {
      if (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED') {
        empCodes.add(task.assigneeCode);
        const parsed = parseInt(task.assigneeCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }
      if (task.assignerCode) {
        empCodes.add(task.assignerCode);
        const parsed = parseInt(task.assignerCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }
      if (task.supervisorCode) {
        empCodes.add(task.supervisorCode);
        const parsed = parseInt(task.supervisorCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }
      if (task.coassigneeCodes) {
        task.coassigneeCodes.forEach((code: string) => {
          if (code) {
            empCodes.add(code);
            const parsed = parseInt(code, 10);
            if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
          }
        });
      }
      if (task.children) task.children.forEach(collectCodes);
    };
    tasks.forEach(collectCodes);

    if (empCodes.size === 0 && userIds.size === 0) return tasks;

    const now = Date.now();
    // Chỉ fetch từ user-service khi cache trống hoặc hết hạn TTL 10 phút
    if (this.userCacheMap.size === 0 || now > this.userCacheExpiresAt) {
      try {
        const usersRes: any = await firstValueFrom(
          this.userService.ListUsers({ take: 500 }),
        );
        const users = usersRes?.data || [];
        const newMap = new Map<string, any>();
        users.forEach((u: any) => {
          if (u.employeeCode) {
            newMap.set(u.employeeCode, u);
          }
          newMap.set(String(u.id), u);
        });
        this.userCacheMap = newMap;
        this.userCacheExpiresAt = now + this.USER_CACHE_TTL;
      } catch (e) {
        // Fallback giữ nguyên cache cũ nếu có lỗi
      }
    }

    const usersMap = this.userCacheMap;

    const mapUsers = (task: any) => {
      if (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED') {
        const u = usersMap.get(task.assigneeCode);
        if (u) {
          task.assigneeName = u.fullName || u.username;
          task.assigneeAvatar = u.avatarUrl;
          task.assigneeJobTitle = u.jobTitleName;
          task.assigneeUnitName = u.unitName;
        }
      }
      if (task.assignerCode) {
        const u = usersMap.get(task.assignerCode);
        if (u) task.assignerName = u.fullName || u.username;
      }
      if (task.supervisorCode) {
        const u = usersMap.get(task.supervisorCode);
        if (u) task.supervisorName = u.fullName || u.username;
      }
      if (task.coassigneeCodes && Array.isArray(task.coassigneeCodes)) {
        task.coassigneeNames = task.coassigneeCodes
          .map((code: string) => {
            const u = usersMap.get(code);
            return u ? u.fullName || u.username : code;
          })
          .filter(Boolean);
      }
      if (task.children) task.children.forEach(mapUsers);
    };
    tasks.forEach(mapUsers);

    return tasks;
  }

  translateTaskData(task: any) {
    if (!task) return task;
    return normalizeTask(task);
  }

  // --- Endpoints ---
  async create(req: any, body: any) {
    if (body.dueDate) {
      const selectedDate = new Date(body.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new InternalServerErrorException(
          'Thời gian hạn chót không được trước thời gian giao việc (hiện tại)',
        );
      }
      body.dueDate = new Date(body.dueDate).toISOString();
    }

    if (body.assignee) {
      if (body.assignee.startsWith('DEPT_')) {
        body.departmentId = parseInt(body.assignee.replace('DEPT_', ''), 10);
      } else {
        body.assigneeCode = body.assignee;
      }
      delete body.assignee;
    }

    if (body.coordinators) {
      body.coassigneeCodes = body.coordinators;
      delete body.coordinators;
    }

    if (body.taskType) {
      body.metadata = body.metadata || {};
      body.metadata.taskType = body.taskType;
      if (body.taskType === 'PERIODIC' && body.recurrence) {
        body.metadata.recurrence = body.recurrence;
      }
      delete body.taskType;
      delete body.recurrence;
    }

    if (req.user) {
      const cachedUser = req.user.id ? this.userCacheMap.get(String(req.user.id)) : null;
      const effectiveEmpCode = req.user.employeeCode || cachedUser?.employeeCode;
      body.assignerCode = effectiveEmpCode || req.user.employeeCode || req.user.username;
      body.currentEmployeeCode = effectiveEmpCode || req.user.employeeCode;
      body.currentUserId = req.user.id ? parseInt(req.user.id, 10) : undefined;
      body.currentUserPermissions = req.user.permissionsFlatten || [];
    }

    if (body.supervisor) {
      body.supervisorCode = body.supervisor;
      delete body.supervisor;
    }

    if (body.baseScore !== undefined) {
      body.baseScore = typeof body.baseScore === 'number' ? body.baseScore : parseFloat(body.baseScore) || 0;
    }
    if (body.weight !== undefined) {
      body.weight = typeof body.weight === 'number' ? body.weight : parseFloat(body.weight) || 0;
    }
    if (body.assigneePercentage !== undefined) {
      body.assigneePercentage = typeof body.assigneePercentage === 'number' ? body.assigneePercentage : parseFloat(body.assigneePercentage) || 100;
    }
    if (body.coassigneePercentages && typeof body.coassigneePercentages === 'object' && !Array.isArray(body.coassigneePercentages)) {
      const codes = body.coassigneeCodes || [];
      body.coassigneePercentages = codes.map((c: string) => Number(body.coassigneePercentages[c]) || 0);
    } else if (Array.isArray(body.coassigneePercentages)) {
      body.coassigneePercentages = body.coassigneePercentages.map((p: any) => Number(p) || 0);
    }

    const metadataObj = {
      ...(body.metadata || {}),
      ...(body.sourceDocumentRef ? { sourceDocumentRef: body.sourceDocumentRef } : {}),
      ...(body.initialSteps ? { initialSteps: body.initialSteps } : {}),
    };
    body.metadataJson = JSON.stringify(metadataObj);
    body.sourceDocumentRef = body.sourceDocumentRef || '';

    if (!body.supervisorCode) {
      try {
        const resolved = await this.getSupervisorByScope(req, {
          departmentId: body.departmentId,
          assigneeCode: body.assigneeCode,
          domainId: body.domainId,
        });
        if (resolved?.data?.supervisorCode) {
          body.supervisorCode = resolved.data.supervisorCode;
        }
      } catch {}
    }

    const response: any = await firstValueFrom(
      this.taskService.CreateTask(body, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async getSupervisorByScope(req: any, query: { departmentId?: number; domainId?: number; assigneeCode?: string }) {
    let targetUnitId = query.departmentId;
    const targetDomainId = query.domainId || 0;

    if (!targetUnitId && query.assigneeCode && query.assigneeCode !== 'UNASSIGNED') {
      const u = this.userCacheMap.get(query.assigneeCode);
      if (u?.departmentId) {
        targetUnitId = u.departmentId;
      }
    }

    if (!targetUnitId && !targetDomainId) {
      return { success: true, data: null };
    }

    try {
      const res: any = await firstValueFrom(
        this.userService.GetEmployeesByScope(
          {
            domain_id: targetDomainId,
            monitored_unit_id: targetUnitId || 0,
          },
          this.getGrpcMetadata(req),
        ),
      );
      const codes: string[] = res?.employee_codes || res?.employeeCodes || [];
      if (codes.length > 0) {
        const supervisorCode = codes[0];
        if (this.userCacheMap.size === 0) {
          await this.populateUsers([{ supervisorCode }]);
        }
        const u = this.userCacheMap.get(supervisorCode);
        return {
          success: true,
          data: {
            supervisorCode,
            supervisorName: u ? u.fullName || u.username : supervisorCode,
            supervisorJobTitle: u?.jobTitleName || undefined,
            supervisorUnitName: u?.unitName || undefined,
            reason: targetUnitId
              ? 'Lãnh đạo được phân công theo dõi đơn vị trong định biên tổ chức'
              : 'Lãnh đạo được phân công theo dõi lĩnh vực trong định biên tổ chức',
            allMatchedCodes: codes,
          },
        };
      }
    } catch {
      // Fallback null
    }

    return { success: true, data: null };
  }

  async list(
    req: any,
    role: string,
    assigneeCode: string,
    assignerCode: string,
    filter: string,
    search: string,
    departmentId: string,
    planId: string,
    isSupervisor: string,
    status: string,
    priority: string,
    page: string,
    limit: string,
    statsFilter: string,
    type: string,
    viewMode: string,
    referenceDate: string,
    summary?: string,
  ) {
    const user = req.user;
    let finalAssigneeCode = assigneeCode;
    let finalAssignerCode: string | undefined = assignerCode;
    const finalDepartmentId =
      departmentId && departmentId !== 'undefined'
        ? parseInt(departmentId, 10)
        : undefined;

    if (role === 'ASSIGNEE' && user) {
      finalAssigneeCode = user.employeeCode;
    } else if (role === 'OWNER' && user) {
      finalAssignerCode = user.employeeCode;
    }

    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    const requestPayload: any = {
      currentEmployeeCode: user?.employeeCode,
      isAdmin,
      isLeader,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      summary: summary === 'true',
    };

    if (finalAssigneeCode) requestPayload.assigneeCode = finalAssigneeCode;
    if (finalAssignerCode) requestPayload.assignerCode = finalAssignerCode;
    if (filter && filter !== 'ALL' && filter !== 'undefined') requestPayload.filter = filter;
    if (search && search.trim() && search !== 'undefined') requestPayload.search = search.trim();
    if (status && status !== 'ALL' && status !== 'undefined') requestPayload.status = status;
    if (priority && priority !== 'ALL' && priority !== 'undefined') requestPayload.priority = priority;
    if (type && type !== 'ALL' && type !== 'undefined') requestPayload.type = type;
    if (statsFilter && statsFilter !== 'undefined') requestPayload.statsFilter = statsFilter;
    if (finalDepartmentId) requestPayload.departmentId = finalDepartmentId;
    if (planId && planId !== 'undefined') requestPayload.planId = parseInt(planId, 10);
    if (isSupervisor === 'true') requestPayload.isSupervisor = true;
    if (user?.unitId) requestPayload.currentUserDept = parseInt(user.unitId, 10);
    if (user?.id) requestPayload.currentUserId = parseInt(user.id, 10);
    if (role && role !== 'undefined') requestPayload.role = role;
    if (viewMode && viewMode !== 'undefined') requestPayload.viewMode = viewMode;
    if (referenceDate && referenceDate !== 'undefined') requestPayload.referenceDate = referenceDate;

    const response: any = await firstValueFrom(
      this.taskService.ListTasks(requestPayload, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));

    if (response?.data) {
      const isSummary = summary === 'true';
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data);
        response.data.forEach((t: any) => this.translateTaskData(t));
        if (isSummary) {
          response.data = response.data.map((t: any) => this.pruneSummaryTask(t));
        }
      } else {
        await this.populateUsers([response.data]);
        this.translateTaskData(response.data);
        if (isSummary) {
          response.data = this.pruneSummaryTask(response.data);
        }
      }
    }

    if (response && user?.employeeCode) {
      response.meta = response.meta || {};
      response.meta.currentEmployeeCode = user.employeeCode;
    }
    return response;
  }

  private pruneSummaryTask(t: any): any {
    if (!t) return t;
    const cleaned: any = {
      id: t.id,
      title: t.title,
      status: t.status,
      statusLabel: t.statusLabel,
      priority: t.priority,
      priorityLabel: t.priorityLabel,
      dueDate: t.dueDate,
      startDate: t.startDate,
      progress: t.progress ?? 0,
      assigneeCode: t.assigneeCode || undefined,
      assigneeName: t.assigneeName || undefined,
      assignerCode: t.assignerCode || undefined,
      assignerName: t.assignerName || undefined,
      supervisorCode: t.supervisorCode || undefined,
      supervisorName: t.supervisorName || undefined,
      coassigneeNames: (Array.isArray(t.coassigneeNames) && t.coassigneeNames.length > 0) ? t.coassigneeNames : undefined,
      sourceDocumentRef: t.sourceDocumentRef || undefined,
      baseScore: t.baseScore ? Number(t.baseScore) : undefined,
      weight: t.weight ? Number(t.weight) : undefined,
      parentId: t.parentId ? Number(t.parentId) : undefined,
      planId: t.planId ? Number(t.planId) : undefined,
      isOverdueWarned: t.isOverdueWarned || undefined,
      isDeadlineWarned: t.isDeadlineWarned || undefined,
      isRiskWarned: t.isRiskWarned || undefined,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
    if (t.metadata?.taskType) {
      cleaned.metadata = { taskType: t.metadata.taskType };
    }
    if (Array.isArray(t.children) && t.children.length > 0) {
      cleaned.children = t.children.map((c: any) => this.pruneSummaryTask(c));
    }
    return cleaned;
  }

  async update(req: any, id: number, body: any) {
    const response: any = await firstValueFrom(
      this.taskService.UpdateTask(
        {
          id,
          weight: body.weight,
          startDate: body.startDate,
          dueDate: body.dueDate,
          priority: body.priority,
          baseScore: body.baseScore,
          title: body.title,
          description: body.description,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async extendTask(req: any, id: number, body: any) {
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate).toISOString();
    }
    const user = req.user;
    const response: any = await firstValueFrom(
      this.taskService.ExtendTask(
        {
          id,
          dueDate: body.dueDate,
          reason: body.reason,
          actorCode: user?.employeeCode || user?.username,
          currentUserPermissions: user?.permissionsFlatten || [],
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async updateStatus(
    req: any,
    id: number,
    status: string,
    rejectReason?: string,
    actionName?: string,
    evidence?: string,
    evidenceData?: any,
  ) {
    let finalEvidence = evidence;
    if (evidenceData && (evidenceData.itemType === 'step' || evidenceData.itemType === 'subtask')) {
      finalEvidence =
        `📋 Báo cáo hoàn thành [${evidenceData.itemType === 'step' ? 'Bước' : 'Nhiệm vụ con'}]: **${evidenceData.itemTitle}**\n${evidenceData.text || ''}`.trim();
      if (evidenceData.files && evidenceData.files.length > 0) {
        finalEvidence += '\n\n**Minh chứng đính kèm:**';
        evidenceData.files.forEach((file: any, index: number) => {
          finalEvidence += `\n${index + 1}. [${file.name}](${file.url})`;
        });
      }
    }

    const user = req.user;
    const response: any = await firstValueFrom(
      this.taskService.UpdateTaskStatus(
        {
          id,
          status,
          rejectReason,
          actionName,
          evidence: finalEvidence,
          evidenceDataJson: evidenceData ? JSON.stringify(evidenceData) : '',
          actorCode: user?.employeeCode || '',
          currentUserPermissions: user?.permissionsFlatten || [],
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }
  async respondTask(
    req: any,
    id: number,
    action: string,
    rejectReason?: string,
    message?: string,
  ) {
    const user = req.user;
    const response: any = await firstValueFrom(
      this.taskService.RespondTask(
        {
          taskId: id,
          action,
          rejectReason,
          message,
          currentUserId: user?.id ? parseInt(user.id, 10) : undefined,
          currentEmployeeCode: user?.employeeCode || user?.username || '',
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: user?.permissionsFlatten || [],
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }


  async assignTask(req: any, id: number, body: any) {
    if (body.assignee) {
      if (body.assignee.startsWith('DEPT_')) {
        body.departmentId = parseInt(body.assignee.replace('DEPT_', ''), 10);
      } else {
        body.assigneeCode = body.assignee;
      }
      delete body.assignee;
    }

    if (body.coordinators) {
      body.coassigneeCodes = body.coordinators;
      delete body.coordinators;
    }

    const assigneeCode = body.assigneeCode;
    const coassigneeCodes = body.coassigneeCodes || body.coAssigneeCodes || [];
    const departmentId = body.departmentId;
    const user = req.user;
    const assignerCode = user?.employeeCode;

    const response: any = await firstValueFrom(
      this.taskService.AssignTask(
        {
          id,
          assigneeCode,
          coassigneeCodes: coassigneeCodes || [],
          departmentId,
          assignerCode,
          currentUserPermissions: user?.permissionsFlatten || [],
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async breakdownTask(req: any, id: number, body: any) {
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

    const taskResponse: any = await firstValueFrom(
      this.taskService.GetTask(
        {
          id: id,
          currentEmployeeCode: assignerCode,
          isAdmin: isAdmin,
          isLeader:
            isAdmin ||
            user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
            user?.permissionsFlatten?.includes('TASK.*'),
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (!taskResponse) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    const metadataObj = {
      ...(body.metadata || {}),
      ...(body.sourceDocumentRef ? { sourceDocumentRef: body.sourceDocumentRef } : {}),
      ...(body.initialSteps ? { initialSteps: body.initialSteps } : {}),
    };

    const breakdownResponse: any = await firstValueFrom(
      this.taskService.BreakdownTask(
        {
          ...body,
          coassigneeCodes:
            body.coordinators || body.coassigneeCodes || body.coAssigneeCodes,
          id: id,
          parentId: id,
          assignerCode,
          sourceDocumentRef: body.sourceDocumentRef || '',
          metadataJson: JSON.stringify(metadataObj),
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (breakdownResponse?.data) this.translateTaskData(breakdownResponse.data);
    return breakdownResponse;
  }


  async requestCoordination(req: any, id: number, body: any) {
    const message = body.message;
    const leadCode = body.leadCode || body.leadId;
    const coordinatorCodes = body.coordinatorCodes || body.coordinatorIds || [];

    const user = req.user;
    const requesterCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

    const taskResponse: any = await firstValueFrom(
      this.taskService.GetTask(
        {
          id: id,
          currentEmployeeCode: requesterCode,
          isAdmin: isAdmin,
          isLeader:
            isAdmin ||
            user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
            user?.permissionsFlatten?.includes('TASK.*'),
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (!taskResponse) throw new Error('Task not found.');

    return firstValueFrom(
      this.taskService.RequestCoordination(
        {
          taskId: id,
          requesterCode,
          message: message || '',
          leadId: leadCode || '',
          coordinatorIds: coordinatorCodes || [],
          leadCode: leadCode || '',
          coordinatorCodes: coordinatorCodes || [],
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  async getSubTasks(req: any, id: number) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    const response: any = await firstValueFrom(
      this.taskService.GetSubTasks(
        {
          taskId: id,
          currentEmployeeCode: user?.employeeCode,
          isAdmin,
          isLeader,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data);
        response.data.forEach((t: any) => this.translateTaskData(t));
      } else {
        await this.populateUsers([response.data]);
        this.translateTaskData(response.data);
      }
    }
    return response;
  }

  async getTaskHistory(req: any, id: number) {
    return firstValueFrom(
      this.taskService.GetTaskHistory(
        { taskId: id },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }


  async getTask(req: any, id: number) {
    const user = req.user;
    const perms = user?.permissionsFlatten || [];
    const isAdmin =
      perms.includes('TASK:MANAGE') ||
      perms.includes('TASK.*') ||
      perms.includes('SYSTEM:*') ||
      perms.some((p: string) => p.startsWith('SYSTEM')) ||
      false;
    const isLeader =
      isAdmin ||
      perms.includes('TASK.ASSIGN') ||
      perms.includes('TASK.*');

    const response = (await firstValueFrom(
      this.taskService.GetTask(
        {
          id,
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: perms,
          isAdmin,
          isLeader,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e))) as any;
    const target = response?.data ? response.data : response;
    if (target) this.translateTaskData(target);
    return response;
  }

  async listSteps(req: any, id: number) {
    const response: any = await firstValueFrom(
      this.taskService.ListSteps({ taskId: id }, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data);
      }
    }
    return response;
  }

  async createStep(req: any, id: number, body: any) {
    if (body.baseScore !== undefined && body.baseScore !== null) {
      body.baseScore = body.baseScore === '' ? 0 : Number(body.baseScore);
    }
    if (body.assignee) {
      body.assigneeCode = body.assignee || undefined;
      delete body.assignee;
    }

    const response: any = await firstValueFrom(
      this.taskService.CreateStep(
        { taskId: id, ...body },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      await this.populateUsers([response.data]);
    }
    return response;
  }

  async updateStep(req: any, id: number, stepId: number, body: any) {
    if (body.evidenceData) {
      let finalEvidence =
        `📋 Báo cáo hoàn thành [${body.evidenceData.itemType === 'step' ? 'Bước' : 'Nhiệm vụ con'}]: **${body.evidenceData.itemTitle}**\n${body.evidenceData.text || ''}`.trim();
      if (body.evidenceData.files && body.evidenceData.files.length > 0) {
        finalEvidence += '\n\n**Minh chứng đính kèm:**';
        body.evidenceData.files.forEach((file: any, index: number) => {
          finalEvidence += `\n${index + 1}. [${file.name}](${file.url})`;
        });
      }
      body.evidence = finalEvidence;
      delete body.evidenceData;
    }

    const response: any = await firstValueFrom(
      this.taskService.UpdateStep(
        {
          taskId: id,
          stepId,
          actorCode: req.user?.employeeCode || '',
          ...body,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      await this.populateUsers([response.data]);
    }
    return response;
  }

  async deleteStep(req: any, id: number, stepId: number) {
    return firstValueFrom(
      this.taskService.DeleteStep(
        { taskId: id, stepId },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  async recordAttendance(req: any, id: number) {
    const user = req.user;
    return firstValueFrom(
      this.taskService.RecordAttendance(
        {
          taskId: id,
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: user?.permissionsFlatten || [],
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  async getAttendanceStats(req: any, id: number) {
    const user = req.user;
    return firstValueFrom(
      this.taskService.GetAttendanceStats(
        {
          taskId: id,
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: user?.permissionsFlatten || [],
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  async getKpiSystemVariables(req: any) {
    return firstValueFrom(
      this.taskService.GetKpiSystemVariables({}, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
  }

  async getGlobalKpiSettings(req: any) {
    return firstValueFrom(
      this.taskService.GetGlobalKpiSettings({}, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
  }

  async saveGlobalKpiSettings(req: any, body: any) {
    return firstValueFrom(
      this.taskService.SaveGlobalKpiSettings(body, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
  }

  async previewGlobalKpiSettings(req: any, body: any) {
    return firstValueFrom(
      this.taskService.PreviewGlobalKpiSettings(
        {
          settingsJson: JSON.stringify(body.settings || {}),
          quota: Number(body.variables?.Q ?? 10),
          completed: Number(body.variables?.C ?? 8),
          weight: Number(body.variables?.W ?? 1),
          delayDays: Number(body.variables?.D ?? 2),
          qualityScore: Number(body.variables?.S ?? 80),
          domainCode: String(body.domainCode || 'GENERIC'),
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  async getGlobalKpiSettingVersions(req: any) {
    return firstValueFrom(
      this.taskService.ListGlobalKpiSettingVersions({}, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
  }
}
