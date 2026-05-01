import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(response => {
        // Nếu response null hoặc undefined
        if (response === null || response === undefined) {
          return {
            success: true,
            data: null,
            meta: null,
            timestamp: new Date().toISOString(),
          };
        }

        // Trường hợp response đã có cấu trúc chuẩn { success, data, meta }
        if (
          typeof response === 'object' &&
          !Array.isArray(response) &&
          ('success' in response || 'data' in response || 'meta' in response)
        ) {
          return {
            success: response.success ?? true,
            data: response.data ?? null,
            meta: response.meta ?? null,
            ...response,
            timestamp: new Date().toISOString(),
          };
        }

        // Trường hợp response trả về dạng { items, total } (phổ biến từ gRPC list)
        if (
          typeof response === 'object' &&
          !Array.isArray(response) &&
          'items' in response &&
          'total' in response
        ) {
          return {
            success: true,
            data: response.items,
            meta: {
              total: response.total,
              ...(response.meta || {}),
            },
            timestamp: new Date().toISOString(),
          };
        }

        // Trường hợp mảng hoặc object đơn lẻ, bọc vào data
        return {
          success: true,
          data: response,
          meta: null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}