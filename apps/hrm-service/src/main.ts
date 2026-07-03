import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

const hrmDir = join(protoRoot, 'hrm');
const protoPath = [
  join(hrmDir, 'employee.proto'),
  join(hrmDir, 'task.proto'),
  join(hrmDir, 'kpi.proto'),
  join(hrmDir, 'master_plan.proto'),
  join(hrmDir, 'rank_quota.proto'),
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['employee', 'task', 'kpi', 'hrm'],
      protoPath,
      url: process.env.GRPC_URL ?? '0.0.0.0:50052',
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      },
    },
  });

  // Add Redis Pub/Sub for listening to global events (like workflow updates)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
  });

  await app.startAllMicroservices();
  await app.init();
  console.log('HRM Service (gRPC + Redis) listening on', process.env.GRPC_URL ?? '0.0.0.0:50052');
}
bootstrap();
