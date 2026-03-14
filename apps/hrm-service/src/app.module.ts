import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { EmployeesModule } from '@/modules/employees/employees.module';

@Module({
  imports: [ConfigModule, PrismaModule, EmployeesModule],
})
export class AppModule {}
