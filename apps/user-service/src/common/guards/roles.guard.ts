import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Role } from '@/common/enums/role.enum';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { GRPC_USER_KEY } from '@/common/guards/grpc-auth.guard';
import type { UserWithPbac } from '@/common/types/grpc-user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const rpcContext = context.switchToRpc().getContext<Record<string, unknown>>();
    const user = rpcContext?.[GRPC_USER_KEY] as UserWithPbac | undefined;

    if (!user) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'User context missing. Use GrpcAuthGuard before RolesGuard (PBAC).',
      });
    }

    const userRoleCodes = (user.roles ?? []).map((r) => r.code?.toLowerCase());
    const hasRole = requiredRoles.some((role) =>
      userRoleCodes.includes(role.toLowerCase()),
    );

    if (!hasRole) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: `Required one of roles: ${requiredRoles.join(', ')}`,
      });
    }

    return true;
  }
}