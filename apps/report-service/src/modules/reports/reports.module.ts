import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

const PROTO_ROOT =
  process.env.PROTO_PATH || join(__dirname, '../../../../../../shared/protos');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'organization',
          protoPath: join(PROTO_ROOT, 'users/organization.proto'),
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
})
export class ReportsModule { }
