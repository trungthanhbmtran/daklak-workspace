import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AiService } from './ai.service';
import { AiFeatureService } from './ai-feature.service';
import { AiController } from './ai.controller';
import { QdrantService } from './qdrant.service';
import { ConfigsModule } from '../../configs/configs.module';
import { UserConfigsModule } from '../user-configs/user-configs.module';

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
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, AiFeatureService, QdrantService],
  exports: [AiService, AiFeatureService, QdrantService],
})
export class AiModule {}
