import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskTemplatesService } from './task-templates.service';

@Controller()
export class TaskTemplatesController {
  constructor(private readonly service: TaskTemplatesService) {}

  @GrpcMethod('TaskTemplateService', 'FindAll')
  async findAll(data: { classification?: string; rank?: string }) {
    return this.service.findAll(data);
  }

  @GrpcMethod('TaskTemplateService', 'Create')
  async create(data: { classification: string; rank: string; taskName: string; defaultUnit: string; defaultWeight?: number }) {
    return this.service.create(data);
  }

  @GrpcMethod('TaskTemplateService', 'Delete')
  async delete(data: { id: number }) {
    return this.service.delete(data);
  }
}
