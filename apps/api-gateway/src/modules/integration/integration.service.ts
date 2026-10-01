import { Injectable, Logger } from '@nestjs/common';
import { RegistryService, UpstreamState } from './registry.service';
import { IncomingMessage, ServerResponse } from 'http';
import { pipeline } from 'stream/promises';
import { EnvSecretProvider } from './secrets/env-secret-provider.service';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    private readonly registry: RegistryService,
    private readonly secretProvider: EnvSecretProvider,
  ) {}

  public async proxyMiddleware(req: any, res: any, next: () => void) {
    const pathPrefix = '/gw/';
    const urlPath = req.originalUrl || req.url;
    
    let gwIndex = urlPath.indexOf(pathPrefix);
    if (gwIndex === -1) {
      return next(); // Not a proxy route
    }
    
    const relativeUrl = urlPath.substring(gwIndex + pathPrefix.length);
    const slashIdx = relativeUrl.indexOf('/');
    
    const upstreamName = slashIdx === -1 ? relativeUrl : relativeUrl.substring(0, slashIdx);
    const targetPath = slashIdx === -1 ? '/' : relativeUrl.substring(slashIdx);

    const upstream = this.registry.getUpstream(upstreamName);
    
    if (!upstream) {
      return res.status(404).json({ success: false, message: 'Upstream not found or disabled' });
    }

    if (!this.checkAccess(req, upstream.config)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
    }

    try {
      const headers = { ...req.headers };
      delete headers['host'];
      delete headers['connection'];
      delete headers['content-length'];

      // Resolve secrets and inject Auth
      if (upstream.config.auth?.kind === 'basic' && upstream.config.auth.secretRef) {
        const secret = await this.secretProvider.getSecret(upstream.config.auth.secretRef);
        if (secret) {
          headers['authorization'] = `Basic ${Buffer.from(secret).toString('base64')}`;
        }
      } else if (upstream.config.auth?.kind === 'apiKey' && upstream.config.auth.secretRef) {
        const secret = await this.secretProvider.getSecret(upstream.config.auth.secretRef);
        if (secret) {
          headers['x-api-key'] = secret; // Assuming x-api-key header for apiKey kind
        }
      } else if (upstream.config.auth?.kind !== 'none') {
        delete headers['authorization'];
        delete headers['cookie'];
      }

      headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();

      const options = {
        path: targetPath,
        method: req.method,
        headers: headers as any,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      };

      // 2. Execute via Opossum Circuit Breaker
      const { statusCode, headers: resHeaders, body } = await upstream.breaker.fire(options);

      // 3. Pipe response back to client
      res.status(statusCode);
      for (const [key, value] of Object.entries(resHeaders)) {
        if (value) res.setHeader(key, value);
      }
      
      await pipeline(body, res);

    } catch (err) {
      this.logger.error(`Proxy Error for ${upstreamName}: ${err.message}`);
      
      if (err.type === 'open') {
        return res.status(503).json({ success: false, message: 'Service Unavailable (Circuit Breaker Open)' });
      }
      if (err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.code === 'UND_ERR_HEADERS_TIMEOUT') {
        return res.status(504).json({ success: false, message: 'Gateway Timeout' });
      }
      
      return res.status(502).json({ success: false, message: 'Bad Gateway' });
    }
  }

  private checkAccess(req: any, config: any): boolean {
    // If upstream requires no specific role, allow
    if (!config.roles || config.roles.length === 0) return true;
    
    // Check method
    if (config.allowedMethods && config.allowedMethods.length > 0) {
      if (!config.allowedMethods.includes(req.method)) return false;
    }

    // Role matching
    const userRoles = req.user?.roles || [];
    return config.roles.some((r: string) => userRoles.includes(r));
  }
}
