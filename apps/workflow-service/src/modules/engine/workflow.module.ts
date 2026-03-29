import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WorkflowEngineService } from "./workflow-engine.service";
import { WorkflowController } from "./workflow.controller";
import { WorkflowGrpcController } from './workflow-grpc.controller';
import { PrismaModule } from "@/database/prisma.module";

@Module({
  imports: [
    HttpModule,
    PrismaModule,
  ],
  controllers: [WorkflowController, WorkflowGrpcController],
  providers: [WorkflowEngineService],
  exports: [WorkflowEngineService],
})
export class WorkflowModule {}
