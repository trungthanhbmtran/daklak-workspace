import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenValidatorService } from '../../modules/integration/token-validator.service';
import { ThreatIntelService, THREAT_SCORES } from '../threat-intel/threat-intel.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenValidator: TokenValidatorService,
    // Optional để không break các module chưa inject ThreatIntelService
    @Optional() private readonly threatIntel?: ThreatIntelService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = (request as any).clientIp
      || (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || request.ip
      || 'unknown';

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
      // Tích điểm: không có token → có thể đang probe API
      this.reportThreat(ip, 'AUTH_FAIL', 'No token provided');
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
        permissionsFlatten: decoded.permissionsFlatten || decoded.permissions_flatten || [],
        roles: decoded.roles || decoded.roleNames || decoded.role_names || [],
        policies: decoded.policies || [],
      };

      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        // Báo cáo event về ThreatIntel để tích điểm
        const msg = error.message ?? '';
        if (msg.includes('revoked')) {
          this.reportThreat(ip, 'REVOKED_TOKEN', msg);
        } else if (msg.includes('expired') || msg.includes('invalid')) {
          this.reportThreat(ip, 'INVALID_JWT', msg);
        } else {
          this.reportThreat(ip, 'AUTH_FAIL', msg);
        }
        throw error;
      }
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
