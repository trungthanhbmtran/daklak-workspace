import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { TaskCatalogService } from './task-catalog.service';
import { GrpcAuthGuard, CurrentUser } from '../../../../../shared/security/grpc-auth';
import { UseGuards } from '@nestjs/common';

@Controller()
@UseGuards(GrpcAuthGuard)
export class TaskCatalogController {
  constructor(private readonly service: TaskCatalogService) {}

  // --- Rank Quotas ---
  @GrpcMethod('TaskService', 'SaveRankQuotas')
  saveRankQuotas(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.service.saveRankQuotas(data); }

  @GrpcMethod('TaskService', 'GetRankQuotasByRank')
  getRankQuotasByRank(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.service.getRankQuotasByRank(data); }

  // --- Task Templates ---
  @GrpcMethod('TaskService', 'FindTaskTemplates')
  findTaskTemplates(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.service.findTaskTemplates(data); }

  @GrpcMethod('TaskService', 'CreateTaskTemplate')
  createTaskTemplate(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.service.createTaskTemplate(data); }

  @GrpcMethod('TaskService', 'UpdateTaskTemplate')
  updateTaskTemplate(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.service.updateTaskTemplate(data.id, data); }

  @GrpcMethod('TaskService', 'DeleteTaskTemplate')
  deleteTaskTemplate(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.service.deleteTaskTemplate(data.id); }

  @GrpcMethod('TaskService', 'BulkUpdateTaskTemplates')
  bulkUpdateTaskTemplates(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    } return this.service.bulkUpdateTaskTemplates(data.templates, data.classification); }
}
