import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PrismaService } from '@/database/prisma.service';
import { METADATA_KEYS } from '@/common/constants/metadata-keys';
import type { UserWithPbac } from '@/common/types/grpc-user.type';

/** Key lưu user trên gRPC context để guard khác dùng */
export const GRPC_USER_KEY = 'user';

function flattenPermissions(
  roles: UserWithPbac['roles'],
): string[] {
  const set = new Set<string>();
  for (const role of roles) {
    for (const p of role.permissions ?? []) {
      const resourceCode = p.resource?.code ?? '';
      if (resourceCode) set.add(`${resourceCode}:${p.action}`);
    }
  }
  return Array.from(set);
}

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc().getContext<{ metadata?: import('@grpc/grpc-js').Metadata }>();
    const metadata = rpcContext?.metadata;
    if (!metadata) {
      throw new RpcException({
        code: GrpcStatus.UNAUTHENTICATED,
        message: 'Missing metadata',
      });
    }

    const rawUserId = metadata.get(METADATA_KEYS.USER_ID)?.[0];
    if (rawUserId == null || rawUserId === '') {
      throw new RpcException({
        code: GrpcStatus.UNAUTHENTICATED,
        message: 'Missing user-id in metadata',
      });
    }

    const userId = Number(rawUserId);
    if (Number.isNaN(userId)) {
      throw new RpcException({
        code: GrpcStatus.UNAUTHENTICATED,
        message: 'Invalid user-id',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: { include: { resource: true } },
          },
        },
      },
    });

    if (!user) {
      throw new RpcException({
        code: GrpcStatus.UNAUTHENTICATED,
        message: 'User not found',
      });
    }

    const userWithPbac = user as unknown as UserWithPbac;
    userWithPbac.permissionsFlatten = flattenPermissions(userWithPbac.roles);

    (rpcContext as Record<string, unknown>)[GRPC_USER_KEY] = userWithPbac;
    return true;
  }
}
