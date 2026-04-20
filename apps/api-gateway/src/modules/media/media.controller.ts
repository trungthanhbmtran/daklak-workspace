import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  UseGuards,
  OnModuleInit,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

// Interface hứng dữ liệu từ gRPC (Khớp với file proto)
interface MediaGrpcService {
  RequestUpload(data: { originalName: string; mimeType: string; size: number; ownerId: string; host: string }): any;
  ConfirmUpload(data: { fileId: string; host: string }): any;
  GetMedia(data: { fileId: string; host: string }): any;

  // --- THÊM 3 HÀM MỚI CHO MULTIPART UPLOAD ---
  InitMultipartUpload(data: { originalName: string; mimeType: string; size: number; ownerId: string; host: string }): any;
  GetMultipartPreSignedUrls(data: { fileKey: string; uploadId: string; partsCount: number; host: string }): any;
  CompleteMultipartUpload(data: { fileId: string; fileKey: string; uploadId: string; parts: { PartNumber: number; ETag: string }[]; host: string }): any;
}

@ApiTags('Quản lý Tệp tin (Media)')
@Controller('admin/media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MediaGatewayController implements OnModuleInit {
  private mediaService: MediaGrpcService;

  constructor(
    @Inject(MICROSERVICES.MEDIA.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.mediaService = this.client.getService(MICROSERVICES.MEDIA.SERVICE);
  }

  // =========================================================================
  // LUỒNG 1: UPLOAD ĐƠN GIẢN (ẢNH, FILE NHẸ)
  // =========================================================================

  @Post('request-upload')
  @ApiOperation({ summary: 'Xin cấp quyền (URL) để upload file trực tiếp lên Storage' })
  @ApiBody({
    schema: {
      example: { originalName: 'quyet_dinh_123.pdf', mimeType: 'application/pdf', size: 1024500 }
    }
  })
  @ApiResponse({ status: 201, description: 'Trả về uploadUrl (Pre-signed) và fileId' })
  async requestUpload(
    @Req() req: any,
    @Headers('host') host: string,
    @Body() body: { originalName: string; mimeType: string; size: number },
  ) {
    const ownerId = req.user?.id || req.user?.sub || 'system-user';
    const forwardedHost = req.headers['x-forwarded-host'];
    const currentHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    
    // Nếu host có cổng (localhost:8080), nó sẽ được giữ nguyên
    const payload = { 
      ...body, 
      ownerId: String(ownerId),
      host: `${protocol}://${currentHost}`
    };
    
    return await firstValueFrom(this.mediaService.RequestUpload(payload));
  }

  @Post('confirm-upload')
  @ApiOperation({ summary: 'Xác nhận file đã upload xong lên Storage' })
  @ApiBody({ schema: { example: { fileId: 'uuid-cua-file' } } })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành COMPLETED và trả về link tải' })
  async confirmUpload(
    @Req() req: any,
    @Headers('host') host: string,
    @Body() body: { fileId: string }
  ) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const forwardedHost = req.headers['x-forwarded-host'];
    const currentHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || host;

    return await firstValueFrom(this.mediaService.ConfirmUpload({ 
      fileId: body.fileId, 
      host: `${protocol}://${currentHost}` 
    }));
  }

  /**
   * LUỒNG 2: MULTIPART UPLOAD (VIDEO, FILE NẶNG)
   */
  @Post('init-multipart-upload')
  @ApiOperation({ summary: 'Khởi tạo tiến trình Upload Multipart cho file dung lượng lớn' })
  @ApiBody({
    schema: {
      example: { originalName: 'video_bao_cao.mp4', mimeType: 'video/mp4', size: 500000000 }
    }
  })
  async initMultipartUpload(
    @Req() req: any,
    @Headers('host') host: string,
    @Body() body: { originalName: string; mimeType: string; size: number },
  ) {
    const ownerId = req.user?.id || req.user?.sub || 'system-user';
    const forwardedHost = req.headers['x-forwarded-host'];
    const currentHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    
    const payload = { 
      ...body, 
      ownerId: String(ownerId),
      host: `${protocol}://${currentHost}`
    };
    return await firstValueFrom(this.mediaService.InitMultipartUpload(payload));
  }

  @Post('get-multipart-pre-signed-urls')
  @ApiOperation({ summary: 'Lấy danh sách các URL để upload từng phần (chunks)' })
  @ApiBody({
    schema: {
      example: { fileKey: '123/video.mp4', uploadId: 'abc-xyz', partsCount: 10 }
    }
  })
  async getMultipartUrls(
    @Headers('host') host: string,
    @Req() req: any,
    @Body() body: { fileKey: string; uploadId: string; partsCount: number },
  ) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const forwardedHost = req.headers['x-forwarded-host'];
    const currentHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || host;

    return await firstValueFrom(this.mediaService.GetMultipartPreSignedUrls({
      ...body,
      host: `${protocol}://${currentHost}`
    }));
  }

  @Post('complete-multipart-upload')
  @ApiOperation({ summary: 'Xác nhận đã upload xong tất cả các phần (chunks) và yêu cầu ráp file' })
  @ApiBody({
    schema: {
      example: {
        fileId: 'uuid', fileKey: '123/video.mp4', uploadId: 'abc-xyz',
        parts: [{ PartNumber: 1, ETag: '"hash1"' }, { PartNumber: 2, ETag: '"hash2"' }]
      }
    }
  })
  async completeMultipartUpload(
    @Headers('host') host: string,
    @Req() req: any,
    @Body() body: { fileId: string; fileKey: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] },
  ) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const forwardedHost = req.headers['x-forwarded-host'];
    const currentHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || host;

    const payload = { ...body, host: `${protocol}://${currentHost}` };
    return await firstValueFrom(this.mediaService.CompleteMultipartUpload(payload));
  }

  // =========================================================================
  // CÁC HÀM CHUNG
  // =========================================================================

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin và link tải/xem của một tệp tin' })
  @ApiResponse({ status: 200, description: 'Thông tin Media kèm downloadUrl' })
  async getMedia(
    @Param('id') id: string,
    @Headers('host') host: string,
    @Req() req: any,
  ) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const forwardedHost = req.headers['x-forwarded-host'];
    const currentHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || host;

    return await firstValueFrom(this.mediaService.GetMedia({ fileId: id, host: `${protocol}://${currentHost}` }));
  }
}