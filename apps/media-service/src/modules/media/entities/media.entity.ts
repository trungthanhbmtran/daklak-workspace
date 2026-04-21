import { MediaStatus } from '../enums/media.enum';

export class Media {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: MediaStatus;
  bucket: string;
  ownerId: string;
  uploadId?: string;
  createdAt: Date;
  updatedAt: Date;
}
