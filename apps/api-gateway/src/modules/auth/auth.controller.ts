import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  Req,
  Res,
  UseGuards,
  OnModuleInit,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('admin/auth')
export class AuthController implements OnModuleInit {
  private authService: any;
  private userService: any;

  constructor(
    @Inject(MICROSERVICES.AUTH.SYMBOL) private readonly authClient: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
  ) { }

  onModuleInit() {
    this.authService = this.authClient.getService(MICROSERVICES.AUTH.SERVICE);
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập bằng username hoặc email + mật khẩu' })
  @ApiResponse({ status: 200, description: 'accessToken, refreshToken, userId, email, username, fullName, unitName (camelCase)' })
  async login(
    @Body() body: { username?: string; email?: string; password?: string;[key: string]: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const hasPassword = body.password && String(body.password).trim().length > 0;
    const loginKey = body.username?.trim() || body.email?.trim();
    if (!loginKey || !hasPassword) {
      throw new BadRequestException(
        'Vui lòng gửi username hoặc email kèm password để đăng nhập.',
      );
    }
    try {
      const result = await firstValueFrom(
        this.userService.Login({
          usernameOrEmail: loginKey,
          password: body.password,
        }),
      ) as any;

      // Set cookies
      const cookieConfig = {
        httpOnly: true,
        secure: true, // Should be true in production, but user explicitly asked for true
        sameSite: 'strict' as const,
        maxAge: 15 * 60 * 1000,
      };

      res.cookie('accessToken', result.accessToken, cookieConfig);
      res.cookie('refreshToken', result.refreshToken, cookieConfig);

      return result;
    } catch (err: any) {
      const code = err?.code;
      const message = err?.details || err?.message || 'Đăng nhập thất bại';
      if (code === 16) throw new UnauthorizedException(message);
      throw new UnauthorizedException(message);
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới access_token bằng refresh_token (session)' })
  @ApiResponse({ status: 200, description: 'accessToken, refreshToken (rotation), userId, email, username, fullName, unitName' })
  async refresh(
    @Body() body: { refreshToken?: string },
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      body.refreshToken?.trim() ||
      (req.cookies?.refreshToken as string)?.trim();
    if (!token) {
      throw new UnauthorizedException('Thiếu refresh_token');
    }
    try {
      const result = await firstValueFrom(
        this.userService.Refresh({ refreshToken: token }),
      ) as any;

      // Set cookies
      const cookieConfig = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 15 * 60 * 1000,
      };

      res.cookie('accessToken', result.accessToken, cookieConfig);
      res.cookie('refreshToken', result.refreshToken, cookieConfig);

      return result;
    } catch (err: any) {
      const message = err?.details || err?.message || 'Refresh token không hợp lệ';
      throw new UnauthorizedException(message);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi refresh_token' })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: { refreshToken?: string },
  ) {
    const token =
      body?.refreshToken?.trim() ||
      (req.cookies?.refreshToken as string)?.trim();
    if (token) {
      try {
        await firstValueFrom(
          this.userService.RevokeRefreshToken({ refreshToken: token }),
        );
      } catch {
        // Ignore lỗi thu hồi
      }
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thông tin user đăng nhập' })
  async me(@Req() req: any) {
    return req.user || null;
  }
}
