import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReportsController } from './reports.controller';

@Module({
  imports: [HttpModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
