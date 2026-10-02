import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  allowedUpstreamPath,
  canAccessUpstream,
} from '../integration/upstream-access';
import {
  RegistryService,
  UpstreamConfig,
} from '../integration/registry.service';
import { EnvSecretProvider } from '../integration/secrets/env-secret-provider.service';
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
  if (
    !s.params ||
    typeof s.params !== 'object' ||
    Array.isArray(s.params) ||
    Object.keys(s.params).length > 30 ||
    Object.entries(s.params).some(
      ([key, value]) =>
        key.length > 100 ||
        ['__proto__', 'constructor', 'prototype'].includes(key) ||
        typeof value !== 'string' ||
        value.length > 500,
    )
  )
    throw new BadRequestException('Tham số nguồn không hợp lệ');
  return { upstream: s.upstream, path: s.path, params: s.params };
}
export function canReadSource(
  config: UpstreamConfig,
  user: ReportCaller,
): boolean {
  return canAccessUpstream(config, user, 'GET');
}
export function allowedReportPath(path: string, paths: string[]): boolean {
  return allowedUpstreamPath(path, paths);
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
    private readonly registry: RegistryService,
    private readonly secrets: EnvSecretProvider,
  ) {}
  list(user: ReportCaller): ReportSourceOption[] {
    return this.registry
      .getReportSourceConfigs()
      .filter((c) => canReadSource(c, user))
      .map((c) => ({ name: c.name, paths: c.allowedPaths ?? [] }));
  }
  async fetch(input: unknown, user: ReportCaller): Promise<unknown> {
    const source = validateTableSource(input);
    if (!this.registry.checkReady())
      throw new ServiceUnavailableException(
        'Registry liên thông chưa sẵn sàng',
      );
    const upstream = this.registry.getUpstream(source.upstream);
    if (!upstream)
      throw new NotFoundException('Nguồn không tồn tại hoặc đã tắt');
    if (
      !canReadSource(upstream.config, user) ||
      !allowedReportPath(source.path, upstream.config.allowedPaths ?? [])
    )
      throw new ForbiddenException(
        'Không có quyền đọc nguồn/đường dẫn báo cáo',
      );
    const requestId = randomUUID(),
      query = new URLSearchParams(source.params).toString();
    const headers: Record<string, string> = {
      accept: 'application/json',
      'x-request-id': requestId,
    };
    if (upstream.config.type === 'internal') {
      headers['x-user-id'] = String(user.sub ?? user.id ?? '');
      headers['x-unit-id'] = String(user.unitId ?? '');
    }
    const auth = upstream.config.auth as
      | { kind?: string; secretRef?: string }
      | undefined;
    if (auth?.kind && auth.kind !== 'none') {
      if (!['basic', 'apiKey'].includes(auth.kind) || !auth.secretRef)
        throw new ServiceUnavailableException(
          'Nguồn chưa cấu hình xác thực được hỗ trợ',
        );
      const secret = await this.secrets.getSecret(auth.secretRef);
      if (!secret)
        throw new ServiceUnavailableException('Nguồn chưa sẵn sàng xác thực');
      if (auth.kind === 'basic')
        headers.authorization =
          'Basic ' + Buffer.from(secret).toString('base64');
      else headers['x-api-key'] = secret;
    }
    let status = 0;
    try {
      const response = await upstream.breaker.fire({
        method: 'GET',
        path: source.path + (query ? '?' + query : ''),
        headers,
      });
      status = response.statusCode;
      if (status < 200 || status >= 300) {
        response.body.destroy();
        throw new BadGatewayException('API nguồn trả về lỗi');
      }
      const maxBytes = 2 * 1024 * 1024;
      if (Number(response.headers['content-length'] ?? 0) > maxBytes) {
        response.body.destroy();
        throw new PayloadTooLargeException('Dữ liệu nguồn vượt giới hạn 2 MB');
      }
      const chunks: Buffer[] = [];
      let bytes = 0;
      const timer = setTimeout(
        () => response.body.destroy(new Error('Report source body timeout')),
        Math.min(Math.max(upstream.config.timeoutMs || 5000, 1000), 10000),
      );
      try {
        for await (const chunk of response.body) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          bytes += buffer.length;
          if (bytes > maxBytes) {
            response.body.destroy();
            throw new PayloadTooLargeException(
              'Dữ liệu nguồn vượt giới hạn 2 MB',
            );
          }
          chunks.push(buffer);
        }
      } finally {
        clearTimeout(timer);
      }
      let data: unknown;
      try {
        data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        throw new BadGatewayException('API nguồn không trả về JSON hợp lệ');
      }
      if (
        data &&
        typeof data === 'object' &&
        (data as { success?: boolean }).success === false
      )
        throw new BadGatewayException('API nguồn báo lỗi');
      return protectData(
        data,
        user.permissionsFlatten?.includes('VIEW_SENSITIVE_DATA') ?? false,
      );
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof PayloadTooLargeException
      )
        throw error;
      throw new BadGatewayException('Không thể lấy dữ liệu liên thông');
    } finally {
      this.logger.log(
        JSON.stringify({
          action: 'REPORT_SOURCE_READ',
          requestId,
          userId: user.id ?? user.sub,
          upstream: source.upstream,
          path: source.path,
          status,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
