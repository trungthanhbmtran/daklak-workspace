import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';

const logger = new Logger('Main');
const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

const postsDir = join(protoRoot, 'posts');
const protoPath = [
  join(postsDir, 'post.proto'),
  join(postsDir, 'category.proto'),
  join(postsDir, 'tag.proto'),
  join(postsDir, 'banner.proto'),
  join(postsDir, 'portal_menu.proto'),
  join(postsDir, 'interaction.proto'),
  join(postsDir, 'portal_config.proto'),
];

async function bootstrap() {
  try {
    // 1. Tạo app dưới dạng Hybrid
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.enableShutdownHooks();

    // 2. Kết nối gRPC
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ['post', 'category', 'tag', 'banner', 'portal_menu', 'interaction', 'portal_config'],
        protoPath,
        url: process.env.GRPC_URL ?? '0.0.0.0:50055',
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          includeDirs: [
            protoRoot,
            join(protoRoot, 'posts'),
            join(protoRoot, 'users'),
          ],
        },
      },
    });

    // 3. Kết nối RabbitMQ
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'translation_response',
        prefetchCount: 10,
        noAck: false,
        queueOptions: {
          durable: false,
        },
      },
    });

    // 4. Khởi chạy microservices
    await app.startAllMicroservices();

    // 5. Lắng nghe trên một port để duy trì ứng dụng (Hybrid App)
    const port = process.env.PORT || 3005; // Dùng port 3005 để tránh xung đột
    await app.listen(port);

    logger.log(`🚀 Post Service is running:`);
    logger.log(`- gRPC: ${process.env.GRPC_URL ?? '0.0.0.0:50055'}`);
    logger.log(`- RabbitMQ: connected to ${rabbitUrl}`);
    logger.log(`- HTTP (Internal): ${port}`);
  } catch (error) {
    logger.error('❌ Error during bootstrap:', error);
    process.exit(1);
  }
}
bootstrap();
