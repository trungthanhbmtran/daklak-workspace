import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { EmployeesModule } from '@/modules/employees/employees.module';
import { TasksModule } from './tasks/tasks.module';
import { KpisModule } from './kpis/kpis.module';
import { PlansModule } from './plans/plans.module';
import { TaskTemplatesModule } from './task-templates/task-templates.module';

@Module({
  imports: [ConfigModule, PrismaModule, EmployeesModule, TasksModule, KpisModule, PlansModule, TaskTemplatesModule],
})
export class AppModule {}
