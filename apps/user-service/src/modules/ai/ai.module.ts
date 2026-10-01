import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AiService } from './ai.service';
import { AiFeatureService } from './ai-feature.service';
import { AiController } from './ai.controller';
import { QdrantService } from './qdrant.service';
import { ConfigsModule } from '../../configs/configs.module';
import { UserConfigsModule } from '../user-configs/user-configs.module';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

@Module({
  imports: [
    ConfigsModule,
    UserConfigsModule,
    ClientsModule.register([
      {
        name: 'AI_QUEUE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
          ],
          queue: 'ai_tasks_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'TASK_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'task',
          protoPath: join(protoRoot, 'hrm', 'task.proto'),
          url: process.env.HRM_GRPC_URL || '0.0.0.0:50053',
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
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(protoRoot, 'users', 'user.proto'),
          url: process.env.USERS_GRPC_URL || process.env.USER_GRPC_URL || '0.0.0.0:50051',
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
        name: 'SYS_CONFIG_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'users',
          protoPath: join(protoRoot, 'users', 'system_config.proto'),
          url: process.env.USERS_GRPC_URL || process.env.USER_GRPC_URL || '0.0.0.0:50051',
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
        name: 'MASTER_PLAN_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'hrm',
          protoPath: join(protoRoot, 'hrm', 'master_plan.proto'),
          url: process.env.HRM_GRPC_URL || '0.0.0.0:50053',
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
  controllers: [AiController],
  providers: [AiService, AiFeatureService, QdrantService],
  exports: [AiService, AiFeatureService, QdrantService],
})
export class AiModule {}
