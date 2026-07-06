import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskParticipantsService } from './task-participants.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TaskParticipantsController {
  constructor(private readonly service: TaskParticipantsService) {}

  @GrpcMethod('TaskService', 'AssignTask')
  assignTask(data: any) {
    return this.service.assignTask(data);
  }

  @GrpcMethod('TaskService', 'RecommendAssignees')
  recommendAssignees(data: any) {
    return this.service.recommendAssignees(data);
  }

  @GrpcMethod('TaskService', 'RequestCoordination')
  requestCoordination(data: any) {
    return this.service.requestCoordination(data.taskId, data);
  }
}
