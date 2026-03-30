import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('MINIO_SECRET_KEY');
    const endpoint = this.configService.get<string>('MINIO_INTERNAL_ENDPOINT') || 'http://minio:9000';
    const region = this.configService.get<string>('MINIO_REGION') || 'us-east-1';
    this.bucket = this.configService.get<string>('MINIO_BUCKET') || 'media-center';

    if (!accessKeyId || !secretAccessKey) {
      this.logger.error('MinIO (Key/Secret) configurations are missing in environment variables');
      throw new Error('Config missing for S3StorageService initialization');
    }

    this.s3Client = new S3Client({
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
      region,
    });
  }

  async onModuleInit() {
    await this.checkAndCreateBucket();
  }

  /**
   * Check if the bucket exists and create it if it doesn't.
   */
  private async checkAndCreateBucket() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`✅ Bucket "${this.bucket}" is ready.`);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        this.logger.warn(`⚠️ Bucket "${this.bucket}" does not exist. Creating...`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`🎉 Successfully created bucket "${this.bucket}".`);
      } else {
        this.logger.error("❌ Error checking MinIO bucket:", error);
      }
    }
  }

  /**
   * Generate a pre-signed URL for direct upload.
   */
  async generateUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Generate a pre-signed URL for downloading a file.
   */
  async generateDownloadUrl(key: string, bucket?: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket || this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Check if an object exists in the storage.
   */
  async checkObjectExists(key: string, bucket?: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: bucket || this.bucket,
        Key: key,
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a multipart upload session.
   */
  async createMultipartUpload(key: string, contentType: string): Promise<string> {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const response = await this.s3Client.send(command);
    return response.UploadId || '';
  }

  /**
   * Generate pre-signed URLs for parts of a multipart upload.
   */
  async generatePresignedUrlsForParts(key: string, uploadId: string, partsCount: number, expiresIn = 3600): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 1; i <= partsCount; i++) {
      const command = new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: i,
      });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      urls.push(url);
    }
    return urls;
  }

  /**
   * Complete a multipart upload session.
   */
  async completeMultipartUpload(key: string, uploadId: string, parts: { PartNumber: number, ETag: string }[]): Promise<void> {
    const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts,
      },
    });
    await this.s3Client.send(command);
  }

  /**
   * Get the current default bucket name.
   */
  getBucketName(): string {
    return this.bucket;
  }
}
