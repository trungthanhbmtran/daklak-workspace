import { ForbiddenException } from '@nestjs/common';
import { AuthOriginGuard } from './auth-origin.guard';
describe('Browser auth origin boundary', () => {
  const original = process.env.AUTH_TRUSTED_ORIGINS;
  const context = (headers: object) =>
    ({ switchToHttp: () => ({ getRequest: () => ({ headers }) }) }) as any;
  afterEach(() => {
    if (original === undefined) delete process.env.AUTH_TRUSTED_ORIGINS;
    else process.env.AUTH_TRUSTED_ORIGINS = original;
  });
  it('accepts same-host browser login and internal server/mobile calls', () => {
    delete process.env.AUTH_TRUSTED_ORIGINS;
    const guard = new AuthOriginGuard();
    expect(
      guard.canActivate(
        context({ host: 'agency.test', origin: 'https://agency.test' }),
      ),
    ).toBe(true);
    expect(guard.canActivate(context({ host: 'agency.test' }))).toBe(true);
  });
  it.each(['https://attacker.test', 'null', 'file:///login'])(
    'rejects browser origin %s',
    (origin) => {
      delete process.env.AUTH_TRUSTED_ORIGINS;
      expect(() =>
        new AuthOriginGuard().canActivate(
          context({ host: 'agency.test', origin }),
        ),
      ).toThrow(ForbiddenException);
    },
  );
  it('uses the configured external origin when the gateway host is internal', () => {
    process.env.AUTH_TRUSTED_ORIGINS = 'https://agency.test';
    const guard = new AuthOriginGuard();
    expect(
      guard.canActivate(
        context({ host: 'api-gateway:8080', origin: 'https://agency.test' }),
      ),
    ).toBe(true);
    expect(() =>
      guard.canActivate(
        context({ host: 'agency.test', origin: 'http://agency.test' }),
      ),
    ).toThrow(ForbiddenException);
  });
});
