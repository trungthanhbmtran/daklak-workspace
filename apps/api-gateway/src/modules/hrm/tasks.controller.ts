import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  OnModuleInit,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';

@ApiTags('HRM - Tasks')
@Controller('admin/hrm/tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController implements OnModuleInit {
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

  private getGrpcMetadata(req: any) {
    const Metadata = require('@grpc/grpc-js').Metadata;
    const meta = new Metadata();

    if (req?.user) {
      const jwt = require('jsonwebtoken');
      // Encode full req.user (including permissionsFlatten, employeeCode) into an internal token
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

  private async populateUsers(tasks: any[]) {
    if (!tasks || tasks.length === 0) return tasks;

    // Collect all employee codes and potential user IDs
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
      // Fetch all users to construct an employeeCode/userId to user details map
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
        if (task.children) task.children.forEach(mapUsers);
      };
      tasks.forEach(mapUsers);
    } catch (e) {
      console.error('Failed to populate users:', e);
    }
    return tasks;
  }

  private translateTaskData(task: any) {
    if (!task) return task;
    const statusMap: Record<string, string> = {
      ASSIGNED: 'Mới giao',
      IN_PROGRESS: 'Đang xử lý',
      PENDING_REVIEW: 'Chờ duyệt',
      COMPLETED: 'Hoàn thành',
      OVERDUE: 'Quá hạn',
      REJECTED: 'Bị từ chối',
      DRAFT: 'Nháp'
    };
    const priorityMap: Record<string, string> = {
      HIGH: 'Cao',
      NORMAL: 'Thường',
      LOW: 'Thấp',
      URGENT: 'Khẩn'
    };
    if (task.status && statusMap[task.status]) task.status = statusMap[task.status];
    if (task.priority && priorityMap[task.priority]) task.priority = priorityMap[task.priority];
    if (task.children) task.children.forEach((c: any) => this.translateTaskData(c));
    if (task.subTasks) task.subTasks.forEach((c: any) => this.translateTaskData(c));
    return task;
  }


  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user) {
      body.assignerCode = req.user.employeeCode || req.user.username;
      body.currentEmployeeCode = req.user.employeeCode;
      body.currentUserId = req.user.id ? parseInt(req.user.id, 10) : undefined;
      body.currentUserPermissions = req.user.permissionsFlatten || [];
    }
    const response: any = await firstValueFrom(
      this.taskService.CreateTask(body, this.getGrpcMetadata(req)),
    );
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  @Get()
  async list(
    @Req() req: any,
    @Query('role') role: string, // NEW: ASSIGNEE | OWNER (3-layer model)
    @Query('assigneeCode') assigneeCode: string,
    @Query('assignerCode') assignerCode: string,
    @Query('filter') filter: string,
    @Query('search') search: string,
    @Query('departmentId') departmentId: string,
    @Query('planId') planId: string,
    @Query('isSupervisor') isSupervisor: string,
    @Query('status') status: string,
    @Query('priority') priority: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('statsFilter') statsFilter: string,
  ) {
    const user = req.user;
    let finalAssigneeCode = assigneeCode;
    let finalAssignerCode: string | undefined = assignerCode;
    const finalDepartmentId = (departmentId && departmentId !== 'undefined')
      ? parseInt(departmentId, 10)
      : undefined;

    // ── 3-layer model (new tabs) ──────────────────────────────────────────────
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
      planId: (planId && planId !== 'undefined') ? parseInt(planId, 10) : undefined,
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

    console.log(
      '[TasksController] ListTasks Request Payload:',
      JSON.stringify(requestPayload, null, 2),
    );

    const response: any = await firstValueFrom(
      this.taskService.ListTasks(requestPayload, this.getGrpcMetadata(req)),
    );

    console.log(
      '[TasksController] ListTasks Raw Response Data Length:',
      response?.data?.length,
    );
    if (response?.data?.length === 0) {
      console.log(
        '[TasksController] ListTasks Raw Response is EMPTY. Response object:',
        JSON.stringify(response, null, 2),
      );
    }

    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data);
        response.data.forEach((t: any) => this.translateTaskData(t));
      } else {
        await this.populateUsers([response.data]);
        this.translateTaskData(response.data);
      }
    }

    // Inject currentEmployeeCode into meta for frontend role badge mapping
    if (response && user?.employeeCode) {
      response.meta = response.meta || {};
      response.meta.currentEmployeeCode = user.employeeCode;
    }

    return response;
  }

  @Get('stats')
  async getStats(
    @Req() req: any,
    @Query('role') role: string,
    @Query('assigneeCode') assigneeCode: string,
    @Query('assignerCode') assignerCode: string,
    @Query('departmentId') departmentId: string,
    @Query('planId') planId: string,
    @Query('isSupervisor') isSupervisor: string,
    @Query('status') status: string,
    @Query('priority') priority: string,
    @Query('search') search: string,
  ) {
    const user = req.user;
    let finalAssigneeCode = assigneeCode;
    let finalAssignerCode: string | undefined = assignerCode;
    const finalDepartmentId = (departmentId && departmentId !== 'undefined')
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
      planId: (planId && planId !== 'undefined') ? parseInt(planId, 10) : undefined,
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

    console.log(
      '[TasksController] GetTaskStats Request Payload:',
      JSON.stringify(requestPayload, null, 2),
    );

    const response: any = await firstValueFrom(
      this.taskService.GetTaskStats(requestPayload, this.getGrpcMetadata(req)),
    );

    return response;
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
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
    );
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  @Put(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('rejectReason') rejectReason?: string,
    @Body('actionName') actionName?: string,
  ) {
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
    );
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  @Get('recommend-assignees')
  async recommendAssignees(
    @Req() req: any,
    @Query('rankCode') rankCode: string,
    @Query('strategy') strategy: string,
    @Query('domainId') domainId: string,
    @Query('jobTitleId') jobTitleId: string,
  ) {
    const user = req.user;
    // API Gateway chỉ đóng vai trò forward context (token info) xuống backend.
    // Việc quyết định user có quyền gì (Admin, Quản lý) và được phép xem danh sách nhân sự nào
    // hoàn toàn thuộc trách nhiệm của hrm-service.

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

    // Normalize field names and resolve department names
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

    return {
      success: true,
      data: {
        topEmployees,
        topDepartments,
      },
    };
  }

  @Put(':id/assign')
  async assignTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
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
    );
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  @Post(':id/breakdown')
  async breakdownTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
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
    );
    if (!taskResponse) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    const breakdownResponse: any = await firstValueFrom(
      this.taskService.BreakdownTask(
        {
          ...body,
          id: id,
          parentId: id,
          assignerCode,
        },
        this.getGrpcMetadata(req),
      ),
    );
    if (breakdownResponse?.data) this.translateTaskData(breakdownResponse.data);
    return breakdownResponse;
  }

  @Get(':id/comments')
  async getComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
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
    );
  }

  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {
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
    );
  }

  @Post(':id/coordinate')
  async requestCoordination(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
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
    );
    if (!taskResponse) throw new Error('Task not found.');
    const isOwner = taskResponse.assigneeCode === requesterCode;
    const isAssigner = taskResponse.assignerCode === requesterCode;

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
    );
  }

  @Put(':id/progress')
  async updateProgress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('progress') progress: number,
  ) {
    return firstValueFrom(
      this.taskService.UpdateTaskProgress(
        {
          id,
          progress,
          actorCode: req.user?.employeeCode || '',
        },
        this.getGrpcMetadata(req),
      ),
    );
  }

  @Get(':id/subtasks')
  async getSubTasks(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
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
    );
    if (response?.data) {
      if (Array.isArray(response.data)) {
        response.data.forEach((t: any) => this.translateTaskData(t));
      } else {
        this.translateTaskData(response.data);
      }
    }
    return response;
  }

  @Get(':id/history')
  async getTaskHistory(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.taskService.GetTaskHistory({ taskId: id }));
  }

  @Put(':id/kpi-setting')
  async upsertTaskKpiSetting(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return firstValueFrom(this.taskService.UpsertTaskKpiSetting({ taskId: id, ...body }));
  }

  @Get(':id/kpi-setting')
  async getTaskKpiSetting(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.taskService.GetTaskKpiSetting({ taskId: id }));
  }

}