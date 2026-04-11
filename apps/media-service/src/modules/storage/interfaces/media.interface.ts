
export interface UploadRequest {
    originalName: string;
    mimeType: string;
    size: number | string;
    ownerId: string;
    host: string;
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
    downloadUrl: string;
    status: string;
    mimeType: string;
  }