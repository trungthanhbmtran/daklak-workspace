import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { PrismaModule } from '@/database/prisma.module';


@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    StorageModule,
  ],
})
export class AppModule { }
