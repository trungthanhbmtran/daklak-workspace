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
  private signingClient: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('MINIO_SECRET_KEY');
    const endpoint =
      this.configService.get<string>('MINIO_INTERNAL_ENDPOINT') || 'http://minio:9000';
    const externalEndpoint =
      this.configService.get<string>('MINIO_EXTERNAL_ENDPOINT') || 'http://localhost:9000';
    const region = this.configService.get<string>('MINIO_REGION') || 'us-east-1';

    this.bucket = this.configService.get<string>('MINIO_BUCKET') || 'media-center';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Missing MinIO credentials');
    }

    const baseConfig = {
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
      region,
      requestChecksumCalculation: 'WHEN_REQUIRED' as const,
      responseChecksumValidation: 'WHEN_REQUIRED' as const,
    };

    // Internal client
    this.s3Client = new S3Client({
      ...baseConfig,
      endpoint,
    });

    // External (signed URL)
    this.signingClient = new S3Client({
      ...baseConfig,
      endpoint: externalEndpoint,
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  /**
   * Ensure bucket exists
   */
  private async ensureBucket() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucket }),
      );
      this.logger.log(`✅ Bucket "${this.bucket}" exists`);
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        this.logger.warn(`⚠️ Bucket not found, creating: ${this.bucket}`);

        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );

        this.logger.log(`🎉 Bucket created: ${this.bucket}`);
      } else {
        this.logger.error('❌ Bucket check failed', error);
      }
    }

    // ❌ KHÔNG set CORS bằng SDK nữa (tránh lỗi 501)
    this.logger.warn(
      '⚠️ Skipping CORS setup via SDK (use MinIO config or mc instead)',
    );
  }

  /**
   * Upload URL
   */
  async generateUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
    externalHost?: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const signingClient = externalHost
      ? new S3Client({
          endpoint: externalHost,
          region: this.configService.get('MINIO_REGION') || 'us-east-1',
          credentials: {
            accessKeyId: this.configService.get('MINIO_ACCESS_KEY'),
            secretAccessKey: this.configService.get('MINIO_SECRET_KEY'),
          },
          forcePathStyle: true,
          requestChecksumCalculation: 'WHEN_REQUIRED',
        })
      : this.signingClient;

    return getSignedUrl(signingClient, command, { expiresIn });
  }

  /**
   * Download URL
   */
  async generateDownloadUrl(
    key: string,
    bucket?: string,
    expiresIn = 3600,
    externalHost?: string,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket || this.bucket,
      Key: key,
    });

    const signingClient = externalHost
      ? new S3Client({
          endpoint: externalHost,
          region: this.configService.get('MINIO_REGION') || 'us-east-1',
          credentials: {
            accessKeyId: this.configService.get('MINIO_ACCESS_KEY'),
            secretAccessKey: this.configService.get('MINIO_SECRET_KEY'),
          },
          forcePathStyle: true,
          requestChecksumCalculation: 'WHEN_REQUIRED',
        })
      : this.signingClient;

    let url = await getSignedUrl(signingClient, command, { expiresIn });

    // 🔥 CHÈN /media VÀO URL DOWNLOAD NẾU CẦN
    if (externalHost && url.includes(externalHost)) {
      url = url.replace(externalHost, `${externalHost}/media`);
    }

    return url;
  }

  /**
   * Check object exists
   */
  async checkObjectExists(
    key: string,
    bucket?: string,
  ): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: bucket || this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Multipart upload
   */
  async createMultipartUpload(
    key: string,
    contentType: string,
  ): Promise<string> {
    const res = await this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
    );
    return res.UploadId || '';
  }

  async generatePresignedUrlsForParts(
    key: string,
    uploadId: string,
    partsCount: number,
    expiresIn = 3600,
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let i = 1; i <= partsCount; i++) {
      const command = new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: i,
      });

      urls.push(
        await getSignedUrl(this.signingClient, command, { expiresIn }),
      );
    }

    return urls;
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
  ) {
    const sorted = parts.sort((a, b) => a.PartNumber - b.PartNumber);

    await this.s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: sorted },
      }),
    );
  }

  getBucketName(): string {
    return this.bucket;
  }
}