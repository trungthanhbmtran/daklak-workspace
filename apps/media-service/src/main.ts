import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { GlobalRpcExceptionFilter } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');
  const protoPath = join(protoRoot, 'media', 'media.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'media',
      protoPath,
      url: process.env.MEDIA_SERVICE_GRPC_URL || '0.0.0.0:50059',
      loader: {
        keepCase: false, // Use keepCase for compatibility with proto definitions
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // Enable validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Apply centralized gRPC error handling
  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();
  console.log('🚀 Media Service (gRPC) is running on', process.env.MEDIA_SERVICE_GRPC_URL || '0.0.0.0:50059');
}
bootstrap();
