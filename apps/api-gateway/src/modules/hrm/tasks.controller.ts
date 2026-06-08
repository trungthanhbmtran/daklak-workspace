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
  private orgService: any;
  private employeeService: any;
  private userService: any;

  // Cache org tree (5 phút)
  private unitMapCache: {
    data: Record<number, any>;
    expiresAt: number;
  } | null = null;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly empClient: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
  ) {}

  onModuleInit() {
    this.taskService = this.client.getService(MICROSERVICES.TASK.SERVICE);
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
    this.employeeService = this.empClient.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  private async populateUsers(tasks: any[]) {
    if (!tasks || tasks.length === 0) return tasks;

    const userIds = new Set<number>();
    const collectIds = (task: any) => {
      if (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED')
        userIds.add(parseInt(task.assigneeCode, 10));
      if (task.assignerCode) userIds.add(parseInt(task.assignerCode, 10));
      if (task.supervisorCode) userIds.add(parseInt(task.supervisorCode, 10));
      if (task.coassigneeCodes)
        task.coassigneeCodes.forEach((id: string) =>
          userIds.add(parseInt(id, 10)),
        );
      if (task.children) task.children.forEach(collectIds);
    };
    tasks.forEach(collectIds);

    const idsToFetch = Array.from(userIds).filter((id) => !isNaN(id) && id > 0);
    if (idsToFetch.length === 0) return tasks;

    try {
      const userRes: any = await firstValueFrom(
        this.userService.GetUsersByIds({ ids: idsToFetch }),
      );
      const usersMap = new Map();
      (userRes?.data || []).forEach((u: any) => usersMap.set(String(u.id), u));

      const mapUsers = (task: any) => {
        if (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED') {
          const u = usersMap.get(String(task.assigneeCode));
          if (u) {
            task.assigneeName = u.fullName || u.username;
            task.assigneeAvatar = u.avatarUrl;
            task.assigneeJobTitle = u.jobTitleName;
            task.assigneeUnitName = u.unitName;
          }
        }
        if (task.assignerCode) {
          const u = usersMap.get(String(task.assignerCode));
          if (u) task.assignerName = u.fullName || u.username;
        }
        if (task.supervisorCode) {
          const u = usersMap.get(String(task.supervisorCode));
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

  private jtMapCache: { data: Record<number, any>; expiresAt: number } | null =
    null;

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

  private async getJobTitlesMap(): Promise<Record<number, any>> {
    if (this.jtMapCache && this.jtMapCache.expiresAt > Date.now())
      return this.jtMapCache.data;
    try {
      const jtRes: any = await firstValueFrom(
        this.orgService.ListJobTitles({}),
      );
      const jtMap: Record<number, any> = {};
      (jtRes?.items || []).forEach((jt: any) => {
        if (jt.id) {
          jtMap[parseInt(jt.id, 10)] = {
            id: parseInt(jt.id, 10),
            category: jt.category || '',
          };
        }
      });
      this.jtMapCache = { data: jtMap, expiresAt: Date.now() + 5 * 60 * 1000 };
      return jtMap;
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

  @Post()
  @RequirePermissions('TASK:CREATE', 'TASK:MANAGE')
  async create(@Req() req: any, @Body() body: any) {
    if (req.user) {
      body.assignerCode = req.user.employeeCode || req.user.username;
    }
    return firstValueFrom(this.taskService.CreateTask(body));
  }

  @Get()
  @RequirePermissions('TASK:READ', 'TASK:MANAGE')
  async list(
    @Req() req: any,
    @Query('tab') tab: string,
    @Query('assigneeCode') assigneeCode: string,
    @Query('filter') filter: string,
    @Query('search') search: string,
    @Query('departmentId') departmentId: string,
    @Query('planId') planId: string, // Lấy toàn bộ task của 1 kế hoạch
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

    if (tab === 'MY_TASKS' && user) {
      // Công việc được giao CHO tôi (tôi là người thực hiện)
      finalAssigneeCode = user.employeeCode;
    } else if (tab === 'ASSIGNED_BY_ME' && user) {
      // Công việc TÔI đã giao cho người khác (tôi là người giao việc)
      finalAssignerCode = user.employeeCode;
    } else if (tab === 'DEPT_TASKS' && user) {
      finalDepartmentId = user.unitId;
    }

    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE');

    // Tính ancestor unit IDs cho visibility và phân quyền theo cây tổ chức
    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    const response: any = await firstValueFrom(
      this.taskService.ListTasks({
        assigneeCode: finalAssigneeCode,
        assignerCode: finalAssignerCode,
        filter,
        search,
        status,
        priority,
        departmentId: finalDepartmentId,
        planId: planId ? parseInt(planId, 10) : undefined, // Pass planId cho plan tree
        isSupervisor: isSupervisor === 'true',
        currentUserCode: user?.employeeCode,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds, // Danh sách đơn vị cha để lọc task cấp trên
      }),
    );

    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data);
      } else {
        await this.populateUsers([response.data]);
      }
    }
    return response;
  }

  @Put(':id')
  @RequirePermissions('TASK:UPDATE', 'TASK:MANAGE')
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
      this.taskService.UpdateTask({
        id: parseInt(id, 10),
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
  @RequirePermissions('TASK:UPDATE', 'TASK:MANAGE')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('rejectReason') rejectReason?: string,
  ) {
    return firstValueFrom(
      this.taskService.UpdateTaskStatus({
        id: parseInt(id, 10),
        status,
        rejectReason,
        // Inject người thực hiện từ JWT token
        actorCode: req.user?.employeeCode || '',
      }),
    );
  }

  @Get('recommend-assignees')
  @RequirePermissions('TASK:READ', 'TASK:MANAGE')
  async recommendAssignees(
    @Req() req: any,
    @Query('rankCode') rankCode: string,
    @Query('strategy') strategy: string,
  ) {
    const user = req.user;
    const res: any = await firstValueFrom(
      this.taskService.RecommendAssignees({
        rankCode: rankCode || 'ALL',
        strategy: strategy || 'LOW_PERFORMANCE',
      }),
    );

    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE');

    if (!isAdmin && user?.unitId) {
      const [unitMap, jtMap] = await Promise.all([
        this.getUnitMap(),
        this.getJobTitlesMap(),
      ]);
      const callerUnitId = parseInt(user.unitId, 10);
      const callerUnit = unitMap[callerUnitId];

      let topEmployees = Array.isArray(res.data)
        ? res.data
        : res.data?.topEmployees || [];
      let topDepartments = Array.isArray(res.data)
        ? []
        : res.data?.topDepartments || [];

      if (callerUnit?.isLeaf) {
        // Leaf: chỉ nhân sự CÙNG PHÒNG, ngoại trừ bản thân
        topEmployees = topEmployees.filter((emp: any) => {
          if (emp.employeeCode === user.employeeCode) return false;
          return emp.departmentId === callerUnitId;
        });
        topDepartments = topDepartments.filter(
          (d: any) => d.departmentId === callerUnitId,
        );
      } else {
        // Non-leaf: lấy LÃNH ĐẠO của CÁC PHÒNG CON TRỰC TIẾP
        const directChildIds = new Set<number>(
          callerUnit?.directChildIds || [],
        );
        const leaderCategories = new Set(['EXECUTIVE', 'MANAGER']);

        topEmployees = topEmployees.filter((emp: any) => {
          if (emp.employeeCode === user.employeeCode) return false;
          if (!directChildIds.has(emp.departmentId)) return false;
          const jt = jtMap[emp.jobTitleId];
          return leaderCategories.has(jt?.category);
        });
        topDepartments = topDepartments.filter((d: any) =>
          directChildIds.has(d.departmentId),
        );
      }

      if (Array.isArray(res.data)) {
        res.data = topEmployees;
      } else {
        res.data = {
          ...res.data,
          topEmployees,
          topDepartments,
        };
      }
    }

    return res;
  }

  @Put(':id/assign')
  @RequirePermissions('TASK:UPDATE', 'TASK:MANAGE')
  async assignTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body('assigneeCode') assigneeCode: string,
    @Body('coassigneeCodes') coassigneeCodes?: string[],
    @Body('departmentId') departmentId?: number,
  ) {
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE');

    const taskId = parseInt(id, 10);
    const taskData: any = await firstValueFrom(
      this.taskService.GetTask({ id: taskId }),
    );

    // Task UNASSIGNED/TEMPLATE: bất kỳ ai đã đăng nhập đều có thể giao
    // Task đã có người xử lý: chỉ chính người đó hoặc admin mới được giao lại
    const isUnassigned =
      taskData.assigneeCode === 'UNASSIGNED' || taskData.status === 'TEMPLATE';
    if (!isAdmin && !isUnassigned && taskData.assigneeCode !== assignerCode) {
      throw new Error(
        'Bạn không có quyền giao nhiệm vụ này (Không phải người đang xử lý).',
      );
    }

    // Nếu không phải admin và có chỉ định người nhận (khác UNASSIGNED), kiểm tra phạm vi quản lý
    if (!isAdmin && assigneeCode && assigneeCode !== 'UNASSIGNED') {
      const empListRes: any = await firstValueFrom(
        this.employeeService.ListEmployees({ keyword: assigneeCode }),
      );
      const targetEmp = { data: empListRes?.data?.[0] };
      if (targetEmp?.data?.departmentId) {
        const unitMap = await this.getUnitMap();
        const assignerAncestorIds = this.getAncestorUnitIds(
          unitMap,
          parseInt(targetEmp.data.departmentId, 10),
        );

        // Người giao phải thuộc cây đơn vị của người nhận (tức là người giao là sếp của người nhận)
        if (
          user.unitId &&
          !assignerAncestorIds.includes(parseInt(user.unitId, 10))
        ) {
          throw new Error(
            'Bạn chỉ được phép giao việc cho nhân sự thuộc phạm vi quản lý của mình.',
          );
        }
      }
    }

    return firstValueFrom(
      this.taskService.AssignTask({
        id: taskId,
        assigneeCode,
        coassigneeCodes: coassigneeCodes || [],
        departmentId,
        // Inject người giao việc từ JWT token (ghi đè lên assignerCode)
        assignerCode,
      }),
    );
  }

  @Post(':id/breakdown')
  @RequirePermissions('TASK:UPDATE', 'TASK:MANAGE')
  async breakdownTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE');

    const taskId = parseInt(id, 10);
    const taskData: any = await firstValueFrom(
      this.taskService.GetTask({ id: taskId }),
    );

    // Chỉ owner (người được giao hiện tại) hoặc admin mới được tạo task con
    if (!isAdmin && taskData.assigneeCode !== assignerCode) {
      throw new Error(
        'Bạn không có quyền phân rã nhiệm vụ này (Không phải người đang xử lý).',
      );
    }

    return firstValueFrom(
      this.taskService.BreakdownTask({
        ...body,
        parentId: taskId,
        assignerCode,
      }),
    );
  }

  @Get(':id/comments')
  @RequirePermissions('TASK:READ', 'TASK:MANAGE')
  async getComments(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE');
    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    return firstValueFrom(
      this.taskService.GetComments({
        taskId: parseInt(id, 10),
        currentUserCode: user?.employeeCode,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,
      }),
    );
  }

  @Post(':id/comments')
  @RequirePermissions('TASK:READ', 'TASK:UPDATE', 'TASK:MANAGE')
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {
    return firstValueFrom(
      this.taskService.AddComment({
        taskId: parseInt(id, 10),
        authorCode: req.user?.employeeCode || '',
        content: body.content,
        isSystemMessage: body.isSystemMessage || false,
      }),
    );
  }

  @Post(':id/coordinate')
  @RequirePermissions('TASK:UPDATE', 'TASK:MANAGE')
  async requestCoordination(
    @Req() req: any,
    @Param('id') id: string,
    @Body('message') message?: string,
    @Body('leadCode') leadCode?: string,
    @Body('coordinatorCodes') coordinatorCodes?: string[],
  ) {
    const user = req.user;
    const requesterCode = user?.employeeCode;
    const taskId = parseInt(id, 10);

    const taskData: any = await firstValueFrom(
      this.taskService.GetTask({ id: taskId }),
    );
    if (!taskData) throw new Error('Task not found.');

    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE');
    const isOwner = taskData.assigneeCode === requesterCode;
    const isAssigner = taskData.assignerCode === requesterCode;

    // Supervisor assigns roles: must be assigner or admin
    if (leadCode && !isAdmin && !isAssigner) {
      throw new Error(
        'Only the task assigner can assign Lead and Coordinators.',
      );
    }

    // Request coordination: must be current assignee
    if (!leadCode && !isAdmin && !isOwner) {
      throw new Error(
        'You do not have permission to send a coordination request (not the current assignee).',
      );
    }

    return firstValueFrom(
      this.taskService.RequestCoordination({
        taskId,
        requesterCode,
        message: message || '',
        leadCode: leadCode || '',
        coordinatorCodes: coordinatorCodes || [],
      }),
    );
  }

  @Put(':id/progress')
  @RequirePermissions('TASK:UPDATE', 'TASK:MANAGE')
  async updateProgress(
    @Req() req: any,
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    return firstValueFrom(
      this.taskService.UpdateTaskProgress({
        id: parseInt(id, 10),
        progress,
        actorCode: req.user?.employeeCode || '',
      }),
    );
  }

  @Get(':id/subtasks')
  @RequirePermissions('TASK:READ', 'TASK:MANAGE')
  async getSubTasks(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE');
    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    return firstValueFrom(
      this.taskService.GetSubTasks({
        taskId: parseInt(id, 10),
        currentUserCode: user?.employeeCode,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,
      }),
    );
  }
}
