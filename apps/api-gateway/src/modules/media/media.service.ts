import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { MICROSERVICES } from '../../core/constants/services';
import {
  RequestUploadDto,
  ConfirmUploadDto,
  InitMultipartUploadDto,
  GetMultipartUrlsDto,
  CompleteMultipartUploadDto,
} from './dto/media.dto';

interface MediaGrpcService {
  RequestUpload(data: any): any;
  ConfirmUpload(data: any): any;
  GetMedia(data: any): any;
  InitMultipartUpload(data: any): any;
  GetMultipartPreSignedUrls(data: any): any;
  CompleteMultipartUpload(data: any): any;
}

@Injectable()
export class MediaService implements OnModuleInit {
  private mediaGrpcService: MediaGrpcService;

  constructor(
    @Inject(MICROSERVICES.MEDIA.SYMBOL)
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.mediaGrpcService = this.client.getService<MediaGrpcService>(
      MICROSERVICES.MEDIA.SERVICE,
    );
  }

  async downloadMedia(id: string, res: Response) {
    try {
      const data = await firstValueFrom<any>(
        this.mediaGrpcService.GetMedia({ fileId: id }),
      );
      if (data?.downloadUrl) {
        return res.redirect(data.downloadUrl);
      }
      return res.status(404).json({ message: 'Media link not found' });
    } catch (_e) {
      return res.status(404).json({ message: 'Media not found' });
    }
  }

  async requestUpload(req: any, body: RequestUploadDto) {
    const ownerId = req.user?.id || req.user?.sub || 'anonymous';
    const payload = { ...body, ownerId: String(ownerId) };
    return await firstValueFrom(this.mediaGrpcService.RequestUpload(payload)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  async confirmUpload(body: ConfirmUploadDto) {
    return await firstValueFrom(this.mediaGrpcService.ConfirmUpload(body)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  async initMultipartUpload(req: any, body: InitMultipartUploadDto) {
    const ownerId = req.user?.id || req.user?.sub || 'anonymous';
    const payload = { ...body, ownerId: String(ownerId) };
    return await firstValueFrom(
      this.mediaGrpcService.InitMultipartUpload(payload),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getMultipartUrls(body: GetMultipartUrlsDto) {
    return await firstValueFrom(
      this.mediaGrpcService.GetMultipartPreSignedUrls(body),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async completeMultipartUpload(body: CompleteMultipartUploadDto) {
    return await firstValueFrom(
      this.mediaGrpcService.CompleteMultipartUpload(body),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getMedia(id: string) {
    return await firstValueFrom(
      this.mediaGrpcService.GetMedia({ fileId: id }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
