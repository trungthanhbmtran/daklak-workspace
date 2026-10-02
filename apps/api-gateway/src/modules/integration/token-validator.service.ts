import {
  Injectable,
  Logger,
  UnauthorizedException,
  ServiceUnavailableException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AUTH_JWT } from '../../../../../shared/core/auth-session';
import { promisify } from 'util';

import { RedisService } from '../../core/redis/redis.service';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom, timeout } from 'rxjs';

// Chuẩn RFC 7519 + OWASP ASVS Level 2 (Thông tư 06/2023/TT-BTTTT)
const JWT_ISSUER = AUTH_JWT.issuer;
const JWT_AUDIENCE = AUTH_JWT.audience;

// ─── In-process LRU Cache cho user_session ────────────────────────────────
// Tránh Redis roundtrip cho mỗi request — TTL 30s (stale window chấp nhận được)
// Kích thước 1000 entry = ~1000 user đồng thời, RAM < 5MB
const SESSION_CACHE_TTL_MS = 30_000; // 30 giây
const SESSION_CACHE_MAX = 1000;

interface CacheEntry {
  data: Record<string, any>;
  expireAt: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jwtVerifyAsync = promisify<
  string,
  string,
  jwt.VerifyOptions,
  jwt.JwtPayload
>(jwt.verify as any);

@Injectable()
export class TokenValidatorService implements OnModuleInit {
  private readonly logger = new Logger(TokenValidatorService.name);
  private grpcService: any;

  // ── Public Key cache (in-memory, 5 phút) ──────────────────────────────────
  private cachedPublicKey: string | null = null;
  private lastFetchTime = 0;
  private keyReload: Promise<string> | null = null;
  private lastKeyReload = 0;

  // ── User Session LRU cache (in-memory, 30 giây) ───────────────────────────
  // Map giữ thứ tự insertion → evict entry cũ nhất khi vượt MAX
  private readonly sessionCache = new Map<string, CacheEntry>();

  constructor(
    private readonly redisService: RedisService,
    @Inject(MICROSERVICES.INTEGRATION.SYMBOL) private readonly client: any,
  ) {}

  async onModuleInit() {
    this.grpcService = this.client.getService(
      MICROSERVICES.INTEGRATION.SERVICE,
    );
    this.fetchPublicKey().catch((e) =>
      this.logger.warn(`Failed to initial fetch public key: ${e.message}`),
    );
  }

  // ─── Public Key ───────────────────────────────────────────────────────────

  private async fetchPublicKey(force = false): Promise<string> {
    const now = Date.now();
    if (
      !force &&
      this.cachedPublicKey &&
      now - this.lastFetchTime < 5 * 60 * 1000
    ) {
      return this.cachedPublicKey;
    }
    try {
      const response = (await firstValueFrom(
        this.grpcService.GetPublicKey({}).pipe(timeout(5000)),
      )) as any;
      if (response?.publicKey) {
        this.cachedPublicKey = response.publicKey;
        this.lastFetchTime = now;
        this.logger.log('JWT Public Key fetched and cached from user-service');
        return this.cachedPublicKey as string;
      }
      throw new Error('Public key not found in response');
    } catch (e: any) {
      this.logger.error(`Error fetching public key via gRPC: ${e.message}`);
      if (!force && this.cachedPublicKey) return this.cachedPublicKey;
      throw new ServiceUnavailableException(
        'Dịch vụ xác thực tạm thời không khả dụng',
      );
    }
  }

  // ─── User Session (LRU in-memory + Redis fallback) ───────────────────────

