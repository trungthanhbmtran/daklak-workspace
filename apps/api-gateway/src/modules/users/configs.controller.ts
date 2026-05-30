import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  OnModuleInit,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('System Configs')
@Controller('admin/system-configs')
export class ConfigsController implements OnModuleInit {
  private configService: any;

  constructor(
    @Inject(MICROSERVICES.SYS_CONFIG.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.configService = this.client.getService('SystemConfigService');
  }

  @Get()
  async getConfigs() {
    const response = (await firstValueFrom(
      this.configService.GetConfigs({}),
    )) as any;
    return { status: 'success', data: response.configs || [] };
  }

  @Put()
  async updateConfig(
    @Body() body: { key: string; value: string; description?: string },
  ) {
    const data = await firstValueFrom(this.configService.UpdateConfig(body));
    return { status: 'success', data, message: 'Cập nhật cấu hình thành công' };
  }
}
