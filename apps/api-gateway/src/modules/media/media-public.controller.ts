import {
  Controller,
  Get,
  Param,
  Inject,
  Res,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

/**
 * Public Controller cho phép xem/tải ảnh mà không cần Login
 * Redirect người dùng tới Pre-signed URL của Storage (MinIO/S3)
 */
@Controller('media')
export class MediaPublicController implements OnModuleInit {
  private mediaService: any;

  constructor(
    @Inject(MICROSERVICES.MEDIA.SYMBOL) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.mediaService = this.client.getService<any>(MICROSERVICES.MEDIA.SERVICE);
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    try {
      // Vì là Public route, chúng ta không có host từ Req của User (hoặc có thể lấy từ headers)
      // Nhưng quan trọng là lấy link từ Media Service
      const result = await firstValueFrom(this.mediaService.GetMedia({ fileId: id }));
      
      if (result && result.downloadUrl) {
        return res.redirect(HttpStatus.MOVED_PERMANENTLY, result.downloadUrl);
      }
      
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Không tìm thấy tệp tin' });
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Lỗi khi tải tệp tin' });
    }
  }
}
