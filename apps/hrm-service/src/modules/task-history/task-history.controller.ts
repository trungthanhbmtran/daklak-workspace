import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskHistoryService } from './task-history.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TaskHistoryController {
  constructor(private readonly service: TaskHistoryService) {}

  @GrpcMethod('TaskService', 'GetTaskHistory')
  getTaskHistory(data: any) {
    return this.service.getTaskHistory(data.taskId);
  }
}
