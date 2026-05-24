"use client";

import { useUser } from "@/hooks/useUser";
import { ReactNode } from "react";

interface GuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredPermissionIds?: number[];
  // Dùng hàm kiểm tra tuỳ chỉnh nếu cần (ví dụ check theo resource/action)
  checkFn?: (user: any) => boolean;
}

export function Guard({ children, fallback = null, requiredPermissionIds, checkFn }: GuardProps) {
  const { user, isLoading } = useUser();

  if (isLoading) return null; // Hoặc một skeleton loader

  // Nếu không yêu cầu quyền gì, cho phép hiển thị
  if (!requiredPermissionIds && !checkFn) return <>{children}</>;

  // Không có user -> không có quyền
  if (!user) return <>{fallback}</>;

  // Kiểm tra qua function tùy chỉnh
  if (checkFn) {
    return checkFn(user) ? <>{children}</> : <>{fallback}</>;
  }

  // Lấy danh sách permissionIds từ user (giả định payload /auth/me trả về mảng permissionIds hoặc roles)
  // Thực tế tùy thuộc vào cấu trúc trả về của API, ở đây mapping tạm từ role
  const userPermissionIds: number[] = user.permissionIds || 
    (user.roles || []).flatMap((r: any) => r.permissions?.map((p: any) => p.id) || []);

  // Kiểm tra có ít nhất 1 quyền (some) hoặc đủ tất cả quyền (every)
  // Dùng "some" để linh hoạt
  const hasPermission = requiredPermissionIds?.some(id => userPermissionIds.includes(id));

  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
