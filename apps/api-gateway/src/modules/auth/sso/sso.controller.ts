import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Header,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SsoService } from './sso.service';
import { AuthService } from '../auth.service';
import {
  RateLimitGuard,
  RateLimit,
} from '../../../core/guards/rate-limit.guard';
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/api/v1/admin/auth/sso',
};
@Controller('admin/auth/sso')
export class SsoController {
  constructor(
    private readonly sso: SsoService,
    private readonly auth: AuthService,
  ) {}
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @Get('providers')
  providers() {
    return { providers: this.sso.list() };
  }
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @Get(':id/start')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSec: 300, keyBy: 'ip', prefix: 'sso-start' })
  async start(@Param('id') id: string, @Res() res: Response) {
    const transaction = await this.sso.start(id);
    res.cookie('ssoTxn', transaction.binding, {
      ...cookieOptions,
      maxAge: 300000,
    });
    return res.redirect(302, transaction.url);
  }
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @Get(':id/callback')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 20, windowSec: 300, keyBy: 'ip', prefix: 'sso-callback' })
  async callback(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.clearCookie('ssoTxn', cookieOptions);
    try {
      const identity = await this.sso.finish(
        id,
        req.query,
        req.cookies?.ssoTxn,
      );
      await this.auth.loginSso(identity, res, req);
      // Fixed relative return prevents open redirects and keeps provider tokens off the browser.
      return res.redirect(303, '/admin/hub');
    } catch {
      return res.redirect(303, '/login?ssoError=authentication_failed');
    }
  }
}
