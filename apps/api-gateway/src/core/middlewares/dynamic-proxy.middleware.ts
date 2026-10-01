import { Injectable, NestMiddleware } from '@nestjs/common';
import { IntegrationService } from '../../modules/integration/integration.service';

@Injectable()
export class DynamicProxyMiddleware implements NestMiddleware {
  constructor(
    private readonly integrationService: IntegrationService,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const pathPrefix = '/gw/';
    const urlPath = req.originalUrl || req.url;

    if (urlPath.includes(pathPrefix)) {
      // Đọc req.user đã được JwtAuthGuard inject — KHÔNG verify lại token
      // JwtAuthGuard chạy trước middleware này và đã xác thực + inject user
      const user = req.user;

      if (!user?.sub && !user?.id) {
        // Nếu chưa có user (route không qua JwtAuthGuard), fallback về header check
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            errorType: 'AUTH_FAILED',
            message: 'Missing or invalid Authorization header',
          });
        }
      }

      // ANTI-SPOOFING: Xóa bỏ các header giả mạo từ client
      delete req.headers['x-user-id'];
      delete req.headers['x-user-email'];
      delete req.headers['x-user-roles'];
      delete req.headers['x-unit-id'];

      // Inject trusted headers từ user đã được xác thực bởi JwtAuthGuard
      if (user) {
        req.headers['x-user-id'] = String(user.sub || user.id || '');
        if (user.email) req.headers['x-user-email'] = user.email;
        if (user.roles?.length) req.headers['x-user-roles'] = Array.isArray(user.roles) ? user.roles.join(',') : user.roles;
        if (user.unitId || user.unit_id) req.headers['x-unit-id'] = String(user.unitId || user.unit_id);
      }

      await this.integrationService.proxyMiddleware(req, res, next);
    } else {
      next();
    }
  }
}
