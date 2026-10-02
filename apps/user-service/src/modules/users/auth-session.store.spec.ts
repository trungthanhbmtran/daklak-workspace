jest.mock('ioredis', () => ({ __esModule: true, default: jest.fn() }));
import Redis from 'ioredis';
import { createHash } from 'crypto';
import { AuthSessionStore, RefreshConflictError } from './auth-session.store';
import { getAuthPolicy } from '../../../../../shared/core/auth-session';

describe('Shared authentication state', () => {
  const client = {
    on: jest.fn(),
    set: jest.fn(),
    eval: jest.fn(),
    get: jest.fn(),
    time: jest.fn(),
    incr: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn(),
  };
  const session = {
    userId: 7,
    sessionId: '11c6badf-4128-490a-93b3-e105f7f415ce',
    expiresAt: 40000, authVersion: 4,
  };
  const tokenKey =
    'auth:refresh:' +
    createHash('sha256').update('private-token').digest('hex');
  let store: AuthSessionStore;
  beforeEach(() => {
    jest.resetAllMocks();
    (Redis as unknown as jest.Mock).mockImplementation(() => client);
    client.time.mockResolvedValue(['1000', '0']);
    client.get.mockResolvedValue(null);
    store = new AuthSessionStore({
      get: (_key: string, fallback?: string) => fallback,
    } as any);
  });
  it('publishes authorization JSON without credentials', async () => {
    await store.setSession(
      7,
      {
        id: 7,
        permissionsFlatten: ['MENU:READ'],
        accessToken: 'secret',
        refreshToken: 'secret',
      },
      900,
    );
    expect(client.set).toHaveBeenCalledWith(
      'user_session:7',
      JSON.stringify({ id: 7, permissionsFlatten: ['MENU:READ'] }),
      'EX',
      900,
    );
  });
  it('creates an idle-limited session with an absolute deadline and current user version', async () => {
    client.eval.mockResolvedValue(1);
    const result = await store.createSession(7, 4);
    expect(result.expiresAt).toBe(29800);
    expect(client.eval).toHaveBeenCalledWith(expect.any(String), 2, 'auth:user:version:db:7', 'auth:session:' + result.sessionId, 4, JSON.stringify({ ...result, version: 4 }), 1800);
  });
  it('checks active status and user generation with the same atomic policy as gateway', async () => {
    client.eval.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    expect(await store.touchSession(session)).toBe(true);
    expect(await store.touchSession(session)).toBe(false);
    expect(client.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('TIME')"),
      2,
      'auth:session:' + session.sessionId,
      'auth:user:version:db:7',
      '7',
      1800,
    );
  });
  it('invalidates every older session without scanning all session keys', async () => {
    await store.revokeAllForUser(7, 5);
    expect(client.eval).toHaveBeenCalledWith(expect.any(String), 2, 'auth:user:version:db:7', 'user_session:7', 5);

  });
  it('uses the shared configured limit for failed login attempts', async () => {
    client.get.mockResolvedValue('5');
    expect(await store.assertLoginAllowed('Test')).toBe(false);
    await store.recordLoginFailure('Test');
    expect(client.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('INCR'"),
      1,
      expect.any(String),
      900,
    );
  });
  it('disconnects on shutdown', () => {
    store.onModuleDestroy();
    expect(client.disconnect).toHaveBeenCalled();
  });
});

describe('One authentication policy for issuer and gateway', () => {
  it('loads documented internal-account defaults', () => {
    expect(getAuthPolicy(() => undefined)).toMatchObject({
      accessSeconds: 900,
      idleSeconds: 1800,
      absoluteSeconds: 28800,
      failureLimit: 5,
      secureCookie: false,
    });
  });
  it('accepts explicit deployment durations and ignores legacy JWT_EXPIRES_IN', () => {
    const config: Record<string, string> = {
      AUTH_ACCESS_TTL_SECONDS: '10m',
      AUTH_SESSION_MAX_SECONDS: '4h',
      AUTH_IDLE_TIMEOUT_SECONDS: '20m',
      AUTH_COOKIE_SECURE: 'true',
      JWT_EXPIRES_IN: '7d',
    };
    expect(getAuthPolicy((key) => config[key])).toMatchObject({
      accessSeconds: 600,
      absoluteSeconds: 14400,
      idleSeconds: 1200,
      secureCookie: true,
    });
  });
  it.each(['0', '-1', 'invalid', '1.5h', '999999999999999999d'])(
    'rejects invalid duration %s at startup',
    (value) => {
      expect(() =>
        getAuthPolicy((key) =>
          key === 'AUTH_ACCESS_TTL_SECONDS' ? value : undefined,
        ),
      ).toThrow();
    },
  );
  it('rejects duration suffixes in a login attempt count', () => {
    expect(() =>
      getAuthPolicy((key) =>
        key === 'AUTH_LOGIN_FAILURE_LIMIT' ? '1m' : undefined,
      ),
    ).toThrow();
  });
  it('rejects idle/access limits longer than the absolute deadline', () => {
    expect(() =>
      getAuthPolicy((key) =>
        key === 'AUTH_SESSION_MAX_SECONDS' ? '5m' : undefined,
      ),
    ).toThrow();
  });
});

