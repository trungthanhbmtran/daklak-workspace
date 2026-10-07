import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Header,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { LoginDto, RefreshTokenDto } from './auth.dto';
import type { AuthRequest } from './auth.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RateLimitGuard, RateLimit } from '../../core/guards/rate-limit.guard';
import { AuthService } from './auth.service';
import { AuthOriginGuard } from './auth-origin.guard';

@ApiTags('Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login: Rate limit 10 lần/15 phút theo IP.
   * Chuẩn OWASP ASVS §2.2.1 — Brute-Force Protection
   */
  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @UseGuards(AuthOriginGuard, RateLimitGuard)
  @RateLimit({ limit: 10, windowSec: 900, keyBy: 'ip', prefix: 'login' })
  @ApiOperation({ summary: 'Đăng nhập bằng username hoặc email + mật khẩu' })
  @ApiResponse({
    status: 200,
    description: 'Trả về expiresAt. Token được gán qua HTTP-Only Cookie.',
  })
  @ApiResponse({
    status: 429,
    description: 'Quá nhiều lần thử đăng nhập. Thử lại sau 15 phút.',
  })
  async login(
    @Body() body: LoginDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(body, res, req);
  }

  /**
   * Refresh: Rate limit 30 lần/15 phút theo IP.
   * Ngăn attacker brute-force refresh token.
   */
  @Post('refresh')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthOriginGuard, RateLimitGuard)
  @RateLimit({ limit: 30, windowSec: 900, keyBy: 'ip', prefix: 'refresh' })
  @ApiOperation({
    summary: 'Làm mới access_token bằng refresh_token (session)',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về expiresAt. Token mới được gán qua HTTP-Only Cookie.',
  })
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(body, req, res);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthOriginGuard)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi refresh_token' })
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: RefreshTokenDto,
  ) {
    return this.authService.logout(req, res, body);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thông tin user đăng nhập' })
  async me(@Req() req: AuthRequest) {
    return this.authService.me(req);
  }
}
