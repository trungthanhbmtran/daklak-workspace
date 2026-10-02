import { Module } from '@nestjs/common';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { IntegrationConfigModule } from '../integration-config/integration-config.module';
import { AuthSessionStore } from './auth-session.store';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { ClientsModule, Transport } from '@nestjs/microservices';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

@Module({
  imports: [
    IntegrationConfigModule,
    // Profile cache only. Shared authentication state uses AuthSessionStore/ioredis.
    CacheModule.register({ isGlobal: true, ttl: 600_000 }),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE', // Tên để Inject vào Service
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: process.env.NOTIFICATION_QUEUE || 'notifications', // Cùng queue với notification_service
          queueOptions: {
            durable: true, // Queue tạm thời hay bền vững
            arguments: {
              'x-dead-letter-exchange': 'dlx_notifications',
              'x-dead-letter-routing-key': 'notifications',
            },
          },
        },
      },
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
  controllers: [UsersController],
  providers: [UsersService, AuthSessionStore],
  exports: [UsersService],
})
export class UsersModule {}
