import { Media as PrismaMedia } from '@prisma/client';
import { MediaInfo } from '../interfaces/media.interface';

export class MediaMapper {
  static toGrpcResponse(media: PrismaMedia, downloadUrl: string): MediaInfo {
    if (!media) {
      return {
        id: '',
        fileName: '',
        originalName: '',
        downloadUrl: downloadUrl || '',
        status: 'FAILED',
        mimeType: '',
        size: 0,
        bucket: '',
        ownerId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      id: media.id,
      fileName: media.fileName,
      originalName: media.originalName,
      downloadUrl: downloadUrl,
      status: media.status,
      mimeType: media.mimeType,
      size: media.size,
      bucket: media.bucket,
      ownerId: media.ownerId,
      createdAt: media.createdAt ? media.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: media.updatedAt ? media.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
