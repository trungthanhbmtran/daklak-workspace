import { RateLimitGuard } from './rate-limit.guard';

describe('Login rate limit identity', () => {
  it('keeps one limit bucket when a client changes its forwarded IP header', async () => {
    const check = jest
      .fn()
      .mockResolvedValue({ allowed: true, remaining: 9, retryAfterSec: 60 });
    const guard = new RateLimitGuard(
      {
        getAllAndOverride: () => ({
          limit: 10,
          windowSec: 900,
          keyBy: 'ip',
          prefix: 'login',
        }),
      } as never,
      { check } as never,
    );
    for (const forged of ['198.51.100.1', '198.51.100.2']) {
      const context = {
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({
          getRequest: () => ({
            ip: '203.0.113.9',
            headers: { 'x-forwarded-for': forged },
          }),
          getResponse: () => ({ setHeader: jest.fn() }),
        }),
      };
      await guard.canActivate(context as never);
    }
    expect(check.mock.calls.map(([key]) => key)).toEqual([
      'login:ip:203.0.113.9',
      'login:ip:203.0.113.9',
    ]);
  });
});
