import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserConfigsService } from './user-configs.service';

@Controller()
export class UserConfigsController {
  constructor(private readonly userConfigsService: UserConfigsService) {}

  @GrpcMethod('UserConfigService', 'GetConfigs')
  async getConfigs(data: { userId: number }) {
    if (!data.userId) {
      return { configs: [] };
    }
    const configs = await this.userConfigsService.getUserConfigs(data.userId);
    return { configs };
  }

  @GrpcMethod('UserConfigService', 'SetConfig')
  async setConfig(data: { userId: number; key: string; value: string }) {
    if (!data.userId || !data.key) {
      return { success: false };
    }
    const result = await this.userConfigsService.setUserConfig(
      data.userId,
      data.key,
      data.value,
    );
    return result;
  }
}
