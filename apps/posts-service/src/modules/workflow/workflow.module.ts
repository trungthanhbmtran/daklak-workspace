import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WORKFLOW_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'workflow',
          protoPath: join(process.cwd(), '..', '..', 'shared', 'protos', 'workflow', 'workflow.proto'),
          url: process.env.WORKFLOW_SERVICE_URL || 'localhost:50060',
        },
      },
    ]),
  ],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
