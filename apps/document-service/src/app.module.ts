import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './modules/document/document.module';
import { CategoryModule } from './modules/category/category.module';
import { MinutesModule } from './modules/minutes/minutes.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    DocumentModule,
    CategoryModule,
    MinutesModule,
    ConsultationModule,
  ],
})
export class AppModule {}
