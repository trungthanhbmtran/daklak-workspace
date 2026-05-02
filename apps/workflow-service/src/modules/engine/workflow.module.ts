import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { WorkflowEngineService } from "./workflow-engine.service";
import { WorkflowController } from "./workflow.controller";
import { WorkflowGrpcController } from './workflow-grpc.controller';
import { PrismaModule } from "@/database/prisma.module";

const protoRoot =
  process.env.PROTO_PATH ||
  join(process.cwd(), '..', '..', 'shared', 'protos');

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(protoRoot, 'users', 'user.proto'),
          url: process.env.USERS_GRPC_URL || 'localhost:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [protoRoot],
          },
        },
      },
      {
        name: 'HRM_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'employee',
          protoPath: join(protoRoot, 'hrm', 'employee.proto'),
          url: process.env.HRM_GRPC_URL || 'localhost:50052',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [protoRoot],
          },
        },
      },
      {
        name: 'POSTS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'post',
          protoPath: join(protoRoot, 'posts', 'post.proto'),
          url: process.env.POSTS_GRPC_URL || 'localhost:50055',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [protoRoot],
          },
        },
      },
      {
        name: 'DOCUMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'document',
          protoPath: join(protoRoot, 'document', 'document.proto'),
          url: process.env.DOCUMENT_GRPC_URL || 'localhost:50056',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [protoRoot],
          },
        },
      },
    ]),
  ],
  controllers: [WorkflowController, WorkflowGrpcController],
  providers: [WorkflowEngineService],
  exports: [WorkflowEngineService],
})
export class WorkflowModule { }
