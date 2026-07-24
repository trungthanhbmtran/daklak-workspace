import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ChatService');
  const app = await NestFactory.create(AppModule);

  // 1. Configure Global Middlewares/Pipes for REST
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors();

  // 2. Connect as a gRPC microservice (Hybrid mode)
  const protoRoot =
    process.env.PROTO_PATH ??
    join(process.cwd(), '..', '..', 'shared', 'protos');
  const chatProtoPath = join(protoRoot, 'chat', 'chat.proto');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'chat',
      protoPath: chatProtoPath,
      url: process.env.GRPC_URL ?? '0.0.0.0:50061', // Port 50061 for ChatService
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      },
    },
  });

  // 3. Connect to RabbitMQ (Event Subscriber)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:Admin%40123@localhost:5672'],
      queue: 'chat_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // 4. Start both REST and Microservices
  app.enableShutdownHooks();
  await app.startAllMicroservices();

  const port = process.env.PORT || 3004; // Different port from workflow
  await app.listen(port);

  logger.log(`🚀 REST API running at: http://localhost:${port}/api/v1`);
  logger.log(
    `📡 gRPC Service listening on: ${process.env.GRPC_URL ?? '0.0.0.0:50061'}`,
  );
}
bootstrap().catch((err) => {
  console.error('Error starting ChatService', err);
  process.exit(1);
});
