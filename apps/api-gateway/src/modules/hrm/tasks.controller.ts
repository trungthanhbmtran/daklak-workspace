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

@ApiTags('HRM - Tasks')
@Controller('admin/hrm/tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController implements OnModuleInit {
  private taskService: any;
  private orgService: any;
  private userService: any;

  // Cache org tree (5 phút)
  private unitMapCache: {
    data: Record<number, any>;
    expiresAt: number;
  } | null = null;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
  ) { }

  onModuleInit() {
    this.taskService = this.client.getService(MICROSERVICES.TASK.SERVICE);
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
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


  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now())
      return this.unitMapCache.data;
    try {
      const treeRes: any = await firstValueFrom(
        this.orgService.GetFullTree({}),
      );
      const unitMap: Record<number, any> = {};
      const flattenNodes = (nodes: any[]) => {
        for (const n of nodes) {
          const nId = parseInt(n.id, 10);
          if (nId) {
            unitMap[nId] = {
              id: nId,
              name: n.name || n.title || '',
              code: n.code,
              parentId: n.parentId ? parseInt(n.parentId, 10) : null,
              isLeaf: n.isLeaf ?? !n.children?.length,
              directChildIds: (n.children || [])
                .map((c: any) => parseInt(c.id, 10))
                .filter(Boolean),
            };
          }
          if (n.children && n.children.length > 0) flattenNodes(n.children);
        }
      };
      flattenNodes(treeRes?.nodes || []);
      this.unitMapCache = {
        data: unitMap,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return unitMap;
    } catch {
      return {};
    }
  }



  private getAncestorUnitIds(
    unitMap: Record<number, any>,
    unitId: number,
  ): number[] {
    const ids: number[] = [];
    let current = unitMap[unitId];
    if (current) ids.push(unitId);
    while (current?.parentId) {
      ids.push(current.parentId);
      current = unitMap[current.parentId];
    }
    return ids;
  }

  private getDescendantUnitIds(
    unitMap: Record<number, any>,
    unitId: number,
  ): number[] {
    const ids: number[] = [unitId];
    const queue = [unitId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const current = unitMap[currentId];
      if (current && current.directChildIds) {
        for (const childId of current.directChildIds) {
          if (!ids.includes(childId)) {
            ids.push(childId);
            queue.push(childId);
          }
        }
      }
    }
    return ids;
  }


  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user) {
      body.assignerCode = req.user.employeeCode || req.user.username;
    }
    return firstValueFrom(this.taskService.CreateTask(body));
  }

  @Get()
  async list(
    @Req() req: any,
    @Query('role') role: string, // NEW: ASSIGNEE | OWNER (3-layer model)
    @Query('assigneeCode') assigneeCode: string,
    @Query('filter') filter: string,
    @Query('search') search: string,
    @Query('departmentId') departmentId: string,
    @Query('planId') planId: string,
    @Query('isSupervisor') isSupervisor: string,
    @Query('status') status: string,
    @Query('priority') priority: string,
  ) {
    const user = req.user;
    let finalAssigneeCode = assigneeCode;
    let finalAssignerCode: string | undefined = undefined;
    let finalDepartmentId = departmentId
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

    let callerAncestorUnitIds: number[] = [];
    let callerDescendantUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
      callerDescendantUnitIds = this.getDescendantUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    const requestPayload = {
      assigneeCode: finalAssigneeCode,
      assignerCode: finalAssignerCode,
      filter,
      search,
      status,
      priority,
      departmentId: finalDepartmentId,
      planId: planId ? parseInt(planId, 10) : undefined,
      isSupervisor: isSupervisor === 'true',
      currentUserCode: user?.employeeCode,
      isAdmin,
      isLeader,
      currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      callerAncestorUnitIds,
      callerDescendantUnitIds,
      role,
    };
    
    console.log('[TasksController] ListTasks Request Payload:', JSON.stringify(requestPayload, null, 2));

    const response: any = await firstValueFrom(
      this.taskService.ListTasks(requestPayload),
    );

    console.log('[TasksController] ListTasks Raw Response Data Length:', response?.data?.length);
    if (response?.data?.length === 0) {
      console.log('[TasksController] ListTasks Raw Response is EMPTY. Response object:', JSON.stringify(response, null, 2));
    }

    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data);
      } else {
        await this.populateUsers([response.data]);
      }
    }

    // Inject currentUserCode into meta for frontend role badge mapping
    if (response && user?.employeeCode) {
      response.meta = response.meta || {};
      response.meta.currentUserCode = user.employeeCode;
    }

    return response;
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return firstValueFrom(
      this.taskService.UpdateTask({
        id,
        weight: body.weight,
        startDate: body.startDate,
        dueDate: body.dueDate,
        priority: body.priority,
        baseScore: body.baseScore,
        title: body.title,
        description: body.description,
      }),
    );
  }

  @Put(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('rejectReason') rejectReason?: string,
  ) {
    const user = req.user;
    return firstValueFrom(
      this.taskService.UpdateTaskStatus({
        id,
        status,
        rejectReason,
        // Inject người thực hiện từ JWT token
        actorCode: user?.employeeCode || '',
        currentUserPermissions: user?.permissionsFlatten || [],
        currentUserId: user?.id,
        currentUserCode: user?.employeeCode || user?.username,
      }),
    );
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
    const unitMap = await this.getUnitMap();

    // API Gateway chỉ đóng vai trò forward context (token info) xuống backend.
    // Việc quyết định user có quyền gì (Admin, Quản lý) và được phép xem danh sách nhân sự nào
    // hoàn toàn thuộc trách nhiệm của hrm-service.

    let res: any;
    try {
      res = await firstValueFrom(
        this.taskService.RecommendAssignees({
          rankCode: rankCode || 'ALL',
          strategy: strategy || 'LOW_PERFORMANCE',
          domainId,
          jobTitleId,
          currentUserId: user?.id,
          currentUserCode: user?.employeeCode,
          currentUserPermissions: user?.permissionsFlatten || [],
        }),
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
      const deptId = emp.departmentId ? parseInt(emp.departmentId, 10) : 0;
      const dept = unitMap[deptId];
      return {
        ...emp,
        employeeName:
          emp.fullName || emp.employeeName || emp.username || emp.employeeCode,
        departmentName: dept?.name || '',
        currentLoad:
          emp.currentLoad !== undefined ? emp.currentLoad : emp.taskCount || 0,
        performanceScore:
          emp.performanceScore !== undefined
            ? emp.performanceScore
            : emp.kpiScore || Math.max(50, 100 - idx * 5),
      };
    });

    topDepartments = topDepartments.map((d: any) => {
      const deptId = d.departmentId ? parseInt(d.departmentId, 10) : 0;
      const dept = unitMap[deptId];
      return {
        ...d,
        departmentName: dept?.name || '',
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
    

    return firstValueFrom(
      this.taskService.AssignTask({
        id,
        assigneeCode,
        coassigneeCodes: coassigneeCodes || [],
        departmentId,
        assignerCode,
        currentUserPermissions: user?.permissionsFlatten || [],
        currentUserId: user?.id,
        currentUserCode: user?.employeeCode || user?.username,
      }),
    );
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
      this.taskService.GetTask({ id: id }),
    );
    if (!taskResponse) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    // Chỉ owner (người được giao hiện tại) hoặc admin mới được tạo task con
    if (!isAdmin && taskResponse.assigneeCode !== assignerCode) {
      throw new Error(
        'Bạn không có quyền phân rã nhiệm vụ này (Không phải người đang xử lý).',
      );
    }

    return firstValueFrom(
      this.taskService.BreakdownTask({
        ...body,
        parentId: id,
        assignerCode,
      }),
    );
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
      this.taskService.GetComments({
        taskId: id,
        currentUserCode: user?.employeeCode,
        isAdmin,
        isLeader,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      }),
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
    let callerAncestorUnitIds: number[] = [];
    let callerDescendantUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
      callerDescendantUnitIds = this.getDescendantUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    return firstValueFrom(
      this.taskService.AddComment({
        id: id,
        authorCode: req.user?.employeeCode || '',
        content: body.content,
        isSystemMessage: body.isSystemMessage || false,
        currentUserCode: user?.employeeCode,
        isAdmin,
        isLeader,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,
        callerDescendantUnitIds,
      }),
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
    

    const taskResponse: any = await firstValueFrom(
      this.taskService.GetTask({ id: id }),
    );
    if (!taskResponse) throw new Error('Task not found.');

    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isOwner = taskResponse.assigneeCode === requesterCode;
    const isAssigner = taskResponse.assignerCode === requesterCode;

    return firstValueFrom(
      this.taskService.RequestCoordination({
        id: id,
        requesterCode,
        message: message || '',
        leadId: leadCode || '',
        coordinatorIds: coordinatorCodes || [],
        leadCode: leadCode || '',
        coordinatorCodes: coordinatorCodes || [],
      }),
    );
  }

  @Put(':id/progress')
  async updateProgress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('progress') progress: number,
  ) {
    return firstValueFrom(
      this.taskService.UpdateTaskProgress({
        id,
        progress,
        actorCode: req.user?.employeeCode || '',
      }),
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

    return firstValueFrom(
      this.taskService.GetSubTasks({
        taskId: id,
        currentUserCode: user?.employeeCode,
        isAdmin,
        isLeader,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      }),
    );
  }

}