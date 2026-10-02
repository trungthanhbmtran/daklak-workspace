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
    expect(validator.verifyToken).toHaveBeenCalledWith('valid', 'unknown');
    expect(req.headers['x-user-id']).toBe('7');
    expect(req.headers['x-user-roles']).toBeUndefined();
    expect(integration.proxyMiddleware).toHaveBeenCalled();
  });
  it.each([
    '/gw/source',
    '/admin/gw/source',
    '/api/v1/gw/source',
    '/api/v1/admin/gw/source',
  ])('authenticates and forwards the supported proxy path %s', async (url) => {
    validator.verifyToken.mockResolvedValue({ id: 7 });
    await middleware.use(
      { url, cookies: { accessToken: 'valid' }, headers: {} },
      res,
      next,
    );
    expect(validator.verifyToken).toHaveBeenCalledWith('valid', 'unknown');
    expect(integration.proxyMiddleware).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
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
  it('does not intercept auth routes when a query string contains /gw/', async () => {
    await middleware.use(
      { url: '/api/v1/admin/auth/login?callbackUrl=/gw/source', headers: {} },
      res,
      next,
    );
    expect(next).toHaveBeenCalled();
    expect(validator.verifyToken).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
  it('requires credentials on proxy routes and leaves other routes alone', async () => {
    await middleware.use({ url: '/gw/source', headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    await middleware.use({ url: '/admin/auth/login', headers: {} }, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(validator.verifyToken).not.toHaveBeenCalled();
  });
});
