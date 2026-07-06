import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskCatalogService } from './task-catalog.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TaskCatalogController {
  constructor(private readonly service: TaskCatalogService) {}

  // --- Rank Quotas ---
  @GrpcMethod('TaskService', 'SaveRankQuotas')
  saveRankQuotas(data: any) { return this.service.saveRankQuotas(data); }

  @GrpcMethod('TaskService', 'GetRankQuotasByRank')
  getRankQuotasByRank(data: any) { return this.service.getRankQuotasByRank(data); }

  // --- Task Templates ---
  @GrpcMethod('TaskService', 'FindTaskTemplates')
  findTaskTemplates(data: any) { return this.service.findTaskTemplates(data); }

  @GrpcMethod('TaskService', 'CreateTaskTemplate')
  createTaskTemplate(data: any) { return this.service.createTaskTemplate(data); }

  @GrpcMethod('TaskService', 'UpdateTaskTemplate')
  updateTaskTemplate(data: any) { return this.service.updateTaskTemplate(data.id, data); }

  @GrpcMethod('TaskService', 'DeleteTaskTemplate')
  deleteTaskTemplate(data: any) { return this.service.deleteTaskTemplate(data.id); }

  @GrpcMethod('TaskService', 'BulkUpdateTaskTemplates')
  bulkUpdateTaskTemplates(data: any) { return this.service.bulkUpdateTaskTemplates(data.templates); }
}
