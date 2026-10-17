import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Inject,
  Req,
  UseGuards,
  ParseIntPipe,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { RequirePolicy } from '../../common/decorators/require-policy.decorator';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@Controller('admin/portal-configs')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PortalConfigController {
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
    @Inject(MICROSERVICES.PORTAL_CONFIG.SYMBOL) private client: ClientGrpc,
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
    this.configService = this.client.getService<any>(
      MICROSERVICES.PORTAL_CONFIG.SERVICE,
    );
  }

  @Post()
  @RequirePolicy('manage', 'portal_config')
  async create(
    @Req() req: any,
    @Body() dto: { code: string; name: string; description?: string },
  ) {
    const res: any = await firstValueFrom(
      this.configService.create(dto, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { data: res.data };
  }

  @Get()
  async findAll(@Req() req: any) {
    const res: any = await firstValueFrom(
      this.configService.getAll({}, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { data: res.data };
  }

  @Put(':id')
  @RequirePolicy('manage', 'portal_config')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { code?: string; name?: string; description?: string },
  ) {
    const res: any = await firstValueFrom(
      this.configService.update({ id, ...dto }, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    return { data: res.data };
  }

  @Post('upsert')
  @RequirePolicy('manage', 'portal_config')
  async upsert(
    @Req() req: any,
    @Body() dto: { code: string; name: string; description?: string },
  ) {
    const res: any = await firstValueFrom(
      this.configService.upsertByCode(
        {
          code: dto.code,
          name: dto.name,
          description: dto.description,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return { data: res.data };
  }

  /**
   * Batch upsert — lưu nhiều config trong 1 request.
   * Client gọi 1 lần thay vì N lần riêng lẻ.
   */
  @Post('batch-upsert')
  @RequirePolicy('manage', 'portal_config')
  async batchUpsert(
    @Req() req: any,
    @Body()
    dto: {
      data: { code: string; name: string; description?: string }[];
    },
  ) {
    const res: any = await firstValueFrom(
      this.configService.batchUpsert(
        { data: dto.data },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return { data: res.data };
  }
}
