import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Chuẩn hoá toàn bộ response về dạng duy nhất:
 * {
 *   success: boolean,
 *   data: any[] | any | null,
 *   meta: {
 *     pagination?: { total, page, pageSize, totalPages },
 *     filter?: Record<string, any>,
 *     [key: string]: any,
 *   } | null,
 *   message?: string,
 *   timestamp: string,
 * }
 *
 * Quy tắc data:
 *  - List endpoint (GET collection, meta có pagination, hoặc items/total) → data luôn là [] nếu không có gì
 *  - Single entity endpoint → data là object hoặc null nếu không tìm thấy
 *  ⚠️ KHÔNG BAO GIỜ trả data: null cho list endpoint — trả data: [] thay thế
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request>();
    const isListRequest = this.detectListRequest(req);

    return next.handle().pipe(
      map((response) => this.transform(response, isListRequest)),
    );
  }

  /**
   * Phát hiện đây có phải list endpoint không:
   * - Method GET
   * - Path không kết thúc bằng UUID / number ID (route collection)
   * - Hoặc path kết thúc bằng / hoặc ?page= / ?limit=
   */
  private detectListRequest(req: Request): boolean {
    if (!req || req.method !== 'GET') return false;
    const path = req.path ?? '';
    // Nếu path kết thúc bằng UUID hoặc số nguyên → single entity
    const endsWithId = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path)
      || /\/\d+$/.test(path);
    // Nếu có query params phân trang → là list
    const hasPaginationQuery = !!(req.query?.page || req.query?.limit || req.query?.pageSize);
    return !endsWithId || hasPaginationQuery;
  }

  private transform(response: any, isListRequest: boolean): any {
    const timestamp = new Date().toISOString();

    // null / undefined
    if (response === null || response === undefined) {
      // Nếu là list request mà service trả null → trả []
      return { success: true, data: isListRequest ? [] : null, meta: null, timestamp };
    }

    // Primitive (string, number, boolean)
    if (typeof response !== 'object') {
      return { success: true, data: response, meta: null, timestamp };
    }

    // Array thuần → luôn trả array (kể cả [])
    if (Array.isArray(response)) {
      return {
        success: true,
        data: response,
        meta: { pagination: { total: response.length, page: 1, pageSize: response.length || 20, totalPages: 1 } },
        timestamp,
      };
    }

    // --- Dạng object ---

    // Legacy: { status: 'success'|'error', data, message }
    if ('status' in response && !('success' in response)) {
      const isOk = response.status === 'success';
      const meta = this.normalizeMeta(response.meta);
      return {
        success: isOk,
        data: this.normalizeData(response.data, meta, isListRequest),
        meta,
        ...(response.message ? { message: response.message } : {}),
        timestamp,
      };
    }

    // Chuẩn { success, data, meta } — giữ nguyên nhưng normalize
    if ('success' in response) {
      const meta = this.normalizeMeta(response.meta);
      return {
        success: response.success,
        data: this.normalizeData(response.data, meta, isListRequest),
        meta,
        ...(response.message ? { message: response.message } : {}),
        timestamp,
      };
    }

    // gRPC list: { items, total }
    if ('items' in response && 'total' in response) {
      const page = response.page ?? response.meta?.page ?? 1;
      const pageSize = response.pageSize ?? response.meta?.pageSize ?? response.limit ?? 20;
      const total = Number(response.total) || 0;
      const meta = {
        pagination: {
          total,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: pageSize > 0 ? Math.ceil(total / Number(pageSize)) : 1,
        },
        ...(response.meta && typeof response.meta === 'object' ? response.meta : {}),
      };
      return {
        success: true,
        // items luôn là array — nếu null/undefined trả []
        data: Array.isArray(response.items) ? response.items : [],
        meta,
        timestamp,
      };
    }

    // { data, meta } từ microservice
    if ('data' in response) {
      const meta = this.normalizeMeta(response.meta);
      return {
        success: true,
        data: this.normalizeData(response.data, meta, isListRequest),
        meta,
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

  /**
   * Chuẩn hoá giá trị data:
   * - Nếu data đã là array → giữ nguyên
   * - Nếu data là null/undefined:
   *   + isListRequest=true HOẶC meta có pagination → trả [] (list endpoint)
   *   + ngược lại → trả null (single entity không tìm thấy)
   * - Nếu data là object → giữ nguyên
   */
  private normalizeData(data: any, meta: any, isListRequest = false): any {
    // Đã là array → giữ nguyên (kể cả [])
    if (Array.isArray(data)) return data;

    // null/undefined
    if (data === null || data === undefined) {
      // isListRequest hoặc có pagination meta → list endpoint → trả []
      if (isListRequest || meta?.pagination !== undefined) return [];
      // Single entity → trả null
      return null;
    }

    return data;
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
