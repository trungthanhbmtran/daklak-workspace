import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class GrpcContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcCtx = context.switchToRpc();
    const data = rpcCtx.getData();
    const metadata = rpcCtx.getContext();

    if (metadata && metadata.get) {
      const userStr = metadata.get('user')?.[0];
      if (userStr) {
        try {
          const user = JSON.parse(userStr as string);
          
          // Inject context into payload for backward compatibility with service
          Object.assign(data, {
            currentUserCode: user.employeeCode || user.username,
            currentUserId: user.id ? parseInt(user.id, 10) : undefined,
            isAdmin: user.permissionsFlatten?.includes('TASK:MANAGE'),
            isLeader: user.permissionsFlatten?.includes('TASK:MANAGE') || user.permissionsFlatten?.includes('TASK.ASSIGN') || user.permissionsFlatten?.includes('TASK.*'),
            currentUserDept: user.unitId ? parseInt(user.unitId, 10) : undefined,
            currentUserPermissions: user.permissionsFlatten || [],
          });
        } catch (e) {
          console.error('[GrpcContextInterceptor] Failed to parse user metadata', e);
        }
      }
    }
    return next.handle();
  }
}
