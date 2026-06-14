import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { WorkflowModule } from '@/modules/engine/workflow.module';
import { AppController } from './app.controller';

@Module({
  imports: [ConfigModule, PrismaModule, WorkflowModule],
  controllers: [AppController],
})
export class AppModule {}
