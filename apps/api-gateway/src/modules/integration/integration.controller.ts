import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Post,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Integration')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('admin/integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('endpoints')
  @ApiOperation({ summary: 'Lấy danh sách các API endpoints của Gateway' })
  getEndpoints() {
    return this.integrationService.getGatewayEndpoints();
  }

  @Get('gateway')
  @ApiOperation({ summary: 'Lấy danh sách cấu hình Gateway/Load Balancer' })
  async getGatewayConfigs() {
    return this.integrationService.getGatewayConfigs();
  }

  @Post('gateway')
  @ApiOperation({ summary: 'Tạo cấu hình Gateway mới' })
  async createGatewayConfig(@Body() body: any) {
    return this.integrationService.createGatewayConfig(body);
  }

  @Put('gateway/:id')
  @ApiOperation({ summary: 'Cập nhật cấu hình Gateway' })
  async updateGatewayConfig(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateGatewayConfig(id, body);
  }

  @Post('gateway/:id/apply')
  @ApiOperation({
    summary: 'Áp dụng cấu hình Gateway (Sinh config file & SSL)',
  })
  async applyGatewayConfig(@Param('id') id: string) {
    const success = await this.integrationService.applyGatewayConfig(id);
    return { success, message: 'Đã kích hoạt cấu hình Gateway thành công' };
  }

  @Delete('gateway/:id')
  @ApiOperation({ summary: 'Xoá cấu hình Gateway' })
  async deleteGatewayConfig(@Param('id') id: string) {
    return this.integrationService.deleteGatewayConfig(id);
  }
  @Get('api-permissions')
  @ApiOperation({ summary: 'Lấy cấu hình phân quyền API động' })
  async getApiPermissions() {
    const rules = await this.integrationService.getApiPermissions();
    return { rules };
  }

  @Put('api-permissions')
  @ApiOperation({ summary: 'Cập nhật cấu hình phân quyền API động' })
  async updateApiPermissions(@Body('rules') rules: any[]) {
    if (!rules || !Array.isArray(rules)) {
      return { success: false, message: 'Nội dung cấu hình không hợp lệ' };
    }
    const success = await this.integrationService.updateApiPermissions(rules);
    return {
      success,
      message: 'Đã cập nhật cấu hình phân quyền API thành công',
    };
  }

  @Get('lgsp-configs')
  @ApiOperation({ summary: 'Lấy cấu hình tích hợp LGSP' })
  async getLgspConfigs() {
    return this.integrationService.getLgspConfigs();
  }

  @Post('lgsp-configs')
  @ApiOperation({ summary: 'Thêm cấu hình LGSP mới' })
  async addLgspConfig(@Body() body: any) {
    return this.integrationService.addLgspConfig(body);
  }

  @Post('lgsp-configs/:id/execute')
  @ApiOperation({
    summary: 'Thực thi gọi dịch vụ LGSP và trả về kết quả map với biểu đồ/bảng',
  })
  async executeLgspService(@Param('id') id: string, @Body() params: any) {
    return this.integrationService.executeLgspService(id, params);
  }
}
