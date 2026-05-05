import { Module } from '@nestjs/common';
import { join } from 'path';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { WorkflowModule } from '../workflow/workflow.module';


import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    WorkflowModule,
    ClientsModule.register([
      {
        name: 'CATEGORY_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'category',
          protoPath: process.env.PROTO_PATH
            ? join(process.env.PROTO_PATH, 'users', 'categories.proto')
            : join(__dirname, '../../../../shared/protos/users/categories.proto'),
          url: process.env.USER_SERVICE_URL || 'user-service:50051',
        },
      },
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

export class PostsModule { }
