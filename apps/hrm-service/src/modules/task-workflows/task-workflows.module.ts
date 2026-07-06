import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TaskWorkflowsController } from './task-workflows.controller';
import { TaskWorkflowsService } from './task-workflows.service';

const PROTO_ROOT = process.env.PROTO_PATH || require('path').join(process.cwd(), '../../shared/protos');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WORKFLOW_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'workflow',
          protoPath: require('path').join(PROTO_ROOT, 'workflow/workflow.proto'),
          url: process.env.WORKFLOW_SERVICE_URL || 'workflow-service:50060',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, includeDirs: [PROTO_ROOT] },
        },
      }
    ])
  ],
  controllers: [TaskWorkflowsController],
  providers: [TaskWorkflowsService],
})
export class TaskWorkflowsModule {}
