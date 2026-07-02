import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { WorkflowModule } from '@/modules/engine/workflow.module';
import { IntegrationModule } from '@/modules/integration/integration.module';
import { AppController } from './app.controller';

@Module({
  imports: [ConfigModule, PrismaModule, WorkflowModule, IntegrationModule],
  controllers: [AppController],
})
export class AppModule {}
