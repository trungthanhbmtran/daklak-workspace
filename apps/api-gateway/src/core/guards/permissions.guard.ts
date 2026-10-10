import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Không tìm thấy thông tin xác thực người dùng',
      );
    }

    const userPermissions = user.permissionsFlatten || [];

    // Kiểm tra xem user có ÍT NHẤT MỘT trong các quyền yêu cầu hay không
    // Cấp quyền nếu có quyền cụ thể, hoặc có quyền wildcard (VD: RESOURCE:*)
    const hasPermission = requiredPermissions.some((permission) => {
      if (userPermissions.includes(permission)) return true;
      const resource = permission.split(':')[0];
      if (resource && userPermissions.includes(`${resource}:*`)) return true;
      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền: ${requiredPermissions.join(
          ' hoặc ',
        )}`,
      );
    }

    return true;
  }
}
