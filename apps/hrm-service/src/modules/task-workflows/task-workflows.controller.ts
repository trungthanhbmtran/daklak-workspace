import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { TaskWorkflowsService } from './task-workflows.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TaskWorkflowsController {
  constructor(private readonly service: TaskWorkflowsService) {}

  @GrpcMethod('TaskService', 'UpdateTaskStatus')
  updateTaskStatus(data: any) {
    return this.service.updateTaskStatus(data.id, data.status, data.rejectReason, data.actorCode, data);
  }

  @EventPattern('WORKFLOW_UPDATED')
  handleWorkflowUpdated(data: { workflowId: string; code?: string; definition?: any }) {
    // Invalidate definition cache cho workflowId
    this.service.invalidateWorkflowCache(data.workflowId, data.definition);
    // Invalidate trigger lookup cache nếu có code
    if (data.code) {
      this.service.shared.cache.delete(`workflow:trigger:${data.code}`);
    }
  }
}
