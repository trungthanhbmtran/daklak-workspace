import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';

const protoRoot =
  process.env.PROTO_PATH || join(process.cwd(), '..', '..', 'shared', 'protos');

function getProtoFile(name: string) {
  const paths = [join(protoRoot, 'posts', name), join(protoRoot, name)];
  for (const p of paths) {
    if (existsSync(p)) return p;
  }
  return join(protoRoot, 'posts', name); // fallback
}

const protoPath = [
  getProtoFile('post.proto'),
  getProtoFile('category.proto'),
  getProtoFile('tag.proto'),
  getProtoFile('banner.proto'),
  getProtoFile('translation.proto'),
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['post', 'category', 'tag', 'banner', 'translation'],
      protoPath,
      url: process.env.GRPC_URL ?? '0.0.0.0:50055',
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot, join(protoRoot, 'posts')],
      },
    },
  });

  // RabbitMQ Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'translation_results',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  // If you also want to expose HTTP (NestFactory.create), you'd call app.listen()
  // But user-service seems to be purely gRPC.
  console.log('Posts Service (gRPC + RMQ) started');
}
bootstrap();
