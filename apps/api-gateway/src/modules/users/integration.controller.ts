import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  OnModuleInit,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Admin - Integration Center')
@Controller('admin/integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminIntegrationController implements OnModuleInit {
  private integrationService: any;

  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.integrationService = this.client.getService('IntegrationService');
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mã liên thông' })
  async findAll(@Query('search') search: string) {
    return firstValueFrom(
      this.integrationService.FindAll({ search: search || '' }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Tạo cấu hình liên thông mới' })
  async create(@Body() body: any) {
    return firstValueFrom(this.integrationService.Create(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật cấu hình liên thông' })
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
      this.integrationService.Update({ id: parseInt(id, 10), ...body }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mã liên thông' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(
      this.integrationService.Delete({ id: parseInt(id, 10) }),
    );
  }

  @Put(':id/active')
  @ApiOperation({ summary: 'Bật/tắt mã liên thông' })
  async toggleActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return firstValueFrom(
      this.integrationService.ToggleActive({ id: parseInt(id, 10), isActive }),
    );
  }
}
