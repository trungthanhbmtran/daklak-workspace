import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

const PROTO_ROOT = process.env.PROTO_PATH || join(__dirname, '../../../../../../shared/protos');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TASK_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'task',
          protoPath: join(PROTO_ROOT, 'hrm/task.proto'),
          url: process.env.HRM_GRPC_URL || '0.0.0.0:50053',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, objects: true, arrays: true, includeDirs: [PROTO_ROOT] },
        },
      },
      {
        name: 'POST_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'post',
          protoPath: join(PROTO_ROOT, 'posts/post.proto'),
          url: process.env.POST_GRPC_URL || '0.0.0.0:50054',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, objects: true, arrays: true, includeDirs: [PROTO_ROOT] },
        },
      },
      {
        name: 'DOCUMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'document',
          protoPath: join(PROTO_ROOT, 'document/document.proto'),
          url: process.env.DOCUMENT_GRPC_URL || '0.0.0.0:50052',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, objects: true, arrays: true, includeDirs: [PROTO_ROOT] },
        },
      },
      {
        name: 'KPI_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'kpi',
          protoPath: join(PROTO_ROOT, 'hrm/kpi.proto'),
          url: process.env.HRM_GRPC_URL || '0.0.0.0:50053',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, objects: true, arrays: true, includeDirs: [PROTO_ROOT] },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'organization',
          protoPath: join(PROTO_ROOT, 'users/organization.proto'),
          url: process.env.USER_GRPC_URL || '0.0.0.0:50051',
          loader: { keepCase: false, longs: String, enums: String, defaults: true, objects: true, arrays: true, includeDirs: [PROTO_ROOT] },
        },
      }
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
