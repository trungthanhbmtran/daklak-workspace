import { Injectable } from '@nestjs/common';

@Injectable()
export class MinioService {
  async presignedPutObject(bucketName: string, objectName: string, expiry: number) {
    return 'dummy-url';
  }
  async generateUploadUrl(fileKey: string, mimeType: string) { return 'dummy-url'; }
  getBucketName() { return 'dummy-bucket'; }
  async checkObjectExists(fileKey: string) { return true; }
  async generateDownloadUrl(fileKey: string) { return 'dummy-url'; }
  async createMultipartUpload(fileKey: string, mimeType: string) { return 'dummy-upload-id'; }
  async generatePresignedUrlsForParts(fileKey: string, uploadId: string, partsCount: number) { return []; }
  async completeMultipartUpload(fileKey: string, uploadId: string, parts: any) { return true; }
}
