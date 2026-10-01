import { Injectable, NestMiddleware } from '@nestjs/common';
import { IntegrationService } from '../../modules/integration/integration.service';
import { TokenValidatorService } from '../../modules/integration/token-validator.service';

@Injectable()
export class DynamicProxyMiddleware implements NestMiddleware {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly tokenValidator: TokenValidatorService,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const pathPrefix = '/gw/';
    const urlPath = req.originalUrl || req.url;
    
    if (urlPath.includes(pathPrefix)) {
      // 1. Authenticate with TokenValidatorService
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
        }
        
        const token = authHeader.split(' ')[1];
        const user = await this.tokenValidator.verifyToken(token);
        
        // Attach user to request for RBAC check in IntegrationService
        req.user = user;
      } catch (err: any) {
        return res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
      }

      // 2. Execute proxy
      await this.integrationService.proxyMiddleware(req, res, next);
    } else {
      next();
    }
  }
}
