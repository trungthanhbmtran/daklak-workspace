import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { WorkflowEngineService } from "./workflow-engine.service";
import { WorkflowController } from "./workflow.controller";
import { WorkflowGrpcController } from './workflow-grpc.controller';
import { PrismaModule } from "@/database/prisma.module";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../../shared/protos/users/user.proto'),
          url: process.env.USERS_GRPC_URL || 'localhost:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [join(__dirname, '../../../../shared/protos')],
          },
        },
      },
      {
        name: 'HRM_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'employee',
          protoPath: join(__dirname, '../../../../shared/protos/hrm/employee.proto'),
          url: process.env.HRM_GRPC_URL || 'localhost:50052',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [join(__dirname, '../../../../shared/protos')],
          },
        },
      },
    ]),
  ],
  controllers: [WorkflowController, WorkflowGrpcController],
  providers: [WorkflowEngineService],
  exports: [WorkflowEngineService],
})
export class WorkflowModule {}
