import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');
  const docDir = join(protoRoot, 'document');

  // gRPC Transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['document', 'category', 'minutes'],
      protoPath: [
        join(docDir, 'document.proto'),
        join(docDir, 'category.proto'),
        join(docDir, 'consultation.proto'),
        join(docDir, 'minutes.proto'),
        join(docDir, 'cabinet.proto'),
        join(docDir, 'dossier.proto'),
      ],
      url: process.env.GRPC_URL ?? '0.0.0.0:50056',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      },
    },
  });

  // RMQ Transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
      queue: 'workflow_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.init();
  console.log('Document Service (gRPC + RMQ) listening on', process.env.GRPC_URL ?? '0.0.0.0:50056');
}
bootstrap();

