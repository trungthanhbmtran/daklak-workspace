import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

// ─── Threat Score Matrix ───────────────────────────────────────────────────
export const THREAT_SCORES = {
  AUTH_FAIL: 10,           // 401 - sai mật khẩu, token hết hạn
  INVALID_JWT: 15,         // Token bị giả mạo / sai định dạng
  REVOKED_TOKEN: 50,       // Token bị thu hồi (đã logout) vẫn dùng → đáng ngờ cao
  FORBIDDEN: 5,            // 403 - truy cập không có quyền
  ENDPOINT_PROBE: 3,       // 404 - quét endpoint
  SQL_INJECTION: 200,      // Pattern SQL injection → block ngay
  PATH_TRAVERSAL: 200,     // ../ path traversal → block ngay
  XSS_ATTEMPT: 100,        // <script> pattern
  SCANNER_UA: 30,          // User-Agent của tool quét bảo mật / bot
  MASS_ENDPOINT_SCAN: 20,  // Quét nhiều endpoint 404 liên tiếp (nhân lên)
} as const;

// ─── Phân loại mối đe dọa ─────────────────────────────────────────────────
export enum ThreatLevel {
  CLEAN = 'CLEAN',           // Score 0-49: bình thường
  SUSPICIOUS = 'SUSPICIOUS', // Score 50-149: tăng cường giám sát
  SCANNER = 'SCANNER',       // Score 150-299: đang quét hệ thống
  ATTACKER = 'ATTACKER',     // Score 300-499: đang tấn công → auto-block 1h
  BLOCKED = 'BLOCKED',       // Score 500+: block 24h
}

export interface ThreatProfile {
  ip: string;
  score: number;
  level: ThreatLevel;
  reasons: string[];
  firstSeenAt: number;
  lastSeenAt: number;
  isBlocked: boolean;
  blockExpiresAt?: number;
  requestCount: number;
}

// Known scanner / exploit framework User-Agents
const MALICIOUS_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
  /nuclei/i, /dirsearch/i, /gobuster/i, /hydra/i, /burpsuite/i,
  /metasploit/i, /nessus/i, /openvas/i, /wfuzz/i, /ffuf/i,
  /python-requests\/[0-1]\./i, // Rất cũ — thường là tool tự động
];

// SQL Injection patterns (Chỉ áp dụng cho URL/Query, rất dễ false positive nếu áp dụng cho Body)
const STRICT_SQLI_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
];

// SQL Injection patterns (Áp dụng cho toàn bộ Request bao gồm Body)
const GENERIC_SQLI_PATTERNS = [
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /union.+select/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /INFORMATION_SCHEMA/i,
  /DROP\s+TABLE/i,
  /INSERT\s+INTO/i,
  /DELETE\s+FROM/i,
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /%2e%2e[\/\\]/i,
  /\.\.\%2f/i,
  /\%2e\%2e\%2f/i,
  /etc\/passwd/i,
  /etc\/shadow/i,
  /windows\/system32/i,
];

// XSS patterns
const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on(load|error|click|mouse)\s*=/i,
  /\balert\s*\(/i,
];

// TTL configs (giây)
const SCORE_TTL_SEC = 3600;        // Score reset sau 1h không hoạt động
const BLOCK_ATTACKER_TTL = 3600;   // Block 1h nếu ATTACKER
const BLOCK_PERMANENT_TTL = 86400; // Block 24h nếu score 500+
const PROFILE_TTL_SEC = 86400;     // Lưu profile 24h

@Injectable()
export class ThreatIntelService {
  private readonly logger = new Logger(ThreatIntelService.name);

  constructor(private readonly redisService: RedisService) { }

  // ─── Kiểm tra xem IP có đang bị block không ──────────────────────────────

  async isBlocked(ip: string): Promise<boolean> {
    try {
      const blocked = await this.redisService.get(`threat:blocked:${ip}`);
      return blocked !== null;
    } catch {
      return false; // Fail open — tránh outage
    }
  }

  // ─── Lấy profile đe dọa của một IP ──────────────────────────────────────

