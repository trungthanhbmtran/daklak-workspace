import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './modules/document/document.module';
import { MinutesModule } from './modules/minutes/minutes.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { PrismaModule } from './database/prisma.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    WorkflowModule,
    DocumentModule,
    MinutesModule,
    ConsultationModule,
  ],
})
export class AppModule { }
