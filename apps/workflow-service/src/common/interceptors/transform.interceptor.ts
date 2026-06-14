import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // Không áp dụng cho gRPC (context type 'rpc')
    if (context.getType() === 'rpc') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Nếu đã bọc rồi thì thôi
        if (
          data &&
          typeof data === 'object' &&
          ('success' in data || 'data' in data)
        ) {
          return {
            success: data.success ?? true,
            data: data.data ?? null,
            meta: data.meta ?? null,
            ...data,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: data ?? null,
          meta: null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
