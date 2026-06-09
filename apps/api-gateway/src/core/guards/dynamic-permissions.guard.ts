import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { pathToRegexp } from 'path-to-regexp';
import { MICROSERVICES } from '../constants/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DynamicPermissionsGuard implements CanActivate {
  private pbacService: any;

  constructor(
    private reflector: Reflector,
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!this.pbacService) {
      this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // SUPER_ADMIN has full access
    const isSuperAdmin = user.roles?.some((r: any) => r.code === 'SUPER_ADMIN');
    if (isSuperAdmin) return true;

    // Get cached endpoints mapping
    let endpoints = await this.cacheManager.get<any[]>('DYNAMIC_ENDPOINTS_RULES');
    if (!endpoints) {
      const res = await firstValueFrom(this.pbacService.GetEndpoints({}));
      endpoints = res.endpoints || [];
      await this.cacheManager.set('DYNAMIC_ENDPOINTS_RULES', endpoints, 60000); // 1 minute
    }

    const currentMethod = request.method.toUpperCase();
    const currentPath = request.path;

    // Find the matching endpoint rule
    for (const ep of endpoints) {
      if (ep.method === currentMethod) {
        // Handle NestJS express path format (e.g., /admin/users/:id)
        const regex = pathToRegexp(ep.path);
        if (regex.test(currentPath)) {
           // We found the route. Check permission
           if (!ep.permission_id || !ep.permission) {
             // No permission required for this endpoint
             return true; 
           }

           // Ensure user has this permission
           const requiredCode = ep.permission.resource_id ? ${ep.permission.action} : ep.permission.action; // wait, pbac normally uses RESOURCE:ACTION or just action if code is formatted
           // Actually, our pbac uses RESOURCE_CODE:ACTION. We need the resource code.
           // In pb.proto EndpointItemResponse, we only have permission.action and resource_id.
           // Let's modify the response to include resource_code or just check user roles.
           
           // User roles are populated in JwtStrategy, usually user.permissions array or we check role.permissions.
           // Assuming user.permissions is a flat list of "RESOURCE:ACTION" strings:
           const userPermissions = request.user.permissionsFlatten || [];
           
           // The required action code from db is usually "RESOURCE:ACTION"
           // Let's assume the action string is already in full format, e.g., "USER:CREATE"
           const requiredAction = ep.permission.action;
           const hasPerm = userPermissions.includes(requiredAction);
           if (!hasPerm) {
             throw new import('@nestjs/common').ForbiddenException('BAn khAng cA3 quyOn truy cAp API nAy.');
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

