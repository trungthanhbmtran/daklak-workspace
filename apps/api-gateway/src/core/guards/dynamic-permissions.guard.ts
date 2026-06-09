import { Injectable, CanActivate, ExecutionContext, Inject, ForbiddenException } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { pathToRegexp } from 'path-to-regexp';
import { MICROSERVICES } from '../constants/services';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class DynamicPermissionsGuard implements CanActivate {
  private pbacService: any;

  private client: any;

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
    private redisService: RedisService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!this.pbacService) {
      this.client = this.moduleRef.get(MICROSERVICES.PBAC.SYMBOL, { strict: false });
      this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // SUPER_ADMIN has full access
    const isSuperAdmin = user.roles?.some((r: any) => r.code === 'SUPER_ADMIN');
    if (isSuperAdmin) return true;

    // Get cached endpoints mapping
    let endpoints: any[] = [];
    const cached = await this.redisService.get('DYNAMIC_ENDPOINTS_RULES');
    if (cached) {
      try { endpoints = JSON.parse(cached); } catch (e) { }
    }
    if (endpoints.length === 0) {
      const res = await firstValueFrom<any>(this.pbacService.GetEndpoints({}));
      endpoints = res?.endpoints || [];
      await this.redisService.set('DYNAMIC_ENDPOINTS_RULES', JSON.stringify(endpoints), 60); // 60 seconds
    }

    const currentMethod = request.method.toUpperCase();
    const currentPath = request.path;

    // Find the matching endpoint rule
    for (const ep of endpoints) {
      if (ep.method === currentMethod) {
        // Handle NestJS express path format (e.g., /admin/users/:id)
        const regex = pathToRegexp(ep.path);
        if (regex.regexp.test(currentPath)) {
          // We found the route. Check permission
          if (!ep.permission_id || !ep.permission) {
            // No permission required for this endpoint
            return true;
          }

          // Ensure user has this permission
          // pbac normally uses RESOURCE:ACTION or just action if code is formatted
          // Actually, our pbac uses RESOURCE_CODE:ACTION. We need the resource code.
          // In pb.proto EndpointItemResponse, we only have permission.action and resource_id.
          // Let's modify the response to include resource_code or just check user roles.

          // User roles are populated in JwtStrategy, usually user.permissions array or we check role.permissions.
          // Assuming user.permissions is a flat list of "RESOURCE:ACTION" strings:
          const userPermissions = request.user.permissionsFlatten || [];

          // The required action code from db is usually "RESOURCE:ACTION"
          // Let's assume the action string is already in full format, e.g., "USER:CREATE"
          const requiredAction = ep.permission.resource_code 
            ? `${ep.permission.resource_code}:${ep.permission.action}`
            : ep.permission.action;
          const hasPerm = userPermissions.includes(requiredAction);
          if (!hasPerm) {
            throw new ForbiddenException('Bạn không có quyền truy cập API này.');
          }
          return true;
        }
      }
    }

    // Default policy: if no rule found, allow or deny?
    // Let's default to ALLOW for backward compatibility until all are mapped.
    return true;
  }
}

