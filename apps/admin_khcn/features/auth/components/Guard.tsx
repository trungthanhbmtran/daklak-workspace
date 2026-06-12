"use client";

import { useUser } from "@/hooks/useUser";
import { ReactNode } from "react";

interface GuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredPolicies?: string[];
  // Dùng hàm kiểm tra tuỳ chỉnh nếu cần (ví dụ check theo resource/action)
  checkFn?: (user: any) => boolean;
}

export function Guard({ children, fallback = null, requiredPolicies, checkFn }: GuardProps) {
  const { user, isLoading } = useUser();

  if (isLoading) return null; // Hoặc một skeleton loader

  // Nếu không yêu cầu quyền gì, cho phép hiển thị
  if (!requiredPolicies && !checkFn) return <>{children}</>;

  // Không có user -> không có quyền
  if (!user) return <>{fallback}</>;

  // Kiểm tra qua function tùy chỉnh
  if (checkFn) {
    return checkFn(user) ? <>{children}</> : <>{fallback}</>;
  }

  // Lấy danh sách permission flatten từ user (dạng CODE:ACTION)
  const userPolicies: string[] = user.permissionsFlatten || [];

  // Kiểm tra có ít nhất 1 quyền (some)
  const hasPermission = requiredPolicies?.some(policy => userPolicies.includes(policy));

  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
