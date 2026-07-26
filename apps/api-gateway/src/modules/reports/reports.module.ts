import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MICROSERVICES } from '../../core/constants/services';
import { registerGrpcService } from '../../core/factories/grpc.factory';

@Module({
  imports: [registerGrpcService(MICROSERVICES.REPORT)],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
