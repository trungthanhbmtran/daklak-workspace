import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
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
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập bằng username hoặc email + mật khẩu' })
  @ApiResponse({
    status: 200,
    description: 'Trả về sessionId và expiresAt. Token được gán qua HTTP-Only Cookie.',
  })
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(body, res);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Làm mới access_token bằng refresh_token (session)',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về sessionId và expiresAt. Token mới được gán qua HTTP-Only Cookie.',
  })
  async refresh(
    @Body() body: any,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(body, req, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi refresh_token' })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: any,
  ) {
    return this.authService.logout(req, res, body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thông tin user đăng nhập' })
  async me(@Req() req: any) {
    return this.authService.me(req);
  }
}
