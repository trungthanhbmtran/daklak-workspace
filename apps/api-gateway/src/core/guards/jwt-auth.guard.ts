import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
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
      const secret =
        process.env.JWT_SECRET ||
        process.env.ACCESS_TOKEN_SECRET ||
        'super-secret';

      const decoded = jwt.verify(token, secret) as any;

      // Chỉ lưu userId từ JWT – mỗi controller tự gọi FindOne khi cần
      (request as any).user = {
        id: parseInt(decoded.sub, 10),
      };

      return true;
    } catch (error: any) {
      console.error('JWT Verification Error:', error?.message);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
