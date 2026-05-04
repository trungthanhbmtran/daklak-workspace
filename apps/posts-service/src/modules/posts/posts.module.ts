import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { WorkflowModule } from '../workflow/workflow.module';


import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    WorkflowModule,
    ClientsModule.register([
      {
        name: 'TRANSLATE_MQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
          queue: 'translation_request',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})

export class PostsModule {}
