import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { TaskHistoryService } from './task-history.service';
import { GrpcAuthGuard, CurrentUser } from '../../../../../shared/security/grpc-auth';
import { UseGuards } from '@nestjs/common';

@Controller()
@UseGuards(GrpcAuthGuard)
export class TaskHistoryController {
  constructor(private readonly service: TaskHistoryService) {}

  @GrpcMethod('TaskService', 'GetTaskHistory')
  getTaskHistory(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    }
    return this.service.getTaskHistory(data.taskId);
  }
}
