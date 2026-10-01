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
 * Các trường hợp đặc biệt duy nhất:
 * - 401: luôn phải redirect login (không thể xử lý khác)
 * - Network error: backend không trả về gì → hiển thị thông báo mặc định
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

    // Message và duration DO BACKEND quyết định, frontend chỉ render
    const message: string = data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
    const duration: number = data?.errorType === 'RATE_LIMITED' ? 8000 : 4000;

    if (status === 401) {
      // 401: Luôn redirect login — đây là hành vi UX, không phải business logic
      if (typeof window !== "undefined") {
        toast.error(message, { duration: 3000 });
        window.location.href = "/admin/login";
      }
    } else {
      // Mọi lỗi khác: render message từ backend
      toast.error(message, { duration });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
