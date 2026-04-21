import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MinioService } from '../../../infrastructure/minio/minio.service';
import { MediaRepository } from '../repositories/media.repository';
import { MediaStatus } from '../enums/media.enum';
import { Media } from '@prisma/client';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly mediaRepository: MediaRepository,
  ) { }

  /**
   * Request a presigned URL for a single file upload
   */
  async requestUpload(ownerId: string, data: { originalName: string; mimeType: string; size: number }) {
    const fileKey = `${ownerId}/${Date.now()}-${data.originalName}`;

    try {
      // 1. Generate presigned URL from Minio
      const uploadUrl = await this.minioService.generateUploadUrl(fileKey, data.mimeType);

      // 2. Save metadata to DB
      const media = await this.mediaRepository.create({
        fileName: fileKey,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        ownerId: ownerId,
        bucket: this.minioService.getBucketName(),
        status: MediaStatus.PENDING,
      });

      return {
        uploadUrl,
        fileId: media.id,
        fileName: fileKey,
      };
    } catch (error) {
      this.logger.error(`Failed to request upload: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirm that the file exists in storage and update DB status
   */
  async confirmUpload(fileId: string) {
    const media = await this.mediaRepository.findById(fileId);
    if (!media) {
      throw new NotFoundException('Media metadata not found');
    }

    const exists = await this.minioService.checkObjectExists(media.fileName);
    if (!exists) {
      throw new Error('File has not been uploaded to storage yet');
    }

    const updatedMedia = await this.mediaRepository.updateStatus(fileId, MediaStatus.COMPLETED);

    return updatedMedia;
  }

  /**
   * Get media metadata and a fresh download URL
   */
  async getMedia(fileId: string) {
    const media = await this.mediaRepository.findById(fileId);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const downloadUrl = await this.minioService.generateDownloadUrl(media.fileName);

    return { media, downloadUrl };
  }

  /**
   * Initialize Multipart Upload
   */
  async initMultipartUpload(ownerId: string, data: { originalName: string; mimeType: string; size: number }) {
    const fileKey = `${ownerId}/${Date.now()}-${data.originalName}`;

    try {
      const uploadId = await this.minioService.createMultipartUpload(fileKey, data.mimeType);

      const media = await this.mediaRepository.create({
        fileName: fileKey,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        ownerId: ownerId,
        bucket: this.minioService.getBucketName(),
        status: MediaStatus.PENDING,
        uploadId: uploadId,
      });

      return {
        uploadId,
        fileKey,
        fileId: media.id,
      };
    } catch (error) {
      this.logger.error(`Failed to init multipart upload: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate presigned URLs for each part of a multipart upload
   */
  async getMultipartPreSignedUrls(fileKey: string, uploadId: string, partsCount: number) {
    return this.minioService.generatePresignedUrlsForParts(fileKey, uploadId, partsCount);
  }

  /**
   * Complete Multipart Upload
   */
  async completeMultipartUpload(
    fileId: string,
    fileKey: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[]
  ) {
    try {
      await this.minioService.completeMultipartUpload(fileKey, uploadId, parts);

      const exists = await this.minioService.checkObjectExists(fileKey);
      if (!exists) {
        throw new Error('Multipart upload completed but file not found in storage');
      }

      return this.mediaRepository.updateStatus(fileId, MediaStatus.COMPLETED);
    } catch (error) {
      this.logger.error(`Failed to complete multipart upload: ${error.message}`, error.stack);
      throw error;
    }
  }
}
