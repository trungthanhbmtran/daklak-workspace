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
  updateTaskStatus(data: { id: number; status: string; rejectReason?: string; actorId?: string }) {
    return this.tasksService.updateTaskStatus(data.id, data.status, data.rejectReason, data.actorId);
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  updateTask(data: { id: number; weight?: number; startDate?: string; dueDate?: string; priority?: string; baseScore?: number; title?: string; description?: string }) {
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
  updateTaskProgress(data: { id: number; progress: number; actorId?: string }) {
    return this.tasksService.updateTaskProgress(data.id, data.progress, data.actorId);
  }

  @GrpcMethod('TaskService', 'RecommendAssignees')
  recommendAssignees(data: { rankCode: string; strategy: string }) {
    return this.tasksService.recommendAssignees(data);
  }

  @GrpcMethod('TaskService', 'AssignTask')
  assignTask(data: { id: number; assigneeId: string; coAssigneeIds?: string[]; departmentId?: number; assignerId?: string }) {
    return this.tasksService.assignTask(data.id, data.assigneeId, data.coAssigneeIds, data.departmentId, data.assignerId);
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
  requestCoordination(data: { taskId: number; requesterId: string; message?: string; leadId?: string; coordinatorIds?: string[] }) {
    return this.tasksService.requestCoordination(data.taskId, data);
  }
}
