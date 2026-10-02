import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from '../../../../admin_khcn/node_modules/axios';
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
    '/session/refresh/',
    '/admin/%73ession/refresh',
    '/admin/%6cogin',
    '/login/',
    '/admin/%2f%2fevil.test',
    '/api/test',
    '/\\evil.test',
  ])('rejects external or recursive destination %s', (value) => {
    expect(safeAuthCallback(value)).toBe('/hub');
  });
  it('returns the canonical local path after dot segments are removed', () => {
    expect(safeAuthCallback('/admin/reports/../hub?tab=1')).toBe('/hub?tab=1');
  });
  it('normalizes the Next base path and preserves valid query strings', () => {
    expect(safeAuthCallback('/admin/hub?tab=1')).toBe('/hub?tab=1');
    expect(safeAuthCallback('/admin/hub?filter=a%26b%3Dc')).toBe(
      '/hub?filter=a%26b%3Dc',
    );
    expect(safeAuthCallback('/services/hrm')).toBe('/services/hrm');
  });
});

describe('Authentication transitions and shared-cookie races', () => {
  const turn = () => new Promise((resolve) => setImmediate(resolve));
  it('confirms the shared cookie after a parallel tab refresh without clearing it', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn();
    const calls: string[] = [];
    transport.defaults.adapter = (config) => {
      calls.push(config.url!);
      return config.url === '/auth/refresh'
        ? fail(config, 409)
        : Promise.resolve(response(config));
    };
    client.defaults.adapter = (config) =>
      config._sessionRetried
        ? Promise.resolve(response(config))
        : fail(config, 401);
    installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: jest.fn(),
    });
    await client.get('/protected');
    expect(calls).toEqual(['/auth/refresh', '/auth/me']);
    expect(expired).not.toHaveBeenCalled();
  });
  it('never expires another tab when its cookie has not arrived after a refresh conflict', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn(),
      errors = jest.fn();
    const calls: string[] = [];
    transport.defaults.adapter = (config) => {
      calls.push(config.url!);
      return fail(config, config.url === '/auth/refresh' ? 409 : 401);
    };
    client.defaults.adapter = (config) => fail(config, 401);
    installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: errors,
    });
    await expect(client.get('/protected')).rejects.toMatchObject({
      response: { status: 409 },
    });
    expect(calls).toEqual(['/auth/refresh', '/auth/me']);
    expect(expired).not.toHaveBeenCalled();
    expect(errors).toHaveBeenCalledTimes(1);
  });
  it('waits for an old refresh before login and does not log out the newer login', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn();
    let release!: () => void,
      loggedIn = false;
    const calls: string[] = [];
    transport.defaults.adapter = async (config) => {
      calls.push(config.url!);
      if (config.url === '/auth/refresh') {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return fail(config, 401);
      }
      return response(config);
    };
    client.defaults.adapter = (config) => {
      if (config.url === '/auth/login') {
        loggedIn = true;
        calls.push('login');
        return Promise.resolve(response(config));
      }
      return loggedIn ? Promise.resolve(response(config)) : fail(config, 401);
    };
    const lifecycle = installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: jest.fn(),
    });
    const protectedCall = client.get('/protected');
    await turn();
    const login = lifecycle.login(() => client.post('/auth/login'));
    await turn();
    expect(loggedIn).toBe(false);
    release();
    await Promise.all([login, protectedCall]);
    expect(calls).toEqual(['/auth/refresh', 'login']);
    expect(expired).not.toHaveBeenCalled();
  });
  it('orders logout after the last refresh cookie write and prevents a post-logout replay', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn();
    let release!: () => void;
    const calls: string[] = [];
    transport.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        calls.push('refresh-start');
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        calls.push('refresh-set-cookie');
      } else calls.push('logout-clear-cookie');
      return response(config);
    };
    const protectedAdapter = jest.fn((config) => fail(config, 401));
    client.defaults.adapter = protectedAdapter;
    const lifecycle = installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: jest.fn(),
    });
    const protectedCall = client.get('/protected');
    const protectedResult = protectedCall.catch(() => undefined);
    await turn();
    const logout = lifecycle.logout();
    await turn();
    expect(calls).toEqual(['refresh-start']);
    release();
    await Promise.all([logout, protectedResult]);
    expect(calls).toEqual([
      'refresh-start',
      'refresh-set-cookie',
      'logout-clear-cookie',
    ]);
    expect(protectedAdapter).toHaveBeenCalledTimes(1);
    expect(expired).not.toHaveBeenCalled();
  });
  it('does not expire a new login when an old retry returns a late 401', async () => {
    const client = axios.create(),
      transport = axios.create(),
      expired = jest.fn();
    let release!: () => void,
      loggedIn = false;
    transport.defaults.adapter = jest.fn(async (config) => response(config));
    client.defaults.adapter = async (config) => {
      if (config.url === '/auth/login') {
        loggedIn = true;
        return response(config);
      }
      if (loggedIn) return response(config);
      if (config._sessionRetried)
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      return fail(config, 401);
    };
    const lifecycle = installSessionRecovery(client, transport, {
      onExpired: expired,
      onError: jest.fn(),
    });
    const protectedCall = client.get('/protected');
    await turn();
    await lifecycle.login(() => client.post('/auth/login'));
    release();
    await protectedCall;
    expect(transport.defaults.adapter).toHaveBeenCalledTimes(1);
    expect(expired).not.toHaveBeenCalled();
  });
});
