import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WorkflowService, WORKFLOW_PACKAGE } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import * as path from 'path';

const PROTO_ROOT = process.env.PROTO_PATH || path.join(process.cwd(), '../../shared/protos');

/**
 * WorkflowModule — cung c?p:
 *  - gRPC client (WORKFLOW_PACKAGE) cho WorkflowService d? g?i TriggerWorkflow / ResumeWorkflow
 *  - WorkflowController l?ng nghe events t? workflow-service qua RabbitMQ
 *    (RMQ transport du?c c?u hình ? app.module / main.ts)
 */
@Global()
@Module({
  imports: [
    // gRPC client — WorkflowService dùng d? g?i workflow-service (TriggerWorkflow, ResumeWorkflow)
    ClientsModule.register([
      {
        name: WORKFLOW_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'workflow',
          protoPath: path.join(PROTO_ROOT, 'workflow/workflow.proto'),
          url: process.env.WORKFLOW_SERVICE_URL || 'workflow-service:50060',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
    ]),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
