import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DynamicProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DynamicProxyMiddleware.name);
  private cache: any = null;
  private lastFetch = 0;
  private readonly TTL = 30000;

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    if (!this.cache || now - this.lastFetch > this.TTL) {
      try {
        const routes = await this.prisma.gatewayRoute.findMany({
          where: { isActive: true },
          include: { service: true }
        });
        this.cache = routes;
        this.lastFetch = now;
      } catch (err) {
        this.logger.error('Failed to fetch proxy routes', err);
        return res.status(500).json({ message: 'Gateway Configuration Error' });
      }
    }

    const path = req.path;
    const method = req.method.toUpperCase();

    // Find a matching route
    const matchedRoute = this.cache.find((r: any) => {
      // Very basic wildcard match (e.g. /api/v1/external/chat/*)
      const pattern = r.path.replace('/*', '');
      if (path.startsWith(pattern)) {
        if (r.methods === 'ALL' || r.methods.includes(method)) {
          return true;
        }
      }
      return false;
    });

    if (matchedRoute && matchedRoute.service && matchedRoute.service.isActive) {
      const targetUrl = matchedRoute.service.url;
      this.logger.debug(`Proxying ${method} ${path} -> ${targetUrl}`);
      
      const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        secure: !matchedRoute.service.ignoreTlsVerify,
        pathRewrite: matchedRoute.stripPath ? {
          [`^${matchedRoute.path.replace('/*', '')}`]: ''
        } : undefined,
      });

      return proxy(req as any, res as any, next);
    }

    // Not found in dynamic proxy, continue to other middlewares/controllers
    next();
  }
}
