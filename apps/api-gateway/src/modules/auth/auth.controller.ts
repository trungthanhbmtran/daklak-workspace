import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  Req,
  UseGuards,
  OnModuleInit,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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
  ) {}

  onModuleInit() {
    this.authService = this.authClient.getService(MICROSERVICES.AUTH.SERVICE);
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập bằng username hoặc email + mật khẩu' })
  @ApiResponse({ status: 200, description: 'accessToken, refreshToken, userId, email, username, fullName, unitName (camelCase)' })
  async login(@Body() body: { username?: string; email?: string; password?: string; [key: string]: any }) {
    const hasPassword = body.password && String(body.password).trim().length > 0;
    const loginKey = body.username?.trim() || body.email?.trim();
    if (!loginKey || !hasPassword) {
      throw new BadRequestException(
        'Vui lòng gửi username hoặc email kèm password để đăng nhập.',
      );
    }
    try {
      const res = await firstValueFrom(
        this.userService.Login({
          usernameOrEmail: loginKey,
          password: body.password,
        }),
      );
      return res;
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
  async refresh(@Body() body: { refreshToken?: string }, @Req() req: any) {
    const token =
      body.refreshToken?.trim() ||
      (req.cookies?.refresh_token as string)?.trim();
    if (!token) {
      throw new UnauthorizedException('Thiếu refresh_token');
    }
    try {
      const res = await firstValueFrom(
        this.userService.Refresh({ refreshToken: token }),
      );
      return res;
    } catch (err: any) {
      const message = err?.details || err?.message || 'Refresh token không hợp lệ';
      throw new UnauthorizedException(message);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi refresh_token' })
  async logout(@Req() req: any, @Body() body?: { refreshToken?: string }) {
    const token =
      body?.refreshToken?.trim() ||
      (req.cookies?.refresh_token as string)?.trim();
    if (token) {
      try {
        await firstValueFrom(
          this.userService.RevokeRefreshToken({ refreshToken: token }),
        );
      } catch {
        // Ignore lỗi thu hồi
      }
    }
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
