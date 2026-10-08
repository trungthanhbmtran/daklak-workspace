import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Reflector } from '@nestjs/core';
import { GatewayContextService } from './gateway-context.service';

export const GRPC_USER_KEY = 'user';
export const STRICT_SESSION_KEY = 'STRICT_SESSION';

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  constructor(
    private readonly gatewayContext: GatewayContextService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = context.switchToRpc().getContext<import('@grpc/grpc-js').Metadata>();
    if (!metadata || typeof metadata.get !== 'function') {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Internal service error: gRPC metadata is missing from upstream caller',
      });
    }

    let tokenContext;
    try {
      const isStrict = this.reflector.getAllAndOverride<boolean>(STRICT_SESSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isStrict) {
        tokenContext = await this.gatewayContext.verify(metadata);
      } else {
        tokenContext = await this.gatewayContext.verifyFast(metadata);
      }
    } catch (e) {
      throw new RpcException({
        code: GrpcStatus.UNAUTHENTICATED,
        message: 'Invalid delegation token',
      });
    }

    const userId = Number(tokenContext.id);
    const pv = Number(tokenContext.authVersion);

    // Thử lấy từ Redis Policy Cache trước (Giai đoạn 4)
    let cacheData = await this.gatewayContext.getPolicyCache(userId, pv);
    let permissionsFlatten = cacheData?.permissionsFlatten;

    // Giai đoạn 5: Khi miss cache, không đọc từ Payload nữa mà query gRPC sang user-service
    if (!permissionsFlatten) {
      try {
        const { firstValueFrom } = await import('rxjs');
        const userData = await firstValueFrom(this.gatewayContext.userClient.FindOne({ id: userId }));
        
        permissionsFlatten = Array.isArray(userData.permissionsFlatten) ? userData.permissionsFlatten : [];
        const newCacheData = {
          permissionsFlatten: permissionsFlatten as string[],
          employeeCode: userData.employeeCode,
          unitId: userData.unitId
        };
        cacheData = newCacheData;
        
        if (permissionsFlatten!.length > 0) {
          await this.gatewayContext.setPolicyCache(userId, pv, newCacheData).catch(() => {});
        }
      } catch (e) {
        permissionsFlatten = [];
      }
    }

    const userObj = {
      id: userId,
      employeeCode: cacheData?.employeeCode || tokenContext.employeeCode || String(userId),
      unitId: cacheData?.unitId || tokenContext.unitId,
      permissionsFlatten
    };

    const args = context.getArgs();
    const callObject = args[2];
    if (callObject && typeof callObject === 'object') {
      (callObject as Record<string, unknown>)[GRPC_USER_KEY] = userObj;
    }
    return true;
  }
}





