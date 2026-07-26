import { TransformInterceptor } from '@core/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '@core/filters/all-exceptions.filter';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

const reportDir = join(protoRoot, 'reports');
const protoPath = [join(reportDir, 'report.proto')];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['reports'],
      protoPath,
      url: process.env.GRPC_URL ?? '0.0.0.0:50062',
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      },
    },
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://root:mypassword@rabbitmq:5672'],
      queue: 'report_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3011);
  console.log(
    'Report Service (REST, gRPC, RMQ) listening on port',
    process.env.PORT ?? 3011,
    'and GRPC on',
    process.env.GRPC_URL ?? '0.0.0.0:50062',
  );
}
void bootstrap();
