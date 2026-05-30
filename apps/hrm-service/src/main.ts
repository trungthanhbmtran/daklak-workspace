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
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
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

  await app.listen();
  console.log('HRM Service (gRPC) listening on', process.env.GRPC_URL ?? '0.0.0.0:50052');
}
bootstrap();
