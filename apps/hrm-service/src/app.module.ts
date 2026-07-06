import { TaskHistoryModule } from './modules/task-history/task-history.module';
import { TaskCatalogModule } from './modules/task-catalog/task-catalog.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { EmployeesModule } from '@/modules/employees/employees.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MasterPlansModule } from './modules/master-plans/master-plans.module';

import { KpiEvaluationsModule } from './modules/kpi-evaluations/kpi-evaluations.module';

import { TaskSharedModule } from './modules/task-shared/task-shared.module';
import { TaskCommentsModule } from './modules/task-comments/task-comments.module';
import { TaskParticipantsModule } from './modules/task-participants/task-participants.module';
import { TaskWorkflowsModule } from './modules/task-workflows/task-workflows.module';
import { TaskKpiModule } from './modules/task-kpi/task-kpi.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ScheduleModule.forRoot(),
    EmployeesModule,
    TaskSharedModule,
    TaskCommentsModule,
    TaskParticipantsModule,
    TaskWorkflowsModule,
    TaskKpiModule,
    TaskHistoryModule,
    TaskCatalogModule,
    TasksModule,
    MasterPlansModule,
    KpiEvaluationsModule,
  ],
})
export class AppModule { }
