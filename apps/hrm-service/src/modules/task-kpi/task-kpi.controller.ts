import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { TaskKpiService } from './task-kpi.service';
import { GrpcAuthGuard, CurrentUser } from '../../../../../shared/security/grpc-auth';
import { UseGuards } from '@nestjs/common';

@Controller()
@UseGuards(GrpcAuthGuard)
export class TaskKpiController {
  constructor(private readonly service: TaskKpiService) {}

  @GrpcMethod('TaskService', 'UpsertTaskKpiSetting')
  upsertTaskKpiSetting(@Payload() data: any, @CurrentUser() user: any) {
    data = data || {};
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
  saveGlobalKpiSettings(@Payload() data: any) {
    return this.service.upsertTaskKpiSetting(data);
  }

  @GrpcMethod('TaskService', 'PreviewGlobalKpiSettings')
  previewGlobalKpiSettings(@Payload() data: any) {
    let settings: any;
    try { settings = JSON.parse(data.settingsJson || '{}'); }
    catch { return { success: true, valid: false, error: 'Cấu hình gửi lên không phải JSON hợp lệ.' }; }
    return this.service.previewFormula({
      settings,
      variables: { Q: data.quota, C: data.completed, W: data.weight, D: data.delayDays, S: data.qualityScore },
      domainCode: data.domainCode,
    });
  }

  @GrpcMethod('TaskService', 'ListGlobalKpiSettingVersions')
  listGlobalKpiSettingVersions() {
    return this.service.listSettingsVersions();
  }
}
