import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Integration')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('endpoints')
  @ApiOperation({ summary: 'Lấy danh sách các API endpoints của Gateway' })
  getEndpoints() {
    return this.integrationService.getGatewayEndpoints();
  }

  @Get('nginx')
  @ApiOperation({ summary: 'Đọc file cấu hình NGINX' })
  async getNginxConfig() {
    const content = await this.integrationService.getNginxConfig();
    return { content };
  }

  @Put('nginx')
  @ApiOperation({ summary: 'Cập nhật cấu hình NGINX' })
  async updateNginxConfig(@Body('content') content: string) {
    if (!content) {
      return { success: false, message: 'Nội dung cấu hình không được để trống' };
    }
    const success = await this.integrationService.updateNginxConfig(content);
    return { success, message: 'Đã cập nhật cấu hình NGINX thành công' };
  }
}
