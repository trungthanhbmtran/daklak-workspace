import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @GrpcMethod('TaskService', 'CreateTask')
  createTask(data: any) {
    return this.tasksService.createTask(data);
  }

  @GrpcMethod('TaskService', 'ListTasks')
  listTasks(data: any) {
    return this.tasksService.listTasks(data);
  }

  @GrpcMethod('TaskService', 'UpdateTaskStatus')
  updateTaskStatus(data: { id: number; status: string; rejectReason?: string }) {
    return this.tasksService.updateTaskStatus(data.id, data.status, data.rejectReason);
  }

  @GrpcMethod('TaskService', 'RecommendAssignees')
  recommendAssignees(data: { rankCode: string; strategy: string }) {
    return this.tasksService.recommendAssignees(data);
  }

  @GrpcMethod('TaskService', 'AssignTask')
  assignTask(data: { id: number; assigneeCode: string; departmentId?: number }) {
    return this.tasksService.assignTask(data.id, data.assigneeCode, data.departmentId);
  }

  @GrpcMethod('TaskService', 'AddComment')
  addComment(data: any) {
    return this.tasksService.addComment(data);
  }

  @GrpcMethod('TaskService', 'GetComments')
  getComments(data: { taskId: number }) {
    return this.tasksService.getComments(data.taskId);
  }
}
