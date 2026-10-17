import {
  Controller,
  Get,
  Body,
  Inject,
  OnModuleInit,
  Put,
  UseGuards,
  Req,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

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
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  onModuleInit() {
    this.configService = this.client.getService('SystemConfigService');
  }

  @Get()
  async getConfigs(@Req() req: any) {
    const response = (await firstValueFrom(
      this.configService.GetConfigs({}, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e))) as any;
    return response.configs || [];
  }

  @Put()
  async updateConfig(
    @Req() req: any,
    @Body() body: { key: string; value: string; description?: string },
  ) {
    return firstValueFrom(
      this.configService.UpdateConfig(body, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
  }
}
