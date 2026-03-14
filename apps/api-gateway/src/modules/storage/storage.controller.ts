import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  Inject,
  UseGuards,
  Req,
  Res,
  OnModuleInit,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import * as express from 'express';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Storage - Admin')
@Controller('admin/storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StorageAdminController implements OnModuleInit {
  private storageService: any;

  constructor(@Inject(MICROSERVICES.STORAGE.SYMBOL) private readonly client: any) {}

  onModuleInit() {
    this.storageService = this.client.getService(MICROSERVICES.STORAGE.SERVICE);
  }

  @Post('upload-check')
  uploadCheck(@Body() body: { fileName?: string; fileSize?: number }) {
    const { fileName, fileSize } = body;
    if (!fileName || !fileSize) {
      return { success: false, message: 'Missing file metadata' };
    }
    if (fileSize > 500 * 1024 * 1024) {
      return { success: false, message: 'File too large' };
    }
    return { canUpload: true, message: 'Metadata ok' };
  }

  @Post('upload-chunk')
  async uploadChunk(
    @Req() req: express.Request,
    @Headers('x-file-name') fileName?: string,
    @Headers('x-file-type') fileType?: string,
    @Headers('x-folder') folder?: string,
  ) {
    const decodedFileName = fileName ? decodeURIComponent(fileName) : '';
    if (!decodedFileName) {
      return { success: false, message: 'Missing file name' };
    }
    const meta = {
      filename: decodedFileName,
      mimetype: fileType || 'application/octet-stream',
      folder: folder || 'admin',
    };
    return new Promise((resolve, reject) => {
      const stream = (this.storageService as any).UploadFile((err: any, resp: any) => {
        if (err) return reject(err);
        resolve(resp);
      });
      stream.write(meta);
      req.on('data', (chunk: Buffer) => {
        const ok = stream.write({ chunk });
        if (!ok) req.pause();
      });
      stream.on('drain', () => req.resume());
      req.on('end', () => stream.end());
      stream.on('error', reject);
    });
  }

  @Get('list')
  async listFiles(@Query('folder') folder?: string) {
    const result = await firstValueFrom(
      this.storageService.ListFolder({ path: folder || '' }),
    );
    return { status: 1, data: (result as { items?: unknown[] })?.items ?? result };
  }

  @Delete()
  async deleteFile(@Body() body: { filePath: string }) {
    const { filePath } = body;
    if (!filePath) {
      return { success: false, message: 'Missing filePath' };
    }
    await firstValueFrom(this.storageService.DeleteFile({ path: filePath }));
  }

  @Get('info')
  async getFileInfo(@Query('filePath') filePath?: string) {
    if (!filePath) {
      return { success: false, message: 'Missing filePath' };
    }
    const result = await firstValueFrom(
      this.storageService.GetMetadata({ path: filePath }),
    );
    return { status: 1, data: result };
  }
}

@ApiTags('Storage - Public')
@Controller('public/storage')
export class StoragePublicController implements OnModuleInit {
  private storageService: any;

  constructor(@Inject(MICROSERVICES.STORAGE.SYMBOL) private readonly client: any) {}

  onModuleInit() {
    this.storageService = this.client.getService(MICROSERVICES.STORAGE.SERVICE);
  }

  @Get('view')
  async viewFile(@Query('filePath') filePath: string, @Res() res: express.Response) {
    if (!filePath) {
      return res.status(400).json({ message: 'Missing filePath' });
    }
    try {
      const metadata = await firstValueFrom(
        this.storageService.GetMetadata({ path: filePath }),
      );
      const stream = (this.storageService as any).DownloadFile({ path: filePath });
      const meta = metadata as { filename?: string; mimetype?: string };
      const filename = meta?.filename || filePath.split('/').pop() || 'file';
      const mimetype = meta?.mimetype || 'application/octet-stream';
      res.setHeader('Content-Type', mimetype);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      stream.on('data', (chunk: any) => res.write(chunk.chunk));
      stream.on('end', () => res.end());
      stream.on('error', () => {
        if (!res.headersSent) res.status(500).json({ message: 'Failed to stream file' });
        else res.end();
      });
    } catch {
      return res.status(404).json({ message: 'File not found' });
    }
  }

  @Get('info')
  async getPublicFileInfo(@Query('filePath') filePath?: string) {
    if (!filePath) {
      return { success: false, message: 'Missing filePath' };
    }
    const result = await firstValueFrom(
      this.storageService.GetMetadata({ path: filePath }),
    );
    return { status: 1, data: result };
  }

  @Get('token/:token')
  async getMetadataByToken(@Param('token') token: string) {
    const result = await firstValueFrom(
      this.storageService.GetMetadataByToken({ token }),
    );
    return { status: 1, data: result };
  }
}
