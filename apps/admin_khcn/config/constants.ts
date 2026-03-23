/**
 * Cấu hình ứng dụng – dùng chung cho app và lib.
 * Ưu tiên đọc từ env; fallback giá trị mặc định.
 */

/**
 * Cấu hình ứng dụng – dùng chung cho app và lib.
 * Phân tách rõ ràng giữa môi trường Server (K8s) và Client (Browser)
 */

const internalUrl = process.env.INTERNAL_API_URL || process.env.API_URL;
const publicUrl = process.env.NEXT_PUBLIC_API_URL;

if (typeof window === "undefined" && !internalUrl) {
  console.warn("⚠️ [constants] INTERNAL_API_URL and API_URL are missing on server-side! Falling back to K8s internal DNS.");
}

// Tách luồng rõ ràng: Tránh việc Server vô tình gọi ra tên miền public
export const API_BASE_URL = typeof window === "undefined"
  // LUỒNG SERVER: Bắt buộc dùng Internal DNS của Kubernetes
  ? (internalUrl || "http://api-gateway:8080/api/v1/admin")
  // LUỒNG CLIENT: Trình duyệt gọi thẳng API qua domain public hoặc relative path
  : (publicUrl || "/api/v1/admin");

export const API_TIMEOUT_MS = 15000;


/** Prefix cho query key React Query (tránh trùng giữa các feature) */
export const QUERY_KEY_PREFIX = {
  ORGANIZATION: "organization",
  MENUS: "menus",
  ROLES: "roles",
  RESOURCES: "resources",
  CATEGORIES: "categories",
} as const;
