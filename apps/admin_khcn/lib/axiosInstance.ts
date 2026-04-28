import axios, { AxiosError } from "axios";
import { toast } from "sonner";
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
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const data: any = error.response.data;

    switch (status) {
      case 401:
        // HttpOnly Cookie hết hạn hoặc không hợp lệ -> Văng ra login
        if (typeof window !== "undefined") {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/admin/login";
        }
        break;
      case 403:
        toast.error("Bạn không có quyền thực hiện thao tác này!");
        break;
      case 500:
        toast.error(data?.message || "Lỗi hệ thống (500). Vui lòng liên hệ Quản trị viên.");
        break;
      default:
        if (data?.message) toast.error(data.message);
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
