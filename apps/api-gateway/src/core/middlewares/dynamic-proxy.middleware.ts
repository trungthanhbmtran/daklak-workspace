import {
  HttpException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { clientIp } from '../client-ip';
import { TokenValidatorService } from '../../modules/integration/token-validator.service';
import { IntegrationService } from '../../modules/integration/integration.service';

@Injectable()
export class DynamicProxyMiddleware implements NestMiddleware {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly tokenValidator: TokenValidatorService,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const pathname = (req.originalUrl || req.url || '').split('?')[0];

    if (/^\/(?:api\/v1\/)?(?:admin\/)?gw\//.test(pathname)) {
      // Middleware runs before guards, so authenticate before forwarding.
      let user: any;
      try {
        const authHeader = req.headers.authorization;
        const token =
          req.cookies?.accessToken ||
          (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : undefined);
        if (!token) throw new UnauthorizedException('Thiếu phiên đăng nhập');
        user = await this.tokenValidator.verifyToken(token, clientIp(req));
        req.user = user;
      } catch (error) {
        const status = error instanceof HttpException ? error.getStatus() : 503;
        return res.status(status).json({
          success: false,
          errorType: status === 401 ? 'AUTH_FAILED' : 'SERVICE_UNAVAILABLE',
          message:
            status === 401
              ? 'Phiên đăng nhập không hợp lệ'
              : 'Dịch vụ xác thực tạm thời không khả dụng',
        });
      }

      // ANTI-SPOOFING: Xóa bỏ các header giả mạo từ client
      delete req.headers['x-user-id'];
      delete req.headers['x-user-email'];
      delete req.headers['x-user-roles'];
      delete req.headers['x-unit-id'];

      // Forward identity from the verified session only.
      if (user) {
        req.headers['x-user-id'] = String(user.sub || user.id || '');
        if (user.email) req.headers['x-user-email'] = user.email;
        if (user.roles?.length)
          req.headers['x-user-roles'] = Array.isArray(user.roles)
            ? user.roles.join(',')
            : user.roles;
        if (user.unitId || user.unit_id)
          req.headers['x-unit-id'] = String(user.unitId || user.unit_id);
      }

      await this.integrationService.proxyMiddleware(req, res, next);
    } else {
      next();
    }
  }
}
