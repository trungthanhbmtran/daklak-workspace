import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'CreateTask')
  createTask(data: any) { return this.tasksService.createTask(data); }

  @GrpcMethod('TaskService', 'ListTasks')
  listTasks(data: any) { return this.tasksService.listTasks(data); }

  @GrpcMethod('TaskService', 'GetTask')
  getTask(data: any) { return this.tasksService.getTask(data.id, data); }

  @GrpcMethod('TaskService', 'UpdateTask')
  updateTask(data: any) { return this.tasksService.updateTask(data.id, data); }

  @GrpcMethod('TaskService', 'DeleteTask')
  deleteTask(data: any) { return this.tasksService.deleteTask(data.id); }

  @GrpcMethod('TaskService', 'GetTaskStats')
  getTaskStats(data: any) { return this.tasksService.getTaskStats(data); }

  @GrpcMethod('TaskService', 'GetTaskTree')
  getTaskTree(data: any) { return this.tasksService.getTaskTree(data.id, data); }

  // ─── Status & Progress ────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'UpdateTaskStatus')
  updateTaskStatus(data: any) {
    return this.tasksService.updateTaskStatus(data.id, data.status, data.rejectReason, data.actorCode || data.currentEmployeeCode, data, data.actionName);
  }

  @GrpcMethod('TaskService', 'UpdateTaskProgress')
  updateTaskProgress(data: any) { return this.tasksService.updateTaskProgress(data.id, data.progress, data.actorCode || data.currentEmployeeCode); }

  // ─── Hierarchy ────────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'BreakdownTask')
  breakdownTask(data: any) { return this.tasksService.breakdownTask(data.parentId, data); }

  @GrpcMethod('TaskService', 'GetSubTasks')
  getSubTasks(data: any) { return this.tasksService.getSubTasks(data.taskId, data); }

  // ─── Participants ─────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'AssignTask')
  assignTask(data: any) { return this.tasksService.assignTask(data.id, data); }

  @GrpcMethod('TaskService', 'RecommendAssignees')
  recommendAssignees(data: any) { return this.tasksService.recommendAssignees(data); }

  @GrpcMethod('TaskService', 'RequestCoordination')
  requestCoordination(data: any) { return this.tasksService.requestCoordination(data.taskId, data); }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'AddComment')
  addComment(data: any) { return this.tasksService.addComment(data.taskId, data); }

  @GrpcMethod('TaskService', 'GetComments')
  getComments(data: any) { return this.tasksService.getComments(data.taskId, data); }

  // ─── Steps (Checklist) ────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'CreateStep')
  createStep(data: any) { return this.tasksService.createStep(data.taskId, data); }

  @GrpcMethod('TaskService', 'UpdateStep')
  updateStep(data: any) { return this.tasksService.updateStep(data.taskId, data.stepId, data); }

  @GrpcMethod('TaskService', 'ListSteps')
  listSteps(data: any) { return this.tasksService.listSteps(data.taskId); }

  @GrpcMethod('TaskService', 'DeleteStep')
  deleteStep(data: any) { return this.tasksService.deleteStep(data.taskId, data.stepId); }

  // ─── Workflow Events ──────────────────────────────────────────────────────

  /** Khi workflow definition thay đổi → invalidate cache để tasks nhận cấu hình mới */
  @EventPattern('WORKFLOW_UPDATED')
  handleWorkflowUpdated(data: { workflowId: string; code?: string; definition?: any }) {
    this.tasksService.invalidateWorkflowCache(data.workflowId, data.definition);
    if (data.code) {
      // Xóa cache trigger lookup để lần sau tìm lại
      // shared service expose cache thông qua tasksService.shared
      this.tasksService['shared'].cache.delete(`workflow:trigger:${data.code}`);
    }
  }
}
