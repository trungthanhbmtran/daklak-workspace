import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Clean null/undefined values recursively from an object/array.
 * Keeps {} instead of null when an object is empty.
 */
function deepClean(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  if (Array.isArray(obj)) {
    return obj
      .map((item) => deepClean(item))
      .filter((item) => item !== undefined);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = deepClean(obj[key]);
        if (val !== undefined && val !== null) {
          cleaned[key] = val;
        }
      }
    }
    return cleaned;
  }
  return obj;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const isListRequest = this.detectListRequest(req);

    return next.handle().pipe(
      map((response) => {
        const timestamp = new Date().toISOString();
        let payload = response;

        // Strip null/undefined entirely
        payload = deepClean(payload);

        // Primitive or empty response
        if (typeof payload !== 'object' || payload === undefined) {
          return {
            success: true,
            data: isListRequest ? [] : {},
            meta: {},
            timestamp,
          };
        }

        // Array response
        if (Array.isArray(payload)) {
          return {
            success: true,
            data: payload,
            meta: {
              pagination: {
                total: payload.length,
                page: 1,
                pageSize: payload.length || 20,
                totalPages: 1,
              },
            },
            timestamp,
          };
        }

        // If it's already structured { success, data, meta }
        if ('success' in payload || 'data' in payload || 'status' in payload) {
          const isOk = payload.status === 'success' || payload.success !== false;
          let data = payload.data !== undefined ? payload.data : payload;
          if (isListRequest && !Array.isArray(data)) {
            data = typeof data === 'object' && Object.keys(data).length === 0 ? [] : [data];
          }

          const meta = this.normalizeMeta(payload.meta);
          const message = payload.message;

          const result: any = {
            success: isOk,
            data: data || (isListRequest ? [] : {}),
            meta: meta || {},
            timestamp,
          };
          if (message) result.message = message;
          return result;
        }

        // Object response
        return {
          success: true,
          data: payload,
          meta: {},
          timestamp,
        };
      }),
    );
  }

  private detectListRequest(req: any): boolean {
    if (!req || req.method !== 'GET') return false;
    const path = req.path ?? '';
    const endsWithId =
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        path,
      ) || /\/\d+$/.test(path);
    const hasPaginationQuery = !!(
      req.query?.page ||
      req.query?.limit ||
      req.query?.pageSize
    );
    return !endsWithId || hasPaginationQuery;
  }

  private normalizeMeta(meta: any): any {
    if (!meta) return {};
    if (typeof meta !== 'object') return { raw: meta };

    if ('pagination' in meta) {
      const p = meta.pagination;
      return {
        ...meta,
        pagination: {
          total: Number(p?.total ?? 0),
          page: Number(p?.page ?? 1),
          pageSize: Number(p?.pageSize ?? 20),
          totalPages: Number(p?.totalPages ?? 1),
        },
      };
    }

    if ('total' in meta) {
      const total = Number(meta.total ?? 0);
      const page = Number(meta.page ?? 1);
      const pageSize = Number(meta.pageSize ?? 20);
      const {
        total: _t,
        page: _p,
        pageSize: _ps,
        totalPages: _tp,
        ...rest
      } = meta;
      return {
        pagination: {
          total,
          page,
          pageSize,
          totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 1,
        },
        ...rest,
      };
    }

    return meta;
  }
}
