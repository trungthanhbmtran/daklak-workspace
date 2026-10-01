import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { DynamicProxyMiddleware } from './dynamic-proxy.middleware';

describe('Dynamic proxy authentication', () => {
  const integration = { proxyMiddleware: jest.fn() };
  const validator = { verifyToken: jest.fn() };
  const next = jest.fn();
  let middleware: DynamicProxyMiddleware;
  let res: any;
  beforeEach(() => {
    jest.resetAllMocks();
    middleware = new DynamicProxyMiddleware(
      integration as any,
      validator as any,
    );
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });
  it('accepts browser cookies and replaces spoofed identity with verified identity', async () => {
    validator.verifyToken.mockResolvedValue({
      id: 7,
      email: 'verified@example.test',
    });
    const req: any = {
      originalUrl: '/api/v1/gw/source',
      cookies: { accessToken: 'valid' },
      headers: { 'x-user-id': '999', 'x-user-roles': 'ADMIN' },
    };
    await middleware.use(req, res, next);
    expect(validator.verifyToken).toHaveBeenCalledWith('valid', undefined);
    expect(req.headers['x-user-id']).toBe('7');
    expect(req.headers['x-user-roles']).toBeUndefined();
    expect(integration.proxyMiddleware).toHaveBeenCalled();
  });
  it('never forwards an unverified bearer token or prepopulated identity', async () => {
    validator.verifyToken.mockRejectedValue(new UnauthorizedException());
    await middleware.use(
      {
        url: '/gw/source',
        headers: { authorization: 'Bearer forged' },
        user: { id: 99 },
      },
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(integration.proxyMiddleware).not.toHaveBeenCalled();
  });
  it('preserves unavailable service status instead of expiring the session', async () => {
    validator.verifyToken.mockRejectedValue(new ServiceUnavailableException());
    await middleware.use(
      { url: '/gw/source', headers: { authorization: 'Bearer valid' } },
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(503);
  });
  it('requires credentials on proxy routes and leaves other routes alone', async () => {
    await middleware.use({ url: '/gw/source', headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    await middleware.use({ url: '/admin/auth/login', headers: {} }, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(validator.verifyToken).not.toHaveBeenCalled();
  });
});
