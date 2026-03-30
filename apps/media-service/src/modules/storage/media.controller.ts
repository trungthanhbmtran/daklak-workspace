import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { MediaService } from './media.service';
import { 
  UploadRequest, 
  UploadResponse, 
  ConfirmRequest, 
  MediaIdRequest, 
  MediaInfo 
} from './interfaces/media.interface';

@Controller()
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
  ) {}

  // =========================================================================
  // LUỒNG 1: UPLOAD ĐƠN (ẢNH, FILE NHẸ)
  // =========================================================================

  @GrpcMethod('MediaService', 'RequestUpload')
  async requestUpload(data: UploadRequest): Promise<UploadResponse> {
    try {
      const result = await this.mediaService.generateUploadUrl(
        data.ownerId, 
        {
          name: data.originalName,
          type: data.mimeType,
          size: Number(data.size),
        }
      );
      
      return {
        uploadUrl: result.uploadUrl,
        fileId: result.fileId,
        fileName: result.fileName,
      };
    } catch (error: any) {
      throw new RpcException({
        code: 13, // INTERNAL
        message: error.message || 'Lỗi hệ thống khi tạo link upload',
      });
    }
  }

  @GrpcMethod('MediaService', 'ConfirmUpload')
  async confirmUpload(data: ConfirmRequest): Promise<MediaInfo> {
    try {
      const updatedMedia = await this.mediaService.confirmUpload(data.fileId);

      // Generate pre-signed URL for response
      const presignedUrl = await this.mediaService.getPresignedDownloadUrl(
        updatedMedia.bucket, 
        updatedMedia.fileName
      );

      return {
        id: updatedMedia.id,
        fileName: updatedMedia.fileName,
        downloadUrl: presignedUrl,
        status: updatedMedia.status, 
        mimeType: updatedMedia.mimeType,
      };
    } catch (error: any) {
      throw new RpcException({ code: 3, message: error.message });
    }
  }

  // =========================================================================
  // LUỒNG 2: MULTIPART UPLOAD (VIDEO, FILE NẶNG)
  // =========================================================================

  @GrpcMethod('MediaService', 'InitMultipartUpload')
  async initMultipartUpload(data: any) {
    try {
      const fileKey = `${data.ownerId}/${Date.now()}-${data.originalName}`;
      
      return await this.mediaService.createMultipartUpload(
        fileKey, 
        data.mimeType, 
        data.ownerId, 
        data.originalName, 
        Number(data.size)
      );
    } catch (error: any) {
      throw new RpcException({
        code: 13,
        message: error.message || 'Không thể khởi tạo Multipart Upload',
      });
    }
  }

  @GrpcMethod('MediaService', 'GetMultipartPreSignedUrls')
  async getMultipartPreSignedUrls(data: any) {
    try {
      const { fileKey, uploadId, partsCount } = data;
      const presignedUrls = await this.mediaService.generatePresignedUrlsForParts(
        fileKey, 
        uploadId, 
        partsCount
      );
      
      return { presignedUrls };
    } catch (error: any) {
      throw new RpcException({
        code: 13,
        message: 'Không thể tạo danh sách link chunks',
      });
    }
  }

  @GrpcMethod('MediaService', 'CompleteMultipartUpload')
  async completeMultipartUpload(data: any): Promise<MediaInfo> {
    try {
      const { fileId, fileKey, uploadId, parts } = data;

      const updatedMedia = await this.mediaService.completeMultipartUpload(
        fileId,
        fileKey, 
        uploadId, 
        parts
      );

      // Build static public URL if requested or use pre-signed
      const downloadUrl = this.mediaService.buildPublicUrl(updatedMedia.bucket, updatedMedia.fileName);

      return {
        id: updatedMedia.id,
        fileName: updatedMedia.fileName,
        downloadUrl: downloadUrl,
        status: updatedMedia.status,
        mimeType: updatedMedia.mimeType,
      };
    } catch (error: any) {
      throw new RpcException({
        code: 13,
        message: error.message || 'Lỗi khi ráp file Multipart',
      });
    }
  }

  // =========================================================================
  // CÁC HÀM DÙNG CHUNG
  // =========================================================================

  @GrpcMethod('MediaService', 'GetMedia')
  async getMedia(data: MediaIdRequest): Promise<MediaInfo> {
    try {
      const media = await this.mediaService.getMediaById(data.fileId);
      if (!media) {
        throw new Error('Không tìm thấy tệp tin');
      }

      // Generate pre-signed download URL
      const presignedUrl = await this.mediaService.getPresignedDownloadUrl(
        media.bucket, 
        media.fileName
      );

      return {
        id: media.id,
        fileName: media.fileName,
        downloadUrl: presignedUrl,
        status: media.status,
        mimeType: media.mimeType,
      };
    } catch (error: any) {
      throw new RpcException({ code: 5, message: error.message });
    }
  }
}