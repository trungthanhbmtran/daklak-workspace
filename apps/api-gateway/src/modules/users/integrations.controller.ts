import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('Integrations')
@Controller('admin/integrations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationsController implements OnModuleInit {
  private integrationService: any;

  constructor(
    @Inject(MICROSERVICES.INTEGRATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.integrationService = this.client.getService('IntegrationService');
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các cấu hình thông báo' })
  async list() {
    const response = (await firstValueFrom(
      this.integrationService.FindAll({ search: '' }),
    )) as any;
    return response.data || [];
  }

  @Post()
  @ApiOperation({ summary: 'Tạo cấu hình thông báo mới' })
  async create(@Body() body: any) {
    return firstValueFrom(this.integrationService.Create(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật cấu hình thông báo' })
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
      this.integrationService.Update({ id: parseInt(id), ...body }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa cấu hình thông báo' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.integrationService.Delete({ id: parseInt(id) }));
  }
}
