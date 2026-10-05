import { Module } from '@nestjs/common';
import { GrpcWorkflowController } from './grpc.controller';
import { DefinitionModule } from '../definition/definition.module';
import { ExecutionModule } from '../execution/execution.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [DefinitionModule, ExecutionModule, CatalogModule],
  controllers: [GrpcWorkflowController],
})
export class GrpcModule {}
