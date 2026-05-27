import { Module } from '@nestjs/common';
import { KpiEvaluationsController } from './kpi-evaluations.controller';
import { KpiEvaluationsService } from './kpi-evaluations.service';

@Module({
  controllers: [KpiEvaluationsController],
  providers: [KpiEvaluationsService]
})
export class KpiEvaluationsModule {}
