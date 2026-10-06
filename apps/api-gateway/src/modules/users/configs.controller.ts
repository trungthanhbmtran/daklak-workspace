import {
  Controller,
  Get,
  Body,
  Inject,
  OnModuleInit,
  Put,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException, ForbiddenException} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('System Configs')
@Controller('admin/system-configs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ConfigsController implements OnModuleInit {
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
    ).catch((e) => this.handleRpcError(e))) as any;
    return response.configs || [];
  }

  @Put()
  async updateConfig(
    @Body() body: { key: string; value: string; description?: string },
  ) {
    return firstValueFrom(this.configService.UpdateConfig(body)).catch((e) =>
      this.handleRpcError(e),
    );
  }
}
