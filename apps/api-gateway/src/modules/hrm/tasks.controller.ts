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

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.taskService = this.client.getService(MICROSERVICES.TASK.SERVICE);
  }

  @Post()
  async create(@Body() body: any) {
    return firstValueFrom(this.taskService.CreateTask(body));
  }

  @Get()
  async list(
    @Query('assigneeCode') assigneeCode: string,
    @Query('filter') filter: string,
    @Query('search') search: string,
    @Query('departmentId') departmentId: string,
    @Query('isSupervisor') isSupervisor: string,
  ) {
    return firstValueFrom(
      this.taskService.ListTasks({
        assigneeCode,
        filter,
        search,
        departmentId: departmentId ? parseInt(departmentId, 10) : undefined,
        isSupervisor: isSupervisor === 'true',
      }),
    );
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body('status') status: string,
    @Body('rejectReason') rejectReason?: string
  ) {
    return firstValueFrom(
      this.taskService.UpdateTaskStatus({
        id: parseInt(id, 10),
        status,
        rejectReason,
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
    @Param('id') id: string,
    @Body('assigneeCode') assigneeCode: string,
    @Body('departmentId') departmentId?: number,
  ) {
    return firstValueFrom(
      this.taskService.AssignTask({
        id: parseInt(id, 10),
        assigneeCode,
        departmentId,
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
    @Param('id') id: string,
    @Body() body: { authorCode: string; content: string; isSystemMessage?: boolean }
  ) {
    return firstValueFrom(
      this.taskService.AddComment({
        taskId: parseInt(id, 10),
        authorCode: body.authorCode,
        content: body.content,
        isSystemMessage: body.isSystemMessage || false,
      }),
    );
  }
}
