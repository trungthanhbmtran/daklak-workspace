import axios, { AxiosError } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "@/config/constants";

// 1. KHỞI TẠO AXIOS
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  // CỰC KỲ QUAN TRỌNG: Trình duyệt sẽ tự động đính kèm HttpOnly Cookie vào request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. RESPONSE INTERCEPTOR (Chỉ để bắt lỗi và bóc data)
apiClient.interceptors.response.use(
  (response) => {
    // Tự động bóc lớp data của Axios
    return response.data;
  },
  async (error: AxiosError) => {
    if (!error.response) {
      console.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const data: any = error.response.data;

    switch (status) {
      case 401:
        console.warn("Phiên làm việc không hợp lệ hoặc đã hết hạn.");
        break;
      case 403:
        console.error("Bạn không có quyền truy cập tài nguyên này.");
        break;
      case 500:
        console.error(data?.message || "Lỗi hệ thống (500).");
        break;
      default:
        if (data?.message) console.error(data.message);
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
