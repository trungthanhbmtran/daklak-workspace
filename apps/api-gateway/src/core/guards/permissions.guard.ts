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

    // 1. Quản trị viên cấp cao / Toàn quyền hệ thống
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    if (
      user.isSuperAdmin === true ||
      roles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(r.toUpperCase()))
    ) {
      return true;
    }

    const userPermissions: string[] = Array.isArray(user.permissionsFlatten)
      ? user.permissionsFlatten
      : [];

    // 2. Wildcard toàn cục
    if (userPermissions.some((p) => p === '*' || p === '*:*' || p.startsWith('ADMIN:'))) {
      return true;
    }

    // 3. Kiểm tra xem user có ÍT NHẤT MỘT trong các quyền yêu cầu hay không
    // Cấp quyền nếu có quyền cụ thể, quyền wildcard, alias tương đương (READ <=> VIEW) hoặc quyền MANAGE
    const hasPermission = requiredPermissions.some((required) => {
      if (userPermissions.includes(required)) return true;

      const [res, act] = required.split(':');
      if (!res) return false;

      // Resource wildcard (VD: REPORT:*)
      if (userPermissions.includes(`${res}:*`)) return true;

      // Quyền MANAGE có thẩm quyền bao trùm tất cả hành động trên tài nguyên
      if (userPermissions.includes(`${res}:MANAGE`)) return true;

      // Alias tương đương: READ <=> VIEW
      if (act === 'READ' && userPermissions.includes(`${res}:VIEW`)) return true;
      if (act === 'VIEW' && userPermissions.includes(`${res}:READ`)) return true;

      // Quyền EXECUTE: Cho phép nếu có CREATE, UPDATE, VIEW hoặc MANAGE
      if (act === 'EXECUTE') {
        if (
          userPermissions.includes(`${res}:CREATE`) ||
          userPermissions.includes(`${res}:UPDATE`) ||
          userPermissions.includes(`${res}:VIEW`)
        ) {
          return true;
        }
      }

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
