import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RateLimitGuard, RateLimit } from '../../core/guards/rate-limit.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login: Rate limit 10 lần/15 phút theo IP.
   * Chuẩn OWASP ASVS §2.2.1 — Brute-Force Protection
   */
  @Post('login')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSec: 900, keyBy: 'ip', prefix: 'login' })
  @ApiOperation({ summary: 'Đăng nhập bằng username hoặc email + mật khẩu' })
  @ApiResponse({
    status: 200,
    description:
      'Trả về sessionId và expiresAt. Token được gán qua HTTP-Only Cookie.',
  })
  @ApiResponse({
    status: 429,
    description: 'Quá nhiều lần thử đăng nhập. Thử lại sau 15 phút.',
  })
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(body, res);
  }

  /**
   * Refresh: Rate limit 30 lần/15 phút theo IP.
   * Ngăn attacker brute-force refresh token.
   */
  @Post('refresh')
  @Header('Cache-Control', 'no-store')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 30, windowSec: 900, keyBy: 'ip', prefix: 'refresh' })
  @ApiOperation({
    summary: 'Làm mới access_token bằng refresh_token (session)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Trả về sessionId và expiresAt. Token mới được gán qua HTTP-Only Cookie.',
  })
  async refresh(
    @Body() body: any,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(body, req, res);
  }

  @Post('logout')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi refresh_token' })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: any,
  ) {
    return this.authService.logout(req, res, body);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thông tin user đăng nhập' })
  async me(@Req() req: any) {
    return this.authService.me(req);
  }
}

