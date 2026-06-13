"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axiosInstance";

/**
 * Hook đăng xuất: xóa toàn bộ cache React Query (menu, quyền, dữ liệu theo user)
 * rồi mới gọi server xóa cookie và redirect. Tránh lỗi user mới vẫn thấy menu/quyền của user cũ.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    // 1. Xóa cache trước khi redirect để lần đăng nhập sau không dùng lại dữ liệu user cũ
    queryClient.clear();

    startTransition(async () => {
      try {
        // 2. Gọi API logout để server xóa cookie HttpOnly
        await apiClient.post("/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // 3. Middleware (proxy.ts) sẽ detect không có token và redirect về /login
        // router.push tự thêm basePath /admin → thành /admin/login
        router.push("/login");
      }
    });
  }

  return { handleLogout, isPending };
}
