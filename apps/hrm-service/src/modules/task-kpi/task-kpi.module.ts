import { Module } from '@nestjs/common';
import { TaskKpiController } from './task-kpi.controller';
import { TaskKpiService } from './task-kpi.service';
import { KpiCalculatorEngine } from './kpi-calculator.engine';

@Module({
  controllers: [TaskKpiController],
  providers: [TaskKpiService, KpiCalculatorEngine],
  exports: [TaskKpiService, KpiCalculatorEngine],
})
export class TaskKpiModule {}
