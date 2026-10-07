import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  Optional,
} from '@nestjs/common';
import { Request } from 'express';
import { clientIp } from '../client-ip';
import { TokenValidatorService } from '../auth/token-validator.service';
import {
  ThreatIntelService,
  THREAT_SCORES,
} from '../threat-intel/threat-intel.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenValidator: TokenValidatorService,
    // Optional để không break các module chưa inject ThreatIntelService
    @Optional() private readonly threatIntel?: ThreatIntelService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = clientIp(request);

    let token: string | undefined;

    // 1. Ưu tiên đọc từ HttpOnly Cookie (Frontend Next.js)
    if (request.cookies?.accessToken) {
      token = request.cookies.accessToken;
    }
    // 2. Fallback: Authorization Bearer header (Postman / Mobile)
    else if (request.headers.authorization?.startsWith('Bearer ')) {
      token = request.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // An expired browser cookie can legitimately leave a request without a token.
      // Rate limiting handles unauthenticated traffic without penalizing shared office IPs.
      throw new UnauthorizedException(
        'Không tìm thấy token xác thực trong Cookie hoặc Header',
      );
    }

    try {
      // verifyToken: RS256 + iss/aud/exp + denylist check + Redis permission cache
      const decoded = await this.tokenValidator.verifyToken(token, ip);

      if (!decoded) {
        this.reportThreat(ip, 'INVALID_JWT', 'Decoded null');
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Chuẩn hóa user object:
      // - id, sub: từ JWT (đã xác thực chữ ký → tin tưởng tuyệt đối)
      // - permissionsFlatten, roles: từ Redis session cache (Coarse-grained)
      const userId = decoded.id || parseInt(decoded.sub, 10);
      (request as any).user = {
        id: userId,
        sub: decoded.sub,
        sid: decoded.sid,
        authVersion: decoded.authVersion,
        jti: decoded.jti,
        email: decoded.email,
        username: decoded.username,
        fullName: decoded.fullName || decoded.full_name,
        employeeCode: decoded.employeeCode || decoded.employee_code,
        isActive: decoded.isActive,
        unitId: decoded.unitId || decoded.unit_id,
        unitCode: decoded.unitCode || decoded.unit_code,
        unitName: decoded.unitName || decoded.unit_name,
        jobTitleCode: decoded.jobTitleCode || decoded.job_title_code,
        jobTitleName: decoded.jobTitleName || decoded.job_title_name,
        permissionsFlatten:
          decoded.permissionsFlatten || decoded.permissions_flatten || [],
        roles: decoded.roles || decoded.roleNames || decoded.role_names || [],
        policies: decoded.policies || [],
      };

      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        // Báo cáo event về ThreatIntel để tích điểm
        const msg = error.message ?? '';
        if (msg === 'ACCESS_TOKEN_EXPIRED' || msg.includes('Phiên đăng nhập')) {
          // Normal session lifecycle is not evidence of an attack.
          throw error;
        }
        if (msg.includes('revoked')) {
          this.reportThreat(ip, 'REVOKED_TOKEN', msg);
        } else if (msg.includes('expired') || msg.includes('invalid')) {
          this.reportThreat(ip, 'INVALID_JWT', msg);
        } else {
          this.reportThreat(ip, 'AUTH_FAIL', msg);
        }
        throw error;
      }
      if (error instanceof HttpException) throw error;
      this.reportThreat(ip, 'INVALID_JWT', error?.message);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  /** Fire-and-forget: báo cáo sự kiện về ThreatIntel mà không block request */
  private reportThreat(
    ip: string,
    event: keyof typeof THREAT_SCORES,
    detail?: string,
  ) {
    if (!this.threatIntel) return;
    this.threatIntel.recordEvent(ip, event, detail).catch(() => {});
  }
}
