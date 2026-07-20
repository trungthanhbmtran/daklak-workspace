import { Injectable, NestMiddleware } from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Injectable()
export class DynamicProxyMiddleware implements NestMiddleware {
  constructor(private readonly integrationService: IntegrationService) {}

  use(req: any, res: any, next: () => void) {
    const route = this.integrationService.matchRoute(
      req.originalUrl || req.url,
    );
    if (route) {
      // Check API Key
      const apiKey = req.headers['x-api-key'] || req.query?.apikey;
      if (
        !apiKey ||
        !this.integrationService.validateApiKey(apiKey as string)
      ) {
        return res
          .status(401)
          .json({ success: false, message: 'Invalid or missing API Key' });
      }

      // Check method
      const allowedMethods = route.methods
        .split(',')
        .map((m) => m.trim().toUpperCase());
      if (!allowedMethods.includes(req.method.toUpperCase())) {
        return res
          .status(405)
          .json({ success: false, message: 'Method Not Allowed' });
      }

      // Execute proxy
      return this.integrationService.proxyMiddleware(req, res, next);
    }

    // No dynamic route found, continue to normal controllers
    next();
  }
}
