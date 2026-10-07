import { PassThrough, Writable } from 'stream';
import { IntegrationService } from './integration.service';
import type { UpstreamConfig } from './registry.service';

describe('Integration proxy security boundaries', () => {
  let config: UpstreamConfig;
  let fire: jest.Mock;
  let getSecret: jest.Mock;
  let service: IntegrationService;

  beforeEach(() => {
    config = {
      name: 'agency',
      type: 'external',
      baseUrl: 'https://agency.example.test',
      allowedPaths: ['/records/*'],
      allowedMethods: ['GET'],
      auth: { kind: 'none' },
      roles: [],
      scopes: ['integration:read'],
      timeoutMs: 5000,
      retry: {},
      cacheTtlSec: 0,
      rateLimit: {},
      version: 1,
      enabled: true,
    };
    fire = jest.fn().mockImplementation(() => {
      const body = new PassThrough();
      body.end('ok');
      return Promise.resolve({ statusCode: 200, headers: {}, body });
    });
    getSecret = jest.fn().mockResolvedValue('partner-credential');
    const rateLimiter = {
      check: jest.fn().mockResolvedValue({ allowed: true, remaining: 99, retryAfterSec: 0 }),
    };
    service = new IntegrationService(
      { getUpstream: () => ({ config, breaker: { fire } }) } as never,
      { getSecret } as never,
      rateLimiter as never,
    );
  });

  function response() {
    const res = new Writable({
      write: (_chunk, _encoding, callback) => callback(),
    });
    return Object.assign(res, {
      status: jest.fn().mockReturnValue(res),
      json: jest.fn(),
      setHeader: jest.fn(),
    });
  }

  function request(overrides: Record<string, unknown> = {}) {
    return {
      originalUrl: '/api/v1/gw/agency/records/list',
      method: 'GET',
      headers: {
        cookie: 'accessToken=browser-secret; refreshToken=browser-refresh',
        authorization: 'Bearer browser-secret',
        'x-api-key': 'client-key',
        'x-user-email': 'person@example.test',
        'x-user-id': '999',
      },
      user: {
        id: 7,
        permissionsFlatten: ['INTEGRATION:READ', 'integration:read'],
      },
      ...overrides,
    };
  }

  it.each([
    { method: 'DELETE' },
    { originalUrl: '/api/v1/gw/agency/private' },
    { user: { id: 7, permissionsFlatten: [] } },
  ])(
    'rejects a request outside configured method, path or permissions: %j',
    async (overrides) => {
      const res = response();
      await service.proxyMiddleware(
        request(overrides) as never,
        res as never,
        jest.fn(),
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it('requires the existing INTEGRATION permission even when source scopes are empty', async () => {
    config.scopes = [];
    const res = response();
    await service.proxyMiddleware(
      request({ user: { id: 7, permissionsFlatten: [] } }) as never,
      res as never,
      jest.fn(),
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(fire).not.toHaveBeenCalled();
  });

  it('keeps query parameters intact while checking the registered pathname', async () => {
    await service.proxyMiddleware(
      request({
        originalUrl:
          '/api/v1/gw/agency/records/list?search=%2Fprivate&limit=10',
      }) as never,
      response() as never,
      jest.fn(),
    );
    expect(fire.mock.calls[0][0].path).toBe(
      '/records/list?search=%2Fprivate&limit=10',
    );
  });

  it('replaces spoofed identity with verified context for internal upstreams', async () => {
    config.type = 'internal';
    await service.proxyMiddleware(
      request({
        user: {
          id: 7,
          unitId: 11,
          permissionsFlatten: ['INTEGRATION:READ', 'integration:read'],
        },
      }) as never,
      response() as never,
      jest.fn(),
    );
    const { headers } = fire.mock.calls[0][0];
    expect(headers['x-user-id']).toBe('7');
    expect(headers['x-unit-id']).toBe('11');
    expect(headers['x-user-email']).toBeUndefined();
    expect(headers.cookie).toBeUndefined();
  });

  it.each(['bearer', 'mtls', 'oauth2_client_credentials'])(
    'rejects unsupported partner authentication %s before forwarding',
    async (kind) => {
      config.auth = { kind, secretRef: 'configured' };
      const res = response();
      await service.proxyMiddleware(
        request() as never,
        res as never,
        jest.fn(),
      );
      expect(res.status).toHaveBeenCalledWith(503);
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it.each(['none', 'basic', 'apiKey'])(
    'never forwards browser credentials or identity to external %s upstreams',
    async (kind) => {
      config.auth = {
        kind,
        ...(kind !== 'none' ? { secretRef: 'partner-key' } : {}),
      };
      await service.proxyMiddleware(
        request() as never,
        response() as never,
        jest.fn(),
      );
      const { headers } = fire.mock.calls[0][0];
      expect(headers.cookie).toBeUndefined();
      expect(headers['x-user-email']).toBeUndefined();
      expect(headers['x-user-id']).toBeUndefined();
      expect(headers.authorization).toBe(
        kind === 'basic'
          ? 'Basic ' + Buffer.from('partner-credential').toString('base64')
          : undefined,
      );
      expect(headers['x-api-key']).toBe(
        kind === 'apiKey' ? 'partner-credential' : undefined,
      );
    },
  );

  it('fails closed when a configured partner secret is missing', async () => {
    config.auth = { kind: 'apiKey', secretRef: 'missing' };
    getSecret.mockResolvedValue(undefined);
    const res = response();
    await service.proxyMiddleware(request() as never, res as never, jest.fn());
    expect(res.status).toHaveBeenCalledWith(503);
    expect(fire).not.toHaveBeenCalled();
  });

  it('prevents an upstream from setting Hub login cookies', async () => {
    fire.mockImplementation(() => {
      const body = new PassThrough();
      body.end('ok');
      return Promise.resolve({
        statusCode: 200,
        headers: {
          'set-cookie': ['accessToken=forged; Path=/'],
          'content-type': 'text/plain',
        },
        body,
      });
    });
    const res = response();
    await service.proxyMiddleware(request() as never, res as never, jest.fn());
    expect(res.setHeader).not.toHaveBeenCalledWith(
      'set-cookie',
      expect.anything(),
    );
    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'text/plain');
  });
});
