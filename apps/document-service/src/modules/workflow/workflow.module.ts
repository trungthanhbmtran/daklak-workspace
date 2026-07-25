import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkflowService, WORKFLOW_RMQ_CLIENT } from './workflow.service';
import { WorkflowController } from './workflow.controller';

@Global()
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
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule { }
