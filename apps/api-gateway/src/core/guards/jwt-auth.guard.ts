import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenValidatorService } from '../../modules/integration/token-validator.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenValidator: TokenValidatorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    let token: string | undefined;

    // 1. ƯU TIÊN ĐỌC TỪ COOKIE (Do Frontend Next.js gửi lên bằng HttpOnly)
    if (request.cookies && request.cookies.accessToken) {
      token = request.cookies.accessToken;
    }
    // 2. NẾU KHÔNG CÓ COOKIE, MỚI TÌM TRONG HEADER (Dùng cho Postman / Mobile App)
    else if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer ')
    ) {
      token = request.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedException(
        'Không tìm thấy token xác thực trong Cookie hoặc Header',
      );
    }

    try {
      // verifyToken: RS256 + iss/aud/exp + denylist + Redis permission cache + audit log
      const ipAddress = (request as any).ip || request.headers['x-forwarded-for'] as string;
      const decoded = await this.tokenValidator.verifyToken(token, ipAddress);

      if (!decoded) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Chuẩn hóa user object cho request:
      // - id, sub từ JWT (luôn đáng tin cậy vì đã xác thực chữ ký)
      // - permissionsFlatten, roles, policies từ Redis session (Coarse-grained cache)
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
        // Quyền đọc từ Redis session cache (Coarse-grained)
        permissionsFlatten: decoded.permissionsFlatten || decoded.permissions_flatten || [],
        roles: decoded.roles || decoded.roleNames || decoded.role_names || [],
        policies: decoded.policies || [],
      };

      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('JWT Verification Error:', error?.message);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
