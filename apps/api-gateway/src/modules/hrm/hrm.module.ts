import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { DepartmentController } from './department.controller';
import { EmployeeController } from './employee.controller';
import { PositionController } from './position.controller';
import { JobTitleController } from './jobtitle.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.ORGANIZATION),
    registerGrpcService(MICROSERVICES.EMPLOYEE),
  ],
  controllers: [
    DepartmentController,
    EmployeeController,
    PositionController,
    JobTitleController,
  ],
})
export class HrmModule {}
