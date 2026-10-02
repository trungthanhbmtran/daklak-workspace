jest.mock('@/database/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hashSync: jest.fn(() => 'dummy'),
  hash: jest.fn(() => Promise.resolve('hash')),
}));
import { UsersService } from './users.service';
import { RefreshConflictError } from './auth-session.store';


import * as bcrypt from 'bcrypt';

describe('Internal account session contract', () => {

  const profile = {
    id: 7,
    isActive: true, authVersion: 0,
    permissionsFlatten: ['MENU:READ'],
    unitId: 3,
  };
  const user = {
    id: 7,
    username: 'test', authVersion: 0, isActive: true,
    credential: { passwordHash: 'hash' },
    jobPositions: [],
    policies: [],
  };
  const sessions = {
    policy: { accessSeconds: 900 },
    setSession: jest.fn(),
    revokeSession: jest.fn(),
    createSession: jest.fn(),
    touchSession: jest.fn(),
    assertLoginAllowed: jest.fn(),
    clearLoginFailures: jest.fn(),
    recordLoginFailure: jest.fn(),
    revokeAllForUser: jest.fn(),
  };
  const devices = { create: jest.fn(), read: jest.fn(), rotate: jest.fn(), revoke: jest.fn() };
  const prisma = {
    user: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    credential: { upsert: jest.fn(), update: jest.fn() },
    authStateSync: { upsert: jest.fn() },
    $transaction: jest.fn(),
  };
  const session = () => ({
    userId: 7,
    sessionId: '11c6badf-4128-490a-93b3-e105f7f415ce',
    expiresAt: Math.floor(Date.now() / 1000) + 28800, authVersion: 0,
  });
  const oldToken = 'a'.repeat(80);
  let service: UsersService;
  beforeEach(() => {
    jest.resetAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.user.findUnique.mockResolvedValue(user);
    sessions.assertLoginAllowed.mockResolvedValue(true);
    sessions.createSession.mockImplementation(() => Promise.resolve(session()));
    sessions.touchSession.mockResolvedValue(true);
    devices.rotate.mockResolvedValue(true);
    prisma.user.update.mockResolvedValue({ ...user, authVersion: 1 });
    prisma.$transaction.mockImplementation((fn) => fn(prisma));
    service = new UsersService(
      prisma as any,
      sessions as any,
      devices as any,
      { del: jest.fn() } as any,
      {} as any,
      {} as any,
    );
    jest.spyOn(service as any, 'freshAuthProfile').mockResolvedValue(profile);
  });
  it('returns a durable session grant without signing a JWT', async () => {
    const result = await service.login({ usernameOrEmail: 'test', password: 'password' });
    expect(result).toMatchObject({ accessToken: '', sessionId: session().sessionId, userId: 7, expiresIn: 900 });
    expect(devices.create).toHaveBeenCalledWith(result.refreshToken, expect.objectContaining({ authVersion: 0 }));
    expect(sessions.setSession).toHaveBeenCalledWith(7, profile, result.refreshTokenExpiresIn);
  });  it('awaits publishing the authorization context before returning login success', async () => {
    let release!: () => void;
    sessions.setSession.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    let completed = false;
    const pending = service
      .login({ usernameOrEmail: 'test', password: 'password' })
      .then(() => {
        completed = true;
      });
    await new Promise((resolve) => setImmediate(resolve));
    expect(completed).toBe(false);
    release();
    await pending;
    expect(completed).toBe(true);
  });
  it('propagates Redis failure instead of issuing an unusable login', async () => {
    sessions.setSession.mockRejectedValue(new Error('Redis unavailable'));
    await expect(
      service.login({ usernameOrEmail: 'test', password: 'password' }),
    ).rejects.toThrow('Redis unavailable');
  });
  it('rotation preserves the absolute deadline and caps access lifetime to remaining time', async () => {
    const prior = {
      ...session(),
      expiresAt: Math.floor(Date.now() / 1000) + 100,
    };
    devices.read.mockResolvedValue(prior);
    const result = await service.refresh({ refreshToken: oldToken });
    expect(result.expiresIn).toBeLessThanOrEqual(100);
    expect(result.refreshTokenExpiresIn).toBeLessThanOrEqual(100);
    expect(devices.rotate).toHaveBeenCalledWith(
      oldToken,
      result.refreshToken,
      prior,
    );
  });
  it.each([false, null])(
    'rejects revoked/idle-expired or already consumed refresh (%s)',
    async (valid) => {
      devices.read.mockResolvedValue(valid === null ? null : session());
      sessions.touchSession.mockResolvedValue(false);
      await expect(
        service.refresh({ refreshToken: oldToken }),
      ).rejects.toThrow();
      expect(devices.rotate).not.toHaveBeenCalled();
    },
  );
  it('preserves the old refresh token if preparing the new session fails', async () => {
    devices.read.mockResolvedValue(session());
    prisma.user.findFirst.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );
    await expect(service.refresh({ refreshToken: oldToken })).rejects.toThrow(
      'Database unavailable',
    );
    expect(devices.rotate).not.toHaveBeenCalled();
    expect(devices.revoke).not.toHaveBeenCalled();
  });
  it('reports a lost parallel refresh as a conflict rather than an expired session', async () => {
    devices.read
      .mockResolvedValueOnce(session())
      .mockRejectedValueOnce(new RefreshConflictError());
    devices.rotate.mockResolvedValue(false);
    try {
      await service.refresh({ refreshToken: oldToken });
      throw new Error('Expected conflict');
    } catch (error: any) {
      expect(error.getError()).toMatchObject({ code: 10 });
    }
  });
  it('rejects a concurrent refresh that loses the atomic rotation', async () => {
    devices.read.mockResolvedValue(session());
    devices.rotate.mockResolvedValue(false);
    await expect(service.refresh({ refreshToken: oldToken })).rejects.toThrow();
  });
  it('revokes the session linked to refresh on logout', async () => {
    devices.revoke.mockResolvedValue(session().sessionId);
    await service.revokeRefreshToken({ refreshToken: oldToken });
    expect(devices.revoke).toHaveBeenCalledWith(oldToken);
  });
  it('blocks a throttled account before expensive password work', async () => {
    sessions.assertLoginAllowed.mockResolvedValue(false);
    await expect(
      service.login({ usernameOrEmail: 'test', password: 'password' }),
    ).rejects.toThrow();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
  it('counts invalid credentials without exposing whether the account exists', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ usernameOrEmail: 'test', password: 'wrong' }),
    ).rejects.toThrow('Tên đăng nhập hoặc mật khẩu không hợp lệ');
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.login({ usernameOrEmail: 'missing', password: 'wrong' }),
    ).rejects.toThrow('Tên đăng nhập hoặc mật khẩu không hợp lệ');
    expect(sessions.recordLoginFailure).toHaveBeenCalledTimes(2);
  });
  it('preserves password whitespace exactly and rejects bcrypt truncation', async () => {
    await service.login({ usernameOrEmail: 'test', password: ' password ' });
    expect(bcrypt.compare).toHaveBeenCalledWith(' password ', 'hash');
    await expect(
      service.login({ usernameOrEmail: 'test', password: 'a'.repeat(73) }),
    ).rejects.toThrow();
  });
  it('enforces password policy on changes and invalidates every older session', async () => {
    await expect(
      service.setPassword({ userId: 7, newPassword: 'short' }),
    ).rejects.toThrow();
    expect(prisma.credential.update).not.toHaveBeenCalled();
    await service.setPassword({
      userId: 7,
      newPassword: 'long passphrase 123',
    });
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith(7, 1);
  });
  it('invalidates sessions when an administrator disables the account', async () => {
    await service.setUserActive({ userId: 7, isActive: false });
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith(7, 1);
  });
});

