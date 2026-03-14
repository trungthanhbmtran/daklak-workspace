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
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    let token: string | undefined;

    // 1. ƯU TIÊN ĐỌC TỪ COOKIE (Do Frontend Next.js gửi lên bằng HttpOnly)
    // Chú ý: Tên cookie phải khớp với tên bạn đã set lúc Login (ví dụ: 'accessToken')
    if (request.cookies && request.cookies.accessToken) {
      token = request.cookies.accessToken;
    } 
    // 2. NẾU KHÔNG CÓ COOKIE, MỚI TÌM TRONG HEADER (Dùng cho Postman / Mobile App)
    else if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
      token = request.headers.authorization.split(' ')[1];
    }

    // console.log(token);


    // Nếu tìm cả 2 nơi đều không thấy token
    if (!token) {
      throw new UnauthorizedException('Không tìm thấy token xác thực trong Cookie hoặc Header');
    }

    try {
      // Cùng secret với user-service
      const secret =
        process.env.JWT_SECRET ||
        process.env.ACCESS_TOKEN_SECRET ||
        'super-secret';
        
      const decoded = jwt.verify(token, secret) as any;
      
      // Gắn thông tin user vào request để các Controller có thể lấy dùng (@Req() req)
      (request as any).user = {
        id: decoded.sub,
        email: decoded.email,
        identitycard: decoded.identitycard,
        roles: decoded.roles || [],
      };
      
      return true;
    } catch (error) {
      // Bắt lỗi cụ thể để dễ debug hơn
      console.error("JWT Verification Error:", error.message);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}