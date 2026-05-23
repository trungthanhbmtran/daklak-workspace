import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ConfigsService } from './configs.service';

@Controller()
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @GrpcMethod('SystemConfigService', 'GetConfigs')
  async getConfigs() {
    const configs = await this.configsService.getConfigs();
    return { configs };
  }

  @GrpcMethod('SystemConfigService', 'UpdateConfig')
  async updateConfig(data: { key: string; value: string; description?: string }) {
    const config = await this.configsService.updateConfig(data.key, data.value, data.description);
    return config;
  }
}
