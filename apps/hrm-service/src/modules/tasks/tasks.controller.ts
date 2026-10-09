import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { GrpcAuthGuard, CurrentUser } from '../../../../../shared/security/grpc-auth';
import { UseGuards } from '@nestjs/common';

@Controller()
@UseGuards(GrpcAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'CreateTask')
  createTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.createTask(data); }

  @GrpcMethod('TaskService', 'ListTasks')
  listTasks(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.listTasks(data); }

  @GrpcMethod('TaskService', 'GetTask')
  getTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.getTask(data.id, data); }

  @GrpcMethod('TaskService', 'UpdateTask')
  updateTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.updateTask(data.id, data); }

  @GrpcMethod('TaskService', 'ExtendTask')
  extendTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.extendTask(data.id, data.dueDate, data.reason, data.actorCode || data.currentEmployeeCode); }

  @GrpcMethod('TaskService', 'DeleteTask')
  deleteTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.deleteTask(data.id); }

  


  @GrpcMethod('TaskService', 'GetTaskTree')
  getTaskTree(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.getTaskTree(data.id, data); }

  @GrpcMethod('TaskService', 'RecordAttendance')
  recordAttendance(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.recordAttendance(data.taskId, data.currentEmployeeCode || data.employeeCode); }

  

  // ─── Status & Progress ────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'UpdateTaskStatus')
  updateTaskStatus(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    }
    return this.tasksService.updateTaskStatus(data.id, data.status, data.rejectReason, data.actorCode || data.currentEmployeeCode, data, data.actionName);
  }


  // ─── Hierarchy ────────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'BreakdownTask')
  breakdownTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.breakdownTask(data.parentId, data); }

  @GrpcMethod('TaskService', 'GetSubTasks')
  getSubTasks(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.getSubTasks(data.taskId, data); }

  // ─── Participants ─────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'AssignTask')
  assignTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.assignTask(data.id, data); }

  @GrpcMethod('TaskService', 'RecommendAssignees')
  recommendAssignees(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.recommendAssignees(data); }

  @GrpcMethod('TaskService', 'RequestCoordination')
  requestCoordination(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.requestCoordination(data.taskId, data); }

  @GrpcMethod('TaskService', 'RespondTask')
  respondTask(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.respondTask(data.taskId, data); }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'AddComment')
  addComment(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.addComment(data.taskId, data); }

  @GrpcMethod('TaskService', 'GetComments')
  getComments(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.getComments(data.taskId, data); }

  // ─── Steps (Checklist) ────────────────────────────────────────────────────

  @GrpcMethod('TaskService', 'CreateStep')
  createStep(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.createStep(data.taskId, data); }

  @GrpcMethod('TaskService', 'UpdateStep')
  updateStep(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.updateStep(data.taskId, data.stepId, data); }

  @GrpcMethod('TaskService', 'ListSteps')
  listSteps(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.listSteps(data.taskId); }

  @GrpcMethod('TaskService', 'DeleteStep')
  deleteStep(data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.tasksService.deleteStep(data.taskId, data.stepId); }

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
