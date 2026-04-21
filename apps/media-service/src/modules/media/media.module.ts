import { Module } from '@nestjs/common';
import { MediaService } from './services/media.service';
import { MediaGrpcController } from './controllers/media.grpc.controller';
import { MediaRepository } from './repositories/media.repository';
import { MinioModule } from '../../infrastructure/minio/minio.module';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [MinioModule, PrismaModule],
  controllers: [MediaGrpcController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService],
})
export class MediaModule { }
