import { Controller, Get, Post, Put, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
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
  async list(@Query('assigneeId') assigneeId: string) {
    return firstValueFrom(this.taskService.ListTasks({
      assigneeId: assigneeId ? parseInt(assigneeId, 10) : undefined,
    }));
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return firstValueFrom(this.taskService.UpdateTaskStatus({
      id: parseInt(id, 10),
      status,
    }));
  }
}
