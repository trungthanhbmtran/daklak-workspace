/**
 * Cấu hình ứng dụng – chỉ dùng qua Nginx prefix
 * Không còn gọi internal Docker/K8s nữa
 */

export const API_BASE_URL = "/api";

export const API_PREFIX = "/api";

export const API_TIMEOUT_MS = 15000;

/** React Query keys */
export const QUERY_KEY_PREFIX = {
  ORGANIZATION: "organization",
  MENUS: "menus",
  ROLES: "roles",
  RESOURCES: "resources",
  CATEGORIES: "categories",
} as const;