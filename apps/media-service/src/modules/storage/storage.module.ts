import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MediaController } from './media.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule { }