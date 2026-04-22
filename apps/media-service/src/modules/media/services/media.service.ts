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
    this.logger.log(`Requesting upload for owner: ${ownerId}, file: ${data.originalName}`);
    if (!data.originalName) {
      throw new Error('originalName is required');
    }
    const fileKey = `${ownerId}/${Date.now()}-${data.originalName}`;

    try {
      // 1. Generate presigned URL from Minio
      const uploadUrl = await this.minioService.generateUploadUrl(fileKey, data.mimeType);
      this.logger.log(`Generated upload URL for key: ${fileKey}`);

      // 2. Save metadata to DB
      const media = await this.mediaRepository.create({
        fileName: fileKey,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: Number(data.size), // Ensure it's a number
        ownerId: ownerId,
        bucket: this.minioService.getBucketName(),
        status: MediaStatus.PENDING,
      });

      if (!media) {
        throw new Error('Failed to create media metadata in database');
      }

      this.logger.log(`Created media metadata with ID: ${media.id}`);

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
    this.logger.log(`Confirming upload for fileId: ${fileId}`);
    const media = await this.mediaRepository.findById(fileId);
    if (!media) {
      this.logger.warn(`Media metadata not found for fileId: ${fileId}`);
      throw new NotFoundException('Media metadata not found');
    }

    this.logger.log(`Checking object existence in Minio for key: ${media.fileName}`);
    const exists = await this.minioService.checkObjectExists(media.fileName);
    if (!exists) {
      this.logger.error(`File ${media.fileName} does not exist in storage`);
      throw new Error('File has not been uploaded to storage yet');
    }

    this.logger.log(`Updating status to COMPLETED for fileId: ${fileId}`);
    const updatedMedia = await this.mediaRepository.updateStatus(fileId, MediaStatus.COMPLETED);

    this.logger.log(`Successfully confirmed upload for fileId: ${fileId}`);
    return updatedMedia;
  }

  /**
   * Get media metadata and a fresh download URL
   */
  async getMedia(fileId: string) {
    this.logger.log(`Getting media for fileId: ${fileId}`);
    const media = await this.mediaRepository.findById(fileId);
    if (!media) {
      this.logger.warn(`Media not found for fileId: ${fileId}`);
      throw new NotFoundException('Media not found');
    }

    this.logger.log(`Generating download URL for key: ${media.fileName}`);
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
    this.logger.log(`Generating ${partsCount} presigned URLs for multipart upload: ${uploadId}, key: ${fileKey}`);
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
    this.logger.log(`Completing multipart upload for fileId: ${fileId}, key: ${fileKey}, uploadId: ${uploadId}`);
    try {
      await this.minioService.completeMultipartUpload(fileKey, uploadId, parts);

      this.logger.log(`Verifying object existence after multipart completion for key: ${fileKey}`);
      const exists = await this.minioService.checkObjectExists(fileKey);
      if (!exists) {
        this.logger.error(`Multipart completion failed: ${fileKey} not found in storage`);
        throw new Error('Multipart upload completed but file not found in storage');
      }

      this.logger.log(`Updating status to COMPLETED for fileId: ${fileId}`);
      return this.mediaRepository.updateStatus(fileId, MediaStatus.COMPLETED);
    } catch (error) {
      this.logger.error(`Failed to complete multipart upload: ${error.message}`, error.stack);
      throw error;
    }
  }
}
