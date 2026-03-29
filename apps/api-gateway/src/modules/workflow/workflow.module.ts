import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { WorkflowController } from './workflow.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.WORKFLOW),
  ],
  controllers: [WorkflowController],
})
export class WorkflowModule {}
