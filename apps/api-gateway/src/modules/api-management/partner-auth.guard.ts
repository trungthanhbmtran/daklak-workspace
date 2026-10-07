import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class PartnerAuthGuard implements CanActivate, OnModuleInit {
  private grpcService: any;
  // Basic token cache to prevent hitting user-service every request (Single flight not fully needed for auth guard if TTL is short, but cache is crucial)
  private cache = new Map<
    string,
    { partnerId: string; scopes: string[]; expiresAt: number }
  >();

  constructor(
    @Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grpcService = this.client.getService('ApiManagementService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract Token from Header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Bearer token');
    }

    const token = authHeader.substring(7); // "daklak_..."
    const hashedKey = crypto.createHash('sha256').update(token).digest('hex');

    // Check cache
    const cached = this.cache.get(hashedKey);
    if (cached && Date.now() < cached.expiresAt) {
      (request as any).partner = cached;
      return true;
    }

    // Call RPC
    try {
      const res = (await firstValueFrom(
        this.grpcService.ValidatePartnerKey({ hashedKey }),
      )) as any;

      const partnerData = {
        partnerId: res.partnerId,
        scopes: JSON.parse(res.scopes),
        expiresAt: Date.now() + 5 * 60 * 1000, // Cache for 5 minutes
      };

      this.cache.set(hashedKey, partnerData);
      (request as any).partner = partnerData;

      return true;
    } catch (e: any) {
      throw new UnauthorizedException('Invalid or revoked API Key');
    }
  }
}
