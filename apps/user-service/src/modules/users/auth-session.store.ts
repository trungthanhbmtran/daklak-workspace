import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import Redis from 'ioredis';
import {
  AuthPolicy,
  getAuthPolicy,
  RefreshSession,
  TOUCH_AUTH_SESSION,
} from '../../../../../shared/core/auth-session';

export class RefreshConflictError extends Error {}

@Injectable()
export class AuthSessionStore implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(AuthSessionStore.name);
  readonly policy: AuthPolicy;
  constructor(config: ConfigService) {
    this.policy = getAuthPolicy((key) => config.get(key));
    this.redis = new Redis(config.get('REDIS_URL', 'redis://redis:6379'), {
      db: Number(config.get('REDIS_DB', '0')),
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      commandTimeout: 5000,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });
    this.redis.on('error', () =>
      this.logger.error('Auth session Redis unavailable'),
    );
  }
  private attemptKey(account: string) {
    return (
      'auth:attempts:' +
      createHash('sha256').update(account.trim().toLowerCase()).digest('hex')
    );
  }
  async consumeSsoAssertion(jti: string): Promise<boolean> { return (await this.redis.set('auth:sso:assertion:' + jti, '1', 'EX', 60, 'NX')) === 'OK'; }
  async assertLoginAllowed(account: string): Promise<boolean> {
    return (
      Number(await this.redis.get(this.attemptKey(account))) <
      this.policy.failureLimit
    );
  }
  async recordLoginFailure(account: string) {
    await this.redis.eval(
      "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n",
      1,
      this.attemptKey(account),
      this.policy.failureWindowSeconds,
    );
  }
  async clearLoginFailures(account: string) {
    await this.redis.del(this.attemptKey(account));
  }
  async createSession(userId: number, authVersion: number): Promise<RefreshSession> {
    if (!Number.isSafeInteger(authVersion) || authVersion < 0) throw new Error('Invalid durable authentication version');
    const now = Number((await this.redis.time())[0]);
    const session = { userId, sessionId: randomUUID(), expiresAt: now + this.policy.absoluteSeconds, authVersion };
    const created = Number(await this.redis.eval(`
local current = tonumber(redis.call('GET', KEYS[1]) or '-1')
if current > tonumber(ARGV[1]) then return 0 end
redis.call('SET', KEYS[1], ARGV[1])
redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])
return 1`, 2, 'auth:user:version:db:' + userId, 'auth:session:' + session.sessionId,
      authVersion, JSON.stringify({ ...session, version: authVersion }), Math.min(this.policy.absoluteSeconds, this.policy.idleSeconds)));
    if (created !== 1) throw new Error('Authentication state changed while logging in');
    return session;
  }
  async touchSession(session: RefreshSession): Promise<boolean> {
    return (
      Number(
        await this.redis.eval(
          TOUCH_AUTH_SESSION,
          2,
          'auth:session:' + session.sessionId,
          'auth:user:version:db:' + session.userId,
          String(session.userId),
          this.policy.idleSeconds,
        ),
      ) === 1
    );
  }
  async setSession(
    userId: number,
    profile: Record<string, unknown>,
    ttl: number,
  ) {
    const safe = { ...profile };
    delete safe.accessToken;
    delete safe.refreshToken;
    await this.redis.set(
      'user_session:' + userId,
      JSON.stringify(safe),
      'EX',
      ttl,
    );
  }
  async revokeSession(sessionId: string) { await this.redis.del('auth:session:' + sessionId); }
  async revokeAllForUser(userId: number, authVersion: number) {
    await this.redis.eval(`
local current = tonumber(redis.call('GET', KEYS[1]) or '-1')
if current < tonumber(ARGV[1]) then redis.call('SET', KEYS[1], ARGV[1]) end
redis.call('DEL', KEYS[2])
return 1`, 2, 'auth:user:version:db:' + userId, 'user_session:' + userId, authVersion);
  }
  onModuleDestroy() {
    this.redis.disconnect();
  }
}

