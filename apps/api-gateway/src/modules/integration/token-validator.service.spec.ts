import { of, throwError } from 'rxjs';
import {
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IntegrationAuthService } from '../../../../user-service/src/modules/integration-config/integration-auth.service';
import { TokenValidatorService } from './token-validator.service';

describe('Issued JWT -> gateway verification', () => {
  const signer = new IntegrationAuthService();
  let validator: TokenValidatorService;
  const redis = { get: jest.fn(), touchAuthSession: jest.fn() },
    rpc = { GetPublicKey: jest.fn() };
  beforeEach(async () => {
    jest.clearAllMocks();
    redis.touchAuthSession.mockResolvedValue(true);
    rpc.GetPublicKey.mockReturnValue(of(signer.getPublicKeyDetails()));
    redis.get.mockImplementation(async (key: string) =>
      key.startsWith('user_session:')
        ? JSON.stringify({
            id: 7,
            isActive: true,
            permissionsFlatten: ['MENU:READ'],
          })
        : null,
    );
    validator = new TokenValidatorService(redis as any, {
      getService: () => rpc,
    });
    await validator.onModuleInit();
  });
  it('accepts a newly issued token with the published session context', async () => {
    expect(
      await validator.verifyToken(signer.signAccessToken(7, 3600)),
    ).toMatchObject({ sub: '7', id: 7, permissionsFlatten: ['MENU:READ'] });
  });
  it('reproduces the HS256 vs RS256 mismatch and continues to reject the old signer', async () => {
    const old = jwt.sign(
      { sub: '7', iss: 'daklak-user-service', aud: 'daklak-api-gateway' },
      'test-hs256-key',
      { expiresIn: 3600 },
    );
    await expect(validator.verifyToken(old)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('rejects expired tokens, wrong audiences and revoked tokens', async () => {
    await expect(
      validator.verifyToken(signer.signAccessToken(7, -1)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      validator.verifyToken(
        signer.signToken({
          sub: '7',
          iss: 'daklak-user-service',
          aud: 'other',
          jti: 'x',
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    redis.get.mockImplementation(async (key: string) =>
      key.startsWith('denylist:') ? 'revoked' : '{}',
    );
    await expect(
      validator.verifyToken(signer.signAccessToken(7, 3600)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('reloads the cached key when user-service rotates its signing key', async () => {
    const rotated = new IntegrationAuthService();
    rpc.GetPublicKey.mockReturnValue(of(rotated.getPublicKeyDetails()));
    expect(
      await validator.verifyToken(rotated.signAccessToken(7, 3600)),
    ).toMatchObject({ sub: '7' });
  });
  it('rejects a server-revoked session even with a valid JWT and cached user', async () => {
    const token = signer.signAccessToken(7, 3600);
    await validator.verifyToken(token);
    redis.touchAuthSession.mockResolvedValue(false);
    await expect(validator.verifyToken(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('does not mistake Redis outages for an expired user session', async () => {
    redis.get.mockRejectedValue(new Error('offline'));
    await expect(
      validator.verifyToken(signer.signAccessToken(7, 3600)),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('benchmarks repeated verification with one cached key and profile lookup', async () => {
    const token = signer.signAccessToken(7, 900);
    const timings: number[] = [];
    for (let i = 0; i < 200; i++) {
      const start = performance.now();
      await validator.verifyToken(token);
      timings.push(performance.now() - start);
    }
    timings.sort((a, b) => a - b);
    expect(rpc.GetPublicKey).toHaveBeenCalledTimes(1);
    expect(
      redis.get.mock.calls.filter(([key]) =>
        String(key).startsWith('user_session:'),
      ),
    ).toHaveLength(1);
    expect(redis.touchAuthSession).toHaveBeenCalledTimes(200);
    console.log(
      JSON.stringify({
        benchmark: 'RS256 verification; Redis mocked',
        samples: timings.length,
        medianMs: +timings[100].toFixed(3),
        p95Ms: +timings[190].toFixed(3),
      }),
    );
  });
  it('does not mistake public-key outages for an expired user session', async () => {
    rpc.GetPublicKey.mockReturnValue(throwError(() => new Error('offline')));
    const cold = new TokenValidatorService(redis as any, {
      getService: () => rpc,
    });
    await cold.onModuleInit();
    await expect(
      cold.verifyToken(signer.signAccessToken(7, 3600)),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
