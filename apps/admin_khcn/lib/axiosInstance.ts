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
