import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import {
  RequestUploadDto,
  ConfirmUploadDto,
  InitMultipartUploadDto,
  GetMultipartUrlsDto,
  CompleteMultipartUploadDto,
} from './dto/media.dto';
import { MediaService } from './media.service';

@ApiTags('Media Management')
@Controller('admin/media')
@ApiBearerAuth('JWT-auth')
export class MediaGatewayController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('download/:id')
  @ApiOperation({ summary: 'Download media file by ID (Redirect)' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the signed download URL',
  })
  async downloadMedia(@Param('id') id: string, @Res() res: Response) {
    return this.mediaService.downloadMedia(id, res);
  }

  @Post('request-upload')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({
    summary: 'Request a presigned URL for direct upload to storage',
  })
  @ApiResponse({ status: 201, description: 'Returns uploadUrl and fileId' })
  async requestUpload(@Req() req: any, @Body() body: RequestUploadDto) {
    return this.mediaService.requestUpload(req, body);
  }

  @Post('confirm-upload')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Confirm file upload completion' })
  @ApiResponse({
    status: 200,
    description: 'Returns media info and download URL',
  })
  async confirmUpload(@Body() body: ConfirmUploadDto) {
    return this.mediaService.confirmUpload(body);
  }

  @Post('init-multipart-upload')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Initialize multipart upload for large files' })
  async initMultipartUpload(
    @Req() req: any,
    @Body() body: InitMultipartUploadDto,
  ) {
    return this.mediaService.initMultipartUpload(req, body);
  }

  @Post('get-multipart-urls')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Get presigned URLs for upload parts' })
  async getMultipartUrls(@Body() body: GetMultipartUrlsDto) {
    return this.mediaService.getMultipartUrls(body);
  }

  @Post('complete-multipart-upload')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({
    summary: 'Complete multipart upload after all parts are uploaded',
  })
  async completeMultipartUpload(@Body() body: CompleteMultipartUploadDto) {
    return this.mediaService.completeMultipartUpload(body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Get media metadata and download link' })
  @ApiResponse({ status: 200, description: 'Media info with downloadUrl' })
  async getMedia(@Param('id') id: string) {
    return this.mediaService.getMedia(id);
  }
}
