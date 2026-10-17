import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type PlainObject = Record<string, unknown>;

interface ApiResponse {
  success: boolean;
  data: unknown;
  meta: PlainObject;
  timestamp: string;
  message?: unknown;
  [extra: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/* Constants (hoisted: không tạo lại mỗi request)                              */
/* -------------------------------------------------------------------------- */

const UUID_TAIL_RE =
  /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_TAIL_RE = /\/\d+$/;
const CUID_TAIL_RE = /\/c[a-z0-9]{24}$/i;
const STATS_RE = /\/(reports|stats|metrics|dashboard|kpis)/i;

const NON_LIST_CONTAINS = ['/code/', '/detail/', '/staffing-report', '/kpi-forms/', '/snapshot'];
const NON_LIST_SUFFIXES = ['/scope', '/staffing', '/subtree', '/info', '/job-titles', '/global-settings', '/xml', '/snapshot', '/personal-workbench', '/task-context'];

/* -------------------------------------------------------------------------- */
/* deepClean                                                                   */
/* -------------------------------------------------------------------------- */

/** Chỉ recurse vào array / object "thường"; bỏ qua Date, Decimal, ObjectId (toJSON), Buffer, Map, Set... */
function isCleanable(v: unknown): v is PlainObject {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as any).toJSON !== 'function' &&
    !ArrayBuffer.isView(v) &&
    !(v instanceof Map) &&
    !(v instanceof Set)
  );
}

/**
 * Xoá null/undefined đệ quy.
 * - Structural sharing: trả về đúng tham chiếu gốc nếu không có gì thay đổi.
 * - Copy-on-write: chỉ cấp phát array/object mới ở lần thay đổi đầu tiên
 *   (code cũ cấp phát sẵn kết quả ngay từ đầu dù payload sạch).
 */
function deepClean(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;

  if (Array.isArray(value)) {
    let result: unknown[] | null = null;
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const cleaned = deepClean(item);
      const changed = item == null || cleaned !== item;

      if (result === null) {
        if (!changed) continue;
        result = value.slice(0, i); // copy phần đã duyệt (không đổi)
      }
      if (cleaned !== undefined) result.push(cleaned);
    }
    return result ?? value;
  }

  if (isCleanable(value)) {
    const keys = Object.keys(value);
    let result: PlainObject | null = null;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = value[key];
      const cleaned = deepClean(val);
      const changed = val == null || cleaned !== val;

      if (result === null) {
        if (!changed) continue;
        result = {};
        for (let j = 0; j < i; j++) result[keys[j]] = value[keys[j]];
      }
      if (cleaned !== undefined) result[key] = cleaned;
    }
    return result ?? value;
  }

  return value;
}

const isEmptyObject = (v: unknown): boolean =>
  typeof v === 'object' && v !== null && Object.keys(v).length === 0;

