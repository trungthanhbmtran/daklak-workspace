import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { ApiManagementService } from './api-management.service';
import { GrpcAuthGuard, GRPC_USER_KEY } from '../../../../../shared/security/grpc-auth';
import { PbacGuard } from '../../../../../shared/security/grpc-auth';
import { Permissions } from '@/common/decorators/permissions.decorator';

@Controller()
@UseGuards(GrpcAuthGuard, PbacGuard)
export class ApiManagementController {
  constructor(private readonly service: ApiManagementService) {}

  private getUser(metadata: any): any {
    // metadata is actually the ServerUnaryCall in NestJS for gRPC, but NestJS passes (data, metadata, call)
    // Wait, GrpcAuthGuard mutates the Rpc context.
    return (
      metadata?.get(GRPC_USER_KEY)?.[0] || {
        id: 'system-admin',
        organizationId: 'DEFAULT',
      }
    );
  }

  @GrpcMethod('ApiManagementService', 'ListConnections')
  @Permissions('INTEGRATION:VIEW')
  async listConnections(data: any) {
    try {
      const orgId = data.organizationId || 'DEFAULT';
      const result = await this.service.listConnections(
        orgId,
        data.limit,
        data.offset,
      );
      return {
        data: result.data.map((conn) => ({
          ...conn,
          auth: typeof conn.auth === 'object' ? conn.auth : { kind: 'none' },
          createdAt: conn.createdAt.toISOString(),
          updatedAt: conn.updatedAt.toISOString(),
        })),
        total: result.total,
      };
    } catch (e: any) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('ApiManagementService', 'GetConnection')
  @Permissions('INTEGRATION:VIEW')
  async getConnection(data: { id: string }) {
    try {
      const conn = await this.service.getConnection(data.id);
      return {
        ...conn,
        auth: typeof conn.auth === 'object' ? conn.auth : { kind: 'none' },
        createdAt: conn.createdAt.toISOString(),
        updatedAt: conn.updatedAt.toISOString(),
      };
    } catch (e: any) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: e.message,
      });
    }
  }

  @GrpcMethod('ApiManagementService', 'CreateConnection')
  @Permissions('INTEGRATION:MANAGE')
  async createConnection(data: any) {
    try {
      const orgId = data.organizationId || 'DEFAULT';
      const userId = 'system-admin'; // Fallback
      const conn = await this.service.createConnection(
        { ...data, organizationId: orgId },
        userId,
      );
      return {
        ...conn,
        auth: typeof conn.auth === 'object' ? conn.auth : { kind: 'none' },
        createdAt: conn.createdAt.toISOString(),
        updatedAt: conn.updatedAt.toISOString(),
      };
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new RpcException({
          code: GrpcStatus.ALREADY_EXISTS,
          message: 'Connection code already exists.',
        });
      }
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e.message,
      });
    }
  }

  @GrpcMethod('ApiManagementService', 'UpdateConnection')
  @Permissions('INTEGRATION:MANAGE')
  async updateConnection(data: any) {
    try {
      const { id, expectedVersion, ...updateData } = data;
      const userId = 'system-admin';
      const conn = await this.service.updateConnection(
        id,
        updateData,
        expectedVersion,
        userId,
      );
      return {
        ...conn,
        auth: typeof conn.auth === 'object' ? conn.auth : { kind: 'none' },
        createdAt: conn.createdAt.toISOString(),
        updatedAt: conn.updatedAt.toISOString(),
      };
    } catch (e: any) {
      if (e.message.includes('OCC')) {
        throw new RpcException({
          code: GrpcStatus.ABORTED,
          message: 'Version conflict (OCC). Please refresh and try again.',
        });
      }
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e.message,
      });
    }
  }

  @GrpcMethod('ApiManagementService', 'DeleteConnection')
  @Permissions('INTEGRATION:MANAGE')
  async deleteConnection(data: { id: string }) {
    try {
      return await this.service.deleteConnection(data.id);
    } catch (e: any) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('ApiManagementService', 'DisableConnection')
  @Permissions('INTEGRATION:MANAGE')
  async disableConnection(data: any) {
    try {
      const { id, expectedVersion } = data;
      const userId = 'system-admin';
      const conn = await this.service.disableConnection(
        id,
        expectedVersion,
        userId,
      );
      return {
        ...conn,
        auth: typeof conn.auth === 'object' ? conn.auth : { kind: 'none' },
        createdAt: conn.createdAt.toISOString(),
        updatedAt: conn.updatedAt.toISOString(),
      };
    } catch (e: any) {
      if (e.message.includes('OCC')) {
        throw new RpcException({
          code: GrpcStatus.ABORTED,
          message: 'Version conflict (OCC). Please refresh.',
        });
      }
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e.message,
      });
    }
  }

  @GrpcMethod('ApiManagementService', 'PublishRevision')
  @Permissions('INTEGRATION:MANAGE')
  async publishRevision(data: any) {
    try {
      const userId = 'system-admin';
      const rev = await this.service.publishRevision(userId);
      return {
        id: rev.id,
        version: rev.version,
        checksum: rev.checksum,
        createdAt: rev.createdAt.toISOString(),
      };
    } catch (e: any) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e.message,
      });
    }
  }

  @GrpcMethod('ApiManagementService', 'CreateImportSession')
  @Permissions('INTEGRATION:MANAGE')
  async createImportSession(data: any) {
    try {
      const orgId = data.organizationId || 'DEFAULT';
      return await this.service.createImportSession({ ...data, organizationId: orgId });
    } catch (e: any) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: e.message,
      });
    }
  }

  @GrpcMethod('ApiManagementService', 'CommitImportSession')
  @Permissions('INTEGRATION:MANAGE')
  async commitImportSession(data: any) {
    try {
      return await this.service.commitImportSession(data, 'system-admin');
    } catch (e: any) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: e.message,
      });
    }
  }
}

