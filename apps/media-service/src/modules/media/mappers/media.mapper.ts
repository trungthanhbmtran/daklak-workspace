import { Media as PrismaMedia } from '@prisma/client';
import { MediaInfo } from '../interfaces/media.interface';

export class MediaMapper {
  static toGrpcResponse(media: PrismaMedia, downloadUrl: string): MediaInfo {
    return {
      id: media.id,
      fileName: media.fileName,
      downloadUrl: downloadUrl,
      status: media.status,
      mimeType: media.mimeType,
      size: media.size,
      createdAt: media.createdAt.toISOString(),
    };
  }
}
