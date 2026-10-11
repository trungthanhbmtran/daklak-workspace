import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import { API_BASE_URL, API_TIMEOUT_MS } from "@/config/constants";
import { installSessionRecovery } from "./session-recovery";
export type { ApiResponse } from "@/lib/api.types";

const options = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
};
const apiClient = axios.create(options);
// Dedicated transport prevents refresh/logout from recursively entering the interceptor.
const sessionTransport = axios.create(options);

/**
 * Tự động loại bỏ tiền tố thừa (/admin hoặc /api/v1/admin) nếu caller vô tình truyền vào,
 * nhằm triệt tiêu hoàn toàn lỗi 404 do double prefix (.../admin/admin/...).
 */
function normalizeUrl(url?: string): string | undefined {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith("/api/v1/admin/")) {
    return url.slice("/api/v1/admin".length);
  }
  if (url.startsWith("/api/v1/admin")) {
    return url.slice("/api/v1/admin".length) || "/";
  }
  if (url.startsWith("api/v1/admin/")) {
    return "/" + url.slice("api/v1/admin/".length);
  }
  if (url.startsWith("/admin/")) {
    return url.slice("/admin".length);
  }
  if (url.startsWith("admin/")) {
    return "/" + url.slice("admin/".length);
  }
  if (url === "/admin" || url === "admin") {
    return "/";
  }
  return url;
}

apiClient.interceptors.request.use((config) => {
  if (config.url) {
    config.url = normalizeUrl(config.url);
  }
  return config;
});

sessionTransport.interceptors.request.use((config) => {
  if (config.url) {
    config.url = normalizeUrl(config.url);
  }
  return config;
});
export async function clearBrowserSession() {
  await sessionLifecycle.logout();
}
export function loginBrowserSession(credentials: { username: string; password: string }) {
  return sessionLifecycle.login(() => apiClient.post("/auth/login", credentials));
}
function showError(error: AxiosError) {
  const data = error.response?.data as
    | { message?: string; errorType?: string }
    | undefined;
  toast.error(
    data?.message ||
      (error.response
        ? "Đã xảy ra lỗi. Vui lòng thử lại."
        : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền."),
    {
      duration: data?.errorType === "RATE_LIMITED" ? 8000 : 4000,
    },
  );
}
const sessionLifecycle = installSessionRecovery(apiClient, sessionTransport, {
  onError: showError,
  onExpired: () => {
    if (typeof window === "undefined") return;
    if (
      ["/admin/login", "/login"].includes(
        window.location.pathname.replace(/\/$/, ""),
      )
    )
      return;
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
      id: "session-expired",
      duration: 3000,
    });
    const callback = window.location.pathname + window.location.search;
    window.location.replace(
      "/admin/login?callbackUrl=" + encodeURIComponent(callback),
    );
  },
});
export default apiClient;
