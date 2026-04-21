import { Observable } from 'rxjs';

export interface UploadRequest {
  originalName: string;
  mimeType: string;
  size: number;
  ownerId: string;
}

export interface UploadResponse {
  uploadUrl: string;
  fileId: string;
  fileName: string;
}

export interface ConfirmRequest {
  fileId: string;
}

export interface MediaIdRequest {
  fileId: string;
}

export interface MediaInfo {
  id: string;
  fileName: string;
  originalName: string;
  downloadUrl: string;
  status: any; // Using any for gRPC enum compatibility or specific enum if preferred
  mimeType: string;
  size: number;
  bucket: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitMultipartRequest {
  originalName: string;
  mimeType: string;
  size: number;
  ownerId: string;
}

export interface InitMultipartResponse {
  uploadId: string;
  fileKey: string;
  fileId: string;
}

export interface GetMultipartUrlsRequest {
  fileKey: string;
  uploadId: string;
  partsCount: number;
}

export interface GetMultipartUrlsResponse {
  presignedUrls: string[];
}

export interface PartInfo {
  partNumber: number;
  eTag: string;
}

export interface CompleteMultipartRequest {
  fileId: string;
  fileKey: string;
  uploadId: string;
  parts: PartInfo[];
}

export interface MediaServiceGrpc {
  RequestUpload(request: UploadRequest): Observable<UploadResponse>;
  ConfirmUpload(request: ConfirmRequest): Observable<MediaInfo>;
  GetMedia(request: MediaIdRequest): Observable<MediaInfo>;
  InitMultipartUpload(request: InitMultipartRequest): Observable<InitMultipartResponse>;
  GetMultipartPreSignedUrls(request: GetMultipartUrlsRequest): Observable<GetMultipartUrlsResponse>;
  CompleteMultipartUpload(request: CompleteMultipartRequest): Observable<MediaInfo>;
}
