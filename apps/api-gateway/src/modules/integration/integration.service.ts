import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { pipeline } from 'stream/promises';
import { RegistryService } from './registry.service';
import { EnvSecretProvider } from './secrets/env-secret-provider.service';
import {
  allowedUpstreamPath,
  canAccessUpstream,
  type UpstreamCaller,
} from './upstream-access';
import { clientIp } from '../../core/client-ip';

const HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function connectionHeaders(value: string | string[] | undefined): Set<string> {
  return new Set(
    (Array.isArray(value) ? value.join(',') : (value ?? ''))
      .split(',')
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean),
  );
}

type ProxyRequest = Request & { user?: UpstreamCaller };

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    private readonly registry: RegistryService,
    private readonly secretProvider: EnvSecretProvider,
  ) {}

  public async proxyMiddleware(
    req: ProxyRequest,
    res: Response,
    next: () => void,
  ) {
    const url = req.originalUrl || req.url;
    const queryIndex = url.indexOf('?');
    const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
    const match =
      /^\/(?:api\/v1\/)?(?:admin\/)?gw\/([a-zA-Z0-9_-]{1,100})(\/.*)?$/.exec(
        pathname,
      );
    if (!match) return next();

    const upstreamName = match[1];
    const path = match[2] || '/';
    const upstream = this.registry.getUpstream(upstreamName);
    if (!upstream) {
      return res
        .status(404)
        .json({ success: false, message: 'Nguồn không tồn tại hoặc đã tắt' });
    }
    const caller = req.user;
    if (!caller) {
      return res
        .status(401)
        .json({ success: false, message: 'Thiếu phiên đăng nhập' });
    }
    const permissions = new Set(caller.permissionsFlatten ?? []);
    if (
      (!permissions.has('INTEGRATION:READ') &&
        !permissions.has('INTEGRATION:MANAGE')) ||
      !canAccessUpstream(upstream.config, caller, req.method) ||
      !allowedUpstreamPath(path, upstream.config.allowedPaths ?? [])
    ) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập nguồn, phương thức hoặc đường dẫn',
      });
    }

    const requestId = randomUUID();
    const startedAt = Date.now();
    let responseStatus = 502;
    try {
      const blocked = connectionHeaders(req.headers.connection);
      const headers: Record<string, string | string[] | undefined> = {};
      for (const [name, value] of Object.entries(req.headers)) {
        if (
          HOP_HEADERS.has(name) ||
          blocked.has(name) ||
          [
            'host',
            'content-length',
            'cookie',
            'authorization',
            'x-api-key',
            'x-real-ip',
            'forwarded',
            'x-csrf-token',
            'x-access-token',
            'x-refresh-token',
            'x-request-id',
          ].includes(name) ||
          name.startsWith('x-user-') ||
          name.startsWith('x-unit-') ||
          name.startsWith('x-auth-') ||
          name.startsWith('x-permission') ||
          name.startsWith('x-forwarded-')
        )
          continue;
        headers[name] = value;
      }

      // Internal context comes from the verified session. External partners get no Hub identity.
      if (upstream.config.type === 'internal') {
        headers['x-user-id'] = String(caller.sub ?? caller.id ?? '');
        headers['x-unit-id'] = String(caller.unitId ?? '');
      }
      headers['x-request-id'] = requestId;

      const auth = upstream.config.auth as
        | { kind?: string; secretRef?: string }
        | undefined;
      if (auth?.kind && auth.kind !== 'none') {
        if (!['basic', 'apiKey'].includes(auth.kind) || !auth.secretRef) {
          responseStatus = 503;
          return res.status(503).json({
            success: false,
            message: 'Nguồn chưa cấu hình xác thực được hỗ trợ',
          });
        }
        const secret = await this.secretProvider.getSecret(auth.secretRef);
        if (!secret) {
          responseStatus = 503;
          return res
            .status(503)
            .json({ success: false, message: 'Nguồn chưa sẵn sàng xác thực' });
        }
        if (auth.kind === 'basic')
          headers.authorization =
            'Basic ' + Buffer.from(secret).toString('base64');
        else headers['x-api-key'] = secret;
      }

      const {
        statusCode,
        headers: responseHeaders,
        body,
      } = await upstream.breaker.fire({
        path: path + (queryIndex === -1 ? '' : url.slice(queryIndex)),
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      });
      responseStatus = statusCode;
      res.status(statusCode);
      const responseBlocked = connectionHeaders(responseHeaders.connection);
      for (const [name, value] of Object.entries(responseHeaders)) {
        if (
          value &&
          name.toLowerCase() !== 'set-cookie' &&
          !HOP_HEADERS.has(name.toLowerCase()) &&
          !responseBlocked.has(name.toLowerCase())
        ) {
          res.setHeader(name, value as string | string[]);
        }
      }
      await pipeline(body, res);
    } catch (error: unknown) {
      const rpc = (error ?? {}) as { type?: string; code?: string };
      responseStatus =
        rpc.type === 'open'
          ? 503
          : ['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT'].includes(
                rpc.code ?? '',
              )
            ? 504
            : 502;
      this.logger.warn(
        JSON.stringify({
          event: 'INTEGRATION_PROXY_FAILED',
          requestId,
          upstream: upstreamName,
          status: responseStatus,
        }),
      );
      if (!res.headersSent) {
        return res.status(responseStatus).json({
          success: false,
          message: 'Dịch vụ liên thông tạm thời không khả dụng',
        });
      }
      res.destroy();
    } finally {
      this.logger.log(
        JSON.stringify({
          event: 'INTEGRATION_PROXY',
          requestId,
          upstream: upstreamName,
          userId: caller.sub ?? caller.id,
          ip: clientIp(req),
          method: req.method,
          status: responseStatus,
          durationMs: Date.now() - startedAt,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
