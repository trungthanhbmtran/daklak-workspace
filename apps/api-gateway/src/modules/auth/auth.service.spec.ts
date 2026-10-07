import { of, throwError, NEVER, TimeoutError } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';

describe('Gateway browser sessions', () => {
  const tokens = {
    userId: 7,
    authVersion: 0,
    sessionId: '11c6badf-4128-490a-93b3-e105f7f415ce',
    refreshToken: 'refresh',
    expiresIn: 3600,
    refreshTokenExpiresIn: 604800,
  };
  const grpc = {
    GetAuthState: jest.fn(),
    Login: jest.fn(),
    Refresh: jest.fn(),
    RevokeRefreshToken: jest.fn(),
    FindOne: jest.fn(),
  };
  const employee = { GetEmployeeByCode: jest.fn() };
  const res = { cookie: jest.fn(), clearCookie: jest.fn() };
  let service: AuthService;
  let warn: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    grpc.GetAuthState.mockReturnValue(
      of({ userId: 7, isActive: true, authVersion: 0, sessionActive: true }),
    );
    grpc.Login.mockReturnValue(of(tokens));
    grpc.Refresh.mockReturnValue(of(tokens));
    grpc.RevokeRefreshToken.mockReturnValue(of({ success: true }));
    service = new AuthService(
      { getService: () => grpc } as unknown as ClientGrpc,
      { getService: () => employee } as unknown as ClientGrpc,
      { signAccessToken: () => 'access' } as unknown as TokenIssuerService,
    );
    service.onModuleInit();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  it.each([null, undefined, 'unexpected'])(
    'maps malformed internal errors to 503 without a TypeError: %p',
    async (error) => {
      grpc.Login.mockReturnValue(throwError(() => error));
      await expect(
        service.login({ username: 'test', password: 'password' }, res as any),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalled();
    },
  );
  it.each([status.UNAUTHENTICATED, status.INVALID_ARGUMENT])(
    'does not expose private RPC details for status %s',
    async (code) => {
      const details = 'private-account-state-and-credentials';
      grpc.Login.mockReturnValue(throwError(() => ({ code, details })));
      try {
        await service.login(
          { username: 'test', password: 'password' },
          res as any,
        );
      } catch (error) {
        expect((error as Error).message).not.toContain(details);
        expect(warn).not.toHaveBeenCalled();
        return;
      }
      throw new Error('expected login to reject');
    },
  );
  it.each([{ code: status.DEADLINE_EXCEEDED }, new TimeoutError()])(
    'maps authentication deadlines to 504 and preserves cookies',
    async (error) => {
      grpc.Refresh.mockReturnValue(throwError(() => error));
      await expect(
        service.refresh({}, { cookies: { refreshToken: 'valid' } }, res as any),
      ).rejects.toBeInstanceOf(GatewayTimeoutException);
      expect(res.clearCookie).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalled();
    },
  );
  it.each([undefined, NaN, Infinity, 1e15])(
    'rejects an invalid or unrepresentable expiry before any cookie write: %p',
    async (expiresIn) => {
      grpc.Login.mockReturnValue(of({ ...tokens, expiresIn }));
      await expect(
        service.login({ username: 'test', password: 'password' }, res as any),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.clearCookie).not.toHaveBeenCalled();
    },
  );
  it('does not return an invented session identifier', async () => {
    const result = await service.login(
      { username: 'test', password: 'password' },
      res as any,
    );
    expect(result).toEqual({ expiresAt: expect.any(String) });
  });
  it.each([
    { username: 'a'.repeat(255), password: 'password' },
    { username: 'test', password: 'á'.repeat(37) },
  ])(
    'rejects excessive credentials before sending a password to gRPC',
    async (body) => {
      await expect(service.login(body, res as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(grpc.Login).not.toHaveBeenCalled();
    },
  );
  it.each([undefined, 'NaN', 0, -1, 1.5, {}, null, 2147483648])(
    'rejects an invalid profile ID before gRPC: %p',
    async (id) => {
      await expect(service.me({ user: { id } })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(grpc.FindOne).not.toHaveBeenCalled();
    },
  );
  it('uses the current employee code from the user service instead of a stale claim', async () => {
    grpc.FindOne.mockReturnValue(
      of({ id: 7, employeeCode: 'CURRENT', fullName: 'Local' }),
    );
    employee.GetEmployeeByCode.mockReturnValue(
      of({ data: { fullName: 'Employee', avatar: 'avatar.png' } }),
    );
    const result = await service.me({ user: { id: 7, employeeId: 99 } } as any);
    expect(employee.GetEmployeeByCode).toHaveBeenCalledWith({
      code: 'CURRENT',
    });
    expect(result).toMatchObject({
      fullName: 'Employee',
      avatarUrl: 'avatar.png',
    });
  });
  it('returns the user profile within five seconds if HRM never responds', async () => {
    jest.useFakeTimers();
    grpc.FindOne.mockReturnValue(
      of({ id: 7, employeeCode: 'CURRENT', fullName: 'Local' }),
    );
    employee.GetEmployeeByCode.mockReturnValue(NEVER);
    const pending = service.me({ user: { id: 7 } });
    await jest.advanceTimersByTimeAsync(5000);
    await expect(pending).resolves.toMatchObject({ fullName: 'Local' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('GET_EMPLOYEE'));
  });
  it('rejects a profile returned for a different user ID', async () => {
    grpc.FindOne.mockReturnValue(of({ id: 8 }));
    await expect(service.me({ user: { id: 7 } })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(employee.GetEmployeeByCode).not.toHaveBeenCalled();
  });
  it('does not confirm login when user lookup is unavailable', async () => {
    grpc.FindOne.mockReturnValue(throwError(() => ({ code: 14 })));
    await expect(service.me({ user: { id: 1 } })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    grpc.FindOne.mockReturnValue(of(null));
    await expect(service.me({ user: { id: 1 } })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('does not clear a newer browser cookie after a concurrent refresh conflict', async () => {
    grpc.Refresh.mockReturnValue(throwError(() => ({ code: 10 })));
    await expect(
      service.refresh({}, { cookies: { refreshToken: 'old' } }, res as any),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(res.clearCookie).not.toHaveBeenCalled();
  });
  it('rejects malformed refresh payloads with 400 rather than throwing a trim error', async () => {
    await expect(
      service.refresh(
        { refreshToken: 123 } as any,
        { cookies: {} },
        res as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(grpc.Refresh).not.toHaveBeenCalled();
  });
  it('sets separate access/refresh lifetimes on root HttpOnly cookies', async () => {
    await service.login({ username: 'test', password: 'password' }, res as any);
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'access',
      expect.objectContaining({ maxAge: 3600000, path: '/', httpOnly: true }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh',
      expect.objectContaining({ maxAge: 604800000, path: '/', httpOnly: true }),
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      'session',
      expect.objectContaining({ path: '/' }),
    );
  });
  it('refreshes from HttpOnly cookies when no body is supplied', async () => {
    await service.refresh(
      undefined,
      { cookies: { refreshToken: 'refresh' } },
      res as any,
    );
    expect(grpc.Refresh).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshToken: 'refresh',
        requestId: expect.any(String),
      }),
    );
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });
  it('leaves cookie cleanup to logout so a late refresh cannot overwrite a newer login', async () => {
    await expect(
      service.refresh({}, { cookies: {} }, res as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(res.clearCookie).not.toHaveBeenCalled();
    grpc.Refresh.mockReturnValue(
      throwError(() => ({ code: 16, details: 'Expired' })),
    );
    await expect(
      service.refresh({}, { cookies: { refreshToken: 'old' } }, res as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('reports unavailable auth services as 503, preserving cookies during refresh', async () => {
    grpc.Refresh.mockReturnValue(throwError(() => ({ code: 14 })));
    await expect(
      service.refresh({}, { cookies: { refreshToken: 'valid' } }, res as any),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(res.clearCookie).not.toHaveBeenCalled();
    grpc.Login.mockReturnValue(throwError(() => ({ code: 14 })));
    await expect(
      service.login({ username: 'test', password: 'password' }, res as any),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('clears all browser cookies even if logout revocation fails', async () => {
    grpc.RevokeRefreshToken.mockReturnValue(throwError(() => ({ code: 14 })));
    await expect(
      service.logout({ cookies: { refreshToken: 'valid' } }, res as any),
    ).resolves.toEqual({ success: true });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('LOGOUT_REVOCATION'),
    );
    for (const name of ['accessToken', 'refreshToken', 'session'])
      expect(res.clearCookie).toHaveBeenCalledWith(
        name,
        expect.objectContaining({ path: '/' }),
      );
  });
  it('rejects malformed token responses without writing a success cookie', async () => {
    grpc.Login.mockReturnValue(of({ ...tokens, expiresIn: 0 }));
    await expect(
      service.login({ username: 'test', password: 'password' }, res as any),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
