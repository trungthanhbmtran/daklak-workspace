import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  BadGatewayException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { allowedUpstreamPath } from '../../core/utils/upstream-access';
import { GatewayRegistryService } from '../api-management/registry.service';
import { ExecutorService } from '../api-management/executor.service';
import type {
  ReportSourceOption,
  TableSource,
} from '../../../../../shared/reporting/table-contract';

export interface ReportCaller {
  id?: number;
  sub?: string;
  unitId?: string | number;
  roles?: string[];
  permissionsFlatten?: string[];
}

export function validateTableSource(input: unknown): TableSource {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Nguồn báo cáo không hợp lệ');
  const s = input as TableSource;
  if (
    typeof s.upstream !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(s.upstream)
  )
    throw new BadRequestException('Tên nguồn không hợp lệ');
  if (
    typeof s.path !== 'string' ||
    s.path.length > 512 ||
    !s.path.startsWith('/') ||
    /[%\\?#\s]/.test(s.path) ||
    s.path.includes('//') ||
    s.path.split('/').some((p) => p === '.' || p === '..')
  )
    throw new BadRequestException('Đường dẫn nguồn không hợp lệ');
  return { upstream: s.upstream, path: s.path, params: s.params || {} };
}

function protectData(value: unknown, sensitive: boolean, depth = 0): unknown {
  if (depth > 16)
    throw new BadGatewayException('Cấu trúc dữ liệu nguồn quá sâu');
  if (Array.isArray(value))
    return value.map((v) => protectData(v, sensitive, depth + 1));
  if (!value || typeof value !== 'object') return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
    const normalized = key.replace(/[_-]/g, '').toLowerCase();
    if (/(password|secret|token|apikey|privatekey)/.test(normalized)) continue;
    if (
      !sensitive &&
      /^(email|phone|phonenumber|mobile|cccd|cmnd|identitynumber|idcard|salary|luong|sodienthoai|socccd)$/.test(
        normalized,
      )
    ) {
      result[key] = '***';
      continue;
    }
    result[key] = protectData(item, sensitive, depth + 1);
  }
  return result;
}

@Injectable()
export class ReportSourceService {
  private readonly logger = new Logger(ReportSourceService.name);
  
  constructor(
    private readonly registry: GatewayRegistryService,
    private readonly executor: ExecutorService,
  ) {}

  list(user: ReportCaller): ReportSourceOption[] {
    const conns = this.registry.getAllConnections();
    const options: ReportSourceOption[] = [];
    
    for (const c of conns) {
      if (!c.enabled) continue;
      // Filter for endpoints with GET methods and map paths
      const paths = c.endpoints
        .filter((e: any) => e.method === 'GET' || e.method === 'get')
        .map((e: any) => e.pathTemplate);
        
      if (paths.length > 0) {
        options.push({ upstream: c.code, name: c.displayName || c.code, paths });
      }
    }
    
    return options;
  }

  async fetch(input: unknown, user: ReportCaller): Promise<unknown> {
    const source = validateTableSource(input);
    const requestId = randomUUID();
    const query = new URLSearchParams(source.params as any).toString();
    const fullPath = source.path + (query ? '?' + query : '');

    try {
      const result = await this.executor.executeRequest(
        source.upstream,
        'GET',
        fullPath,
        { accept: 'application/json', 'x-request-id': requestId },
        null,
        user
      );

      if (result.status < 200 || result.status >= 300) {
        throw new BadGatewayException('API nguồn trả về lỗi');
      }

      let data = result.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch {}
      }

      if (data && typeof data === 'object' && (data as any).success === false) {
        throw new BadGatewayException('API nguồn báo lỗi');
      }

      return protectData(
        data,
        user.permissionsFlatten?.includes('VIEW_SENSITIVE_DATA') ?? false,
      );
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof BadGatewayException) {
        throw error;
      }
      this.logger.error(`Report fetch failed: ${error.message}`);
      throw new BadGatewayException('Không thể lấy dữ liệu liên thông');
    } finally {
      this.logger.log(
        JSON.stringify({
          action: 'REPORT_SOURCE_READ',
          requestId,
          userId: user.id ?? user.sub,
          upstream: source.upstream,
          path: source.path,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
