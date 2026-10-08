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
 * Tối ưu hoá (Expert Level): Áp dụng kỹ thuật Structural Sharing.
 * Chỉ cấp phát bộ nhớ tạo object/array mới nếu thực sự có giá trị bị thay đổi (xóa null/undefined).
 * Nếu payload hoàn toàn sạch, trả về nguyên bản tham chiếu gốc để tiết kiệm CPU & RAM (Garbage Collection).
 */
function deepClean(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    let hasChanges = false;
    const result = [];
    for (let i = 0; i < obj.length; i++) {
      const val = obj[i];
      if (val === null || val === undefined) {
        hasChanges = true;
      } else {
        const cleaned = deepClean(val);
        result.push(cleaned);
        if (cleaned !== val) {
          hasChanges = true;
        }
      }
    }
    // Trả về original array nếu không có gì thay đổi
    return hasChanges ? result : obj;
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    let hasChanges = false;
    const cleaned: any = {};
    const keys = Object.keys(obj);
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = obj[key];
      
      if (val === null || val === undefined) {
        hasChanges = true;
      } else {
        const cleanedVal = deepClean(val);
        cleaned[key] = cleanedVal;
        if (cleanedVal !== val) {
          hasChanges = true;
        }
      }
    }
    // Trả về original object nếu không có gì thay đổi
    return hasChanges ? cleaned : obj;
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
          if (payload.hubApps) result.hubApps = payload.hubApps;
          if (payload.sidebarMenus) result.sidebarMenus = payload.sidebarMenus;
          if (payload.allowedPaths) result.allowedPaths = payload.allowedPaths;
          if (payload.allowed_paths) result.allowedPaths = payload.allowed_paths;
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
    if (
      path.includes('/code/') ||
      path.includes('/detail/') ||
      path.endsWith('/scope') ||
      path.endsWith('/staffing') ||
      path.includes('/staffing-report') ||
      path.endsWith('/subtree') ||
      path.endsWith('/info') ||
      path.endsWith('/job-titles')
    ) {
      return false;
    }
    
    const endsWithId =
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        path,
      ) || /\/\d+$/.test(path);
    const hasPaginationQuery = !!(
      req.query?.page ||
      req.query?.limit ||
      req.query?.pageSize
    );
    const isStats = /\/(reports|stats|metrics|dashboard|kpis)/i.test(path);
    if (isStats && !hasPaginationQuery) return false;
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
