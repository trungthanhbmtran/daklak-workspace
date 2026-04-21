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
    const endpoint = (this.configService.get<string>('MINIO_INTERNAL_ENDPOINT') || 'http://minio:9000').replace(/\/+$/, '');
    const externalEndpoint = (this.configService.get<string>('MINIO_EXTERNAL_ENDPOINT') || 'http://localhost:9000').replace(/\/+$/, '');
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
    return getSignedUrl(this.signingClient, command, { expiresIn });
  }

  async generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.signingClient, command, { expiresIn });
  }

  async checkObjectExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async createMultipartUpload(key: string, contentType: string): Promise<string> {
    const res = await this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
    );
    return res.UploadId || '';
  }

  async generatePresignedUrlsForParts(key: string, uploadId: string, partsCount: number, expiresIn = 3600): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 1; i <= partsCount; i++) {
      const command = new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: i,
      });
      urls.push(await getSignedUrl(this.signingClient, command, { expiresIn }));
    }
    return urls;
  }

  async completeMultipartUpload(key: string, uploadId: string, parts: { PartNumber: number; ETag: string }[]) {
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);
    await this.s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: sortedParts },
      }),
    );
  }

  getBucketName(): string {
    return this.bucket;
  }
}
