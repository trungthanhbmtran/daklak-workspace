import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaRepository } from './repositories/media.repository';
import { S3StorageService } from './services/s3-storage.service';

@Module({
  imports: [], // PrismaModule is global, so it doesn't need to be imported here if configured as such
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaRepository,
    S3StorageService,
  ],
  exports: [MediaService],
})
export class StorageModule { }