import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MICROSERVICES } from '../../core/constants/services';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES.REPORT.SYMBOL,
        transport: Transport.GRPC,
        options: {
          package: MICROSERVICES.REPORT.PACKAGE,
          protoPath: join(
            __dirname,
            '../../../../shared/protos/' + MICROSERVICES.REPORT.PROTO,
          ),
          url: MICROSERVICES.REPORT.URL,
        },
      },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
