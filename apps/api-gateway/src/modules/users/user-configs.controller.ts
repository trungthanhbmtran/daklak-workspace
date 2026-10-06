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
  BadRequestException,
  NotFoundException,
  ConflictException,
, UnauthorizedException, ForbiddenException} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('User Configs')
@Controller('admin/user-configs')
@UseGuards(JwtAuthGuard)
export class UserConfigsController implements OnModuleInit {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

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
    ).catch((e) => this.handleRpcError(e))) as any;
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
    ).catch((e) => this.handleRpcError(e));
  }
}
