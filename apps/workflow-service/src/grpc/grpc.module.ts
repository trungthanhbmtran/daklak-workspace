import { Module } from '@nestjs/common';
import { GrpcWorkflowController } from './grpc.controller';
import { DefinitionModule } from '../definition/definition.module';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [DefinitionModule, ExecutionModule],
  controllers: [GrpcWorkflowController],
})
export class GrpcModule {}
