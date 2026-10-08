import { Controller } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @GrpcMethod('ApiManagementService', 'CreatePartner')
  async createPartner(data: any) {
    // If organizationId is missing from gateway payload, fallback to DEFAULT
    return this.partnerService.createPartner({
      ...data,
      organizationId: data.organizationId || 'DEFAULT',
    });
  }

  @GrpcMethod('ApiManagementService', 'ListPartners')
  async listPartners(data: { organizationId: string }) {
    const orgId = data.organizationId || 'DEFAULT';
    const result = await this.partnerService.listPartners(orgId);
    return { data: result };
  }

  @GrpcMethod('ApiManagementService', 'IssuePartnerKey')
  async issueKey(data: any) {
    return this.partnerService.issueKey(
      data.partnerId,
      data.name,
      data.scopes,
      data.expiresAt ? new Date(data.expiresAt) : undefined,
    );
  }

  @GrpcMethod('ApiManagementService', 'RevokePartnerKey')
  async revokeKey(data: { keyId: string }) {
    await this.partnerService.revokeKey(data.keyId);
    return { success: true };
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
