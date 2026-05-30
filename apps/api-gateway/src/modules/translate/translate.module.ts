import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { TranslateController } from './translate.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.TRANSLATE),
    ClientsModule.register([
      {
        name: 'TRANSLATE_QUEUE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
          ],
          queue: 'translate_tasks_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TranslateController],
})
export class TranslateModule {}
