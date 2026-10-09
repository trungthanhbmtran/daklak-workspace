import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { MICROSERVICES } from '../../core/constants/services';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

@ApiTags('HRM - Rank Quotas')
@Controller('admin/hrm/rank-quotas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class RankQuotasController {
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

  private rankQuotaService: any;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    private readonly issuer: TokenIssuerService,
  ) {}

  onModuleInit() {
    this.rankQuotaService = this.client.getService('TaskService');
  }

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

  @Post()
  async saveRankQuotas(@Req() req: any, @Body() body: any) {
    const data = await firstValueFrom(
      this.rankQuotaService.SaveRankQuotas(body, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    return data;
  }

  @Get(':rankCode')
  async getRankQuotasByRank(
    @Req() req: any,
    @Param('rankCode') rankCode: string,
    @Query('domainCode') domainCode: string,
  ) {
    const data = await firstValueFrom(
      this.rankQuotaService.GetRankQuotasByRank(
        { rankCode, domainCode },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return data;
  }
}
