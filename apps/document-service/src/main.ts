import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');
  const docDir = join(protoRoot, 'document');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ['document', 'category'],
      protoPath: [
        join(docDir, 'document.proto'),
        join(docDir, 'category.proto'),
      ],
      url: process.env.GRPC_URL ?? '0.0.0.0:50056',
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      },
    },
  });

  app.enableShutdownHooks();

  await app.listen();
  console.log('Document Service (gRPC) listening on', process.env.GRPC_URL ?? '0.0.0.0:50056');
}
bootstrap();
