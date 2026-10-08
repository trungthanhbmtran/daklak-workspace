import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PrismaService } from '@/database/prisma.service';
import { METADATA_KEYS } from '@/common/constants/metadata-keys';
import type { UserWithPbac } from '@/common/types/grpc-user.type';

/** Key lưu user trên gRPC context để guard khác dùng */
export const GRPC_USER_KEY = 'user';

function flattenPermissions(policies: UserWithPbac['policies']): string[] {
  const set = new Set<string>();
  for (const p of policies ?? []) {
    const resourceCode = p.resource?.code ?? '';
    if (resourceCode) set.add(`${resourceCode}:${p.action}`);
  }
  return Array.from(set);
}

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Trong NestJS @GrpcMethod, NestJS truyền handler với (request, metadata, call).
    // context.switchToRpc().getContext() trả về chính call.metadata (Metadata object),
    // KHÔNG phải object { metadata: ... }.
    const metadata = context
      .switchToRpc()
      .getContext<import('@grpc/grpc-js').Metadata>();

    if (!metadata || typeof metadata.get !== 'function') {
      // Đây là lỗi internal (api-gateway quên gửi metadata), KHÔNG phải lỗi xác thực user.
      // Dùng INTERNAL thay vì UNAUTHENTICATED để tránh api-gateway map thành HTTP 401
      // và trigger logout nhầm cho user đang đăng nhập.
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Internal service error: gRPC metadata is missing from upstream caller',
      });
    }

    const rawUserId = metadata.get(METADATA_KEYS.USER_ID)?.[0];
    if (rawUserId == null || rawUserId === '') {
      // Tương tự: thiếu user-id là lỗi của caller (api-gateway), không phải user.
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Internal service error: user-id not forwarded in gRPC metadata',
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
        policies: { include: { resource: true } },
      },
    });

    if (!user) {
      throw new RpcException({
        code: GrpcStatus.UNAUTHENTICATED,
        message: 'User not found',
      });
    }

    const userWithPbac = user as unknown as UserWithPbac;
    userWithPbac.permissionsFlatten = flattenPermissions(userWithPbac.policies);

    // Gắn user vào call object (args[2] = ServerUnaryCall) để PbacGuard đọc được.
    // Trong NestJS gRPC @GrpcMethod, args là [request, metadata, call].
    const args = context.getArgs();
    const callObject = args[2]; // ServerUnaryCall
    if (callObject && typeof callObject === 'object') {
      (callObject as Record<string, unknown>)[GRPC_USER_KEY] = userWithPbac;
    }
    return true;
  }
}
