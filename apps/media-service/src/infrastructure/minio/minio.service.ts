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
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private s3Client: S3Client;
  private signingClient: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('MINIO_ROOT_USER') || '';
    const secretAccessKey = this.configService.get<string>('MINIO_ROOT_PASSWORD') || '';
    const endpoint = this.configService.get<string>('MINIO_INTERNAL_ENDPOINT') || 'http://minio:9000';
    const externalEndpoint = this.configService.get<string>('MINIO_EXTERNAL_ENDPOINT') || 'http://localhost:9000';
    const region = this.configService.get<string>('MINIO_REGION') || 'us-east-1';

    this.bucket = this.configService.get<string>('MINIO_BUCKET') || 'media-center';

    const baseConfig = {
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
      region,
      requestChecksumCalculation: 'WHEN_REQUIRED' as const,
      responseChecksumValidation: 'WHEN_REQUIRED' as const,
    };

    this.s3Client = new S3Client({
      ...baseConfig,
      endpoint,
    });

    this.signingClient = new S3Client({
      ...baseConfig,
      endpoint: externalEndpoint,
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`✅ Bucket "${this.bucket}" is ready`);
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        this.logger.warn(`⚠️ Bucket not found, creating: ${this.bucket}`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`🎉 Bucket created: ${this.bucket}`);
      } else {
        this.logger.error('❌ MinIO connection failed', error);
      }
    }
  }

  async generateUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.signingClient, command, { expiresIn });
    const prefix = this.configService.get<string>('MINIO_URL_PREFIX', '');
    const finalUrl = prefix ? `${prefix}${new URL(url).pathname}${new URL(url).search}` : url;
    this.logger.debug(`Generated upload URL: ${finalUrl}`);
    return finalUrl;
  }

  async generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    this.logger.debug(`Generating download URL for key: ${key}, expires in: ${expiresIn}s`);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.signingClient, command, { expiresIn });
    const prefix = this.configService.get<string>('MINIO_URL_PREFIX', '');
    const finalUrl = prefix ? `${prefix}${new URL(url).pathname}${new URL(url).search}` : url;
    this.logger.debug(`Generated download URL: ${finalUrl}`);
    return finalUrl;
  }

  async checkObjectExists(key: string): Promise<boolean> {
    try {
      this.logger.debug(`Checking if object exists: ${key} in bucket ${this.bucket}`);
      await this.s3Client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      this.logger.debug(`Object exists: ${key}`);
      return true;
    } catch (error) {
      this.logger.debug(`Object check failed for ${key}: ${error.message}`);
      return false;
    }
  }

  async createMultipartUpload(key: string, contentType: string): Promise<string> {
    this.logger.log(`Initiating multipart upload for key: ${key}, type: ${contentType}`);
    const res = await this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
    );
    this.logger.log(`Multipart upload initiated. UploadId: ${res.UploadId}`);
    return res.UploadId || '';
  }

  async generatePresignedUrlsForParts(key: string, uploadId: string, partsCount: number, expiresIn = 3600): Promise<string[]> {
    this.logger.debug(`Generating ${partsCount} presigned URLs for uploadId: ${uploadId}`);
    const urls: string[] = [];
    for (let i = 1; i <= partsCount; i++) {
      const command = new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: i,
      });
      const url = await getSignedUrl(this.signingClient, command, { expiresIn });
      const prefix = this.configService.get<string>('MINIO_URL_PREFIX', '');
      urls.push(prefix ? `${prefix}${new URL(url).pathname}${new URL(url).search}` : url);
    }
    this.logger.debug(`Successfully generated ${urls.length} part URLs`);
    return urls;
  }

  async completeMultipartUpload(key: string, uploadId: string, parts: { PartNumber: number; ETag: string }[]) {
    this.logger.log(`Completing multipart upload for key: ${key}, uploadId: ${uploadId} with ${parts.length} parts`);
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);
    await this.s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: sortedParts },
      }),
    );
    this.logger.log(`Successfully completed multipart upload for key: ${key}`);
  }

  getBucketName(): string {
    return this.bucket;
  }
}
