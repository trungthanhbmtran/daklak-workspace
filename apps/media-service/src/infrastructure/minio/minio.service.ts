import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'daklak-media';
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('MINIO_ENDPOINT') || 'http://localhost:9000',
      region: this.configService.get<string>('MINIO_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
        secretAccessKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
      },
      forcePathStyle: true, // Needed for MinIO
    });
  }

  getBucketName() {
    return this.bucketName;
  }

  async presignedPutObject(bucketName: string, objectName: string, expiry: number) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: expiry });
  }

  async generateUploadUrl(fileKey: string, mimeType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: mimeType,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async checkObjectExists(fileKey: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  async generateDownloadUrl(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async createMultipartUpload(fileKey: string, mimeType: string): Promise<string> {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: mimeType,
    });
    const response = await this.s3Client.send(command);
    if (!response.UploadId) throw new Error('Failed to create multipart upload');
    return response.UploadId;
  }

  async generatePresignedUrlsForParts(fileKey: string, uploadId: string, partsCount: number) {
    const presignedUrls: string[] = [];
    for (let i = 1; i <= partsCount; i++) {
      const command = new UploadPartCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        UploadId: uploadId,
        PartNumber: i,
      });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      presignedUrls.push(url);
    }
    return presignedUrls;
  }

  async completeMultipartUpload(fileKey: string, uploadId: string, parts: any[]) {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          ETag: part.eTag,
          PartNumber: part.partNumber,
        })),
      },
    });
    await this.s3Client.send(command);
    return true;
  }
}
