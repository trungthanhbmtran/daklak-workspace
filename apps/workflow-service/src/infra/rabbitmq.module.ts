import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';

export const WORKFLOW_RMQ_CLIENT = 'WORKFLOW_RMQ_CLIENT';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: WORKFLOW_RMQ_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin123@localhost:5672'],
            queue: 'workflow_events_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService, WORKFLOW_RMQ_CLIENT],
})
export class RabbitMQModule {}
