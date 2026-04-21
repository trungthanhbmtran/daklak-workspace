import { Controller, UseFilters, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { MediaService } from '../services/media.service';
import { MediaMapper } from '../mappers/media.mapper';
import {
  UploadRequestDto,
  ConfirmRequestDto,
  MediaIdRequestDto,
  InitMultipartRequestDto,
  GetMultipartUrlsRequestDto,
  CompleteMultipartRequestDto,
} from '../dto/media.dto';
import {
  MediaInfo,
  UploadResponse,
  InitMultipartResponse,
  GetMultipartUrlsResponse,
} from '../interfaces/media.interface';
import { status } from '@grpc/grpc-js';

@Controller()
export class MediaGrpcController {
  private readonly logger = new Logger(MediaGrpcController.name);
  constructor(private readonly mediaService: MediaService) { }

  @GrpcMethod('MediaService', 'RequestUpload')
  async requestUpload(data: UploadRequestDto): Promise<UploadResponse> {
    this.logger.log(`Incoming request: RequestUpload, data: ${JSON.stringify(data)}`);
    try {
      const result = await this.mediaService.requestUpload(data.ownerId, {
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
      });

      return {
        uploadUrl: result.uploadUrl,
        fileId: result.fileId,
        fileName: result.fileName,
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message || 'Failed to request upload URL',
      });
    }
  }

  @GrpcMethod('MediaService', 'ConfirmUpload')
  async confirmUpload(data: ConfirmRequestDto): Promise<MediaInfo> {
    this.logger.log(`Incoming request: ConfirmUpload, data: ${JSON.stringify(data)}`);
    try {
      const media = await this.mediaService.confirmUpload(data.fileId);
      const downloadUrl = await this.mediaService.getMedia(media.id);
      return MediaMapper.toGrpcResponse(media, downloadUrl.downloadUrl);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? status.NOT_FOUND : status.INTERNAL,
        message: error.message || 'Failed to confirm upload',
      });
    }
  }

  @GrpcMethod('MediaService', 'GetMedia')
  async getMedia(data: MediaIdRequestDto): Promise<MediaInfo> {
    this.logger.log(`Incoming request: GetMedia, data: ${JSON.stringify(data)}`);
    try {
      const { media, downloadUrl } = await this.mediaService.getMedia(data.fileId);
      return MediaMapper.toGrpcResponse(media, downloadUrl);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? status.NOT_FOUND : status.INTERNAL,
        message: error.message || 'Media not found',
      });
    }
  }

  @GrpcMethod('MediaService', 'InitMultipartUpload')
  async initMultipartUpload(data: InitMultipartRequestDto): Promise<InitMultipartResponse> {
    this.logger.log(`Incoming request: InitMultipartUpload, data: ${JSON.stringify(data)}`);
    try {
      const result = await this.mediaService.initMultipartUpload(data.ownerId, {
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
      });

      return {
        uploadId: result.uploadId,
        fileKey: result.fileKey,
        fileId: result.fileId,
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message || 'Failed to initialize multipart upload',
      });
    }
  }

  @GrpcMethod('MediaService', 'GetMultipartPreSignedUrls')
  async getMultipartPreSignedUrls(data: GetMultipartUrlsRequestDto): Promise<GetMultipartUrlsResponse> {
    this.logger.log(`Incoming request: GetMultipartPreSignedUrls, data: ${JSON.stringify(data)}`);
    try {
      const urls = await this.mediaService.getMultipartPreSignedUrls(
        data.fileKey,
        data.uploadId,
        data.partsCount,
      );

      return { presignedUrls: urls };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message || 'Failed to generate presigned URLs for parts',
      });
    }
  }

  @GrpcMethod('MediaService', 'CompleteMultipartUpload')
  async completeMultipartUpload(data: CompleteMultipartRequestDto): Promise<MediaInfo> {
    this.logger.log(`Incoming request: CompleteMultipartUpload, data: ${JSON.stringify(data)}`);
    try {
      const media = await this.mediaService.completeMultipartUpload(
        data.fileId,
        data.fileKey,
        data.uploadId,
        data.parts.map((p) => ({
          PartNumber: p.partNumber,
          ETag: p.eTag,
        })),
      );

      const { downloadUrl } = await this.mediaService.getMedia(media.id);
      return MediaMapper.toGrpcResponse(media, downloadUrl);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message || 'Failed to complete multipart upload',
      });
    }
  }
}
