import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Nếu endpoint không yêu cầu quyền nào, cho phép truy cập
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Chưa đăng nhập hoặc không tìm thấy thông tin user.');
    }

    const userPermissions = user.permissionsFlatten || [];
    
    // Kiểm tra xem user có ít nhất một trong các quyền yêu cầu hay không
    // (Hoặc có thể sửa logic thành require TẤT CẢ các quyền, tùy yêu cầu)
    const hasPermission = requiredPermissions.some((permission) => userPermissions.includes(permission));

    if (!hasPermission) {
      throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này. Cần một trong các quyền: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
