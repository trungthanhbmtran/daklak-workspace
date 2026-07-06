import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskCommentsService } from './task-comments.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TaskCommentsController {
  constructor(private readonly service: TaskCommentsService) {}

  @GrpcMethod('TaskService', 'AddComment')
  addComment(data: any) {
    return this.service.addComment(data.taskId, data);
  }

  @GrpcMethod('TaskService', 'GetComments')
  getComments(data: any) {
    return this.service.getComments(data.taskId, data);
  }
}
