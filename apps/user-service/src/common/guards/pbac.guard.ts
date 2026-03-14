import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';
import { GRPC_USER_KEY } from '@/common/guards/grpc-auth.guard';
import type { UserWithPbac } from '@/common/types/grpc-user.type';

@Injectable()
export class PbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const rpcContext = context.switchToRpc().getContext<Record<string, unknown>>();
    const user = rpcContext?.[GRPC_USER_KEY] as UserWithPbac | undefined;

    if (!user) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'User context missing. Use GrpcAuthGuard before PbacGuard.',
      });
    }

    const userPermissions = user.permissionsFlatten ?? [];
    const hasPermission = requiredPermissions.some((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: `Required one of: ${requiredPermissions.join(', ')}`,
      });
    }

    return true;
  }
}
