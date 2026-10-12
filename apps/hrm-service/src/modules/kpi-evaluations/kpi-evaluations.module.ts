import { Module } from '@nestjs/common';
import { KpiEvaluationsController } from './kpi-evaluations.controller';
import { KpiEvaluationsService } from './kpi-evaluations.service';
import { TaskKpiModule } from '../task-kpi/task-kpi.module';

@Module({
  imports: [TaskKpiModule],
  controllers: [KpiEvaluationsController],
  providers: [KpiEvaluationsService]
})
export class KpiEvaluationsModule {}
