import {
  Controller,
  Get,
  Body,
  Inject,
  OnModuleInit,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('System Configs')
@Controller('admin/system-configs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ConfigsController implements OnModuleInit {
  private configService: any;

  constructor(
    @Inject(MICROSERVICES.SYS_CONFIG.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.configService = this.client.getService('SystemConfigService');
  }

  @Get()
  async getConfigs() {
    const response = (await firstValueFrom(
      this.configService.GetConfigs({}),
    )) as any;
    return response.configs || [];
  }

  @Put()
  async updateConfig(
    @Body() body: { key: string; value: string; description?: string },
  ) {
    return firstValueFrom(this.configService.UpdateConfig(body));
  }
}


