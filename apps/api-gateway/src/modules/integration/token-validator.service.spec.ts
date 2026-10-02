import { of, throwError } from 'rxjs';
import { UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { TokenValidatorService } from './token-validator.service';
describe('Gateway issuer and authoritative revocation', () => {
  const signer = new TokenIssuerService(), sid = '11c6badf-4128-490a-93b3-e105f7f415ce';
  let validator: TokenValidatorService;
  const redis = { get: jest.fn(), touchAuthSession: jest.fn() }, rpc = { GetAuthState: jest.fn() };
  const state = { userId: 7, isActive: true, authVersion: 0, sessionActive: true };
  const token = () => signer.signAccessToken(7, 900, sid, 0);
  beforeEach(() => {
    jest.clearAllMocks(); redis.touchAuthSession.mockResolvedValue(true); rpc.GetAuthState.mockReturnValue(of(state));
    redis.get.mockImplementation(async (key: string) => key.startsWith('user_session:') ? JSON.stringify({ id: 7, authVersion: 0, permissionsFlatten: ['MENU:READ'] }) : null);
    validator = new TokenValidatorService(redis as any, { getService: () => rpc } as any, signer); validator.onModuleInit();
  });
  it('accepts a Gateway token', async () => { expect(await validator.verifyToken(token())).toMatchObject({ id: 7, sid, authVersion: 0 }); });
  it('rejects legacy HS256', async () => { await expect(validator.verifyToken(jwt.sign({ sub: '7' }, 'test-key', { expiresIn: 900 }))).rejects.toBeInstanceOf(UnauthorizedException); });
  it.each([{ ...state, isActive: false }, { ...state, sessionActive: false }, { ...state, authVersion: 1 }, { ...state, userId: 8 }])('rejects durable revocation with active Redis: %p', async next => {
    rpc.GetAuthState.mockReturnValue(of(next)); await expect(validator.verifyToken(token())).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('checks DB again after caching profile', async () => { await validator.verifyToken(token()); rpc.GetAuthState.mockReturnValue(of({ ...state, authVersion: 1 })); await expect(validator.verifyToken(token())).rejects.toBeInstanceOf(UnauthorizedException); });
  it('distinguishes idle expiry from outages', async () => { redis.touchAuthSession.mockResolvedValue(false); await expect(validator.verifyToken(token())).rejects.toBeInstanceOf(UnauthorizedException); redis.touchAuthSession.mockRejectedValue(new Error('offline')); await expect(validator.verifyToken(token())).rejects.toBeInstanceOf(ServiceUnavailableException); });
  it('fails closed on DB outage', async () => { rpc.GetAuthState.mockReturnValue(throwError(() => new Error('offline'))); await expect(validator.verifyToken(token())).rejects.toBeInstanceOf(ServiceUnavailableException); });
  it('rejects denylisted access token', async () => { redis.get.mockImplementation(async (key: string) => key.startsWith('denylist:') ? 'revoked' : JSON.stringify({ authVersion: 0 })); await expect(validator.verifyToken(token())).rejects.toBeInstanceOf(UnauthorizedException); });
  it('does not renew idle for monitoring', async () => { await validator.verifyToken(token(), undefined, false); expect(redis.touchAuthSession).toHaveBeenCalledWith(sid, '7', 0, false); });
  it('benchmarks 200 validations with dependency mocks', async () => {
    const value = token(), timings: number[] = [];
    for (let n = 0; n < 200; n++) { const start = performance.now(); await validator.verifyToken(value); timings.push(performance.now() - start); }
    timings.sort((a,b) => a-b); expect(rpc.GetAuthState).toHaveBeenCalledTimes(200);
    expect(redis.get.mock.calls.filter(([key]) => String(key).startsWith('user_session:'))).toHaveLength(1);
    console.log(JSON.stringify({ benchmark: 'RS256; dependency mocks', samples: 200, medianMs: timings[100], p95Ms: timings[190] }));
  });
});

