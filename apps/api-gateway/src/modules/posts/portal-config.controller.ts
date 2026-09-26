import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Inject,
  UseGuards,
  ParseIntPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { RequirePolicy } from '../../common/decorators/require-policy.decorator';

@Controller('admin/portal-configs')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PortalConfigController {
  private configService: any;

  constructor(
    @Inject(MICROSERVICES.PORTAL_CONFIG.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.configService = this.client.getService<any>(
      MICROSERVICES.PORTAL_CONFIG.SERVICE,
    );
  }

  @Post()
  @RequirePolicy('manage', 'portal_config')
  async create(
    @Body() dto: { code: string; name: string; description?: string },
  ) {
    const res: any = await firstValueFrom(this.configService.create(dto)).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    );
    return { success: true, data: res.data };
  }

  @Get()
  async findAll() {
    const res: any = await firstValueFrom(this.configService.getAll({})).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    );
    return { success: true, data: res.data };
  }

  @Put(':id')
  @RequirePolicy('manage', 'portal_config')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { code?: string; name?: string; description?: string },
  ) {
    const res: any = await firstValueFrom(
      this.configService.update({ id, ...dto }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { success: true, data: res.data };
  }

  @Post('upsert')
  @RequirePolicy('manage', 'portal_config')
  async upsert(
    @Body() dto: { code: string; name: string; description?: string },
  ) {
    const res: any = await firstValueFrom(
      this.configService.upsertByCode({
        code: dto.code,
        name: dto.name,
        description: dto.description,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { success: true, data: res.data };
  }

  /**
   * Batch upsert — lưu nhiều config trong 1 request.
   * Client gọi 1 lần thay vì N lần riêng lẻ.
   */
  @Post('batch-upsert')
  @RequirePolicy('manage', 'portal_config')
  async batchUpsert(
    @Body()
    dto: {
      data: { code: string; name: string; description?: string }[];
    },
  ) {
    const res: any = await firstValueFrom(
      this.configService.batchUpsert({ data: dto.data }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { success: true, data: res.data };
  }
}
