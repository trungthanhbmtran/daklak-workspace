import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { EmployeesModule } from '@/modules/employees/employees.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MasterPlansModule } from './modules/master-plans/master-plans.module';
import { KpiEvaluationsModule } from './modules/kpi-evaluations/kpi-evaluations.module';
import { TaskHistoryModule } from './modules/task-history/task-history.module';
import { TaskCatalogModule } from './modules/task-catalog/task-catalog.module';
import { TaskKpiModule } from './modules/task-kpi/task-kpi.module';

import { InternalAuthModule } from './core/auth/gateway-context.service';

@Module({
  imports: [
    InternalAuthModule,
    ConfigModule,
    PrismaModule,
    ScheduleModule.forRoot(),
    EmployeesModule,
    // TasksModule imports TaskSharedModule (@Global) — tự động available toàn app
    TasksModule,
    MasterPlansModule,
    KpiEvaluationsModule,
    TaskHistoryModule,
    TaskCatalogModule,
    TaskKpiModule,
  ],
})
export class AppModule {}

