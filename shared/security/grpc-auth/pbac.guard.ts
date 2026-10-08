import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { GRPC_USER_KEY } from './grpc-auth.guard';

export const PERMISSIONS_KEY = 'REQUIRE_PERMISSIONS';
export const RequirePermission = (...permissions: string[]) => {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    Reflector.createDecorator<string[]>()(permissions)(target, key as any, descriptor as any);
  };
};

@Injectable()
export class PbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    const args = context.getArgs();
    const callObject = args[2] as Record<string, unknown> | undefined;
    const user = callObject?.[GRPC_USER_KEY] as any | undefined;

    if (!user) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'User context missing. Use GrpcAuthGuard before PbacGuard.',
      });
    }

    const userPermissions = user.permissionsFlatten ?? [];
    const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: `Required one of: ${requiredPermissions.join(', ')}`,
      });
    }

    return true;
  }
}

