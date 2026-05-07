/**
 * Cấu hình ứng dụng – chỉ dùng qua Nginx prefix
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const API_TIMEOUT_MS = 15000;
