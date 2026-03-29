import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../database/prisma.service';
import { MediaStatus } from '@prisma/client';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3Client: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET || 'media-center';

  constructor(private prisma: PrismaService) {
    const accessKeyId = process.env.MINIO_ACCESS_KEY;
    const secretAccessKey = process.env.MINIO_SECRET_KEY;
    const endpoint = process.env.MINIO_INTERNAL_ENDPOINT || 'http://minio:9000';

    // Kiểm tra nếu thiếu cấu hình thì báo lỗi ngay lúc khởi động
    if (!accessKeyId || !secretAccessKey || !endpoint) {
      throw new Error('Cấu hình MinIO (Key/Secret/Endpoint) bị thiếu trong file .env');
    }

    this.s3Client = new S3Client({
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
      region: process.env.MINIO_REGION || 'us-east-1',
    });
  }

  async onModuleInit() {
    await this.checkAndCreateBucket();
  }

  // =========================================================================
  // 1. LUỒNG UPLOAD ĐƠN (ẢNH, FILE NHẸ)
  // =========================================================================

  async generateUploadUrl(userId: string, data: { name: string, type: string, size: number }) {
    const fileKey = `${userId}/${Date.now()}-${data.name}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        ContentType: data.type,
      });

      // Link có hiệu lực trong 5 phút (300 giây)
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

      // Lưu Metadata vào DB: Đã dọn sạch cột downloadUrl
      const media = await this.prisma.media.create({
        data: {
          fileName: fileKey,
          originalName: data.name,
          mimeType: data.type,
          size: Number(data.size),
          ownerId: userId,
          bucket: this.bucket,
          status: MediaStatus.PENDING,
        },
      });

      return { uploadUrl, fileId: media.id, fileName: fileKey };
    } catch (error) {
      console.error('S3 Pre-signed URL Error:', error);
      throw new InternalServerErrorException('Không thể khởi tạo tiến trình upload');
    }
  }

  async confirmUpload(fileId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: fileId } });
    if (!media) throw new NotFoundException('Không tìm thấy thông tin tệp tin');

    try {
      // Dùng lệnh HEAD để kiểm tra thực tế file đã tồn tại trên MinIO chưa
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: media.bucket,
        Key: media.fileName,
      }));

      // Nếu không có lỗi, cập nhật trạng thái thành COMPLETED
      return await this.prisma.media.update({
        where: { id: fileId },
        data: { status: MediaStatus.COMPLETED },
      });
    } catch (e) {
      throw new Error('Tệp tin chưa được tải lên kho lưu trữ hoặc tên file không hợp lệ');
    }
  }

  async getMediaById(id: string) {
    return this.prisma.media.findUnique({ where: { id } });
  }

  // =========================================================================
  // 2. LUỒNG MULTIPART UPLOAD (VIDEO, FILE NẶNG)
  // =========================================================================

  async createMultipartUpload(fileKey: string, mimeType: string, userId: string, originalName: string, size: number) {
    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: fileKey,
        ContentType: mimeType,
      });
      const response = await this.s3Client.send(command);
      const uploadId = response.UploadId || '';

      // Lưu Metadata vào DB: Đã dọn sạch cột downloadUrl
      const mediaRecord = await this.prisma.media.create({
        data: {
          fileName: fileKey,
          originalName: originalName,
          mimeType: mimeType,
          size: Number(size),
          ownerId: userId,
          bucket: this.bucket,
          status: MediaStatus.PENDING,
          uploadId: uploadId,
        },
      });

      // Trả về đủ 3 thông tin cho Controller
      return { uploadId, fileKey, fileId: mediaRecord.id };
    } catch (error) {
      console.error('Multipart Init Error:', error);
      throw new InternalServerErrorException('Không thể khởi tạo Multipart Upload');
    }
  }

  async generatePresignedUrlsForParts(fileKey: string, uploadId: string, partsCount: number): Promise<string[]> {
    const urls: string[] = [];
    // Lưu ý: PartNumber của MinIO/S3 bắt đầu từ 1, không phải 0
    for (let i = 1; i <= partsCount; i++) {
      const command = new UploadPartCommand({
        Bucket: this.bucket,
        Key: fileKey,
        UploadId: uploadId,
        PartNumber: i,
      });
      // Mỗi link chunk có hiệu lực 1 tiếng
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      urls.push(url);
    }
    return urls;
  }

  async completeMultipartUpload(fileId: string, fileKey: string, uploadId: string, parts: { PartNumber: number, ETag: string }[]) {
    const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: fileKey,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: sortedParts,
        },
      });

      // Báo cho MinIO ráp file
      await this.s3Client.send(command);

      // Cập nhật CSDL thành COMPLETED
      return await this.prisma.media.update({
        where: { id: fileId },
        data: { status: MediaStatus.COMPLETED },
      });
    } catch (error) {
      console.error('Multipart Complete Error:', error);
      throw new InternalServerErrorException('Lỗi khi ráp file Multipart, vui lòng thử lại');
    }
  }


  async getPresignedDownloadUrl(bucket: string, fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileName,
    });
    // Link này sống 1 tiếng, đủ để cán bộ ngồi viết bài và xem preview
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  // =========================================================================
  // 3. TIỆN ÍCH HỆ THỐNG
  // =========================================================================

  private async checkAndCreateBucket() {
    try {
      // Kiểm tra xem bucket đã tồn tại chưa
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      console.log(`✅ Bucket "${this.bucket}" đã sẵn sàng.`);
    } catch (error: any) {
      // Nếu lỗi 404 (Không tìm thấy) -> Tạo mới
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`⚠️ Bucket "${this.bucket}" chưa tồn tại. Đang tạo mới...`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        console.log(`🎉 Đã tạo thành công bucket "${this.bucket}".`);
      } else {
        console.error("❌ Lỗi kiểm tra MinIO:", error);
      }
    }
  }
}