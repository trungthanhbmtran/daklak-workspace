import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ClientGrpc } from '@nestjs/microservices';
import { MICROSERVICES } from '../constants/services';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private userService: any;

  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.userService) {
      this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
    }

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

      // Call User Service to fetch permissions dynamically
      let userRes: any = null;
      const userId = parseInt(decoded.sub, 10);
      try {
        userRes = await firstValueFrom(
          this.userService.FindOne({ id: userId })
        );
      } catch (err) {
        console.error('Failed to fetch user permissions from user-service:', err.message);
      }


      // Gắn thông tin user vào request
      (request as any).user = {
        id: userId,
        employeeId: userRes?.employeeId,
      };

      return true;
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