  async getProfile(ip: string): Promise<ThreatProfile | null> {
    try {
      const raw = await this.redisService.get(`threat:profile:${ip}`);
      if (raw) return JSON.parse(raw);
    } catch { }
    return null;
  }

  // ─── Phân tích request và tính threat score ───────────────────────────────

  /**
   * Phân tích request để phát hiện mẫu tấn công.
   * Tích điểm theo hành vi, tự động block khi vượt ngưỡng.
   */
  async analyzeRequest(
    ip: string,
    ctx: {
      url: string;
      method: string;
      userAgent?: string;
      body?: string;
      query?: string;
    },
  ): Promise<{ threatLevel: ThreatLevel; shouldBlock: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let additionalScore = 0;

    // ── 1. Kiểm tra User-Agent ──
    const ua = ctx.userAgent ?? '';
    for (const pattern of MALICIOUS_UA_PATTERNS) {
      if (pattern.test(ua)) {
        additionalScore += THREAT_SCORES.SCANNER_UA;
        reasons.push(`Malicious UA detected: ${ua.substring(0, 50)}`);
        break;
      }
    }

    // ── 2. Kiểm tra SQL Injection ──
    const urlAndQuery = `${ctx.url} ${ctx.query ?? ''}`;
    const fullInput = `${ctx.url} ${ctx.body ?? ''} ${ctx.query ?? ''}`;

    // Kiểm tra gắt gao (Dấu nháy đơn, Hash) chỉ trên URL và Query Params để tránh false positive trong Body JSON
    for (const pattern of STRICT_SQLI_PATTERNS) {
      if (pattern.test(urlAndQuery)) {
        additionalScore += THREAT_SCORES.SQL_INJECTION;
        reasons.push('SQL Injection attempt detected in URL/Query');
        break;
      }
    }

    // Kiểm tra cấu trúc tấn công (Union, Drop, Exec) trên toàn bộ Payload bao gồm Body
    for (const pattern of GENERIC_SQLI_PATTERNS) {
      if (pattern.test(fullInput)) {
        additionalScore += THREAT_SCORES.SQL_INJECTION;
        reasons.push('SQL Injection attempt detected in Payload');
        break;
      }
    }

    // ── 3. Kiểm tra Path Traversal ──
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(ctx.url)) {
        additionalScore += THREAT_SCORES.PATH_TRAVERSAL;
        reasons.push('Path traversal attempt detected');
        break;
      }
    }

    // ── 4. Kiểm tra XSS ──
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(fullInput)) {
        additionalScore += THREAT_SCORES.XSS_ATTEMPT;
        reasons.push('XSS attempt detected');
        break;
      }
    }

    // ── 5. Ghi nhận và tính tổng score ──
    const profile = await this.recordScore(ip, additionalScore, reasons);

    return {
      threatLevel: profile.level,
      shouldBlock: profile.isBlocked,
      reasons: profile.reasons.slice(-5), // Trả về 5 lý do gần nhất
    };
  }

  /**
   * Ghi nhận sự kiện bảo mật (gọi từ Guard/Middleware khi có lỗi xác thực).
   */
  async recordEvent(
    ip: string,
    event: keyof typeof THREAT_SCORES,
    detail?: string,
  ): Promise<ThreatProfile> {
    const score = THREAT_SCORES[event];
    const reason = detail ? `${event}: ${detail}` : event;
    return this.recordScore(ip, score, [reason]);
  }

  // ─── Internal: Ghi nhận và tính toán điểm ────────────────────────────────

  private async recordScore(
    ip: string,
    additionalScore: number,
    reasons: string[],
  ): Promise<ThreatProfile> {
    const redisClient = this.redisService.getClient();
    const now = Date.now();

    try {
      // Lấy profile hiện tại
      const raw = await this.redisService.get(`threat:profile:${ip}`);
      const existing: Partial<ThreatProfile> = raw ? JSON.parse(raw) : {};

      // Tính score mới bằng Redis INCRBY (atomic)
      const scoreKey = `threat:score:${ip}`;
      const pipeline = redisClient.pipeline();
      pipeline.incrby(scoreKey, additionalScore);
      pipeline.ttl(scoreKey);
      const results = await pipeline.exec();

      const totalScore = (results?.[0]?.[1] as number) ?? additionalScore;
      const ttl = results?.[1]?.[1] as number;
      if (ttl === -1) {
        await redisClient.expire(scoreKey, SCORE_TTL_SEC);
      }

      // Phân loại mức độ đe dọa
      const level = this.classifyThreat(totalScore);
      const isBlocked = await this.isBlocked(ip);

      // Auto-block nếu đạt ngưỡng và chưa bị block
      let blockExpiresAt: number | undefined = undefined;
      if (!isBlocked) {
        if (totalScore >= 500) {
          await redisClient.setex(`threat:blocked:${ip}`, BLOCK_PERMANENT_TTL, 'PERMANENT');
          blockExpiresAt = now + BLOCK_PERMANENT_TTL * 1000;
          this.logger.error(
            `[THREAT:BLOCKED] ip=${ip} score=${totalScore} — BLOCKED 24h. Reasons: ${reasons.join(', ')}`,
          );
        } else if (totalScore >= 300) {
          await redisClient.setex(`threat:blocked:${ip}`, BLOCK_ATTACKER_TTL, 'ATTACKER');
          blockExpiresAt = now + BLOCK_ATTACKER_TTL * 1000;
          this.logger.error(
            `[THREAT:ATTACKER] ip=${ip} score=${totalScore} — AUTO-BLOCKED 1h. Reasons: ${reasons.join(', ')}`,
          );
        } else if (totalScore >= 150) {
          this.logger.warn(
            `[THREAT:SCANNER] ip=${ip} score=${totalScore}. Reasons: ${reasons.join(', ')}`,
          );
        } else if (totalScore >= 50) {
          this.logger.warn(
            `[THREAT:SUSPICIOUS] ip=${ip} score=${totalScore}. Reasons: ${reasons.join(', ')}`,
          );
        }
      }

      // Ghi nhận reason SQL/Traversal/XSS ngay cả khi score = 0 để audit
      if (additionalScore >= 100) {
        this.logger.error(
          `[THREAT:CRITICAL_PATTERN] ip=${ip} score=+${additionalScore} ${reasons.join(' | ')}`,
        );
      }

      // Cập nhật profile
      const allReasons = [
        ...(existing.reasons ?? []),
        ...reasons.filter(r => r.length > 0),
      ].slice(-20); // Giữ 20 lý do gần nhất

      const profile: ThreatProfile = {
        ip,
        score: totalScore,
        level,
        reasons: allReasons,
        firstSeenAt: existing.firstSeenAt ?? now,
        lastSeenAt: now,
        isBlocked: totalScore >= 300 || isBlocked,
        blockExpiresAt: blockExpiresAt ?? existing.blockExpiresAt,
        requestCount: (existing.requestCount ?? 0) + 1,
      };

      await this.redisService.set(
        `threat:profile:${ip}`,
        JSON.stringify(profile),
        PROFILE_TTL_SEC,
      );

      return profile;
    } catch (e: any) {
      this.logger.error(`[ThreatIntel] Redis error for ip=${ip}: ${e.message}`);
      return {
        ip,
        score: 0,
        level: ThreatLevel.CLEAN,
        reasons: [],
        firstSeenAt: now,
        lastSeenAt: now,
        isBlocked: false,
        requestCount: 1,
      };
    }
  }

  private classifyThreat(score: number): ThreatLevel {
    if (score >= 500) return ThreatLevel.BLOCKED;
    if (score >= 300) return ThreatLevel.ATTACKER;
    if (score >= 150) return ThreatLevel.SCANNER;
    if (score >= 50) return ThreatLevel.SUSPICIOUS;
    return ThreatLevel.CLEAN;
  }

  // ─── Admin: Unblock thủ công ──────────────────────────────────────────────

  async unblock(ip: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`threat:blocked:${ip}`),
      this.redisService.del(`threat:score:${ip}`),
      this.redisService.del(`threat:profile:${ip}`),
    ]);
    this.logger.log(`[THREAT:UNBLOCKED] ip=${ip} manually unblocked`);
  }
}
