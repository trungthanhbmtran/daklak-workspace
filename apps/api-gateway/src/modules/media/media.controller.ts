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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as microservices from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
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

@ApiTags('Media Management')
@Controller('admin/media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MediaGatewayController implements OnModuleInit {
  private mediaService: MediaGrpcService;

  constructor(
    @Inject(MICROSERVICES.MEDIA.SYMBOL) private readonly client: microservices.ClientGrpc,
  ) { }

  onModuleInit() {
    this.mediaService = this.client.getService<MediaGrpcService>(MICROSERVICES.MEDIA.SERVICE);
  }

  @Post('request-upload')
  @ApiOperation({ summary: 'Request a presigned URL for direct upload to storage' })
  @ApiResponse({ status: 201, description: 'Returns uploadUrl and fileId' })
  async requestUpload(@Req() req: any, @Body() body: RequestUploadDto) {
    const ownerId = req.user?.id || req.user?.sub || 'anonymous';
    console.log(`[Gateway] 📥 Received upload request for: ${body.originalName} from user ${ownerId}`);
    const payload = { ...body, ownerId: String(ownerId) };
    const result = await firstValueFrom(this.mediaService.RequestUpload(payload));
    console.log(`[Gateway] 🔗 Proxying result:`, result);
    return result;
  }

  @Post('confirm-upload')
  @ApiOperation({ summary: 'Confirm file upload completion' })
  @ApiResponse({ status: 200, description: 'Returns media info and download URL' })
  async confirmUpload(@Body() body: ConfirmUploadDto) {
    return await firstValueFrom(this.mediaService.ConfirmUpload(body));
  }

  @Post('init-multipart-upload')
  @ApiOperation({ summary: 'Initialize multipart upload for large files' })
  async initMultipartUpload(@Req() req: any, @Body() body: InitMultipartUploadDto) {
    const ownerId = req.user?.id || req.user?.sub || 'anonymous';
    const payload = { ...body, ownerId: String(ownerId) };
    return await firstValueFrom(this.mediaService.InitMultipartUpload(payload));
  }

  @Post('get-multipart-urls')
  @ApiOperation({ summary: 'Get presigned URLs for upload parts' })
  async getMultipartUrls(@Body() body: GetMultipartUrlsDto) {
    return await firstValueFrom(this.mediaService.GetMultipartPreSignedUrls(body));
  }

  @Post('complete-multipart-upload')
  @ApiOperation({ summary: 'Complete multipart upload after all parts are uploaded' })
  async completeMultipartUpload(@Body() body: CompleteMultipartUploadDto) {
    return await firstValueFrom(this.mediaService.CompleteMultipartUpload(body));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media metadata and download link' })
  @ApiResponse({ status: 200, description: 'Media info with downloadUrl' })
  async getMedia(@Param('id') id: string) {
    return await firstValueFrom(this.mediaService.GetMedia({ fileId: id }));
  }
}