/**
 * Chuẩn Response thống nhất từ API Gateway.
 * Mọi response từ apiClient đều có cấu trúc này
 * (interceptor của axiosInstance đã bóc lớp Axios, trả thẳng object này).
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiMeta {
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  filter?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Tiện ích: bóc mảng data từ ApiResponse */
export function pickData<T>(res: ApiResponse<T[]>): T[] {
  return Array.isArray(res?.data) ? res.data : [];
}

/** Tiện ích: bóc object data từ ApiResponse */
export function pickOne<T>(res: ApiResponse<T>): T {
  return res?.data;
}

/** Tiện ích: bóc meta từ ApiResponse */
export function pickMeta(res: ApiResponse<unknown>): ApiMeta {
  return res?.meta ?? {};
}
