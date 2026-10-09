import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { PrismaModule } from '../prisma/prisma.module';

const PROTO_ROOT =
  process.env.PROTO_PATH || join(__dirname, '../../../../../../shared/protos');

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'organization',
          protoPath: join(PROTO_ROOT, 'users/organization.proto'),
          url:
            process.env.USERS_GRPC_URL ||
            process.env.USER_GRPC_URL ||
            '0.0.0.0:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            objects: true,
            arrays: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
      {
        name: 'TASK_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'task',
          protoPath: join(PROTO_ROOT, 'hrm/task.proto'),
          url: process.env.HRM_GRPC_URL || '0.0.0.0:50053',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            objects: true,
            arrays: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
      {
        name: 'DOCUMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'document',
          protoPath: join(PROTO_ROOT, 'document/document.proto'),
          url: process.env.DOCUMENT_GRPC_URL || '0.0.0.0:50052',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            objects: true,
            arrays: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
      {
        name: 'API_MANAGEMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'api_management.v2',
          protoPath: join(PROTO_ROOT, 'integration/api-management.proto'),
          url: process.env.USER_GRPC_URL || '0.0.0.0:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            objects: true,
            arrays: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
