import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { StorageModule } from '@/modules/storage/storage.module';


@Module({
  imports: [
    ConfigModule,
    StorageModule,
  ],
})
export class AppModule {}
