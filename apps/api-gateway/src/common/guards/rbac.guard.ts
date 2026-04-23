import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    
    // ADMIN has all permissions
    if (userRoles.includes(Role.ADMIN)) return true;

    return requiredRoles.some(role => userRoles.includes(role));
  }
}
