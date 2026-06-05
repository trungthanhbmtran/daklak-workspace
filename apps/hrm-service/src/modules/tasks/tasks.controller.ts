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
  updateTaskStatus(data: { id: number; status: string; rejectReason?: string; actorCode?: string }) {
    return this.tasksService.updateTaskStatus(data.id, data.status, data.rejectReason, data.actorCode);
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  updateTask(data: { id: number; weight?: number; startDate?: string; dueDate?: string; priority?: string; baseScore?: number; title?: string; description?: string }) {
    return this.tasksService.updateTask(data.id, data);
  }

  @GrpcMethod('TaskService', 'GetTask')
  getTask(data: { id: number }) {
    return this.tasksService.getTask(data.id);
  }

  @GrpcMethod('TaskService', 'BreakdownTask')
  breakdownTask(data: any) {
    return this.tasksService.breakdownTask(data);
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
  assignTask(data: { id: number; assigneeCode: string; coAssigneeCodes?: string[]; departmentId?: number; assignerCode?: string }) {
    return this.tasksService.assignTask(data.id, data.assigneeCode, data.coAssigneeCodes, data.departmentId, data.assignerCode);
  }

  @GrpcMethod('TaskService', 'AddComment')
  addComment(data: any) {
    return this.tasksService.addComment(data);
  }

  @GrpcMethod('TaskService', 'GetComments')
  getComments(data: { taskId: number }) {
    return this.tasksService.getComments(data.taskId);
  }

  @GrpcMethod('TaskService', 'GetSubTasks')
  getSubTasks(data: { taskId: number }) {
    return this.tasksService.getSubTasks(data.taskId);
  }

  @GrpcMethod('TaskService', 'RequestCoordination')
  requestCoordination(data: { taskId: number; requesterCode: string; message?: string; leadCode?: string; coordinatorCodes?: string[] }) {
    return this.tasksService.requestCoordination(data);
  }
}
