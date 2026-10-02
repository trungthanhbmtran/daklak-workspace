import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JWT guard infrastructure failures', () => {
  const request = {
    cookies: { accessToken: 'token' },
    headers: {},
    ip: '127.0.0.1',
  };
  const context = { switchToHttp: () => ({ getRequest: () => request }) };
  it('does not treat a missing browser cookie as attack evidence', async () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {}, cookies: {}, ip: '127.0.0.1' }),
      }),
    };
    const threat: any = { recordEvent: jest.fn() };
    const guard = new JwtAuthGuard({ verifyToken: jest.fn() } as any, threat);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(threat.recordEvent).not.toHaveBeenCalled();
  });
  it('preserves a 503 without declaring the user token invalid', async () => {
    const verifyToken = jest
      .fn()
      .mockRejectedValue(new ServiceUnavailableException('offline'));
    const threat = { recordEvent: jest.fn().mockResolvedValue(undefined) };
    const guard = new JwtAuthGuard({ verifyToken } as any, threat as any);
    await expect(guard.canActivate(context as any)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(threat.recordEvent).not.toHaveBeenCalled();
  });
  it('still rejects a genuinely invalid token', async () => {
    const guard = new JwtAuthGuard({
      verifyToken: jest
        .fn()
        .mockRejectedValue(new UnauthorizedException('invalid')),
    } as any);
    await expect(guard.canActivate(context as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
