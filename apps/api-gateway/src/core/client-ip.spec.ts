import express from 'express';
import request from 'supertest';
import { clientIp, trustedProxyAddresses } from './client-ip';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SecurityMiddleware } from './middlewares/security.middleware';

describe('Trusted proxy configuration and client identity', () => {
  it('ignores forged forwarding headers without a trusted proxy', async () => {
    const app = express();
    app.set('trust proxy', trustedProxyAddresses());
    app.get('/', (req, res) => res.json({ ip: clientIp(req) }));
    const result = await request(app)
      .get('/')
      .set('X-Forwarded-For', '198.51.100.1');
    expect(result.body.ip).toBe('127.0.0.1');
  });

  it('uses the nearest untrusted peer instead of the attacker-controlled leftmost address', async () => {
    const app = express();
    app.set('trust proxy', trustedProxyAddresses('127.0.0.1/32,::1/128'));
    app.get('/', (req, res) => res.json({ ip: clientIp(req) }));
    const result = await request(app)
      .get('/')
      .set('X-Forwarded-For', '198.51.100.1, 203.0.113.9');
    expect(result.body.ip).toBe('203.0.113.9');
  });

  it.each([
    'true',
    '*',
    '0.0.0.0/0',
    '::/0',
    '127.0.0.1/33',
    '::1/129',
    '127.0.0.1/foo',
    '127.0.0.1/32/1',
    '127.0.0.1,',
  ])('rejects unsafe or invalid proxy configuration %s', (value) => {
    expect(() => trustedProxyAddresses(value)).toThrow('TRUSTED_PROXY_CIDRS');
  });

  it('normalizes mapped IPv4 peers and falls back only to the socket', () => {
    expect(clientIp({ ip: '::ffff:203.0.113.9' })).toBe('203.0.113.9');
    expect(
      clientIp({ socket: { remoteAddress: '203.0.113.9' } as never }),
    ).toBe('203.0.113.9');
    expect(clientIp({})).toBe('unknown');
  });

  it('keeps JWT validation independent of spoofed headers and prepopulated IP context', async () => {
    const verifyToken = jest.fn().mockResolvedValue({ sub: '7' });
    const guard = new JwtAuthGuard({ verifyToken } as never);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '203.0.113.9',
          clientIp: '198.51.100.99',
          headers: { 'x-forwarded-for': ['198.51.100.1'] },
          cookies: { accessToken: 'valid' },
        }),
      }),
    };
    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(verifyToken).toHaveBeenCalledWith('valid', '203.0.113.9');
  });

  it('uses the same trusted identity for the security blocklist and threat analysis', async () => {
    const threat = {
      isBlocked: jest.fn().mockResolvedValue(false),
      analyzeRequest: jest.fn().mockResolvedValue({ shouldBlock: false }),
    };
    const middleware = new SecurityMiddleware(threat as never);
    const req = {
      ip: '203.0.113.9',
      url: '/api/v1/admin/auth/login',
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.1' },
    };
    const next = jest.fn();
    await middleware.use(req, {}, next);
    expect(threat.isBlocked).toHaveBeenCalledWith('203.0.113.9');
    expect(threat.analyzeRequest).toHaveBeenCalledWith(
      '203.0.113.9',
      expect.anything(),
    );
    expect(next).toHaveBeenCalled();
  });
});
