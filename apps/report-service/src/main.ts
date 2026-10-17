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
      channelOptions: {
        'grpc.max_receive_message_length': 64 * 1024 * 1024,
        'grpc.max_send_message_length': 64 * 1024 * 1024,
      },
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      },
    },
  });
  // Fail-fast: không chạy với credentials mặc định (đã xóa fallback amqp://admin:...@rabbitmq)
  const rabbitUrl = process.env.RABBITMQ_URL;
  if (!rabbitUrl) {
    throw new Error(
      'RABBITMQ_URL chưa được cấu hình — report-service yêu cầu RabbitMQ để subscribe report_queue. Vui lòng cấu hình RABBITMQ_URL trong .env.',
    );
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
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
}
void bootstrap().catch((err) => {
  console.error('[Report Service] Bootstrap failed:', err?.message || err);
  process.exit(1);
});
