import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

/**
 * Chuẩn hoá toàn bộ response về dạng duy nhất:
 * {
 *   success: boolean,
 *   data: any | null,
 *   meta: {
 *     pagination?: { total, page, pageSize, totalPages },
 *     filter?: Record<string, any>,
 *     [key: string]: any,
 *   } | null,
 *   message?: string,
 *   timestamp: string,
 * }
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((response) => this.transform(response)),
    );
  }

  private transform(response: any): any {
    const timestamp = new Date().toISOString();

    // null / undefined
    if (response === null || response === undefined) {
      return { success: true, data: null, meta: null, timestamp };
    }

    // Primitive (string, number, boolean)
    if (typeof response !== 'object') {
      return { success: true, data: response, meta: null, timestamp };
    }

    // Array thuần
    if (Array.isArray(response)) {
      return {
        success: true,
        data: response,
        meta: { pagination: { total: response.length } },
        timestamp,
      };
    }

    // --- Dạng object ---

    // Legacy: { status: 'success'|'error', data, message }
    if ('status' in response && !('success' in response)) {
      const isOk = response.status === 'success';
      return {
        success: isOk,
        data: response.data ?? null,
        meta: this.normalizeMeta(response.meta),
        ...(response.message ? { message: response.message } : {}),
        timestamp,
      };
    }

    // Chuẩn { success, data, meta } — giữ nguyên nhưng normalize meta
    if ('success' in response) {
      return {
        success: response.success,
        data: response.data ?? null,
        meta: this.normalizeMeta(response.meta),
        ...(response.message ? { message: response.message } : {}),
        timestamp,
      };
    }

    // gRPC list: { items, total }
    if ('items' in response && 'total' in response) {
      const page = response.page ?? response.meta?.page ?? 1;
      const pageSize = response.pageSize ?? response.meta?.pageSize ?? response.limit ?? 20;
      const total = Number(response.total) || 0;
      return {
        success: true,
        data: response.items,
        meta: {
          pagination: {
            total,
            page: Number(page),
            pageSize: Number(pageSize),
            totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 1,
          },
          ...(response.meta && typeof response.meta === 'object' ? response.meta : {}),
        },
        timestamp,
      };
    }

    // { data, meta } từ microservice
    if ('data' in response) {
      return {
        success: true,
        data: response.data,
        meta: this.normalizeMeta(response.meta),
        ...(response.message ? { message: response.message } : {}),
        timestamp,
      };
    }

    // Object đơn lẻ — wrap vào data
    return {
      success: true,
      data: response,
      meta: null,
      timestamp,
    };
  }

  private normalizeMeta(meta: any): any {
    if (!meta) return null;
    if (typeof meta !== 'object') return { raw: meta };

    // Chuẩn hoá pagination nếu có
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

    // Nếu meta chính là pagination fields
    if ('total' in meta) {
      const total = Number(meta.total ?? 0);
      const page = Number(meta.page ?? 1);
      const pageSize = Number(meta.pageSize ?? 20);
      const { total: _t, page: _p, pageSize: _ps, totalPages: _tp, ...rest } = meta;
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
