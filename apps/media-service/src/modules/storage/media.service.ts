import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { MediaStatus, Media } from '@prisma/client';
import { S3StorageService } from './services/s3-storage.service';
import { MediaRepository } from './repositories/media.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly storageProvider: S3StorageService,
    private readonly mediaRepository: MediaRepository,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Helper function: Build static public URL
   */
  // public buildPublicUrl(bucket: string, fileName: string): string {
  //   const endpoint = this.configService.get<string>('MINIO_EXTERNAL_ENDPOINT') || 'http://localhost:30000';
  //   return `${endpoint}/${bucket}/${fileName}`;
  // }

  /**
   * LUỒNG 1: UPLOAD ĐƠN (ẢNH, FILE NHẸ)
   * Tạo link pre-signed để client upload trực tiếp lên S3/MinIO
   */
  async generateUploadUrl(userId: string, data: { name: string, type: string, size: number }, host?: string) {
    const fileKey = `${userId}/${Date.now()}-${data.name}`;

    try {
      // 1. Tạo link pre-signed từ storage provider (vẫn truyền host để ký đúng domain)
      let uploadUrl = await this.storageProvider.generateUploadUrl(fileKey, data.type, 300, host);

      this.logger.log(`Generated Raw Upload URL: ${uploadUrl} for host: ${host}`);

      // 🔥 CHÈN /media VÀO URL NẾU CÓ HOST
      // Thay vì check includes(host), ta lấy host/media để route qua Nginx
      if (host) {
        // Tìm vị trí của path bắt đầu từ sau bucket name hoặc host
        // Đảm bảo URL luôn đi qua Nginx proxy /media
        const urlObj = new URL(uploadUrl);
        uploadUrl = `${host}/media${urlObj.pathname}${urlObj.search}`;
        this.logger.log(`Final Upload URL (Proxied): ${uploadUrl}`);
      }

      // 2. Lưu Metadata vào DB thông qua Repository
      const media = await this.mediaRepository.create({
        fileName: fileKey,
        originalName: data.name,
        mimeType: data.type,
        size: Number(data.size),
        ownerId: userId,
        bucket: this.storageProvider.getBucketName(),
        status: MediaStatus.PENDING,
      });

      return { uploadUrl, fileId: media.id, fileName: fileKey };
    } catch (error) {
      this.logger.error('Error in generateUploadUrl:', error);
      throw new InternalServerErrorException('Không thể khởi tạo tiến trình upload');
    }
  }

  /**
   * Xác nhận file đã được upload thành công lên storage
   */
  async confirmUpload(fileId: string): Promise<Media> {
    const media = await this.mediaRepository.findById(fileId);
    if (!media) {
      throw new NotFoundException('Không tìm thấy thông tin tệp tin');
    }

    // 1. Kiểm tra thực tế file đã tồn tại trên storage chưa
    const exists = await this.storageProvider.checkObjectExists(media.fileName, media.bucket);
    if (!exists) {
      throw new Error('Tệp tin chưa được tải lên kho lưu trữ hoặc tên file không hợp lệ');
    }

    // 2. Cập nhật trạng thái thành COMPLETED
    return this.mediaRepository.updateStatus(fileId, MediaStatus.COMPLETED);
  }

  /**
   * Lấy thông tin media theo ID
   */
  async getMediaById(id: string): Promise<Media | null> {
    return this.mediaRepository.findById(id);
  }

  /**
   * LUỒNG 2: MULTIPART UPLOAD (VIDEO, FILE NẶNG)
   * Khởi tạo quá trình upload nhiều phần (chunks)
   */
  async createMultipartUpload(fileKey: string, mimeType: string, userId: string, originalName: string, size: number, host?: string) {
    try {
      // 1. Khởi tạo multipart upload trên S3
      const uploadId = await this.storageProvider.createMultipartUpload(fileKey, mimeType);

      // 2. Lưu metadata vào DB
      const mediaRecord = await this.mediaRepository.create({
        fileName: fileKey,
        originalName: originalName,
        mimeType: mimeType,
        size: Number(size),
        ownerId: userId,
        bucket: this.storageProvider.getBucketName(),
        status: MediaStatus.PENDING,
        uploadId: uploadId,
      });

      return { uploadId, fileKey, fileId: mediaRecord.id };
    } catch (error) {
      this.logger.error('Error in createMultipartUpload:', error);
      throw new InternalServerErrorException('Không thể khởi tạo Multipart Upload');
    }
  }

  /**
   * Tạo danh sách links pre-signed cho các chunks của file
   */
  async generatePresignedUrlsForParts(fileKey: string, uploadId: string, partsCount: number): Promise<string[]> {
    return this.storageProvider.generatePresignedUrlsForParts(fileKey, uploadId, partsCount);
  }

  /**
   * Hoàn thành quá trình upload multipart
   */
  async completeMultipartUpload(
    fileId: string,
    fileKey: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
    host?: string
  ) {
    try {
      // 1. Complete multipart
      await this.storageProvider.completeMultipartUpload(fileKey, uploadId, parts);

      // 2. VERIFY FILE EXISTS
      const exists = await this.storageProvider.checkObjectExists(
        fileKey,
        this.storageProvider.getBucketName()
      );

      if (!exists) {
        throw new Error('Multipart upload hoàn tất nhưng file không tồn tại trên storage');
      }

      // 3. Update DB
      return this.mediaRepository.updateStatus(fileId, MediaStatus.COMPLETED);
    } catch (error) {
      this.logger.error('Error in completeMultipartUpload:', error);
      throw new InternalServerErrorException(
        error.message || 'Lỗi khi ráp file Multipart, vui lòng thử lại'
      );
    }
  }

  /**
   * Sinh link tải xuống có chữ ký (on-the-fly)
   */
  async getPresignedDownloadUrl(bucket: string, fileName: string, host?: string): Promise<string> {
    let url = await this.storageProvider.generateDownloadUrl(fileName, bucket, 3600, host);

    // 🔥 CHÈN /media VÀO URL DOWNLOAD NẾU CÓ HOST
    if (host) {
      const urlObj = new URL(url);
      url = `${host}/media${urlObj.pathname}${urlObj.search}`;
    }

    return url;
  }

  /**
   * Tạo URL tĩnh (nếu storage công khai)
   */
  buildPublicUrl(bucket: string, key: string, host?: string): string {
    if (host) {
      return `${host}/media/${bucket}/${key}`;
    }
    return `/${bucket}/${key}`;
  }
}
