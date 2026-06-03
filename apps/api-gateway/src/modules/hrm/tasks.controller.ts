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

@ApiTags('HRM - Tasks')
@Controller('admin/hrm/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController implements OnModuleInit {
  private taskService: any;
  private orgService: any;

  // Cache org tree (5 phút)
  private unitMapCache: { data: Record<number, any>; expiresAt: number } | null = null;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
  ) {}

  onModuleInit() {
    this.taskService = this.client.getService(MICROSERVICES.TASK.SERVICE);
    this.orgService = this.orgClient.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now()) return this.unitMapCache.data;
    try {
      const treeRes: any = await firstValueFrom(this.orgService.GetFullTree({}));
      const unitMap: Record<number, any> = {};
      const flatten = (nodes: any[]) => {
        for (const n of nodes) {
          const nId = parseInt(n.id, 10);
          if (nId) unitMap[nId] = { id: nId, parentId: n.parentId ? parseInt(n.parentId, 10) : null };
          if (n.children?.length) flatten(n.children);
        }
      };
      flatten(treeRes?.nodes || []);
      this.unitMapCache = { data: unitMap, expiresAt: Date.now() + 5 * 60 * 1000 };
      return unitMap;
    } catch { return {}; }
  }

  private getAncestorUnitIds(unitMap: Record<number, any>, unitId: number): number[] {
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
    @Query('assigneeCode') assigneeCode: string,
    @Query('filter') filter: string,
    @Query('search') search: string,
    @Query('departmentId') departmentId: string,
    @Query('planId') planId: string,          // Lấy toàn bộ task của 1 kế hoạch
    @Query('isSupervisor') isSupervisor: string,
    @Query('status') status: string,
    @Query('priority') priority: string,
  ) {
    const user = req.user;
    let finalAssigneeCode = assigneeCode;
    let finalAssignerCode: string | undefined = undefined;
    let finalDepartmentId = departmentId ? parseInt(departmentId, 10) : undefined;

    if (tab === 'MY_TASKS' && user) {
      // Công việc được giao CHO tôi (tôi là người thực hiện)
      finalAssigneeCode = user.employeeCode || user.username;
    } else if (tab === 'ASSIGNED_BY_ME' && user) {
      // Công việc TÔI đã giao cho người khác (tôi là người giao việc)
      finalAssignerCode = user.employeeCode || user.username;
    } else if (tab === 'DEPT_TASKS' && user) {
      finalDepartmentId = user.unitId;
    }

    const isAdmin = user?.roles?.includes('ADMIN') || user?.role === 'ADMIN' || user?.username === 'admin';

    // Tính ancestor unit IDs cho visibility và phân quyền theo cây tổ chức
    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(unitMap, parseInt(user.unitId, 10));
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
        planId: planId ? parseInt(planId, 10) : undefined,  // Pass planId cho plan tree
        isSupervisor: isSupervisor === 'true',
        currentUserCode: user?.employeeCode || user?.username,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,  // Danh sách đơn vị cha để lọc task cấp trên
      }),
    );

    if (response && user) {
      if (!response.meta) response.meta = {};
      response.meta.currentUser = user;
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
    @Body('rejectReason') rejectReason?: string
  ) {
    return firstValueFrom(
      this.taskService.UpdateTaskStatus({
        id: parseInt(id, 10),
        status,
        rejectReason,
        // Inject người thực hiện từ JWT token
        actorCode: req.user?.employeeCode || req.user?.username || '',
      }),
    );
  }

  @Get('recommend-assignees')
  async recommendAssignees(
    @Query('rankCode') rankCode: string,
    @Query('strategy') strategy: string,
  ) {
    return firstValueFrom(
      this.taskService.RecommendAssignees({
        rankCode: rankCode || 'ALL',
        strategy: strategy || 'LOW_PERFORMANCE',
      }),
    );
  }

  @Put(':id/assign')
  async assignTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body('assigneeCode') assigneeCode: string,
    @Body('departmentId') departmentId?: number,
  ) {
    return firstValueFrom(
      this.taskService.AssignTask({
        id: parseInt(id, 10),
        assigneeCode,
        departmentId,
        // Inject người giao việc từ JWT token (ghi đè lên assignerCode)
        assignerCode: req.user?.employeeCode || req.user?.username || '',
      }),
    );
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return firstValueFrom(
      this.taskService.GetComments({
        taskId: parseInt(id, 10),
      }),
    );
  }

  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; isSystemMessage?: boolean }
  ) {
    return firstValueFrom(
      this.taskService.AddComment({
        taskId: parseInt(id, 10),
        authorCode: req.user?.employeeCode || req.user?.username || '',
        content: body.content,
        isSystemMessage: body.isSystemMessage || false,
      }),
    );
  }

  @Get(':id/subtasks')
  async getSubTasks(@Param('id') id: string) {
    return firstValueFrom(
      this.taskService.GetSubTasks({
        taskId: parseInt(id, 10),
      }),
    );
  }
}
