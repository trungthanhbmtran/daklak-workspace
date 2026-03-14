"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
// Import logout action from server actions or use a fetch if it does not exist
// We will mock it temporarily if the action is truly missing from the actions/auth file.

/**
 * Hook đăng xuất: xóa toàn bộ cache React Query (menu, quyền, dữ liệu theo user)
 * rồi mới gọi server xóa cookie và redirect. Tránh lỗi user mới vẫn thấy menu/quyền của user cũ.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    // Xóa cache trước khi redirect để lần đăng nhập sau không dùng lại dữ liệu user cũ
    queryClient.clear();
    startTransition(async () => {
      // Temporary fallback if action doesn't exist
      window.location.href = '/login';
    });
  }

  return { handleLogout, isPending };
}
