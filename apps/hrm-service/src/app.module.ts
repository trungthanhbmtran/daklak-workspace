import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { EmployeesModule } from '@/modules/employees/employees.module';
import { TasksModule } from './tasks/tasks.module';
import { KpisModule } from './kpis/kpis.module';

@Module({
  imports: [ConfigModule, PrismaModule, EmployeesModule, TasksModule, KpisModule],
})
export class AppModule {}
