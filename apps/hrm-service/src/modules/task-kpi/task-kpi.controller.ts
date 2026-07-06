import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskKpiService } from './task-kpi.service';
import { GrpcContextInterceptor } from '../../core/interceptors/grpc-context.interceptor';

@Controller()
@UseInterceptors(GrpcContextInterceptor)
export class TaskKpiController {
  constructor(private readonly service: TaskKpiService) {}

  @GrpcMethod('TaskService', 'UpsertTaskKpiSetting')
  upsertTaskKpiSetting(data: any) {
    return this.service.upsertTaskKpiSetting(data);
  }

  @GrpcMethod('TaskService', 'GetTaskKpiSetting')
  getTaskKpiSetting(data: any) {
    return this.service.getTaskKpiSetting(data.taskId);
  }
}
