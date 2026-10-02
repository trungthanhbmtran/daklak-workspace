import {
  Injectable,
  Inject,
  OnModuleInit,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { MICROSERVICES } from '../../core/constants/services';
import { sanitizeUserForClient } from '../../common/utils/user.util';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';
import type { AuthTokens } from './auth-cookies';

@Injectable()
export class AuthService implements OnModuleInit {
  private userGrpcService: any;
  private employeeGrpcService: any;
  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly employeeClient: any,
  ) {}
  onModuleInit() {
    this.userGrpcService = this.userClient.getService(
      MICROSERVICES.USER.SERVICE,
    );
    this.employeeGrpcService = this.employeeClient.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
  }
  private authError(error: unknown): Error {
    const rpc = error as { code?: number; details?: string };
    if (rpc.code === 16)
      return new UnauthorizedException(
        rpc.details || 'Thông tin đăng nhập không hợp lệ hoặc đã hết hạn',
      );
    if (rpc.code === 10)
      return new ConflictException(
        'Phiên đang được làm mới. Vui lòng thử lại.',
      );
    if (rpc.code === 8)
      return new HttpException(
        'Tạm thời không thể đăng nhập. Vui lòng thử lại sau.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    if (rpc.code === 3)
      return new BadRequestException(
        rpc.details || 'Thông tin đăng nhập không hợp lệ',
      );
    return new ServiceUnavailableException(
      'Dịch vụ xác thực tạm thời không khả dụng. Vui lòng thử lại.',
    );
  }
  private establishSession(res: Response, result: AuthTokens) {
    setAuthCookies(res, result);
    return {
      sessionId: randomUUID(),
      expiresAt: new Date(Date.now() + result.expiresIn * 1000).toISOString(),
    };
  }
  async login(body: any, res: Response) {
    const loginKey =
      (typeof body?.username === 'string' && body.username.trim()) ||
      (typeof body?.email === 'string' && body.email.trim());
    if (
      !loginKey ||
      typeof body?.password !== 'string' ||
      !body.password.trim()
    ) {
      throw new BadRequestException(
        'Vui lòng gửi username hoặc email kèm password để đăng nhập.',
      );
    }
    try {
      const result = await firstValueFrom<AuthTokens>(
        this.userGrpcService
          .Login({ usernameOrEmail: loginKey, password: body.password })
          .pipe(timeout(10000)),
      );
      return this.establishSession(res, result);
    } catch (error) {
      throw this.authError(error);
    }
  }
  private refreshToken(body: any, req: any): string {
    if (body?.refreshToken != null && typeof body.refreshToken !== 'string') {
      throw new BadRequestException('refreshToken phải là chuỗi');
    }
    return (
      body?.refreshToken?.trim() ||
      (typeof req.cookies?.refreshToken === 'string'
        ? req.cookies.refreshToken.trim()
        : '')
    );
  }
  async refresh(body: any, req: any, res: Response) {
    const token = this.refreshToken(body, req);
    if (!token) {
      throw new UnauthorizedException('Thiếu refresh_token');
    }
    try {
      const result = await firstValueFrom<AuthTokens>(
        this.userGrpcService
          .Refresh({ refreshToken: token })
          .pipe(timeout(10000)),
      );
      return this.establishSession(res, result);
    } catch (error) {
      const mapped = this.authError(error);
      throw mapped;
    }
  }
  async logout(req: any, res: Response, body?: any) {
    // Always clear the browser session, including legacy cookies, even if revocation is unavailable.
    clearAuthCookies(res);
    const token = this.refreshToken(body, req);
    if (token) {
      try {
        await firstValueFrom(
          this.userGrpcService
            .RevokeRefreshToken({ refreshToken: token })
            .pipe(timeout(5000)),
        );
      } catch (error) {
        throw this.authError(error);
      }
    }
    return { success: true };
  }

  async me(req: any) {
    const employeeId = req.user?.employeeId;
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không tìm thấy thông tin user trong token',
      );
    }

    const user: any = await firstValueFrom(
      this.userGrpcService.FindOne({ id: Number(userId) }).pipe(timeout(10000)),
    ).catch((error) => {
      if (error?.code === 5)
        throw new UnauthorizedException('Tài khoản không còn tồn tại');
      throw this.authError(error);
    });
    if (!user?.id || user.isActive === false)
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    let hrm: any = null;

    if (employeeId) {
      try {
        const empRes: any = await firstValueFrom(
          this.employeeGrpcService.GetEmployee({ id: Number(employeeId) }),
        );
        hrm = empRes?.data;
      } catch (e) {
        // Ignore error
      }
    }

    return sanitizeUserForClient({
      ...user,
      fullName: hrm?.fullName || user?.fullName,
      avatarUrl: hrm?.avatar || user?.avatarUrl,
    });
  }
}
