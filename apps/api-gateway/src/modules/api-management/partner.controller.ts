import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';

@Controller('admin/api-management/partners')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PartnerController implements OnModuleInit {
  private grpcService: any;

  constructor(
    private readonly issuer: TokenIssuerService,
    @Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)
    private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.grpcService = this.client.getService('ApiManagementService');
  }

  private getGrpcMetadata(req: any): Metadata {
    const metadata = new Metadata();
    if (req.user?.id) {
      metadata.add('user-id', req.user.id.toString());
      metadata.set(
        'authorization',
        'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
      );
    }
    return metadata;
  }

  @Post()
  @RequirePermissions('INTEGRATION:MANAGE')
  async createPartner(@Req() req: any, @Body() data: any) {
    const res = await firstValueFrom(
      this.grpcService.CreatePartner(
        {
          ...data,
          organizationId: req.user?.organizationId || 'DEFAULT',
        },
        this.getGrpcMetadata(req),
      ),
    );
    return { data: res };
  }

  @Get()
  @RequirePermissions('INTEGRATION:VIEW')
  async listPartners(@Req() req: any) {
    const res = (await firstValueFrom(
      this.grpcService.ListPartners(
        { organizationId: req.user?.organizationId || 'DEFAULT' },
        this.getGrpcMetadata(req),
      ),
    )) as any;
    return { data: res.data || [] };
  }

  @Post(':id/keys')
  @RequirePermissions('INTEGRATION:MANAGE')
  async issueKey(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    const res = await firstValueFrom(
      this.grpcService.IssuePartnerKey(
        {
          partnerId: id,
          name: data.name,
          scopes: data.scopes,
          expiresAt: data.expiresAt,
        },
        this.getGrpcMetadata(req),
      ),
    );
    return { data: res };
  }

  @Put('keys/:keyId/revoke')
  @RequirePermissions('INTEGRATION:MANAGE')
  async revokeKey(@Req() req: any, @Param('keyId') keyId: string) {
    await firstValueFrom(
      this.grpcService.RevokePartnerKey({ keyId }, this.getGrpcMetadata(req)),
    );
    return {};
  }
}
