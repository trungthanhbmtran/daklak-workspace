import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const protoRoot = process.env.PROTO_PATH ?? join(__dirname, '../../../shared/protos');
  const docDir = join(protoRoot, 'document');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ['document', 'category'],
      protoPath: [
        join(docDir, 'document.proto'),
        join(docDir, 'category.proto'),
      ],
      url: '0.0.0.0:50056',
    },
  });
  await app.listen();
  console.log('Document Service is listening on 0.0.0.0:50056');
}
bootstrap();
