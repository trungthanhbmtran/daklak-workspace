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
  create(data: any) {
    return this.taskTemplatesService.create(data);
  }

  @GrpcMethod('TaskTemplateService', 'Delete')
  delete(data: { id: number }) {
    return this.taskTemplatesService.delete(data.id);
  }
}
