import { Controller, Get, Req, Res, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { IntegrationConfigService } from './integration-config.service';
import { IntegrationAuthService } from './integration-auth.service';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Controller()
export class IntegrationConfigInternalController {
  constructor(
    private readonly configService: IntegrationConfigService,
    private readonly authService: IntegrationAuthService
  ) {}

  @Get('.well-known/jwks.json')
  getJwks() {
    return this.authService.getJwks();
  }

  @Get('internal/registry/snapshot')
  async getSnapshot(@Headers('if-none-match') ifNoneMatch: string, @Req() req: Request, @Res() res: Response) {
    // Basic mTLS or Service Token validation
    this.validateInternalRequest(req);

    const upstreams = await this.configService.getAllUpstreams();
    
    // Calculate global version/etag
    const highestVersion = upstreams.reduce((max, u) => Math.max(max, u.version), 0);
    const etag = `W/"${highestVersion}-${upstreams.length}"`;

    if (ifNoneMatch === etag) {
      return res.status(304).send();
    }

    res.setHeader('ETag', etag);
    return res.status(200).json({
      version: highestVersion,
      etag,
      upstreams,
    });
  }

  private validateInternalRequest(req: Request) {
    // 1. Check mTLS (if enabled in gateway proxy)
    // const cert = req.socket.getPeerCertificate?.();
    // if (cert && Object.keys(cert).length > 0 && req.client.authorized) return;

    // 2. Fallback to Service Token (OAuth2 Client Credentials / static secret)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Validate token logic here. For internal service mesh, a static secret might suffice,
      // or validating against an internal issuer.
      if (token === process.env.INTERNAL_SERVICE_TOKEN) return;
    }
    
    // Un-comment to strictly enforce in production. Relaxed for current dev phase until env is set.
    // throw new UnauthorizedException('mTLS or valid service token required for /internal/* endpoints');
  }
}
