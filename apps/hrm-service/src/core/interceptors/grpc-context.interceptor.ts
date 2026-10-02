import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GatewayContextService } from '../auth/gateway-context.service';
@Injectable()
export class GrpcContextInterceptor implements NestInterceptor {
  constructor(private readonly auth: GatewayContextService) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const rpc = context.switchToRpc();
    const user = await this.auth.verify(rpc.getContext());
    Object.assign(rpc.getData(), {
      currentEmployeeCode: user.employeeCode || String(user.id),
      currentUserId: user.id, currentUserDept: Number(user.unitId) || undefined,
      currentUserPermissions: user.permissionsFlatten,
    });
    return next.handle();
  }
}

