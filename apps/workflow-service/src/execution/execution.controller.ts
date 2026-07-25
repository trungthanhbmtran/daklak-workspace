import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ExecutionService } from './execution.service';

@Controller('workflow')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post('processes/:code/start')
  async startProcessHttp(@Param('code') code: string, @Body() payload: any) {
    const instance = await this.executionService.startProcess(code, payload);
    return {
      success: true,
      data: instance,
      message: 'OK',
    };
  }

  @EventPattern('workflow.instance.start_requested')
  async handleStartRequested(@Payload() data: { code: string; payload: any }) {
    await this.executionService.startProcess(data.code, data.payload);
  }

  @EventPattern('workflow.task.action_submitted')
  async handleActionSubmitted(@Payload() data: { taskId: string; payload: any }) {
    await this.executionService.completeTask(data.taskId, data.payload);
  }

  @Get('instances')
  async getInstances() {
    const data = await this.executionService.getInstances();
    return { success: true, data, message: 'OK' };
  }

  @Get('tasks')
  async getTasks() {
    const data = await this.executionService.getTasks();
    return { success: true, data, message: 'OK' };
  }

  @Post('tasks/:id/complete')
  async completeTaskHttp(@Param('id') id: string, @Body() payload: any) {
    const result = await this.executionService.completeTask(id, payload);
    return {
      success: true,
      data: result,
      message: 'OK',
    };
  }
}

