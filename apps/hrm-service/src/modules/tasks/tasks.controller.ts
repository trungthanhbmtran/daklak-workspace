import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @GrpcMethod('TaskService', 'CreateTask')
  createTask(data: any) {
    return this.tasksService.createTask(data);
  }

  @GrpcMethod('TaskService', 'ListTasks')
  listTasks(data: any) {
    return this.tasksService.listTasks(data);
  }

  @GrpcMethod('TaskService', 'GetTaskStats')
  getTaskStats(data: any) {
    return this.tasksService.getTaskStats(data);
  }



  @GrpcMethod('TaskService', 'UpdateTask')
  updateTask(data: { id: number; weight?: number; startDate?: string; dueDate?: string; priority?: string; baseScore?: number; title?: string; description?: string; domainId?: number; monitoredUnitId?: number; kpiCriteriaId?: number }) {
    return this.tasksService.updateTask(data.id, data);
  }

  @GrpcMethod('TaskService', 'GetTask')
  getTask(data: any) {
    return this.tasksService.getTask(data.id, data);
  }

  @GrpcMethod('TaskService', 'BreakdownTask')
  breakdownTask(data: any) {
    return this.tasksService.breakdownTask(data.parentId, data);
  }

  @GrpcMethod('TaskService', 'GetSubTasks')
  getSubTasks(data: any) {
    return this.tasksService.getSubTasks(data.taskId, data);
  }

  @GrpcMethod('TaskService', 'UpdateTaskProgress')
  updateTaskProgress(data: any) {
    return this.tasksService.updateTaskProgress(data.id, data.progress, data.actorCode);
  }

}
