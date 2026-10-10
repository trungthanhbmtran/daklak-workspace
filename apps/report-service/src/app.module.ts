import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportsModule } from './modules/reports/reports.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { DocumentGeneratorModule } from './modules/document-generator/document-generator.module';

import { GrpcAuthModule } from '../../../shared/security/grpc-auth';

@Module({
  imports: [
    GrpcAuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ReportsModule,
    TemplatesModule,
    StatisticsModule,
    DocumentGeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



