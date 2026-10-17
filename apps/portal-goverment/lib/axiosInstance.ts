import axios, { AxiosError } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "@/config/constants";
import { installSessionRecovery } from "./session-recovery";

// 1. KHỞI TẠO AXIOS
const options = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  // CỰC KỲ QUAN TRỌNG: Trình duyệt sẽ tự động đính kèm HttpOnly Cookie vào request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};
const apiClient = axios.create(options);
const sessionTransport = axios.create(options);

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
      const pathname = window.location.pathname;
      const segments = pathname.split("/").filter(Boolean);
      if (segments[0] === "en") {
        lang = "en";
      } else {
        lang = "vi";
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


// 3. XỬ LÝ LỖI (Error Handler)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showError(_error: AxiosError) {
  // Lỗi mạng/auth được xử lý tập trung qua React Query hoặc UI state
}

// 4. CÀI ĐẶT SESSION RECOVERY
const sessionLifecycle = installSessionRecovery(apiClient, sessionTransport, {
  onError: showError,
  onExpired: () => {
    if (typeof window === "undefined") return;
    if (["/login"].includes(window.location.pathname.replace(/\/$/, ""))) return;

    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    const callback = window.location.pathname + window.location.search;
    window.location.replace("/login?callbackUrl=" + encodeURIComponent(callback));
  },
});

export async function clearBrowserSession() {
  await sessionLifecycle.logout();
}

export function loginBrowserSession(credentials: any) {
  return sessionLifecycle.login(() => apiClient.post("/auth/login", credentials));
}

export default apiClient;
