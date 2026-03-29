import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { WorkflowModule } from '@/modules/engine/workflow.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    WorkflowModule,
  ],
})
export class AppModule {}
