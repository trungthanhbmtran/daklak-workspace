/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper an toàn để bóc tách dữ liệu từ Gateway envelope ({ success, data }).
 */
export function unwrapData<T>(res: any, fallback?: T): T {
  if (res == null) return fallback as T;
  if (typeof res === "object" && "data" in res && res.data !== undefined) {
    return res.data as T;
  }
  return res as T;
}
