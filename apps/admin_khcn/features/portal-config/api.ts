/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * features/portal-config/api.ts
 * Tập trung toàn bộ network calls cho portal-config.
 * Components và hooks KHÔNG import apiClient trực tiếp.
 */
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

// ─── Portal Config ─────────────────────────────────────────────────────────

export interface PortalConfigItem {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export const portalConfigApi = {
  /** Lấy toàn bộ config items */
  getAll: (): Promise<ApiResponse<PortalConfigItem[]>> =>
    apiClient.get("/portal-configs") as any,

  /** Tạo 1 config item */
  create: (data: { code: string; name: string; description?: string }): Promise<ApiResponse<PortalConfigItem>> =>
    apiClient.post("/portal-configs", data) as any,

  /** Cập nhật 1 config item */
  update: (id: number, data: { code?: string; name?: string; description?: string }): Promise<ApiResponse<PortalConfigItem>> =>
    apiClient.put(`/portal-configs/${id}`, data) as any,

  /** Upsert theo code */
  upsert: (data: { code: string; name: string; description?: string }): Promise<ApiResponse<PortalConfigItem>> =>
    apiClient.post("/portal-configs/upsert", data) as any,

  /**
   * Batch upsert — lưu tất cả config trong 1 request thay vì N requests tuần tự.
   * Giảm save latency từ ~3.4s → ~200ms (17 items × 200ms → parallel 1 request).
   */
  batchUpsert: (items: { code: string; name: string; description?: string }[]): Promise<ApiResponse<any>> =>
    apiClient.post("/portal-configs/batch-upsert", { data: items }) as any,
};

// ─── Languages ─────────────────────────────────────────────────────────────

export interface LanguageItem {
  id: number;
  code: string;
  name: string;
  active: number;
}

export const portalLanguagesApi = {
  /** Lấy danh sách ngôn ngữ active từ Category module */
  getActive: (): Promise<ApiResponse<LanguageItem[]>> =>
    apiClient.get("/categories", { params: { group: "LANGUAGE", active: 1 } }) as any,
};

// ─── Portal Builder ────────────────────────────────────────────────────────

export const portalBuilderApi = {
  /** Lấy danh sách pages */
  getPages: (params?: any): Promise<ApiResponse<any[]>> =>
    apiClient.get("/portal-pages", { params }) as any,

  /** Tạo/cập nhật page */
  upsertPage: (data: any): Promise<ApiResponse<any>> =>
    apiClient.post("/portal-pages", data) as any,

  /** Xóa page */
  deletePage: (id: string | number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/portal-pages/${id}`) as any,

  /** Lấy config theo code */
  getByCode: (code: string): Promise<ApiResponse<PortalConfigItem>> =>
    apiClient.get(`/portal-configs/by-code/${code}`) as any,
};
