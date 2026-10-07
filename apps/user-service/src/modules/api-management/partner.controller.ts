import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { GrpcMethod } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller('admin/api-management/partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  async createPartner(@Body() data: any, @Req() req: any) {
    const orgId = req.user?.organizationId || 'DEFAULT';
    return this.partnerService.createPartner({
      ...data,
      organizationId: orgId,
    });
  }

  @Get()
  async listPartners(@Req() req: any) {
    const orgId = req.user?.organizationId || 'DEFAULT';
    return this.partnerService.listPartners(orgId);
  }

  @Post(':id/keys')
  async issueKey(@Param('id') id: string, @Body() data: any) {
    return this.partnerService.issueKey(
      id,
      data.name,
      data.scopes,
      data.expiresAt ? new Date(data.expiresAt) : undefined,
    );
  }

  @Put('keys/:keyId/revoke')
  async revokeKey(@Param('keyId') keyId: string) {
    return this.partnerService.revokeKey(keyId);
  }

  // gRPC for API Gateway to validate Bearer tokens
  @GrpcMethod('ApiManagementService', 'ValidatePartnerKey')
  async validatePartnerKey(data: { hashedKey: string }) {
    const result = await this.partnerService.validateKey(data.hashedKey);
    if (!result) {
      throw new RpcException({
        code: GrpcStatus.UNAUTHENTICATED,
        message: 'Invalid or revoked partner key',
      });
    }
    return {
      ...result,
      scopes: JSON.stringify(result.scopes),
    };
  }
}
