import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class GrpcContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcCtx = context.switchToRpc();
    const data = rpcCtx.getData();
    const metadata = rpcCtx.getContext();
    console.log('[DEBUG Interceptor] Executing... Metadata keys:', metadata ? Object.keys(metadata) : 'NONE');

    if (metadata && metadata.get) {
      const authHeader = metadata.get('authorization')?.[0];
      console.log('[DEBUG Interceptor] authHeader:', authHeader);
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const user = jwt.decode(token) as any;
          
          if (user) {
            // Inject context into payload for backward compatibility with service
            Object.assign(data, {
              currentUserCode: user.employeeCode || user.username,
              currentUserId: user.id ? parseInt(user.id, 10) : undefined,
              currentUserDept: user.unitId ? parseInt(user.unitId, 10) : undefined,
              currentUserPermissions: user.permissionsFlatten || [],
            });
          }
        } catch (e) {
          console.error('[GrpcContextInterceptor] Failed to decode JWT', e);
        }
      }
    }
    return next.handle();
  }
}
