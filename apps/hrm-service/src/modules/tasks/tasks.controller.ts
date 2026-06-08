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
  updateTaskStatus(data: any) {
    return this.tasksService.updateTaskStatus(data.id, data.status, data.rejectReason, data.actorCode, data);
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  updateTask(data: any) {
    return this.tasksService.updateTask(data.id, data);
  }

  @GrpcMethod('TaskService', 'GetTask')
  getTask(data: any) {
    return this.tasksService.getTask(data.id, data);
  }

  @GrpcMethod('TaskService', 'BreakdownTask')
  breakdownTask(data: any) {
    return this.tasksService.breakdownTask(data.id, data);
  }

  @GrpcMethod('TaskService', 'UpdateTaskProgress')
  updateTaskProgress(data: { id: number; progress: number; actorCode?: string }) {
    return this.tasksService.updateTaskProgress(data.id, data.progress, data.actorCode);
  }

  @GrpcMethod('TaskService', 'RecommendAssignees')
  recommendAssignees(data: { rankCode: string; strategy: string }) {
    return this.tasksService.recommendAssignees(data);
  }

  @GrpcMethod('TaskService', 'AssignTask')
  assignTask(data: any) {
    return this.tasksService.assignTask(data.id, data.assigneeCode, data.coassigneeCodes, data.departmentId, data.assignerCode, data);
  }

  @GrpcMethod('TaskService', 'AddComment')
  addComment(data: any) {
    return this.tasksService.addComment(data.taskId || data.id, data);
  }

  @GrpcMethod('TaskService', 'GetComments')
  getComments(data: any) {
    return this.tasksService.getComments(data.taskId || data.id, data);
  }

  @GrpcMethod('TaskService', 'GetSubTasks')
  getSubTasks(data: any) {
    return this.tasksService.getSubTasks(data.id, data);
  }

  @GrpcMethod('TaskService', 'RequestCoordination')
  requestCoordination(data: { taskId: number; requesterCode: string; message?: string; leadCode?: string; coordinatorCodes?: string[] }) {
    return this.tasksService.requestCoordination(data.taskId, data);
  }
}
