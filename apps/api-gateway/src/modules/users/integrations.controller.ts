import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { getInternalHttpHeaders } from '../../core/utils/internal-metadata.util';

@ApiTags('Integrations')
@Controller('admin/integrations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);
  private readonly notificationServiceUrl =
    'http://notification-service:50075/api/v1/integrations';

  constructor(private readonly httpService: HttpService) {}

  @Get()
  @RequirePermissions('INTEGRATION:MANAGE', 'NOTIFICATION:MANAGE')
  @ApiOperation({ summary: 'Lấy danh sách các cấu hình thông báo' })
  async list(@Req() req: any) {
    const search = req.query?.search || '';
    const headers = getInternalHttpHeaders();
    const { data } = await firstValueFrom(
      this.httpService.get(this.notificationServiceUrl, {
        params: { search },
        headers,
      }),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return { data: null };
    });
    return data;
  }

  @Post()
  @RequirePermissions('INTEGRATION:MANAGE', 'NOTIFICATION:MANAGE')
  @ApiOperation({ summary: 'Tạo cấu hình thông báo mới' })
  async create(@Body() body: any) {
    const headers = getInternalHttpHeaders();
    const { data } = await firstValueFrom(
      this.httpService.post(this.notificationServiceUrl, body, { headers }),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return { data: null };
    });
    return data;
  }

  @Put(':id')
  @RequirePermissions('INTEGRATION:MANAGE', 'NOTIFICATION:MANAGE')
  @ApiOperation({ summary: 'Cập nhật cấu hình thông báo' })
  async update(@Param('id') id: string, @Body() body: any) {
    const headers = getInternalHttpHeaders();
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.notificationServiceUrl}/${id}`, body, {
        headers,
      }),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return { data: null };
    });
    return data;
  }

  @Put(':id/active')
  @RequirePermissions('INTEGRATION:MANAGE', 'NOTIFICATION:MANAGE')
  @ApiOperation({ summary: 'Cập nhật trạng thái kích hoạt' })
  async toggleActive(@Param('id') id: string, @Body() body: any) {
    const headers = getInternalHttpHeaders();
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.notificationServiceUrl}/${id}/active`, body, {
        headers,
      }),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return { data: null };
    });
    return data;
  }

  @Delete(':id')
  @RequirePermissions('INTEGRATION:MANAGE', 'NOTIFICATION:MANAGE')
  @ApiOperation({ summary: 'Xóa cấu hình thông báo' })
  async delete(@Param('id') id: string) {
    const headers = getInternalHttpHeaders();
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.notificationServiceUrl}/${id}`, { headers }),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return { data: null };
    });
    return data;
  }
}
