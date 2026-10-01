import { Module } from '@nestjs/common';
import { join } from 'path';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';
import { PrismaService } from '@/database/prisma.service';
import { AiModule } from '../ai/ai.module';

import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    AiModule,
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
        name: 'MEDIA_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos'), 'media', 'media.proto'),
          url: process.env.MEDIA_SERVICE_URL || 'media-service:50059',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos')],
          },
        },
      },
    ]),
  ],
  controllers: [AiAssistantController],
  providers: [AiAssistantService, PrismaService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
