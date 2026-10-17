/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper an toàn để bóc tách dữ liệu từ Gateway envelope ({ success, data, meta }).
 * - Bóc tách triệt để mọi tầng envelope lồng nhau ({ success, data: { success, data: [...] } }).
 * - Đảm bảo tầng UI component chỉ cần gọi data để render trực tiếp, không cần phải ?.data hay convert lại.
 * - Hỗ trợ tương thích ngược (defensive): gán getter .data ẩn trả về chính nó nếu kết quả là object/array.
 */
export function unwrapData<T = any>(res: any, fallback?: T): T & { data?: any } {
  if (res == null) return fallback as (T & { data?: any });

  let target = res;
  while (
    target != null &&
    typeof target === "object" &&
    !Array.isArray(target) &&
    "data" in target &&
    target.data !== undefined
  ) {
    const isEnvelope =
      "success" in target ||
      "meta" in target ||
      "status" in target ||
      "statusCode" in target ||
      "timestamp" in target ||
      "message" in target;

    if (isEnvelope || (target.data && typeof target.data === "object")) {
      target = target.data;
    } else {
      target = target.data;
      break;
    }
  }

  const result = (target ?? fallback) as T;

  // Tương thích ngược: Cho phép các component cũ lỡ gọi ?.data vẫn truy cập được chính dữ liệu này
  if (result != null && typeof result === "object") {
    if (!("data" in result)) {
      try {
        Object.defineProperty(result, "data", {
          get() {
            return this;
          },
          configurable: true,
          enumerable: false,
        });
      } catch {
        // bỏ qua nếu object bị frozen
      }
    }
  }

  return result as (T & { data?: any });
}
