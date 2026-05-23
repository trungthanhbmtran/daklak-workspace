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

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.ORGANIZATION),
    registerGrpcService(MICROSERVICES.EMPLOYEE),
    registerGrpcService(MICROSERVICES.TASK),
    registerGrpcService(MICROSERVICES.KPI),
    registerGrpcService(MICROSERVICES.MASTER_PLAN),
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
  ],
})
export class HrmModule {}
