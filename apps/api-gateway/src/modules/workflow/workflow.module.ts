import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.WORKFLOW),
    registerGrpcService(MICROSERVICES.SYS_CATEGORY),
    registerGrpcService(MICROSERVICES.ORGANIZATION),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
export class WorkflowModule {}
