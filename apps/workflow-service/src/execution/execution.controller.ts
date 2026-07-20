import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ExecutionService } from './execution.service';

@Controller('workflow')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post('processes/:code/start')
  async startProcess(@Param('code') code: string, @Body() payload: any) {
    const instance = await this.executionService.startProcess(code, payload);
    return {
      success: true,
      data: instance,
      message: 'OK',
    };
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
  async completeTask(@Param('id') id: string, @Body() payload: any) {
    const result = await this.executionService.completeTask(id, payload);
    return {
      success: true,
      data: result,
      message: 'OK',
    };
  }
}