/* -------------------------------------------------------------------------- */
/* Interceptor                                                                 */
/* -------------------------------------------------------------------------- */

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const isList = this.detectListRequest(req);

    return next.handle().pipe(map((res) => this.transform(res, isList)));
  }

  private transform(response: unknown, isList: boolean): unknown {
    // File download / stream: không được bọc
    if (response instanceof StreamableFile || Buffer.isBuffer(response)) {
      return response;
    }

    const timestamp = new Date().toISOString();

    // Response đã có cấu trúc { success | data | status }
    // (kiểm tra trên raw để key không bị mất do deepClean)
    if (
      isCleanable(response) &&
      !Array.isArray(response) &&
      ('success' in response || 'data' in response || 'status' in response)
    ) {
      return this.buildStructured(response, isList, timestamp);
    }

    const payload = deepClean(response);

    // Rỗng / primitive
    if (payload === undefined || typeof payload !== 'object') {
      return {
        success: true,
        data: isList ? [] : {},
        meta: {},
        timestamp,
      } satisfies ApiResponse;
    }

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
      } satisfies ApiResponse;
    }

    return { success: true, data: payload, meta: {}, timestamp } satisfies ApiResponse;
  }

  private buildStructured(raw: PlainObject, isList: boolean, timestamp: string): ApiResponse {
    let data = deepClean('data' in raw ? raw.data : raw);

    // Bóc tách siêu dữ liệu pagination/meta từ raw nếu chưa được gói vào raw.meta
    const rawMeta =
      raw.meta ??
      ('total' in raw
        ? {
            total: raw.total,
            page: raw.page,
            pageSize: raw.pageSize ?? raw.limit,
            totalPages: raw.totalPages,
          }
        : undefined);
    const metaObj = this.normalizeMeta(deepClean(rawMeta));

    // Triệt tiêu lỗi bọc lồng nhau (Double-wrapped envelope): Nếu data bên trong vẫn chứa vỏ envelope
    while (
      data !== null &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      'data' in (data as PlainObject)
    ) {
      const inner = data as PlainObject;
      if (
        'success' in inner ||
        'status' in inner ||
        Object.keys(inner).length === 1 ||
        Array.isArray(inner.data)
      ) {
        if (!metaObj.pagination && 'total' in inner) {
          const t = Number(inner.total ?? 0);
          const ps = Number(inner.pageSize ?? inner.limit ?? 20);
          metaObj.pagination = {
            total: t,
            page: Number(inner.page ?? 1),
            pageSize: ps,
            totalPages: Number(inner.totalPages ?? (ps > 0 ? Math.ceil(t / ps) : 1)),
          };
        }
        data = inner.data;
      } else {
        break;
      }
    }

    // Nếu endpoint là List hoặc data là danh sách được bọc trong container { items, rows }
    if (
      data !== null &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      !('schema' in (data as PlainObject))
    ) {
      const dObj = data as PlainObject;
      if (Array.isArray(dObj.items)) {
        if (!metaObj.pagination && ('total' in dObj || 'count' in dObj)) {
          const t = Number(dObj.total ?? dObj.count ?? dObj.items.length);
          const ps = Number(dObj.pageSize ?? dObj.limit ?? 20);
          metaObj.pagination = {
            total: t,
            page: Number(dObj.page ?? 1),
            pageSize: ps,
            totalPages: Number(dObj.totalPages ?? (ps > 0 ? Math.ceil(t / ps) : 1)),
          };
        }
        data = dObj.items;
      } else if (Array.isArray(dObj.rows)) {
        if (!metaObj.pagination && ('total' in dObj || 'count' in dObj)) {
          const t = Number(dObj.total ?? dObj.count ?? dObj.rows.length);
          const ps = Number(dObj.pageSize ?? dObj.limit ?? 20);
          metaObj.pagination = {
            total: t,
            page: Number(dObj.page ?? 1),
            pageSize: ps,
            totalPages: Number(dObj.totalPages ?? (ps > 0 ? Math.ceil(t / ps) : 1)),
          };
        }
        data = dObj.rows;
      }
    }

    if (data === undefined) {
      data = isList ? [] : {};
    } else if (isList && !Array.isArray(data)) {
      const isContainer =
        data !== null &&
        typeof data === 'object' &&
        ('schema' in data || 'data' in data || 'items' in data || 'rows' in data);
      if (!isContainer) {
        data = isEmptyObject(data) ? [] : [data];
      }
    }

    if (raw.actions && !metaObj.actions) {
      metaObj.actions = deepClean(raw.actions);
    }
    if (raw.permissions && !metaObj.permissions) {
      metaObj.permissions = deepClean(raw.permissions);
    }

    const result: ApiResponse = {
      success: raw.success !== false && raw.status !== 'error',
      data,
      meta: metaObj,
      timestamp,
    };

    if (raw.message) result.message = raw.message;

    const hubApps = deepClean(raw.hubApps);
    if (hubApps) result.hubApps = hubApps;

    const sidebarMenus = deepClean(raw.sidebarMenus);
    if (sidebarMenus) result.sidebarMenus = sidebarMenus;

    // allowed_paths (snake_case) ưu tiên hơn allowedPaths như code cũ
    const allowedPaths = deepClean(raw.allowed_paths ?? raw.allowedPaths);
    if (allowedPaths) result.allowedPaths = allowedPaths;

    if ('xmlContent' in raw && raw.xmlContent !== undefined) {
      result.xmlContent = raw.xmlContent;
    }
    if ('placeholders' in raw && raw.placeholders !== undefined) {
      result.placeholders = raw.placeholders;
    }

    return result;
  }

  private detectListRequest(req: any): boolean {
    if (!req || req.method !== 'GET') return false;

    const path: string = req.path ?? '';

    if (
      NON_LIST_CONTAINS.some((s) => path.includes(s)) ||
      NON_LIST_SUFFIXES.some((s) => path.endsWith(s))
    ) {
      return false;
    }

    const q = req.query;
    const hasPaginationQuery = !!(q?.page || q?.limit || q?.pageSize);

    if (!hasPaginationQuery && STATS_RE.test(path)) return false;

    const endsWithId =
      UUID_TAIL_RE.test(path) ||
      NUMERIC_TAIL_RE.test(path) ||
      CUID_TAIL_RE.test(path);
    return !endsWithId || hasPaginationQuery;
  }

  private normalizeMeta(meta: unknown): PlainObject {
    if (!meta) return {};
    if (typeof meta !== 'object') return { raw: meta };

    const m = meta as PlainObject;

    if ('pagination' in m) {
      const p = (m.pagination ?? {}) as PlainObject;
      return {
        ...m,
        pagination: {
          total: Number(p.total ?? 0),
          page: Number(p.page ?? 1),
          pageSize: Number(p.pageSize ?? 20),
          totalPages: Number(p.totalPages ?? 1),
        },
      };
    }

    if ('total' in m) {
      const { total, page, pageSize, totalPages: _ignored, ...rest } = m;
      const t = Number(total ?? 0);
      const ps = Number(pageSize ?? 20);
      return {
        pagination: {
          total: t,
          page: Number(page ?? 1),
          pageSize: ps,
          totalPages: ps > 0 ? Math.ceil(t / ps) : 1,
        },
        ...rest,
      };
    }

    return m;
  }
}
