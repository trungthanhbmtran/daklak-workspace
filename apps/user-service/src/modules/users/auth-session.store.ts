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
  private refreshKey(token: string) {
    return 'auth:refresh:' + createHash('sha256').update(token).digest('hex');
  }
  private usedRefreshKey(token: string) {
    return this.refreshKey(token).replace(
      'auth:refresh:',
      'auth:refresh-used:',
    );
  }
  private attemptKey(account: string) {
    return (
      'auth:attempts:' +
      createHash('sha256').update(account.trim().toLowerCase()).digest('hex')
    );
  }
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
  async createSession(userId: number): Promise<RefreshSession> {
    const now = Number((await this.redis.time())[0]);
    const session = {
      userId,
      sessionId: randomUUID(),
      expiresAt: now + this.policy.absoluteSeconds,
    };
    const version = Number(
      (await this.redis.get('auth:user:version:' + userId)) || 0,
    );
    await this.redis.set(
      'auth:session:' + session.sessionId,
      JSON.stringify({ ...session, version }),
      'EX',
      Math.min(this.policy.absoluteSeconds, this.policy.idleSeconds),
    );
    return session;
  }
  async touchSession(session: RefreshSession): Promise<boolean> {
    return (
      Number(
        await this.redis.eval(
          TOUCH_AUTH_SESSION,
          2,
          'auth:session:' + session.sessionId,
          'auth:user:version:' + session.userId,
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
  async setRefresh(token: string, session: RefreshSession, ttl: number) {
    await this.redis.set(
      this.refreshKey(token),
      JSON.stringify(session),
      'EX',
      ttl,
    );
  }
  async getRefresh(token: string): Promise<RefreshSession | null> {
    const raw = await this.redis.get(this.refreshKey(token));
    if (raw) return JSON.parse(raw) as RefreshSession;
    const used = await this.redis.get(this.usedRefreshKey(token));
    if (used) {
      const session = JSON.parse(used) as RefreshSession;
      if (await this.redis.get('auth:session:' + session.sessionId))
        throw new RefreshConflictError();
    }
    return null;
  }
  async rotateRefresh(
    oldToken: string,
    newToken: string,
    session: RefreshSession,
    ttl: number,
  ): Promise<boolean> {
    const script = `local function touch() ${TOUCH_AUTH_SESSION} end
local raw = redis.call('GET', KEYS[3])
if not raw then return 0 end
local old = cjson.decode(raw)
if old.sessionId ~= ARGV[3] or touch() ~= 1 then return 0 end
local now = tonumber(redis.call('TIME')[1])
local ttl = math.min(tonumber(ARGV[4]), old.expiresAt - now)
if ttl <= 0 then return 0 end
redis.call('SET', KEYS[4], raw, 'EX', ttl)
redis.call('SET', KEYS[5], raw, 'EX', ttl)
redis.call('DEL', KEYS[3])
return 1`;
    return (
      Number(
        await this.redis.eval(
          script,
          5,
          'auth:session:' + session.sessionId,
          'auth:user:version:' + session.userId,
          this.refreshKey(oldToken),
          this.refreshKey(newToken),
          this.usedRefreshKey(oldToken),
          String(session.userId),
          this.policy.idleSeconds,
          session.sessionId,
          ttl,
        ),
      ) === 1
    );
  }
  async revokeRefresh(token: string) {
    // A token consumed by an in-flight refresh still identifies the same session for logout.
    await this.redis.eval(
      `
local raw = redis.call('GET', KEYS[1]) or redis.call('GET', KEYS[2])
if not raw then return 0 end
local s = cjson.decode(raw)
redis.call('DEL', 'auth:session:' .. s.sessionId)
redis.call('DEL', KEYS[1], KEYS[2])
return 1`,
      2,
      this.refreshKey(token),
      this.usedRefreshKey(token),
    );
  }
  async revokeAllForUser(userId: number) {
    await this.redis.incr('auth:user:version:' + userId);
    await this.redis.del('user_session:' + userId);
  }
  onModuleDestroy() {
    this.redis.disconnect();
  }
}
