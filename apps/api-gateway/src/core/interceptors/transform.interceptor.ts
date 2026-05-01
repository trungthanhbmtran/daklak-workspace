import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          return {
            success: true,
            ...response,
          };
        }
        return {
          success: true,
          data: response,
          meta: null,
        };
      }),
    );
  }
}