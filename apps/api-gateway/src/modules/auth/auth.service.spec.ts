import { of, throwError } from 'rxjs';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

describe('Gateway browser sessions', () => {
  const tokens = {
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresIn: 3600,
    refreshTokenExpiresIn: 604800,
  };
  const grpc = {
    Login: jest.fn(),
    Refresh: jest.fn(),
    RevokeRefreshToken: jest.fn(),
    FindOne: jest.fn(),
  };
  const res = { cookie: jest.fn(), clearCookie: jest.fn() };
  let service: AuthService;
  beforeEach(() => {
    jest.clearAllMocks();
    grpc.Login.mockReturnValue(of(tokens));
    grpc.Refresh.mockReturnValue(of(tokens));
    grpc.RevokeRefreshToken.mockReturnValue(of({ success: true }));
    service = new AuthService(
      { getService: () => grpc },
      { getService: () => ({}) },
    );
    service.onModuleInit();
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
      service.refresh({ refreshToken: 123 }, { cookies: {} }, res as any),
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
    expect(grpc.Refresh).toHaveBeenCalledWith({ refreshToken: 'refresh' });
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
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
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
