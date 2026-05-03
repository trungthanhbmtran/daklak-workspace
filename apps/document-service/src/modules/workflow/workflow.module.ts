import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WorkflowService } from './workflow.service';

const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WORKFLOW_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'workflow',
          protoPath: join(protoRoot, 'workflow', 'workflow.proto'),
          url: process.env.WORKFLOW_SERVICE_URL || 'localhost:50060',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [protoRoot],
          },
        },
      },
    ]),
  ],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule { }
