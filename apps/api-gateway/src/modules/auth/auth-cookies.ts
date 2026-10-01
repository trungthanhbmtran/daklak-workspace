import type { Response, CookieOptions } from 'express';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
}
export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.AUTH_COOKIE_SECURE === 'true',
    sameSite: 'strict',
    path: '/',
  };
}
export function clearAuthCookies(res: Response) {
  for (const name of ['accessToken', 'refreshToken', 'session']) {
    for (const path of ['/', '/admin', '/api/v1/admin/auth']) {
      res.clearCookie(name, { ...authCookieOptions(), path });
    }
  }
}
export function setAuthCookies(res: Response, tokens: AuthTokens) {
  if (
    !tokens.accessToken ||
    !tokens.refreshToken ||
    !Number.isFinite(tokens.expiresIn) ||
    tokens.expiresIn <= 0 ||
    !Number.isFinite(tokens.refreshTokenExpiresIn) ||
    tokens.refreshTokenExpiresIn <= 0
  ) {
    throw new Error('Invalid authentication response');
  }
  clearAuthCookies(res);
  res.cookie('accessToken', tokens.accessToken, {
    ...authCookieOptions(),
    maxAge: tokens.expiresIn * 1000,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...authCookieOptions(),
    maxAge: tokens.refreshTokenExpiresIn * 1000,
  });
}
