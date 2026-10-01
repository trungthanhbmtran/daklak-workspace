jest.mock('@/database/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('bcrypt', () => ({ compare: jest.fn(), hashSync: jest.fn(() => 'dummy'), hash: jest.fn(async () => 'hash') }));
import { UsersService } from './users.service';
import { IntegrationAuthService } from '../integration-config/integration-auth.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

describe('Internal account session contract', () => {
  const signer = new IntegrationAuthService();
  const profile = { id: 7, isActive: true, permissionsFlatten: ['MENU:READ'], unitId: 3 };
  const user = { id: 7, username: 'test', credential: { passwordHash: 'hash' }, jobPositions: [], policies: [] };
  const sessions = {
    setSession: jest.fn(), setRefresh: jest.fn(), consumeRefresh: jest.fn(), revokeRefresh: jest.fn(),
    createSession: jest.fn(), touchSession: jest.fn(), assertLoginAllowed: jest.fn(),
    clearLoginFailures: jest.fn(), recordLoginFailure: jest.fn(), revokeAllForUser: jest.fn(),
  };
  const prisma = { user: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() }, credential: { update: jest.fn() } };
  const config = { get: jest.fn(() => undefined) };
  const session = () => ({ userId: 7, sessionId: '11c6badf-4128-490a-93b3-e105f7f415ce', expiresAt: Math.floor(Date.now() / 1000) + 28800 });
  const oldToken = 'a'.repeat(80);
  let service: UsersService;
  beforeEach(() => {
    jest.resetAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.user.findUnique.mockResolvedValue(user);
    sessions.assertLoginAllowed.mockResolvedValue(true);
    sessions.createSession.mockImplementation(async () => session());
    sessions.touchSession.mockResolvedValue(true);
    service = new UsersService(prisma as any, config as any, signer, sessions as any, { del: jest.fn() } as any, {} as any, {} as any);
    jest.spyOn(service, 'findOne').mockResolvedValue(profile as any);
  });
  it('issues RS256 tokens with a unique server session and 15 minute access lifetime', async () => {
    const result = await service.login({ usernameOrEmail: 'test', password: 'password' });
    const verified = jwt.verify(result.accessToken, signer.getPublicKeyDetails().publicKey,
      { algorithms: ['RS256'], issuer: 'daklak-user-service', audience: 'daklak-api-gateway' }) as jwt.JwtPayload;
    expect(verified).toMatchObject({ sub: '7', sid: session().sessionId });
    expect(verified.exp! - verified.iat!).toBe(900);
    expect(result.refreshTokenExpiresIn).toBeGreaterThanOrEqual(28798);
    expect(result.refreshTokenExpiresIn).toBeLessThanOrEqual(28800);
    expect(sessions.setSession).toHaveBeenCalledWith(7, profile, result.refreshTokenExpiresIn);
  });
  it('awaits publishing the authorization context before returning login success', async () => {
    let release!: () => void;
    sessions.setSession.mockReturnValue(new Promise<void>(resolve => { release = resolve; }));
    let completed = false;
    const pending = service.login({ usernameOrEmail: 'test', password: 'password' }).then(() => { completed = true; });
    await new Promise(resolve => setImmediate(resolve));
    expect(completed).toBe(false); release(); await pending; expect(completed).toBe(true);
  });
  it('propagates Redis failure instead of issuing an unusable login', async () => {
    sessions.setSession.mockRejectedValue(new Error('Redis unavailable'));
    await expect(service.login({ usernameOrEmail: 'test', password: 'password' })).rejects.toThrow('Redis unavailable');
  });
  it('rotation preserves the absolute deadline and caps access lifetime to remaining time', async () => {
    const prior = { ...session(), expiresAt: Math.floor(Date.now() / 1000) + 100 };
    sessions.consumeRefresh.mockResolvedValue(prior);
    const result = await service.refresh({ refreshToken: oldToken });
    expect(result.expiresIn).toBeLessThanOrEqual(100);
    expect(result.refreshTokenExpiresIn).toBeLessThanOrEqual(100);
    expect(sessions.setRefresh).toHaveBeenCalledWith(result.refreshToken, prior, result.refreshTokenExpiresIn);
  });
  it.each([false, null])('rejects revoked/idle-expired or already consumed refresh (%s)', async valid => {
    sessions.consumeRefresh.mockResolvedValue(valid === null ? null : session());
    sessions.touchSession.mockResolvedValue(false);
    await expect(service.refresh({ refreshToken: oldToken })).rejects.toThrow();
    expect(sessions.setRefresh).not.toHaveBeenCalled();
  });
  it('revokes the session linked to refresh on logout', async () => {
    await service.revokeRefreshToken({ refreshToken: oldToken });
    expect(sessions.revokeRefresh).toHaveBeenCalledWith(oldToken);
  });
  it('blocks a throttled account before expensive password work', async () => {
    sessions.assertLoginAllowed.mockResolvedValue(false);
    await expect(service.login({ usernameOrEmail: 'test', password: 'password' })).rejects.toThrow();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
  it('counts invalid credentials without exposing whether the account exists', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login({ usernameOrEmail: 'test', password: 'wrong' })).rejects.toThrow('Tên đăng nhập hoặc mật khẩu không hợp lệ');
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.login({ usernameOrEmail: 'missing', password: 'wrong' })).rejects.toThrow('Tên đăng nhập hoặc mật khẩu không hợp lệ');
    expect(sessions.recordLoginFailure).toHaveBeenCalledTimes(2);
  });
  it('preserves password whitespace exactly and rejects bcrypt truncation', async () => {
    await service.login({ usernameOrEmail: 'test', password: ' password ' });
    expect(bcrypt.compare).toHaveBeenCalledWith(' password ', 'hash');
    await expect(service.login({ usernameOrEmail: 'test', password: 'a'.repeat(73) })).rejects.toThrow();
  });
  it('enforces password policy on changes and invalidates every older session', async () => {
    await expect(service.setPassword({ userId: 7, newPassword: 'short' })).rejects.toThrow();
    expect(prisma.credential.update).not.toHaveBeenCalled();
    await service.setPassword({ userId: 7, newPassword: 'long passphrase 123' });
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith(7);
  });
  it('invalidates sessions when an administrator disables the account', async () => {
    await service.setUserActive({ userId: 7, isActive: false });
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith(7);
  });
});

