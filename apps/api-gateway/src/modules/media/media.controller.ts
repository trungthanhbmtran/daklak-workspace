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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

// Interface hứng dữ liệu từ gRPC (Khớp với file proto)
interface MediaGrpcService {
  RequestUpload(data: { originalName: string; mimeType: string; size: number; ownerId: string }): any;
  ConfirmUpload(data: { fileId: string }): any;
  GetMedia(data: { fileId: string }): any;

  // --- THÊM 3 HÀM MỚI CHO MULTIPART UPLOAD ---
  InitMultipartUpload(data: { originalName: string; mimeType: string; size: number; ownerId: string }): any;
  GetMultipartPreSignedUrls(data: { fileKey: string; uploadId: string; partsCount: number }): any;
  CompleteMultipartUpload(data: { fileId: string; fileKey: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] }): any;
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
    @Body() body: { originalName: string; mimeType: string; size: number },
  ) {
    const ownerId = req.user?.id || req.user?.sub || 'system-user';
    const payload = { ...body, ownerId: String(ownerId) };
    return await firstValueFrom(this.mediaService.RequestUpload(payload));
  }

  @Post('confirm-upload')
  @ApiOperation({ summary: 'Xác nhận file đã upload xong lên Storage' })
  @ApiBody({ schema: { example: { fileId: 'uuid-cua-file' } } })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành COMPLETED và trả về link tải' })
  async confirmUpload(@Body() body: { fileId: string }) {
    return await firstValueFrom(this.mediaService.ConfirmUpload({ fileId: body.fileId }));
  }

  // =========================================================================
  // LUỒNG 2: MULTIPART UPLOAD (VIDEO, FILE NẶNG)
  // =========================================================================

  @Post('multipart/init')
  @ApiOperation({ summary: 'Khởi tạo tiến trình Upload Multipart cho file dung lượng lớn' })
  @ApiBody({
    schema: {
      example: { originalName: 'video_bao_cao.mp4', mimeType: 'video/mp4', size: 500000000 }
    }
  })
  async initMultipartUpload(
    @Req() req: any,
    @Body() body: { originalName: string; mimeType: string; size: number },
  ) {
    const ownerId = req.user?.id || req.user?.sub || 'system-user';
    const payload = { ...body, ownerId: String(ownerId) };
    return await firstValueFrom(this.mediaService.InitMultipartUpload(payload));
  }

  @Post('multipart/presigned-urls')
  @ApiOperation({ summary: 'Lấy danh sách các URL để upload từng phần (chunks)' })
  @ApiBody({
    schema: {
      example: { fileKey: '123/video.mp4', uploadId: 'abc-xyz', partsCount: 10 }
    }
  })
  async getMultipartUrls(
    @Body() body: { fileKey: string; uploadId: string; partsCount: number },
  ) {
    return await firstValueFrom(this.mediaService.GetMultipartPreSignedUrls(body));
  }

  @Post('multipart/complete')
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
    @Body() body: { fileId: string; fileKey: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] },
  ) {
    return await firstValueFrom(this.mediaService.CompleteMultipartUpload(body));
  }

  // =========================================================================
  // CÁC HÀM CHUNG
  // =========================================================================

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin và link tải/xem của một tệp tin' })
  @ApiResponse({ status: 200, description: 'Thông tin Media kèm downloadUrl' })
  async getMedia(@Param('id') id: string) {
    return await firstValueFrom(this.mediaService.GetMedia({ fileId: id }));
  }
}