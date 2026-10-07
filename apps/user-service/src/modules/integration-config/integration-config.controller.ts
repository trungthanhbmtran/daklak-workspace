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
    private readonly authService: IntegrationAuthService,
  ) {}

  @GrpcMethod('IntegrationConfigService', 'GetPublicKey')
  async getPublicKey() {
    return this.authService.getPublicKeyDetails();
  }

  @GrpcMethod('IntegrationConfigService', 'GetSnapshot')
  async getSnapshot() {
    const upstreams = await this.service.getAllUpstreams();
    const highestVersion = upstreams.reduce(
      (max, u) => Math.max(max, u.version),
      0,
    );
    const etag = `W/"${highestVersion}-${upstreams.length}"`;
    return {
      version: highestVersion,
      etag,
      upstreams: JSON.stringify(upstreams),
    };
  }

  private mapToUpstreamResponse(r: any) {
    const safeStringify = (val: any) => {
      if (!val) return '{}';
      return typeof val === 'string' ? val : JSON.stringify(val);
    };

    return {
      ...r,
      auth: safeStringify(r.auth),
      allowedPaths: Array.isArray(r.allowedPaths) ? r.allowedPaths : [],
      allowedMethods: Array.isArray(r.allowedMethods) ? r.allowedMethods : [],
      retry: safeStringify(r.retry),
      rateLimit: safeStringify(r.rateLimit),
      roles: Array.isArray(r.roles) ? r.roles : [],
      scopes: Array.isArray(r.scopes) ? r.scopes : [],
      metadata: safeStringify(r.metadata),
      createdAt: r.createdAt?.toISOString() || '',
      updatedAt: r.updatedAt?.toISOString() || '',
    };
  }

  private parseDto(data: any) {
    const dto = { ...data };

    const safeParse = (val: any) => {
      if (!val) return {};
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          return {};
        }
      }
      return val;
    };

    dto.auth = safeParse(dto.auth);
    dto.retry = safeParse(dto.retry);
    dto.rateLimit = safeParse(dto.rateLimit);
    dto.metadata = safeParse(dto.metadata);

    return dto;
  }

  @GrpcMethod('IntegrationConfigService', 'CreateUpstream')
  async createUpstream(data: any) {
    try {
      const dto = this.parseDto(data) as CreateUpstreamDto;
      const callerUserId = data.callerUserId || 'system-admin';
      const r = await this.service.createUpstream(dto, callerUserId);
      return this.mapToUpstreamResponse(r);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new RpcException({
          code: GrpcStatus.ALREADY_EXISTS,
          message:
            'Tên API (Upstream) này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.',
        });
      }
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e.message,
      });
    }
  }

  @GrpcMethod('IntegrationConfigService', 'GetAllUpstreams')
  async getAllUpstreams() {
    const records = await this.service.getAllUpstreams();
    const data = records.map((r) => this.mapToUpstreamResponse(r));
    return { data };
  }

  @GrpcMethod('IntegrationConfigService', 'GetUpstreamById')
  async getUpstreamById(data: any) {
    try {
      const r = await this.service.getUpstreamById(data.id);
      return this.mapToUpstreamResponse(r);
    } catch (e: any) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: e.message,
      });
    }
  }

  @GrpcMethod('IntegrationConfigService', 'UpdateUpstream')
  async updateUpstream(data: any) {
    try {
      const dto = this.parseDto(data.data) as UpdateUpstreamDto;
      const callerUserId = data.callerUserId || 'system-admin';
      const r = await this.service.updateUpstream(data.id, dto, callerUserId);
      return this.mapToUpstreamResponse(r);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new RpcException({
          code: GrpcStatus.ALREADY_EXISTS,
          message:
            'Tên API (Upstream) này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.',
        });
      }
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e.message,
      });
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
