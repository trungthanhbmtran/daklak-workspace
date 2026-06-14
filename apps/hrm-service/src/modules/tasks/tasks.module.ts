import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

const PROTO_ROOT = process.env.PROTO_PATH || require('path').join(process.cwd(), '../../shared/protos');

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: config.get<string>('NOTIFICATION_QUEUE') || 'notifications',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
    ClientsModule.register([
      {
        name: 'INTEGRATION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'integration',
          protoPath: require('path').join(PROTO_ROOT, 'users/integration.proto'),
          url: process.env.USER_SERVICE_ADDR || 'user-service:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
      {
        name: 'USER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: require('path').join(PROTO_ROOT, 'users/user.proto'),
          url: process.env.USER_SERVICE_ADDR || 'user-service:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
      {
        name: 'WORKFLOW_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'workflow',
          protoPath: require('path').join(PROTO_ROOT, 'workflow/workflow.proto'),
          url: process.env.WORKFLOW_SERVICE_ADDR || 'workflow-service:50055',
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
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule { }
