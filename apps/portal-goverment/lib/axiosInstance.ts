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

// Helper to extract cookies in browser
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
};

// 2. REQUEST INTERCEPTOR (Middleware to push active language to the backend)
apiClient.interceptors.request.use(
  (config) => {
    let lang = "vi";
    if (typeof window !== "undefined") {
      // Prioritize cookie set by Next.js middleware, fall back to URL analysis
      const cookieLang = getCookie("lang");
      if (cookieLang === "vi" || cookieLang === "en") {
        lang = cookieLang;
      } else {
        const pathname = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const isEn = pathname.startsWith("/aboutus") ||
                     pathname.startsWith("/news") ||
                     pathname.startsWith("/documents") ||
                     pathname.startsWith("/procedures") ||
                     pathname.startsWith("/feedback") ||
                     pathname.startsWith("/contact") ||
                     searchParams.get("lang") === "en";
        lang = isEn ? "en" : "vi";
      }
    }

    // Append language as a standard query param
    config.params = {
      lang,
      ...config.params,
    };

    // Also attach in headers for server/middleware compatibility
    config.headers["Accept-Language"] = lang;
    config.headers["x-lang"] = lang;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// 3. RESPONSE INTERCEPTOR (Chỉ để bắt lỗi và bóc data)
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
