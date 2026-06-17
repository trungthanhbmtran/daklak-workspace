import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';

const PROTO_ROOT = process.env.PROTO_PATH || require('path').join(process.cwd(), '../../shared/protos');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: require('path').join(PROTO_ROOT, 'users/user.proto'),
          url: process.env.USER_SERVICE_ADDR || 'user-service:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [PROTO_ROOT],
          },
        },
      },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
