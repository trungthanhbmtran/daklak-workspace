import { Module } from '@nestjs/common';
import { TaskKpiController } from './task-kpi.controller';
import { TaskKpiService } from './task-kpi.service';

@Module({
  controllers: [TaskKpiController],
  providers: [TaskKpiService],
})
export class TaskKpiModule {}
