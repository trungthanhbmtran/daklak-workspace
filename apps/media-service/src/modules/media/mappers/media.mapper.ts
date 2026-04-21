import { Media as PrismaMedia } from '@prisma/client';
import { MediaInfo } from '../interfaces/media.interface';

export class MediaMapper {
  static toGrpcResponse(media: PrismaMedia, downloadUrl: string): MediaInfo {
    return {
      id: media.id,
      fileName: media.fileName,
      originalName: media.originalName,
      downloadUrl: downloadUrl,
      status: media.status,
      mimeType: media.mimeType,
      size: media.size,
      bucket: media.bucket || '',
      ownerId: media.ownerId || '',
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    };
  }
}
