import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MediaController } from './media.controller'; // Hoặc StorageController tùy bạn đặt tên
import { PrismaModule } from '../../database/prisma.module'; // IMPORT VÀO ĐÂY

@Module({
  imports: [PrismaModule], // KẾT NỐI PRISMA VÀO MODULE NÀY
  controllers: [MediaController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}