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
      throw new ForbiddenException('Không tìm thấy thông tin xác thực người dùng');
    }

    // SUPER_ADMIN có toàn quyền
    const isSuperAdmin = user.roles?.some(
      (role: any) => role === 'SUPER_ADMIN' || role?.code === 'SUPER_ADMIN',
    );
    if (isSuperAdmin) {
      return true;
    }

    const userPermissions = user.permissionsFlatten || [];

    // Kiểm tra xem user có ÍT NHẤT MỘT trong các quyền yêu cầu hay không (hoặc có thể cấu hình yêu cầu TẤT CẢ)
    // Thông thường, nếu decorator truyền ['USER:CREATE', 'USER:MANAGE'] thì chỉ cần có 1 trong 2 là pass.
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

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
