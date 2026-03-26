/**
 * Cấu hình ứng dụng – dùng chung cho app và lib.
 * Ưu tiên đọc từ env; fallback giá trị mặc định.
 */

/**
 * Cấu hình ứng dụng – dùng chung cho app và lib.
 * Phân tách rõ ràng giữa môi trường Server (K8s) và Client (Browser)
 */

const internalHost = process.env.INTERNAL_API_URL || "http://api-gateway:8080";
const externalPrefix = "/api/v1/admin";
const internalPrefix = "/v1/admin";

export const API_BASE_URL = typeof window === "undefined"
  ? `${internalHost}${internalPrefix}`
  : externalPrefix;

export const INTERNAL_GATEWAY_URL = internalHost;
export const API_PREFIX = externalPrefix;

export const API_TIMEOUT_MS = 15000;


/** Prefix cho query key React Query (tránh trùng giữa các feature) */
export const QUERY_KEY_PREFIX = {
  ORGANIZATION: "organization",
  MENUS: "menus",
  ROLES: "roles",
  RESOURCES: "resources",
  CATEGORIES: "categories",
} as const;
