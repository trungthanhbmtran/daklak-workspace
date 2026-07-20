import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  UseGuards,
  OnModuleInit,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('PBAC – Tài nguyên')
@Controller('admin/resources')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ResourcesController implements OnModuleInit {
  private pbacService: any;

  constructor(
    @Inject(MICROSERVICES.PBAC.SYMBOL)
    private readonly client: any,
  ) {}

  onModuleInit() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
  }

  /**
   * GET /admin/resources
   * Trả danh sách PBAC Resource phẳng — dùng cho dropdown menu form
   * Chuẩn PBAC: menu gắn với resource thay vì danh sách permission IDs
   */
  @Get()
  @ApiOperation({ summary: 'Danh sách PBAC Resource (dùng cho menu form)' })
  @ApiResponse({ status: 200, description: 'Mảng resources phẳng' })
  async listResources() {
    const res = (await firstValueFrom(this.pbacService.GetResources({})).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    )) as any;
    const rawResources = res?.resources ?? res?.data?.resources ?? [];
    return (rawResources as any[]).map((r: any) => ({
      id: r.id,
      code: r.code ?? '',
      name: r.name ?? r.code ?? '',
      serviceCode: r.serviceCode ?? null,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài nguyên mới' })
  @ApiResponse({ status: 201, description: 'Tài nguyên vừa được tạo' })
  async createResource(
    @Body() body: { code: string; name: string; serviceCode?: string },
  ) {
    return firstValueFrom(
      this.pbacService.CreateResource({
        code: body.code,
        name: body.name,
        serviceCode: body.serviceCode,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật tài nguyên' })
  @ApiResponse({ status: 200, description: 'Tài nguyên sau khi cập nhật' })
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string; serviceCode?: string },
  ) {
    return firstValueFrom(
      this.pbacService.UpdateResource({
        id,
        code: body.code,
        name: body.name,
        serviceCode: body.serviceCode,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
