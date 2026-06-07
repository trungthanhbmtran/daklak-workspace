import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { IntegrationService } from '../../modules/integration/integration.service';

@Injectable()
export class DynamicApiGuard implements CanActivate {
  constructor(private readonly integrationService: IntegrationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) {
      // If no user, it means either JwtAuthGuard wasn't applied or failed. 
      // If this is a protected route, we reject.
      throw new UnauthorizedException();
    }

    // Always allow Super Admin
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('ADMIN')) {
      return true;
    }

    const rules = await this.integrationService.getApiPermissions();
    if (!rules || rules.length === 0) {
      return true; // No rules configured, bypass
    }

    const path = request.path;
    const method = request.method;

    let matchedRule = null;

    for (const rule of rules) {
      if (this.matchPath(rule.path, path) && (rule.method === 'ALL' || rule.method === method)) {
        matchedRule = rule;
        
        // We evaluate the FIRST matched rule
        const requiredPermissions = rule.permissions || [];
        if (requiredPermissions.length > 0) {
          const hasPerm = requiredPermissions.some((p: string) => user.permissionsFlatten?.includes(p));
          if (!hasPerm) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này. Endpoint yêu cầu một trong các quyền: ${requiredPermissions.join(', ')}`);
          }
        }
        
        // If matched and no roles required (or has role), allow
        return true;
      }
    }

    // If no rule matched, default allow
    return true;
  }

  private matchPath(pattern: string, path: string): boolean {
    if (!pattern) return false;
    // Simple wildcard match
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return path.startsWith(prefix);
    }
    return pattern === path;
  }
}
