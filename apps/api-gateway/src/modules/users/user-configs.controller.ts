import {
  Controller,
  Get,
  Body,
  Inject,
  OnModuleInit,
  Put,
  UseGuards,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('User Configs')
@Controller('admin/user-configs')
@UseGuards(JwtAuthGuard)
export class UserConfigsController implements OnModuleInit {
  private userConfigService: any;

  constructor(
    @Inject(MICROSERVICES.USER_CONFIG.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.userConfigService = this.client.getService('UserConfigService');
  }

  @Get()
  async getConfigs(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    const response = (await firstValueFrom(
      this.userConfigService.GetConfigs({ userId }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return response.configs || [];
  }

  @Put()
  async setConfig(
    @Req() req: any,
    @Body() body: { key: string; value: string },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new InternalServerErrorException('User ID missing');
    return firstValueFrom(
      this.userConfigService.SetConfig({
        userId,
        key: body.key,
        value: body.value,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }
}
