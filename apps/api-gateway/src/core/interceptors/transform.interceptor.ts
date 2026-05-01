import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(response => {
        // Nếu đã có cấu trúc data hoặc success từ microservice, chỉ cần bổ sung các field thiếu
        if (
          response &&
          typeof response === 'object' &&
          !Array.isArray(response) &&
          ('data' in response || 'success' in response || 'meta' in response)
        ) {
          return {
            success: true,
            data: null,
            meta: null,
            ...response,
            timestamp: new Date().toISOString(),
          };
        }

        // Trường hợp mảng hoặc object đơn lẻ (chưa bọc), bọc vào data
        return {
          success: true,
          data: response ?? null,
          meta: null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}