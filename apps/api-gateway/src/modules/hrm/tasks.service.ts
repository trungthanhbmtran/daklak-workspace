import { Injectable, Inject, OnModuleInit , InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import * as jwt from 'jsonwebtoken';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class TasksService implements OnModuleInit {
  private taskService: any;
  private userService: any;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
  ) {}

  onModuleInit() {
    this.taskService = this.client.getService(MICROSERVICES.TASK.SERVICE);
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  getGrpcMetadata(req: any) {
    const meta = new Metadata();
    if (req?.user) {
      const internalToken = jwt.sign(
        req.user,
        process.env.JWT_SECRET || 'super-secret',
      );
      meta.add('authorization', `Bearer ${internalToken}`);
    } else if (req?.headers?.authorization) {
      meta.add('authorization', req.headers.authorization);
    }
    return meta;
  }

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

    try {
      const usersRes: any = await firstValueFrom(
        this.userService.ListUsers({ take: 500 }),
      );
      const users = usersRes?.data || [];
      const usersMap = new Map<string, any>();
      users.forEach((u: any) => {
        if (u.employeeCode) {
          usersMap.set(u.employeeCode, u);
        }
        usersMap.set(String(u.id), u);
      });

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
    } catch (e) {
      console.error('Failed to populate users:', e);
    }
    return tasks;
  }

  translateTaskData(task: any) {
    if (!task) return task;
    const statusMap: Record<string, string> = {
      ASSIGNED: 'Mới giao',
      IN_PROGRESS: 'Đang xử lý',
      PENDING_REVIEW: 'Chờ duyệt',
      COMPLETED: 'Hoàn thành',
      OVERDUE: 'Quá hạn',
      REJECTED: 'Bị từ chối',
      DRAFT: 'Nháp',
    };
    const priorityMap: Record<string, string> = {
      HIGH: 'Cao',
      NORMAL: 'Thường',
      LOW: 'Thấp',
      URGENT: 'Khẩn',
    };
    if (task.status && statusMap[task.status])
      task.status = statusMap[task.status];
    if (task.priority && priorityMap[task.priority])
      task.priority = priorityMap[task.priority];
    if (task.children)
      task.children.forEach((c: any) => this.translateTaskData(c));
    if (task.subTasks)
      task.subTasks.forEach((c: any) => this.translateTaskData(c));
    return task;
  }

  // --- Endpoints ---
  async create(req: any, body: any) {
    if (req.user) {
      body.assignerCode = req.user.employeeCode || req.user.username;
      body.currentEmployeeCode = req.user.employeeCode;
      body.currentUserId = req.user.id ? parseInt(req.user.id, 10) : undefined;
      body.currentUserPermissions = req.user.permissionsFlatten || [];
    }

    if (body.coAssigneeCodes) {
      body.coassigneeCodes = body.coAssigneeCodes;
      delete body.coAssigneeCodes;
    }

    const response: any = await firstValueFrom(
      this.taskService.CreateTask(body, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async list(req: any, role: string, assigneeCode: string, assignerCode: string, filter: string, search: string, departmentId: string, planId: string, isSupervisor: string, status: string, priority: string, page: string, limit: string, statsFilter: string) {
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

    const requestPayload = {
      assigneeCode: finalAssigneeCode,
      assignerCode: finalAssignerCode,
      filter,
      search,
      status,
      priority,
      statsFilter,
      departmentId: finalDepartmentId,
      planId:
        planId && planId !== 'undefined' ? parseInt(planId, 10) : undefined,
      isSupervisor: isSupervisor === 'true',
      currentEmployeeCode: user?.employeeCode,
      isAdmin,
      isLeader,
      currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      currentUserId: user?.id ? parseInt(user.id, 10) : undefined,
      role,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    const response: any = await firstValueFrom(
      this.taskService.ListTasks(requestPayload, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });

    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data);
        response.data.forEach((t: any) => this.translateTaskData(t));
      } else {
        await this.populateUsers([response.data]);
        this.translateTaskData(response.data);
      }
    }

    if (response && user?.employeeCode) {
      response.meta = response.meta || {};
      response.meta.currentEmployeeCode = user.employeeCode;
    }
    return response;
  }

  async getStats(req: any, role: string, assigneeCode: string, assignerCode: string, departmentId: string, planId: string, isSupervisor: string, status: string, priority: string, search: string) {
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

    const requestPayload = {
      assigneeCode: finalAssigneeCode,
      assignerCode: finalAssignerCode,
      departmentId: finalDepartmentId,
      planId:
        planId && planId !== 'undefined' ? parseInt(planId, 10) : undefined,
      isSupervisor: isSupervisor === 'true',
      status,
      priority,
      search,
      currentEmployeeCode: user?.employeeCode,
      isAdmin,
      isLeader,
      currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      currentUserId: user?.id ? parseInt(user.id, 10) : undefined,
      role,
    };

    const response: any = await firstValueFrom(
      this.taskService.GetTaskStats(requestPayload, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return response;
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
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async updateStatus(req: any, id: number, status: string, rejectReason?: string, actionName?: string) {
    const user = req.user;
    const response: any = await firstValueFrom(
      this.taskService.UpdateTaskStatus(
        {
          id,
          status,
          rejectReason,
          actionName,
          actorCode: user?.employeeCode || '',
          currentUserPermissions: user?.permissionsFlatten || [],
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async recommendAssignees(req: any, rankCode: string, strategy: string, domainId: string, jobTitleId: string) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    let res: any;
    try {
      res = await firstValueFrom(
        this.taskService.RecommendAssignees(
          {
            rankCode: rankCode || 'ALL',
            strategy: strategy || 'LOW_PERFORMANCE',
            domainId,
            jobTitleId,
            currentUserId: user?.id ? parseInt(user.id, 10) : undefined,
            currentEmployeeCode: user?.employeeCode,
            currentUserPermissions: user?.permissionsFlatten || [],
          },
          this.getGrpcMetadata(req),
        ),
      );
    } catch (e) {
      console.error('Failed to call recommendAssignees from taskService:', e);
      res = { success: true, data: { topEmployees: [], topDepartments: [] } };
    }

    let topEmployees = Array.isArray(res?.data)
      ? res.data
      : res?.data?.topEmployees || [];
    let topDepartments = Array.isArray(res?.data)
      ? []
      : res?.data?.topDepartments || [];

    topEmployees = topEmployees.map((emp: any, idx: number) => {
      return {
        ...emp,
        employeeName:
          emp.fullName || emp.employeeName || emp.username || emp.employeeCode,
        departmentName: emp.departmentName || '',
        currentLoad:
          emp.currentLoad !== undefined ? emp.currentLoad : emp.taskCount || 0,
        performanceScore:
          emp.performanceScore !== undefined
            ? emp.performanceScore
            : emp.kpiScore || Math.max(50, 100 - idx * 5),
      };
    });

    topDepartments = topDepartments.map((d: any) => {
      return {
        ...d,
        departmentName: d.departmentName || d.name || '',
      };
    });

    return { success: true, data: { topEmployees, topDepartments } };
  }

  async assignTask(req: any, id: number, body: any) {
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
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
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
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    if (!taskResponse) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    const breakdownResponse: any = await firstValueFrom(
      this.taskService.BreakdownTask(
        {
          ...body,
          coassigneeCodes: body.coassigneeCodes || body.coAssigneeCodes,
          id: id,
          parentId: id,
          assignerCode,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    if (breakdownResponse?.data) this.translateTaskData(breakdownResponse.data);
    return breakdownResponse;
  }

  async getComments(req: any, id: number) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    return firstValueFrom(
      this.taskService.GetComments(
        {
          taskId: id,
          currentEmployeeCode: user?.employeeCode,
          isAdmin,
          isLeader,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async addComment(req: any, id: number, body: { content: string; isSystemMessage?: boolean }) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');
    return firstValueFrom(
      this.taskService.AddComment(
        {
          taskId: id,
          authorCode: req.user?.employeeCode || '',
          content: body.content,
          isSystemMessage: body.isSystemMessage || false,
          currentEmployeeCode: user?.employeeCode,
          isAdmin,
          isLeader,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
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
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
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
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async updateProgress(req: any, id: number, progress: number) {
    return firstValueFrom(
      this.taskService.UpdateTaskProgress(
        {
          id,
          progress,
          actorCode: req.user?.employeeCode || '',
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
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
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
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

  async getTaskHistory(id: number) {
    return firstValueFrom(
      this.taskService.GetTaskHistory({ taskId: id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async upsertTaskKpiSetting(id: number, body: any) {
    return firstValueFrom(
      this.taskService.UpsertTaskKpiSetting({ taskId: id, ...body }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async getTaskKpiSetting(id: number) {
    return firstValueFrom(
      this.taskService.GetTaskKpiSetting({ taskId: id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async getTask(req: any, id: number) {
    const user = req.user;
    const response = (await firstValueFrom(
      this.taskService.getTask(
        {
          id,
          currentEmployeeCode: user?.employeeCode,
          isAdmin: user?.permissionsFlatten?.includes('TASK:MANAGE') || false,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async listSteps(req: any, id: number) {
    return firstValueFrom(
      this.taskService.ListSteps({ taskId: id }, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async createStep(req: any, id: number, body: any) {
    return firstValueFrom(
      this.taskService.CreateStep(
        { taskId: id, ...body },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async updateStep(req: any, id: number, stepId: number, body: any) {
    return firstValueFrom(
      this.taskService.UpdateStep(
        { taskId: id, stepId, ...body },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async deleteStep(req: any, id: number, stepId: number) {
    return firstValueFrom(
      this.taskService.DeleteStep(
        { taskId: id, stepId },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }
}
