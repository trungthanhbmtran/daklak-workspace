/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { API_BASE_URL, API_TIMEOUT_MS } from "@/config/constants";
import type { ApiResponse } from "@/lib/api.types";

export type { ApiResponse };

/**
 * Axios instance — Frontend KHÔNG chứa logic phân loại lỗi.
 *
 * Nguyên tắc "Dumb Frontend / Smart Backend":
 * - Backend (AllExceptionsFilter) luôn trả về { message, errorType, statusCode }
 * - Frontend chỉ đọc message từ backend và hiển thị
 * - KHÔNG dùng statusCode để đoán ý nghĩa lỗi
 * - KHÔNG hardcode string check như message.includes("bị khóa")
 *
 * Trường hợp đặc biệt duy nhất cho 401:
 * - Đang ở /admin/login: 401 = sai mật khẩu → giữ trang, để onError xử lý
 * - Các trang khác: 401 = hết session → redirect về login
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true, // Tự động đính kèm HttpOnly Cookie
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response.data, // Bóc lớp Axios data
  async (error: AxiosError) => {
    if (!error.response) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const data: any = error.response.data;

    // Message DO BACKEND quyết định, frontend chỉ render
    const message: string = data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
    const duration: number = data?.errorType === "RATE_LIMITED" ? 8000 : 4000;

    if (status === 401) {
      // Kiểm tra CHÍNH XÁC bằng so sánh pathname — KHÔNG dùng includes() tránh false positive
      // Ví dụ includes("/login") sẽ match nhầm: /admin/user-login-history, /admin/reports/login-audit
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      const isOnLoginPage = pathname === "/admin/login" || pathname === "/login";

      if (isOnLoginPage) {
        // Đang ở trang login: 401 = sai mật khẩu → KHÔNG redirect
        // Để lỗi propagate lên onError của LoginClient để hiện toast
      } else {
        // Đang ở trang khác: 401 = hết session → redirect về login
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          duration: 3000,
        });
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      }
    } else {
      // Mọi lỗi khác: render message từ backend
      toast.error(message, { duration });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
