import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskSharedService } from './task-shared.service';
import { AppCacheService } from '../../core/cache/app-cache.service';

const PROTO_ROOT = process.env.PROTO_PATH || require('path').join(process.cwd(), '../../shared/protos');

@Global()
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
            queueOptions: { durable: true },
          },
        }),
      }
    ]),
    ClientsModule.register([
      {
        name: 'USER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: require('path').join(PROTO_ROOT, 'users/user.proto'),
          url: process.env.USER_SERVICE_ADDR || 'user-service:50051',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, includeDirs: [PROTO_ROOT] },
        },
      },
      {
        name: 'WORKFLOW_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'workflow',
          protoPath: require('path').join(PROTO_ROOT, 'workflow/workflow.proto'),
          url: process.env.WORKFLOW_SERVICE_URL || 'workflow-service:50060',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, includeDirs: [PROTO_ROOT] },
        },
      },
      {
        name: 'CHAT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'chat',
          protoPath: require('path').join(PROTO_ROOT, 'chat/chat.proto'),
          url: process.env.CHAT_SERVICE_ADDR || 'chat-service:50061',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, includeDirs: [PROTO_ROOT] },
        },
      }
    ])
  ],
  providers: [TaskSharedService, AppCacheService],
  exports: [TaskSharedService, AppCacheService, ClientsModule],
})
export class TaskSharedModule { }

