import type { User, Role, Policy, Resource } from '@generated/prisma/client';

/**
 * User được gắn vào gRPC context sau khi GrpcAuthGuard xác thực (PBAC).
 * permissionsFlatten: ['user:create', 'user:read', ...] từ Vai trò -> Quyền -> Resource.code:action
 */
export type UserWithPbac = User & {
  roles: (Role & {
    policies: (Policy & { resource: Resource })[];
  })[];
  /** Đã flatten để check nhanh: resourceCode:action */
  permissionsFlatten?: string[];
};

/** @deprecated Dùng UserWithPbac */
export type UserWithRbac = UserWithPbac;
