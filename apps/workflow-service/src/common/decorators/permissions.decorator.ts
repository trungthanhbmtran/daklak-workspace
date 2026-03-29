import { SetMetadata } from '@nestjs/common';

/** Key cho Reflector lấy danh sách permission bắt buộc (format "resource:action") */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator khai báo permission cần có để gọi handler.
 * User phải có ít nhất một trong các permission.
 * Ví dụ: @Permissions('user:create', 'user:read')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
