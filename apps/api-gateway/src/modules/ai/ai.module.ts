import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AiService } from './ai.service';
import { AiFeatureService } from './ai-feature.service';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { AiController } from './ai.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.SYS_CONFIG),
    registerGrpcService(MICROSERVICES.USER),
    registerGrpcService(MICROSERVICES.TASK),
    registerGrpcService(MICROSERVICES.MASTER_PLAN),
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
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, AiFeatureService],
  exports: [AiService],
})
export class AiModule {}
