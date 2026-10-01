import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { IntegrationConfigService } from './integration-config.service';
import { CreateUpstreamDto, UpdateUpstreamDto } from './dto/upstream.dto';
import { IntegrationAuthService } from './integration-auth.service';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class IntegrationConfigController {
  constructor(
    private readonly service: IntegrationConfigService,
    private readonly authService: IntegrationAuthService
  ) {}

  @GrpcMethod('IntegrationConfigService', 'GetPublicKey')
  async getPublicKey() {
    return this.authService.getPublicKeyDetails();
  }

  @GrpcMethod('IntegrationConfigService', 'GetSnapshot')
  async getSnapshot() {
    const upstreams = await this.service.getAllUpstreams();
    const highestVersion = upstreams.reduce((max, u) => Math.max(max, u.version), 0);
    const etag = `W/"${highestVersion}-${upstreams.length}"`;
    return {
      version: highestVersion,
      etag,
      upstreams: JSON.stringify(upstreams)
    };
  }

  @GrpcMethod('IntegrationConfigService', 'CreateUpstream')
  async createUpstream(data: any) {
    try {
      const dto = data as CreateUpstreamDto;
      const callerUserId = data.callerUserId || 'system-admin';
      return await this.service.createUpstream(dto, callerUserId);
    } catch (e: any) {
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: e.message });
    }
  }

  @GrpcMethod('IntegrationConfigService', 'GetAllUpstreams')
  async getAllUpstreams() {
    const data = await this.service.getAllUpstreams();
    return { data };
  }

  @GrpcMethod('IntegrationConfigService', 'GetUpstreamById')
  async getUpstreamById(data: any) {
    try {
      return await this.service.getUpstreamById(data.id);
    } catch (e: any) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: e.message });
    }
  }

  @GrpcMethod('IntegrationConfigService', 'UpdateUpstream')
  async updateUpstream(data: any) {
    try {
      const dto = data.data as UpdateUpstreamDto;
      const callerUserId = data.callerUserId || 'system-admin';
      return await this.service.updateUpstream(data.id, dto, callerUserId);
    } catch (e: any) {
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: e.message });
    }
  }

  @GrpcMethod('IntegrationConfigService', 'DeleteUpstream')
  async deleteUpstream(data: any) {
    try {
      const callerUserId = data.callerUserId || 'system-admin';
      const success = await this.service.deleteUpstream(data.id, callerUserId);
      return { success };
    } catch (e: any) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }
}