  /**
   * Lấy user session với LRU in-process cache (30s TTL).
   * - HIT: trả về ngay từ RAM (0ms)
   * - MISS: gọi Redis (1ms), lưu vào RAM cache
   * - Invalidate: gọi invalidateSessionCache(userId) khi logout
   */
  public async getUserSession(
    userId: string | number,
  ): Promise<Record<string, any>> {
    if (!userId) return {};

    const cacheKey = String(userId);
    const now = Date.now();

    // ── L1: In-process LRU Cache ──
    const cached = this.sessionCache.get(cacheKey);
    if (cached && now < cached.expireAt) {
      // Move to end (LRU: recently used)
      this.sessionCache.delete(cacheKey);
      this.sessionCache.set(cacheKey, cached);
      return cached.data;
    }

    // ── L2: Redis ──
    try {
      const sessionStr = await this.redisService.get(`user_session:${userId}`);
      if (sessionStr) {
        const data = JSON.parse(sessionStr);
        this.setSessionCache(cacheKey, data, now);
        return data;
      }
    } catch (e: any) {
      this.logger.warn(`[getUserSession] Redis unavailable for user ${userId}`);
      throw new ServiceUnavailableException(
        'Dịch vụ phiên đăng nhập tạm thời không khả dụng',
      );
    }
    return {};
  }

  private setSessionCache(key: string, data: Record<string, any>, now: number) {
    // Evict oldest entry nếu đầy (LRU)
    if (this.sessionCache.size >= SESSION_CACHE_MAX) {
      const oldestKey = this.sessionCache.keys().next().value;
      if (oldestKey) this.sessionCache.delete(oldestKey);
    }
    this.sessionCache.set(key, { data, expireAt: now + SESSION_CACHE_TTL_MS });
  }

  /** Gọi khi user logout để xóa cache ngay lập tức */
  public invalidateSessionCache(userId: string | number): void {
    this.sessionCache.delete(String(userId));
  }

  // Verify signed claims before using them in Redis keys. Session/denylist reads run together.
  public async verifyToken(token: string, ipAddress?: string): Promise<any> {
    const options: jwt.VerifyOptions = {
      algorithms: ['RS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    };
    let decoded: jwt.JwtPayload;
    const publicKey = await this.fetchPublicKey();
    try {
      decoded = await jwtVerifyAsync(token, publicKey, options);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new UnauthorizedException('ACCESS_TOKEN_EXPIRED');
      if (
        error instanceof jwt.JsonWebTokenError &&
        error.message === 'invalid signature'
      ) {
        // A user-service restart/key rotation must not invalidate every newly issued JWT
        // for the entire five-minute public-key cache interval.
        if (!this.keyReload && Date.now() - this.lastKeyReload > 10000) {
          this.lastKeyReload = Date.now();
          this.keyReload = this.fetchPublicKey(true).finally(() => {
            this.keyReload = null;
          });
        }
        const freshKey = this.keyReload
          ? await this.keyReload
          : this.cachedPublicKey!;
        try {
          decoded = await jwtVerifyAsync(token, freshKey, options);
        } catch {
          throw new UnauthorizedException('Invalid or expired token');
        }
      } else {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
    if (
      !decoded.sub ||
      !/^[1-9]\d*$/.test(decoded.sub) ||
      !decoded.jti ||
      typeof decoded.sid !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(decoded.sid) ||
      typeof decoded.exp !== 'number'
    ) {
      throw new UnauthorizedException('Invalid token claims');
    }
    const [denylistHit, userSession, activeSession] = await Promise.all([
      this.redisService.get('denylist:' + decoded.jti).catch(() => {
        throw new ServiceUnavailableException(
          'Dịch vụ xác thực tạm thời không khả dụng',
        );
      }),
      this.getUserSession(decoded.sub),
      this.redisService.touchAuthSession(decoded.sid, decoded.sub).catch(() => {
        throw new ServiceUnavailableException(
          'Dịch vụ phiên đăng nhập tạm thời không khả dụng',
        );
      }),
    ]);
    if (!activeSession)
      throw new UnauthorizedException(
        'Phiên đăng nhập đã hết hạn hoặc bị thu hồi',
      );
    if (denylistHit) throw new UnauthorizedException('Token has been revoked');
    if (!Object.keys(userSession).length)
      throw new UnauthorizedException('Phiên đăng nhập cần được làm mới');
    if (userSession.isActive === false)
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    return { ...userSession, ...decoded };
  }
}
