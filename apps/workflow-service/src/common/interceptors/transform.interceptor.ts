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
  message: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // Nếu res đã đúng chuẩn (do Controller tự trả về meta custom) thì không bọc lại
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
          return res;
        }

        // Nếu res chứa biến items (do chuẩn cũ), tự động trích xuất
        // và map biến pagination vào meta
        let data = res;
        let meta: any = undefined;

        if (res && typeof res === 'object') {
          if ('items' in res) {
            data = res.items;
          }
          if ('pagination' in res) {
            meta = { pagination: res.pagination };
          } else if ('meta' in res) {
            meta = res.meta;
          }
        }

        return {
          success: true,
          data: data,
          meta: meta,
          message: 'Success',
        };
      }),
    );
  }
}
