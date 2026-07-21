import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TasksService } from './tasks.service';

@ApiTags('HRM - Tasks')
@Controller('admin/hrm/tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.tasksService.create(req, body);
  }

  @Get()
  async list(
    @Req() req: any,
    @Query('role') role: string,
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
    return this.tasksService.list(req, role, assigneeCode, assignerCode, filter, search, departmentId, planId, isSupervisor, status, priority, page, limit, statsFilter);
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
    return this.tasksService.getStats(req, role, assigneeCode, assignerCode, departmentId, planId, isSupervisor, status, priority, search);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.tasksService.update(req, id, body);
  }

  @Put(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('rejectReason') rejectReason?: string,
    @Body('actionName') actionName?: string,
  ) {
    return this.tasksService.updateStatus(req, id, status, rejectReason, actionName);
  }

  @Get('recommend-assignees')
  async recommendAssignees(
    @Req() req: any,
    @Query('rankCode') rankCode: string,
    @Query('strategy') strategy: string,
    @Query('domainId') domainId: string,
    @Query('jobTitleId') jobTitleId: string,
  ) {
    return this.tasksService.recommendAssignees(req, rankCode, strategy, domainId, jobTitleId);
  }

  @Put(':id/assign')
  async assignTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.tasksService.assignTask(req, id, body);
  }

  @Post(':id/breakdown')
  async breakdownTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.tasksService.breakdownTask(req, id, body);
  }

  @Get(':id/comments')
  async getComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getComments(req, id);
  }

  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {
    return this.tasksService.addComment(req, id, body);
  }

  @Post(':id/coordinate')
  async requestCoordination(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.tasksService.requestCoordination(req, id, body);
  }

  @Put(':id/progress')
  async updateProgress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('progress') progress: number,
  ) {
    return this.tasksService.updateProgress(req, id, progress);
  }

  @Get(':id/subtasks')
  async getSubTasks(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getSubTasks(req, id);
  }

  @Get(':id/history')
  async getTaskHistory(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getTaskHistory(id);
  }

  @Put(':id/kpi-setting')
  async upsertTaskKpiSetting(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.tasksService.upsertTaskKpiSetting(id, body);
  }

  @Get(':id/kpi-setting')
  async getTaskKpiSetting(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getTaskKpiSetting(id);
  }

  @Get(':id')
  async getTask(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getTask(req, id);
  }

  @Get(':id/steps')
  async listSteps(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.listSteps(req, id);
  }

  @Post(':id/steps')
  async createStep(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.tasksService.createStep(req, id, body);
  }

  @Put(':id/steps/:stepId')
  async updateStep(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('stepId', ParseIntPipe) stepId: number,
    @Body() body: any,
  ) {
    return this.tasksService.updateStep(req, id, stepId, body);
  }

  @Delete(':id/steps/:stepId')
  async deleteStep(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('stepId', ParseIntPipe) stepId: number,
  ) {
    return this.tasksService.deleteStep(req, id, stepId);
  }
}
