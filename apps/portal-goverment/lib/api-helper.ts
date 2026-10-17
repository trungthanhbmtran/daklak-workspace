/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper trích xuất dữ liệu thực thể từ Response chuẩn duy nhất của hệ thống:
 * { success: boolean, data: T, meta?: object, message?: string, timestamp?: string }
 * - Do Backend và Frontend đã chuẩn hóa duy nhất 1 dạng, Client chỉ việc lấy trực tiếp .data để render.
 * - Giữ tính lũy thừa (idempotent): nếu dữ liệu đã unwrap hoặc là mảng/primitive thì giữ nguyên.
 */
export function unwrapData<T = any>(res: any, fallback?: T): T {
  if (res == null) return fallback as T;

  if (typeof res === "object" && !Array.isArray(res) && "data" in res && res.data !== undefined) {
    return (res.data ?? fallback) as T;
  }

  return (res ?? fallback) as T;
}
