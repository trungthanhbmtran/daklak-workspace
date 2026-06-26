import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../constants/services';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private userService: any;

  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

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
      const userId = parseInt(decoded.sub, 10);

      if (isNaN(userId)) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Check cache in Redis
      const cacheKey = `user:profile:${userId}`;
      let cachedUserStr: string | null = null;
      try {
        cachedUserStr = await this.redisService.get(cacheKey);
      } catch (err) {
        console.error('Redis cache read error:', err);
      }

      let userInfo: any = null;
      if (cachedUserStr) {
        try {
          userInfo = JSON.parse(cachedUserStr);
        } catch (err) {
          console.error('Failed to parse cached user string:', err);
        }
      }

      if (!userInfo) {
        try {
          userInfo = await firstValueFrom(
            this.userService.FindOne({ id: userId }),
          );
          if (userInfo) {
            try {
              await this.redisService.set(
                cacheKey,
                JSON.stringify(userInfo),
                900,
              ); // 15 mins
            } catch (err) {
              console.error('Redis cache write error:', err);
            }
          }
        } catch (err: any) {
          console.error(
            `Failed to fetch user info for ID ${userId} from user-service:`,
            err?.message,
          );
          throw new UnauthorizedException(
            'Không tìm thấy thông tin xác thực người dùng',
          );
        }
      }

      if (!userInfo || !userInfo.isActive) {
        throw new UnauthorizedException(
          'Tài khoản đã bị vô hiệu hóa hoặc không khả dụng',
        );
      }

      // Lưu đầy đủ thông tin vào request.user
      (request as any).user = {
        id: userId,
        email: userInfo.email,
        username: userInfo.username,
        fullName: userInfo.fullName || userInfo.full_name,
        employeeCode: userInfo.employeeCode || userInfo.employee_code,
        unitId: userInfo.unitId || userInfo.unit_id,
        unitCode: userInfo.unitCode || userInfo.unit_code,
        unitName: userInfo.unitName || userInfo.unit_name,
        jobTitleCode: userInfo.jobTitleCode || userInfo.job_title_code,
        jobTitleName: userInfo.jobTitleName || userInfo.job_title_name,
        permissionsFlatten:
          userInfo.permissionsFlatten || userInfo.permissions_flatten || [],
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
