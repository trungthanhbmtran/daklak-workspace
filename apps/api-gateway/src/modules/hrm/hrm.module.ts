import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { DepartmentController } from './department.controller';
import { EmployeeController } from './employee.controller';
import { PositionController } from './position.controller';
import { JobTitleController } from './jobtitle.controller';
import { PublicHrmController } from './public-hrm.controller';
import { TasksController } from './tasks.controller';
import { KpisController } from './kpis.controller';
import { MasterPlansController } from './master-plans.controller';
import { MasterPlansService } from './master-plans.service';
import { TaskTemplatesController } from './task-templates.controller';
import { RankQuotasController } from './rank-quotas.controller';
import { TasksService } from './tasks.service';
import { KpisService } from './kpis.service';
import { EmployeeService } from './employee.service';
import { DepartmentService } from './department.service';
import { PositionService } from './position.service';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.USER),
    registerGrpcService(MICROSERVICES.ORGANIZATION),
    registerGrpcService(MICROSERVICES.EMPLOYEE),
    registerGrpcService(MICROSERVICES.TASK),
    registerGrpcService(MICROSERVICES.KPI),
    registerGrpcService(MICROSERVICES.MASTER_PLAN),
    registerGrpcService(MICROSERVICES.RANK_QUOTA),
    registerGrpcService(MICROSERVICES.SYS_CATEGORY),
  ],
  controllers: [
    DepartmentController,
    EmployeeController,
    PositionController,
    JobTitleController,
    PublicHrmController,
    TasksController,
    KpisController,
    MasterPlansController,
    TaskTemplatesController,
    RankQuotasController,
  ],
  providers: [
    TasksService,
    MasterPlansService,
    KpisService,
    EmployeeService,
    DepartmentService,
    PositionService,
  ],
})
export class HrmModule {}
