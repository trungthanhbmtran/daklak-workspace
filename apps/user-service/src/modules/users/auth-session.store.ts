import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import Redis from 'ioredis';
import { AUTH_DEFAULTS, positiveSeconds, RefreshSession, TOUCH_AUTH_SESSION } from '../../../../../shared/core/auth-session';

@Injectable()
export class AuthSessionStore implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(AuthSessionStore.name);
  readonly idleSeconds: number;
  readonly absoluteSeconds: number;
  constructor(config: ConfigService) {
    this.idleSeconds = positiveSeconds(config.get('AUTH_IDLE_TIMEOUT_SECONDS'), AUTH_DEFAULTS.idleSeconds);
    this.absoluteSeconds = positiveSeconds(config.get('AUTH_SESSION_MAX_SECONDS'), AUTH_DEFAULTS.absoluteSeconds);
    this.redis = new Redis(config.get('REDIS_URL', 'redis://redis:6379'), {
      db: Number(config.get('REDIS_DB', '0')), maxRetriesPerRequest: 2,
      connectTimeout: 5000, commandTimeout: 5000,
      retryStrategy: times => Math.min(times * 500, 5000),
    });
    this.redis.on('error', () => this.logger.error('Auth session Redis unavailable'));
  }
  private refreshKey(token: string) {
    return 'auth:refresh:' + createHash('sha256').update(token).digest('hex');
  }
  private attemptKey(account: string) {
    return 'auth:attempts:' + createHash('sha256').update(account.trim().toLowerCase()).digest('hex');
  }
  async assertLoginAllowed(account: string): Promise<boolean> {
    return Number(await this.redis.get(this.attemptKey(account))) < AUTH_DEFAULTS.failureLimit;
  }
  async recordLoginFailure(account: string) {
    await this.redis.eval("local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n",
      1, this.attemptKey(account), AUTH_DEFAULTS.failureWindowSeconds);
  }
  async clearLoginFailures(account: string) { await this.redis.del(this.attemptKey(account)); }
  async createSession(userId: number): Promise<RefreshSession> {
    const now = Number((await this.redis.time())[0]);
    const session = { userId, sessionId: randomUUID(), expiresAt: now + this.absoluteSeconds };
    const version = Number(await this.redis.get('auth:user:version:' + userId) || 0);
    await this.redis.set('auth:session:' + session.sessionId, JSON.stringify({ ...session, version }),
      'EX', Math.min(this.absoluteSeconds, this.idleSeconds));
    return session;
  }
  async touchSession(session: RefreshSession): Promise<boolean> {
    return Number(await this.redis.eval(TOUCH_AUTH_SESSION, 2, 'auth:session:' + session.sessionId,
      'auth:user:version:' + session.userId, String(session.userId), this.idleSeconds)) === 1;
  }
  async setSession(userId: number, profile: Record<string, unknown>, ttl: number) {
    const { accessToken: _access, refreshToken: _refresh, ...safe } = profile;
    await this.redis.set('user_session:' + userId, JSON.stringify(safe), 'EX', ttl);
  }
  async setRefresh(token: string, session: RefreshSession, ttl: number) {
    await this.redis.set(this.refreshKey(token), JSON.stringify(session), 'EX', ttl);
  }
  async consumeRefresh(token: string): Promise<RefreshSession | null> {
    const raw = await this.redis.eval("local v = redis.call('GET', KEYS[1]); if v then redis.call('DEL', KEYS[1]) end; return v", 1, this.refreshKey(token));
    if (!raw) return null;
    return JSON.parse(String(raw)) as RefreshSession;
  }
  async revokeRefresh(token: string) {
    const session = await this.consumeRefresh(token);
    if (session) await this.redis.del('auth:session:' + session.sessionId);
  }
  async revokeAllForUser(userId: number) {
    await this.redis.incr('auth:user:version:' + userId);
    await this.redis.del('user_session:' + userId);
  }
  onModuleDestroy() { this.redis.disconnect(); }
}

