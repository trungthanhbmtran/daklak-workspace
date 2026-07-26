import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';

const PROTO_ROOT = process.env.PROTO_PATH || require('path').join(process.cwd(), '../../shared/protos');

@Module({
  imports: [],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
