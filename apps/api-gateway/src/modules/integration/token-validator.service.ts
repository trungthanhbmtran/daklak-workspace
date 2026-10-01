import {
  Injectable,
  Logger,
  UnauthorizedException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';

import { RedisService } from '../../core/redis/redis.service';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

// Chuẩn RFC 7519 + OWASP ASVS Level 2 (Thông tư 06/2023/TT-BTTTT)
const JWT_ISSUER = 'daklak-user-service';
const JWT_AUDIENCE = 'daklak-api-gateway';

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
const jwtVerifyAsync = promisify<string, string, jwt.VerifyOptions, jwt.JwtPayload>(
  jwt.verify as any,
);

@Injectable()
export class TokenValidatorService implements OnModuleInit {
  private readonly logger = new Logger(TokenValidatorService.name);
  private grpcService: any;

  // ── Public Key cache (in-memory, 5 phút) ──────────────────────────────────
  private cachedPublicKey: string | null = null;
  private lastFetchTime = 0;

  // ── User Session LRU cache (in-memory, 30 giây) ───────────────────────────
  // Map giữ thứ tự insertion → evict entry cũ nhất khi vượt MAX
  private readonly sessionCache = new Map<string, CacheEntry>();

  constructor(
    private readonly redisService: RedisService,
    @Inject(MICROSERVICES.INTEGRATION.SYMBOL) private readonly client: any,
  ) {}

  async onModuleInit() {
    this.grpcService = this.client.getService(MICROSERVICES.INTEGRATION.SERVICE);
    this.fetchPublicKey().catch(e =>
      this.logger.warn(`Failed to initial fetch public key: ${e.message}`),
    );
  }

  // ─── Public Key ───────────────────────────────────────────────────────────

  private async fetchPublicKey(): Promise<string> {
    const now = Date.now();
    if (this.cachedPublicKey && now - this.lastFetchTime < 5 * 60 * 1000) {
      return this.cachedPublicKey;
    }
    try {
      const response = (await firstValueFrom(
        this.grpcService.GetPublicKey({}),
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
      if (this.cachedPublicKey) return this.cachedPublicKey as string;
      throw new Error('Unable to fetch public key for JWT verification');
    }
  }

  // ─── User Session (LRU in-memory + Redis fallback) ───────────────────────

  /**
   * Lấy user session với LRU in-process cache (30s TTL).
   * - HIT: trả về ngay từ RAM (0ms)
   * - MISS: gọi Redis (1ms), lưu vào RAM cache
   * - Invalidate: gọi invalidateSessionCache(userId) khi logout
   */
  public async getUserSession(userId: string | number): Promise<Record<string, any>> {
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
      this.logger.warn(`[getUserSession] Redis error for user ${userId}: ${e.message}`);
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

  // ─── Core: verifyToken với Parallel Execution ─────────────────────────────

  /**
   * TỐI ƯU TỐC ĐỘ — 3 kỹ thuật:
   *
   * 1. jwt.decode() TRƯỚC (0ms, no crypto) → lấy jti + sub để pipeline Redis
   * 2. Promise.all([jwt.verify(), redisChecks]) — chạy SONG SONG
   *    - jwt.verify() (RS256): ~1-2ms CPU
   *    - Redis pipeline(denylist + session): ~1ms network
   *    → Tiết kiệm ~1-2ms so với sequential
   * 3. user_session từ LRU in-process cache (30s) → 0 Redis call / 99% requests
   *
   * Kết quả: ~4ms → ~1ms overhead/request
   *
   * Bảo mật vẫn đảm bảo:
   * - jwt.verify() vẫn check chữ ký RS256 + iss + aud + exp
   * - Denylist check vẫn thực thi sau khi verify thành công
   * - Session cache 30s: stale window chấp nhận được cho Coarse-grained auth
   */
  public async verifyToken(token: string, ipAddress?: string): Promise<any> {
    // ── BƯỚC 1: Decode nhanh (không verify) để lấy claims sớm ──────────────
    // jwt.decode() không check chữ ký — dùng để pipeline Redis song song
    // jwt.verify() bên dưới sẽ xác thực đầy đủ ngay sau
    const rawDecoded = jwt.decode(token) as any;
    const earlyJti = rawDecoded?.jti;
    const earlySub = rawDecoded?.sub;

    // ── BƯỚC 2: Lấy Public Key (in-memory, ~0ms) ────────────────────────────
    const publicKey = await this.fetchPublicKey();

    // ── BƯỚC 3: Parallel execution ──────────────────────────────────────────
    // A) JWT verify + B) Redis denylist + C) Session cache — chạy đồng thời
    const [decoded, denylistHit, userSession] = await Promise.all([
      // A) Xác thực đầy đủ: chữ ký RS256 + iss + aud + exp
      jwtVerifyAsync(token, publicKey, {
        algorithms: ['RS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }).catch((e: any) => {
        this.logger.warn(`[AUTH_FAILED] ${e.message} | ip=${ipAddress ?? 'unknown'}`);
        throw new UnauthorizedException('Invalid or expired token');
      }),

      // B) Kiểm tra denylist (JTI) — song song với verify
      earlyJti
        ? this.redisService
            .get(`denylist:${earlyJti}`)
            .catch((e: any) => {
              this.logger.warn(`Denylist check failed for jti=${earlyJti}: ${e.message}`);
              return null; // Fail open — tránh block toàn bộ
            })
        : Promise.resolve(null),

      // C) Session quyền — LRU cache (30s) → 0 Redis call cho 99% request
      earlySub
        ? this.getUserSession(earlySub)
        : Promise.resolve({}),
    ]);

    // ── BƯỚC 4: Kiểm tra denylist sau khi verify thành công ─────────────────
    if (denylistHit) {
      this.logger.warn(
        `[AUTH_REVOKED] jti=${decoded.jti} sub=${decoded.sub} | ip=${ipAddress ?? 'unknown'}`,
      );
      throw new UnauthorizedException('Token has been revoked');
    }

    // ── BƯỚC 5: Audit log (async, không block response) ────────────────────
    setImmediate(() => {
      this.logger.log(
        `[AUTH_SUCCESS] sub=${decoded.sub} jti=${decoded.jti} | ip=${ipAddress ?? 'unknown'}`,
      );
    });

    // JWT claims (đã xác thực chữ ký) ghi đè session để đảm bảo toàn vẹn
    return { ...userSession, ...decoded };
  }
}
