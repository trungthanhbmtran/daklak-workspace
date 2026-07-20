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
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@Controller('admin/portal-configs')
@UseGuards(JwtAuthGuard, RbacGuard)
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
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: { code: string; name: string; description?: string },
  ) {
    const res: any = await firstValueFrom(this.configService.create(dto)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
    return { success: true, data: res.data };
  }

  @Get()
  async findAll() {
    const res: any = await firstValueFrom(this.configService.getAll({})).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
    return { success: true, data: res.data || [] };
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { code?: string; name?: string; description?: string },
  ) {
    const res: any = await firstValueFrom(
      this.configService.update({ id, ...dto }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return { success: true, data: res.data };
  }

  @Post('upsert')
  @Roles(Role.ADMIN)
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
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return { success: true, data: res.data };
  }

  /**
   * Batch upsert — lưu nhiều config trong 1 request.
   * Client gọi 1 lần thay vì N lần riêng lẻ.
   */
  @Post('batch-upsert')
  @Roles(Role.ADMIN)
  async batchUpsert(
    @Body()
    dto: {
      items: { code: string; name: string; description?: string }[];
    },
  ) {
    const res: any = await firstValueFrom(
      this.configService.batchUpsert({ items: dto.items }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return { success: true, data: res.data };
  }
}
