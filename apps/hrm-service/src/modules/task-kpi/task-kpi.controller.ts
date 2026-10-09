import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskKpiService } from './task-kpi.service';
import { GrpcAuthGuard, CurrentUser } from '../../../../../shared/security/grpc-auth';
import { UseGuards } from '@nestjs/common';

@Controller()
@UseGuards(GrpcAuthGuard)
export class TaskKpiController {
  constructor(private readonly service: TaskKpiService) {}

  @GrpcMethod('TaskService', 'UpsertTaskKpiSetting')
  upsertTaskKpiSetting(data: any, @CurrentUser() user: any) {
    if (user) {
      data.currentEmployeeCode = user.employeeCode;
      data.currentUserId = user.id;
      data.currentUserDept = user.unitId;
      data.currentUserPermissions = user.permissionsFlatten;
    }
    return this.service.upsertTaskKpiSetting(data);
  }

  @GrpcMethod('TaskService', 'GetTaskKpiSetting')
  getTaskKpiSetting(data: any, @CurrentUser() user: any) {
    return this.service.getTaskKpiSetting();
  }

  @GrpcMethod('TaskService', 'GetKpiSystemVariables')
  getKpiSystemVariables() {
    return this.service.getSystemVariables();
  }

  @GrpcMethod('TaskService', 'GetGlobalKpiSettings')
  getGlobalKpiSettings() {
    return this.service.getTaskKpiSetting();
  }

  @GrpcMethod('TaskService', 'SaveGlobalKpiSettings')
  saveGlobalKpiSettings(data: any) {
    return this.service.upsertTaskKpiSetting(data);
  }
}
