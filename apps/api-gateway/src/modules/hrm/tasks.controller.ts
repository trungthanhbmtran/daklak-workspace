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
import { DynamicPermissionsGuard } from '../../core/guards/dynamic-permissions.guard';

@ApiTags('HRM - Tasks')
@Controller('admin/hrm/tasks')
@UseGuards(JwtAuthGuard, DynamicPermissionsGuard)
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
  ) { }

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
  async create(@Req() req: any, @Body() body: any) {
    if (req.user) {
      body.assignerCode = req.user.employeeCode || req.user.username;
    }
    return firstValueFrom(this.taskService.CreateTask(body));
  }

  @Get()
  async list(
    @Req() req: any,
    @Query('tab') tab: string,
    @Query('role') role: string,          // NEW: ASSIGNEE | OWNER (3-layer model)
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
      // Tab ② "Việc của tôi": tasks được giao cho tôi thực hiện
      finalAssigneeCode = user.employeeCode;
    } else if (role === 'OWNER' && user) {
      // Tab ③ "Tôi đã giao": tasks tôi tạo/giao cho người khác
      finalAssignerCode = user.employeeCode;
    }
    // Tab ①  "Chờ giao" (PENDING_ASSIGN): assigneeCode=UNASSIGNED được pass thẳng từ query

    // ── Backward compatible (old tabs) ───────────────────────────────────────
    if (!role) {
      if (tab === 'MY_TASKS' && user) {
        finalAssigneeCode = user.employeeCode;
      } else if (tab === 'ASSIGNED_BY_ME' && user) {
        finalAssignerCode = user.employeeCode;
      } else if (tab === 'DEPT_TASKS' && user) {
        finalDepartmentId = user.unitId;
      }
    }

    const isAdmin = user?.roles?.some((r: any) => r === 'SUPER_ADMIN' || r?.code === 'SUPER_ADMIN') || user?.permissionsFlatten?.includes('TASK:MANAGE');

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
        planId: planId ? parseInt(planId, 10) : undefined,
        isSupervisor: isSupervisor === 'true',
        currentUserCode: user?.employeeCode,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,
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

    const isAdmin = user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN') || user?.permissionsFlatten?.includes('TASK:MANAGE');

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
        // Non-leaf: lấy LÃNH ĐẠO của CÁC PHÒNG CON TRỰC TIẾP (theo mã unitCode)
        const callerUnitCode = callerUnit?.code || '';
        const isDirectChildByCode = (childCode: string, parentCode: string) => {
          if (!childCode || !parentCode || childCode.length <= parentCode.length) return false;
          if (!childCode.startsWith(parentCode)) return false;
          const remainder = childCode.substring(parentCode.length);
          if (remainder[0] !== '.') return false;
          const rest = remainder.substring(1);
          return !rest.includes('.');
        };

        const directChildIds = new Set<number>();
        Object.values(unitMap).forEach((u: any) => {
          if (isDirectChildByCode(u.code, callerUnitCode)) {
            directChildIds.add(u.id);
          }
        });

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
  async assignTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body('assigneeCode') assigneeCode: string,
    @Body('coassigneeCodes') coassigneeCodes?: string[],
    @Body('departmentId') departmentId?: number,
  ) {
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN') || user?.permissionsFlatten?.includes('TASK:MANAGE');

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

    // Nếu không phải admin, kiểm tra phạm vi quản lý
    if (!isAdmin) {
      const unitMap = await this.getUnitMap();
      const callerUnitCode = user.unitCode;
      
      const isDirectChildByCode = (childCode: string, parentCode: string) => {
        if (!childCode || !parentCode || childCode.length <= parentCode.length) return false;
        if (!childCode.startsWith(parentCode)) return false;
        const remainder = childCode.substring(parentCode.length);
        if (remainder[0] !== '.') return false;
        const rest = remainder.substring(1);
        return !rest.includes('.');
      };

      let targetUnitId: number | undefined;
      let targetJobTitleId: number | undefined;

      if (assigneeCode && assigneeCode !== 'UNASSIGNED') {
        const empListRes: any = await firstValueFrom(
          this.employeeService.ListEmployees({ keyword: assigneeCode }),
        );
        const targetEmp = empListRes?.data?.[0];
        if (targetEmp) {
          targetUnitId = parseInt(targetEmp.departmentId, 10);
          targetJobTitleId = parseInt(targetEmp.jobTitleId, 10);
        }
      } else if (departmentId) {
        targetUnitId = parseInt(departmentId as any, 10);
      }

      if (targetUnitId) {
        const targetUnit = unitMap[targetUnitId];
        if (targetUnitId !== parseInt(user.unitId, 10)) {
          // Giao việc xuống phòng ban khác -> Phải là phòng con trực tiếp
          if (!targetUnit || !callerUnitCode || !isDirectChildByCode(targetUnit.code, callerUnitCode)) {
            throw new Error('Bạn chỉ được phép giao việc cho phòng ban nội bộ hoặc phòng trực tiếp (theo mã đơn vị).');
          }
          
          // Nếu giao cho cá nhân ở phòng con, cá nhân đó phải là lãnh đạo
          if (targetJobTitleId) {
            const jtMap = await this.getJobTitlesMap();
            const jt = jtMap[targetJobTitleId];
            const leaderCategories = new Set(['EXECUTIVE', 'MANAGER']);
            if (!jt || !leaderCategories.has(jt.category)) {
              throw new Error('Khi giao việc xuống phòng trực tiếp, chỉ được giao cho chức danh lãnh đạo của phòng đó.');
            }
          }
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
  async breakdownTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN') || user?.permissionsFlatten?.includes('TASK:MANAGE');

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
  async getComments(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    const isAdmin = user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN') || user?.permissionsFlatten?.includes('TASK:MANAGE');
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

    const isAdmin = user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN') || user?.permissionsFlatten?.includes('TASK:MANAGE');
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
  async getSubTasks(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    const isAdmin = user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN') || user?.permissionsFlatten?.includes('TASK:MANAGE');
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

