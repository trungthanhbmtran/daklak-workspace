import axios, { AxiosError, type InternalAxiosRequestConfig } from '../../../../admin_khcn/node_modules/axios';
import { installSessionRecovery } from '../../../../admin_khcn/lib/session-recovery';
import { safeAuthCallback } from '../../../../admin_khcn/lib/auth-navigation';

const response = (
  config: InternalAxiosRequestConfig,
  data: unknown = { success: true },
) => ({ data, status: 200, statusText: 'OK', headers: {}, config });
const fail = (config: InternalAxiosRequestConfig, status: number) =>
  Promise.reject(
    new AxiosError('HTTP ' + status, undefined, config, undefined, {
      ...response(config),
      status,
    }),
  );
describe('Browser session recovery', () => {
  it('refreshes once for simultaneous protected API failures and retries each once', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn(),
      errors = jest.fn();
    let calls = 0;
    transport.defaults.adapter = async (config) => {
      calls++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return response(config);
    };
    client.defaults.adapter = (config) =>
      config._sessionRetried
        ? Promise.resolve(response(config, { ok: config.url }))
        : fail(config, 401);
    installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: errors,
    });
    const result = await Promise.all([
      client.get('/auth/me'),
      client.get('/menus/hub'),
      client.get('/notifications'),
    ]);
    expect(result).toEqual([
      { ok: '/auth/me' },
      { ok: '/menus/hub' },
      { ok: '/notifications' },
    ]);
    expect(calls).toBe(1);
    expect(expired).not.toHaveBeenCalled();
  });
  it('reuses a completed refresh for a late 401 from an old request', async () => {
    const client = axios.create(),
      transport = axios.create();
    let calls = 0,
      release!: () => void;
    transport.defaults.adapter = async (config) => {
      calls++;
      return response(config);
    };
    client.defaults.adapter = async (config) => {
      if (config._sessionRetried) return response(config);
      if (config.url === '/slow')
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      return fail(config, 401);
    };
    installSessionRecovery(client, transport, {
      onExpired: jest.fn(),
      onError: jest.fn(),
    });
    const slow = client.get('/slow');
    await client.get('/fast');
    release();
    await slow;
    expect(calls).toBe(1);
  });
  it('cleans up and redirects once if refresh is rejected, with no retry loop', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn();
    let refreshes = 0,
      logouts = 0;
    transport.defaults.adapter = (config) => {
      if (config.url === '/auth/refresh') {
        refreshes++;
        return fail(config, 401);
      }
      logouts++;
      return Promise.resolve(response(config));
    };
    client.defaults.adapter = (config) => fail(config, 401);
    installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: jest.fn(),
    });
    await Promise.allSettled([
      client.get('/auth/me'),
      client.get('/menus/hub'),
    ]);
    await expect(client.get('/another')).rejects.toBeDefined();
    expect(refreshes).toBe(1);
    expect(logouts).toBe(1);
    expect(expired).toHaveBeenCalledTimes(1);
  });
  it('never refreshes login, logout or explicit login verification failures', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn();
    const adapter = jest.fn((config) => Promise.resolve(response(config)));
    transport.defaults.adapter = adapter;
    client.defaults.adapter = (config) => fail(config, 401);
    installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: jest.fn(),
    });
    await Promise.allSettled([
      client.post('/auth/login'),
      client.post('/auth/logout'),
      client.get('/auth/me', { skipSessionRecovery: true }),
    ]);
    expect(adapter).not.toHaveBeenCalled();
    expect(expired).not.toHaveBeenCalled();
  });
  it('stops after one retry when even the refreshed token is rejected', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn();
    let requests = 0;
    transport.defaults.adapter = async (config) => response(config);
    client.defaults.adapter = (config) => {
      requests++;
      return fail(config, 401);
    };
    installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: jest.fn(),
    });
    await expect(client.get('/auth/me')).rejects.toBeDefined();
    expect(requests).toBe(2);
    expect(expired).toHaveBeenCalledTimes(1);
  });
  it('preserves the session on refresh outages and does not refresh 403 responses', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn(),
      errors = jest.fn();
    transport.defaults.adapter = (config) => fail(config, 503);
    client.defaults.adapter = (config) =>
      fail(config, config.url === '/forbidden' ? 403 : 401);
    installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: errors,
    });
    await Promise.allSettled([
      client.get('/auth/me'),
      client.get('/forbidden'),
    ]);
    expect(expired).not.toHaveBeenCalled();
    expect(errors).toHaveBeenCalledTimes(2);
  });
});
describe('Safe login destinations', () => {
  it.each([
    null,
    '',
    '//evil.test',
    'https://evil.test',
    '/%2f%2fevil.test',
    '/login',
    '/admin/login',
    '/session/refresh',
    '/api/test',
    '/\\evil.test',
  ])('rejects external or recursive destination %s', (value) => {
    expect(safeAuthCallback(value)).toBe('/hub');
  });
  it('normalizes the Next base path and preserves valid query strings', () => {
    expect(safeAuthCallback('/admin/hub?tab=1')).toBe('/hub?tab=1');
    expect(safeAuthCallback('/services/hrm')).toBe('/services/hrm');
  });
});

