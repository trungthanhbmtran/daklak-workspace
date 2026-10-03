import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { clientIp } from '../client-ip';
import {
  ThreatIntelService,
  ThreatLevel,
} from '../threat-intel/threat-intel.service';

/**
 * SecurityMiddleware — Lớp bảo vệ đầu tiên (First Line of Defense).
 *
 * Áp dụng TRƯỚC tất cả middleware khác:
 * 1. Kiểm tra IP trong blocklist Redis → block ngay (HTTP 403)
 * 2. Phân tích request pattern (SQL injection, path traversal, XSS, scanner UA)
 * 3. Tích điểm hành vi → tự động nâng level đe dọa
 * 4. Log chi tiết mọi mối đe dọa để audit
 *
 * Chi phí xử lý: ~0.5ms (1 Redis GET cho blocklist check)
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  // Whitelist paths không cần phân tích (health check, static assets)
  private readonly WHITELIST_PATHS = [
    '/api/v1/health',
    '/api/v1/metrics',
    '/favicon.ico',
  ];

  constructor(private readonly threatIntel: ThreatIntelService) {}

  async use(req: any, res: any, next: () => void) {
    const ip = clientIp(req);
    const url: string = req.originalUrl || req.url;
    const method: string = req.method;
    const userAgent: string = req.headers['user-agent'] ?? '';

    // ── Bỏ qua whitelist paths ────────────────────────────────────────────
    if (this.WHITELIST_PATHS.some((p) => url.startsWith(p))) {
      req.clientIp = ip;
      return next();
    }

    // ── Kiểm tra blocklist (fast path — chỉ 1 Redis GET ~0.5ms) ──────────
    const isBlocked = await this.threatIntel.isBlocked(ip);
    if (isBlocked) {
      this.logger.warn(
        `[BLOCKED_REQUEST] ip=${ip} url=${url} ua=${userAgent.substring(0, 50)}`,
      );
      return res.status(403).json({
        success: false,
        statusCode: 403,
        errorType: 'IP_BLOCKED',
        message:
          'Truy cập bị từ chối. IP của bạn đã bị khóa do hoạt động đáng ngờ.',
        retryAfter: 3600,
      });
    }

    // ── Phân tích threat pattern (async, không block response) ───────────
    // Chạy phân tích trong background, không làm chậm request hợp lệ
    const bodyStr = req.body ? JSON.stringify(req.body).substring(0, 500) : '';
    const queryStr = req.query
      ? JSON.stringify(req.query).substring(0, 200)
      : '';

    // Fire-and-forget: phân tích sau khi đã forward request
    // Nếu phát hiện pattern nguy hiểm, sẽ block request TIẾP THEO từ IP này
    this.threatIntel
      .analyzeRequest(ip, {
        url,
        method,
        userAgent,
        body: bodyStr,
        query: queryStr,
      })
      .then(({ threatLevel, shouldBlock, reasons }) => {
        if (shouldBlock) {
          this.logger.error(
            `[THREAT:AUTO_BLOCK] ip=${ip} level=${threatLevel} reasons=${reasons.join('|')} url=${url}`,
          );
        } else if (threatLevel === ThreatLevel.SCANNER) {
          this.logger.warn(
            `[THREAT:SCANNER] ip=${ip} url=${url} reasons=${reasons.join('|')}`,
          );
        } else if (threatLevel === ThreatLevel.SUSPICIOUS) {
          this.logger.warn(`[THREAT:SUSPICIOUS] ip=${ip} url=${url}`);
        }
      })
      .catch(() => {}); // Fail silently — không ảnh hưởng request

    // ── Inject threat context vào request để Guard sử dụng ───────────────
    req.clientIp = ip;

    next();
  }
}
