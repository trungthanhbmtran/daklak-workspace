import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class IntegrationService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationService.name);
  private config: any = { services: [], routes: [], apikeys: [] };

  constructor(private readonly prisma: PrismaService) {}

  // Custom router function for http-proxy-middleware
  public proxyMiddleware = createProxyMiddleware({
    router: (req) => {
      return this.getTargetUrl(req);
    },
    changeOrigin: true,
    secure: false, // Default to false to support internal self-signed certs (controlled via ignoreTlsVerify at service level if needed, but globally false is safer for internal microservices)
    pathRewrite: (path, req) => {
      return this.rewritePath(path, req);
    },
    on: {
      error: (err, req, res) => {
        this.logger.error(`Proxy Error: ${err.message}`);
      },
    },
  });

  async onModuleInit() {
    await this.fetchConfig();
    // Poll every 30 seconds
    setInterval(() => this.fetchConfig(), 30000);
  }

  private async fetchConfig() {
    try {
      const services = await this.prisma.gatewayService.findMany({
        where: { isActive: true },
      });
      const routes = await this.prisma.gatewayRoute.findMany({
        where: { isActive: true },
        include: { service: true },
      });
      const apikeys = await this.prisma.apiKey.findMany({
        where: { isActive: true },
      });

      this.config = { services, routes, apikeys };
      this.logger.log('Loaded dynamic gateway configuration from database');
    } catch (err) {
      this.logger.error(
        `Failed to load gateway config from database: ${err.message}`,
      );
    }
  }

  public validateApiKey(key: string): boolean {
    return this.config.apikeys.some((k: any) => k.key === key && k.isActive);
  }

  private lbCounters: Record<number, number> = {};

  private getTargetUrl(req: any): string | undefined {
    const route = this.matchRoute(req.originalUrl || req.url);
    if (route && route.service) {
      const service = route.service;
      const urls = service.url
        .split(',')
        .map((u: string) => u.trim())
        .filter(Boolean);

      if (urls.length === 0) return undefined;

      let targetUrl = urls[0];

      if (urls.length > 1) {
        if (service.loadBalanceStrategy === 'RANDOM') {
          targetUrl = urls[Math.floor(Math.random() * urls.length)];
        } else if (service.loadBalanceStrategy === 'ROUND_ROBIN') {
          if (this.lbCounters[service.id] === undefined) {
            this.lbCounters[service.id] = 0;
          }
          targetUrl = urls[this.lbCounters[service.id] % urls.length];
          this.lbCounters[service.id]++;
        }
      }

      if (service.useSsl && targetUrl.startsWith('http://')) {
        targetUrl = targetUrl.replace('http://', 'https://');
      }

      return targetUrl;
    }
    return undefined; // Let it fall through or fail
  }

  private rewritePath(path: string, req: any): string {
    const route = this.matchRoute(req.originalUrl || req.url);
    if (route && route.stripPath) {
      let prefix = route.path;
      if (prefix.endsWith('/*')) {
        prefix = prefix.slice(0, -2);
      }
      if (path.startsWith(prefix)) {
        return path.substring(prefix.length) || '/';
      }
    }
    return path;
  }

  public matchRoute(url: string): any {
    if (!url) return null;
    const cleanUrl = url.split('?')[0];

    // Find matching route
    for (const route of this.config.routes) {
      const pathPattern = route.path;

      // Exact match
      if (pathPattern === cleanUrl) return route;

      // Wildcard match
      if (pathPattern.endsWith('/*')) {
        const prefix = pathPattern.slice(0, -2);
        if (cleanUrl.startsWith(prefix)) {
          return route;
        }
      }
    }
    return null;
  }

  async getServices() {
    const data = await this.prisma.gatewayService.findMany({
      include: { routes: true },
    });
    return { success: true, data };
  }

  async createService(data: any) {
    const {
      name,
      url,
      description,
      isActive,
      loadBalanceStrategy,
      useSsl,
      ignoreTlsVerify,
    } = data;
    const service = await this.prisma.gatewayService.create({
      data: {
        name,
        url,
        description,
        loadBalanceStrategy: loadBalanceStrategy ?? 'ROUND_ROBIN',
        useSsl: useSsl ?? false,
        ignoreTlsVerify: ignoreTlsVerify ?? true,
        isActive: isActive ?? true,
      } as any,
    });
    return { success: true, data: service };
  }

  async updateService(id: string, data: any) {
    const {
      name,
      url,
      description,
      isActive,
      loadBalanceStrategy,
      useSsl,
      ignoreTlsVerify,
    } = data;
    const service = await this.prisma.gatewayService.update({
      where: { id: parseInt(id) },
      data: {
        name,
        url,
        description,
        loadBalanceStrategy,
        useSsl,
        ignoreTlsVerify,
        isActive,
      } as any,
    });
    return { success: true, data: service };
  }

  async deleteService(id: string) {
    await this.prisma.gatewayService.delete({ where: { id: parseInt(id) } });
    return { success: true };
  }

  async getRoutes() {
    const data = await this.prisma.gatewayRoute.findMany({
      include: { service: true },
    });
    return { success: true, data };
  }

  async createRoute(data: any) {
    const { path, stripPath, serviceId, methods, isActive } = data;
    const route = await this.prisma.gatewayRoute.create({
      data: {
        path,
        stripPath,
        serviceId: parseInt(serviceId),
        methods,
        isActive: isActive ?? true,
      },
    });
    return { success: true, data: route };
  }

  async updateRoute(id: string, data: any) {
    const { path, stripPath, serviceId, methods, isActive } = data;
    const route = await this.prisma.gatewayRoute.update({
      where: { id: parseInt(id) },
      data: {
        path,
        stripPath,
        serviceId: serviceId ? parseInt(serviceId) : undefined,
        methods,
        isActive,
      },
    });
    return { success: true, data: route };
  }

  async deleteRoute(id: string) {
    await this.prisma.gatewayRoute.delete({ where: { id: parseInt(id) } });
    return { success: true };
  }

  async getApiKeys() {
    const data = await this.prisma.apiKey.findMany();
    return { success: true, data };
  }

  async createApiKey(data: any) {
    const crypto = require('crypto');
    const key = crypto.randomBytes(32).toString('hex');
    const { name, description, isActive } = data;
    const apikey = await this.prisma.apiKey.create({
      data: { name, description, isActive: isActive ?? true, key },
    });
    return { success: true, data: apikey };
  }

  async updateApiKey(id: string, data: any) {
    const { name, description, isActive } = data;
    const apikey = await this.prisma.apiKey.update({
      where: { id: parseInt(id) },
      data: { name, description, isActive },
    });
    return { success: true, data: apikey };
  }

  async deleteApiKey(id: string) {
    await this.prisma.apiKey.delete({ where: { id: parseInt(id) } });
    return { success: true };
  }
}
