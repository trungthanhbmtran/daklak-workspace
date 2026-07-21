import { Injectable, Inject, OnModuleInit, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { MICROSERVICES } from '../../core/constants/services';
import { sanitizeUserForClient } from '../../common/utils/user.util';

@Injectable()
export class AuthService implements OnModuleInit {
  private authGrpcService: any;
  private userGrpcService: any;
  private employeeGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.AUTH.SYMBOL) private readonly authClient: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly employeeClient: any,
  ) {}

  onModuleInit() {
    this.authGrpcService = this.authClient.getService(MICROSERVICES.AUTH.SERVICE);
    this.userGrpcService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
    this.employeeGrpcService = this.employeeClient.getService(MICROSERVICES.EMPLOYEE.SERVICE);
  }

  async login(body: any, res: Response) {
    const hasPassword = body.password && String(body.password).trim().length > 0;
    const loginKey = body.username?.trim() || body.email?.trim();
    if (!loginKey || !hasPassword) {
      throw new BadRequestException(
        'Vui lòng gửi username hoặc email kèm password để đăng nhập.',
      );
    }
    try {
      const result = (await firstValueFrom(
        this.userGrpcService.Login({
          usernameOrEmail: loginKey,
          password: body.password,
        }),
      )) as any;

      const cookieConfig = {
        httpOnly: true,
        secure: false, // Tắt secure để chạy được trên HTTP (port 80)
        sameSite: 'strict' as const,
        maxAge: 15 * 60 * 1000,
      };

      res.cookie('accessToken', result.accessToken, cookieConfig);
      res.cookie('refreshToken', result.refreshToken, cookieConfig);

      const expiresAt = new Date(Date.now() + (result.expiresIn || 86400) * 1000).toISOString();

      return {
        sessionId: randomUUID(),
        expiresAt,
      };
    } catch (err: any) {
      const code = err?.code;
      const message = err?.details || err?.message || 'Đăng nhập thất bại';
      if (code === 16) throw new UnauthorizedException(message);
      throw new UnauthorizedException(message);
    }
  }

  async refresh(body: any, req: any, res: Response) {
    const token =
      body.refreshToken?.trim() ||
      (req.cookies?.refreshToken as string)?.trim();
    if (!token) {
      throw new UnauthorizedException('Thiếu refresh_token');
    }
    try {
      const result = (await firstValueFrom(
        this.userGrpcService.Refresh({ refreshToken: token }),
      )) as any;

      const cookieConfig = {
        httpOnly: true,
        secure: false, // Tắt secure để chạy được trên HTTP (port 80)
        sameSite: 'strict' as const,
        maxAge: 15 * 60 * 1000,
      };

      res.cookie('accessToken', result.accessToken, cookieConfig);
      res.cookie('refreshToken', result.refreshToken, cookieConfig);

      const expiresAt = new Date(Date.now() + (result.expiresIn || 86400) * 1000).toISOString();

      return {
        sessionId: randomUUID(),
        expiresAt,
      };
    } catch (err: any) {
      const message = err?.details || err?.message || 'Refresh token không hợp lệ';
      throw new UnauthorizedException(message);
    }
  }

  async logout(req: any, res: Response, body?: any) {
    const token =
      body?.refreshToken?.trim() ||
      (req.cookies?.refreshToken as string)?.trim();
    if (token) {
      try {
        await firstValueFrom(
          this.userGrpcService.RevokeRefreshToken({ refreshToken: token }),
        );
      } catch {
        // Ignore lỗi thu hồi
      }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { success: true };
  }

  async me(req: any) {
    const employeeId = req.user?.employeeId;
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin user trong token');
    }

    const user: any = await firstValueFrom(
      this.userGrpcService.FindOne({ id: Number(userId) }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
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
