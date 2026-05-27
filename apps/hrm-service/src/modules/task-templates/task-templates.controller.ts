import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskTemplatesService } from './task-templates.service';

@Controller()
export class TaskTemplatesController {
  constructor(private readonly taskTemplatesService: TaskTemplatesService) {}

  @GrpcMethod('TaskTemplateService', 'FindAll')
  findAll(data: any) {
    return this.taskTemplatesService.findAll(data);
  }

  @GrpcMethod('TaskTemplateService', 'Create')
  async create(data: any) {
    try {
      console.log('CreateTemplate payload:', data);
      return await this.taskTemplatesService.create(data);
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  @GrpcMethod('TaskTemplateService', 'Update')
  async update(data: any) {
    try {
      console.log('UpdateTemplate payload:', data);
      return await this.taskTemplatesService.update(data.id, data);
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  @GrpcMethod('TaskTemplateService', 'Delete')
  delete(data: { id: number }) {
    return this.taskTemplatesService.delete(data.id);
  }
}
