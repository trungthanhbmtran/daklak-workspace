import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegistryService } from './registry.service';
import { ImportParserService } from './import.service';
import { ImportCommitDto } from './import.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@Controller('admin/integration-upstreams')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationController {
  private grpcService: any;

  constructor(
    private readonly registryService: RegistryService,
    private readonly importParserService: ImportParserService,
    @Inject(MICROSERVICES.INTEGRATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.grpcService = this.client.getService(
      MICROSERVICES.INTEGRATION.SERVICE,
    );
  }

  @Get('status')
  async getStatus() {
    return {
      success: true,
      ready: this.registryService.checkReady(),
    };
  }

  @Post()
  @RequirePermissions('INTEGRATION:MANAGE')
  async create(@Body() dto: any, @Req() req: any) {
    const payload = {
      ...dto,
      auth: typeof dto.auth === 'object' ? JSON.stringify(dto.auth) : dto.auth,
      retry:
        typeof dto.retry === 'object' ? JSON.stringify(dto.retry) : dto.retry,
      rateLimit:
        typeof dto.rateLimit === 'object'
          ? JSON.stringify(dto.rateLimit)
          : dto.rateLimit,
      metadata:
        typeof dto.metadata === 'object'
          ? JSON.stringify(dto.metadata)
          : dto.metadata,
      callerUserId: req.user.id.toString(),
    };
    const res = await firstValueFrom(this.grpcService.CreateUpstream(payload));
    return { success: true, data: this.parseGrpcResponse(res) };
  }

  private parseGrpcResponse(item: any) {
    if (!item) return item;
    try {
      if (typeof item.auth === 'string' && item.auth !== '')
        item.auth = JSON.parse(item.auth);
    } catch (e) {
      item.auth = {};
    }
    try {
      if (typeof item.retry === 'string' && item.retry !== '')
        item.retry = JSON.parse(item.retry);
    } catch (e) {
      item.retry = {};
    }
    try {
      if (typeof item.rateLimit === 'string' && item.rateLimit !== '')
        item.rateLimit = JSON.parse(item.rateLimit);
    } catch (e) {
      item.rateLimit = {};
    }
    try {
      if (typeof item.metadata === 'string' && item.metadata !== '')
        item.metadata = JSON.parse(item.metadata);
    } catch (e) {
      item.metadata = {};
    }
    // Handle the corrupted [object Object] cases
    if (item.metadata === '[object Object]') item.metadata = {};
    if (item.auth === '[object Object]') item.auth = {};
    return item;
  }

  @Get()
  @RequirePermissions('INTEGRATION:MANAGE', 'INTEGRATION:READ')
  async getAll() {
    const res = (await firstValueFrom(
      this.grpcService.GetAllUpstreams({}),
    )) as any;
    const items = res.data || [];
    const parsedItems = items.map((item: any) => this.parseGrpcResponse(item));
    return { success: true, data: parsedItems };
  }

  @Get(':id')
  @RequirePermissions('INTEGRATION:MANAGE', 'INTEGRATION:READ')
  async getById(@Param('id') id: string) {
    const res = await firstValueFrom(this.grpcService.GetUpstreamById({ id }));
    return { success: true, data: this.parseGrpcResponse(res) };
  }

  @Put(':id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const parsedDto = {
      ...dto,
      auth: typeof dto.auth === 'object' ? JSON.stringify(dto.auth) : dto.auth,
      retry:
        typeof dto.retry === 'object' ? JSON.stringify(dto.retry) : dto.retry,
      rateLimit:
        typeof dto.rateLimit === 'object'
          ? JSON.stringify(dto.rateLimit)
          : dto.rateLimit,
      metadata:
        typeof dto.metadata === 'object'
          ? JSON.stringify(dto.metadata)
          : dto.metadata,
    };
    const payload = {
      id,
      data: parsedDto,
      callerUserId: req.user.id.toString(),
    };
    const res = await firstValueFrom(this.grpcService.UpdateUpstream(payload));
    return { success: true, data: this.parseGrpcResponse(res) };
  }

  @Delete(':id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async delete(@Param('id') id: string, @Req() req: any) {
    const payload = { id, callerUserId: req.user.id.toString() };
    const res = await firstValueFrom(this.grpcService.DeleteUpstream(payload));
    return { success: true, data: res };
  }

  @Post('import/preview')
  @RequirePermissions('INTEGRATION:MANAGE')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async importPreview(
    @UploadedFile() file: Express.Multer.File,
    @Body('text') text: string,
  ) {
    if (!file && !text) {
      throw new BadRequestException(
        'Vui lòng upload file hoặc cung cấp nội dung text',
      );
    }

    const content = file ? file.buffer.toString('utf8') : text;
    const filename = file ? file.originalname : undefined;

    const result = await this.importParserService.parseFileOrText(
      content,
      filename,
    );

    // Check for conflicts
    const res = (await firstValueFrom(
      this.grpcService.GetAllUpstreams({}),
    )) as any;
    const existingUpstreams = res.data || [];

    const endpointsWithStatus = result.endpoints.map((ep) => {
      const isConflict = existingUpstreams.some((existing: any) => {
        if (!existing.allowedPaths || !existing.allowedMethods) return false;
        // Naive conflict detection for now
        const pathMatch = existing.allowedPaths.includes(ep.path);
        const methodMatch = existing.allowedMethods.includes(ep.method);
        return pathMatch && methodMatch;
      });
      return { ...ep, status: isConflict ? 'CONFLICT' : 'NEW' };
    });

    return {
      success: true,
      data: {
        ...result,
        endpoints: endpointsWithStatus,
      },
    };
  }

  @Post('import/commit')
  @RequirePermissions('INTEGRATION:MANAGE')
  async importCommit(@Body() dto: ImportCommitDto, @Req() req: any) {
    // Basic bulk implementation
    let createdCount = 0;
    const overwrittenCount = 0;
    const skippedCount = 0;
    let errorCount = 0;

    const res = (await firstValueFrom(
      this.grpcService.GetAllUpstreams({}),
    )) as any;
    const existingUpstreams = res.data || [];

    try {
      const payload = {
        name: dto.systemName || 'Imported API',
        type: 'REST',
        baseUrl: dto.baseUrl,
        allowedPaths: dto.endpoints.map((e) => e.path),
        allowedMethods: dto.endpoints.map((e) => e.method),
        auth: JSON.stringify({}),
        timeoutMs: 30000,
        retry: JSON.stringify({ attempts: 3 }),
        cacheTtlSec: 0,
        rateLimit: JSON.stringify({ windowMs: 60000, maxRequests: 1000 }),
        roles: [],
        scopes: [],
        enabled: true,
        callerUserId: req.user.id.toString(),
        metadata: JSON.stringify({ _parsedEndpoints: dto.endpoints }),
      };

      await firstValueFrom(this.grpcService.CreateUpstream(payload));
      createdCount++;
    } catch (err) {
      errorCount++;
    }

    return {
      success: true,
      message: `Import thành công. Tạo mới: ${createdCount}, Ghi đè: ${overwrittenCount}, Bỏ qua: ${skippedCount}, Lỗi: ${errorCount}`,
      data: { createdCount, overwrittenCount, skippedCount, errorCount },
    };
  }
}
