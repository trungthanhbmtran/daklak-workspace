import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkflowService, WORKFLOW_RMQ_CLIENT, WORKFLOW_PACKAGE } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import * as path from 'path';

const PROTO_ROOT = process.env.PROTO_PATH || path.join(process.cwd(), '../../shared/protos');

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: WORKFLOW_RMQ_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>('RABBITMQ_URL');
          if (!rabbitUrl) {
            throw new Error('RABBITMQ_URL is not set — refusing to connect (no credential fallback).');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitUrl],
              queue: 'workflow_events_queue',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
    ClientsModule.register([
      {
        name: WORKFLOW_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'workflow',
          protoPath: path.join(PROTO_ROOT, 'workflow/workflow.proto'),
          url: process.env.WORKFLOW_SERVICE_URL || 'workflow-service:50060',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, includeDirs: [PROTO_ROOT] },
        },
      },
    ]),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule { }

