import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { EmployeesModule } from '@/modules/employees/employees.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MasterPlansModule } from './modules/master-plans/master-plans.module';
import { TaskTemplatesModule } from './modules/task-templates/task-templates.module';
import { KpiEvaluationsModule } from './modules/kpi-evaluations/kpi-evaluations.module';
import { RankQuotasModule } from './modules/rank-quotas/rank-quotas.module';

@Module({
  imports: [ConfigModule, PrismaModule, EmployeesModule, TasksModule, TaskTemplatesModule, MasterPlansModule, KpiEvaluationsModule, RankQuotasModule],
})
export class AppModule {}
