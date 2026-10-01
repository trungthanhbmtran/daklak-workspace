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
      // Xác thực token qua JWKS và check Denylist
      const decodedUser = await this.tokenValidator.verifyToken(token);

      if (!decodedUser || decodedUser.isActive === false) {
        throw new UnauthorizedException(
          'Tài khoản đã bị vô hiệu hóa hoặc không khả dụng',
        );
      }

      // Payload của JWT mới từ user-service đã chứa sẵn đủ thông tin,
      // Không cần gọi gRPC FindOne ngược về user-service nữa.
      (request as any).user = {
        id: decodedUser.id || parseInt(decodedUser.sub, 10),
        email: decodedUser.email,
        username: decodedUser.username,
        fullName: decodedUser.fullName || decodedUser.full_name,
        employeeCode: decodedUser.employeeCode || decodedUser.employee_code,
        unitId: decodedUser.unitId || decodedUser.unit_id,
        unitCode: decodedUser.unitCode || decodedUser.unit_code,
        unitName: decodedUser.unitName || decodedUser.unit_name,
        jobTitleCode: decodedUser.jobTitleCode || decodedUser.job_title_code,
        jobTitleName: decodedUser.jobTitleName || decodedUser.job_title_name,
        policies: decodedUser.policies || [],
        permissionsFlatten:
          decodedUser.permissionsFlatten || decodedUser.permissions_flatten || [],
        roles: decodedUser.roles || [],
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
