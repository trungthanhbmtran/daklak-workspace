/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export interface KpiFormTemplateItem {
  formCode: string;
  name: string;
  description: string;
  templateFileId: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  targetRole: string;
  schemaVersion: string;
  documentCount: number;
  hasXmlFile: boolean;
  xmlSize: number;
}

export interface KpiFormDetailResponse {
  formCode: string;
  name: string;
  description: string;
  templateFileId: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  targetRole: string;
  schemaVersion: string;
  documentCount: number;
  hasXmlFile: boolean;
  xmlSize: number;
  xmlContent: string;
  placeholders: string[];
}

export interface KpiFormXmlResponse {
  formCode: string;
  xmlContent: string;
  placeholders: string[];
  xmlSize: number;
}

export interface ValidateXmlResult {
  isValid: boolean;
  message: string;
  error?: string;
  placeholders: string[];
}

export const kpiFormsApi = {
  // Lấy danh sách biểu mẫu đánh giá (Nơi chứa mẫu đánh giá)
  list(): Promise<ApiResponse<KpiFormTemplateItem[]>> {
    return apiClient.get('/hrm/kpi-forms') as any;
  },

  // Lấy chi tiết biểu mẫu kèm nội dung XML
  getDetail(formCode: string): Promise<ApiResponse<KpiFormDetailResponse>> {
    return apiClient.get(`/hrm/kpi-forms/${formCode}`) as any;
  },

  // Cập nhật metadata biểu mẫu
  update(formCode: string, payload: { name: string; description: string; templateFileId?: string }): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/kpi-forms/${formCode}`, payload) as any;
  },

  // Lấy nội dung XML của biểu mẫu
  getXml(formCode: string): Promise<ApiResponse<KpiFormXmlResponse>> {
    return apiClient.get(`/hrm/kpi-forms/${formCode}/xml`) as any;
  },

  // Lưu nội dung XML cho biểu mẫu
  saveXml(formCode: string, xmlContent: string): Promise<ApiResponse<KpiFormXmlResponse>> {
    return apiClient.put(`/hrm/kpi-forms/${formCode}/xml`, { xmlContent }) as any;
  },

  // Kiểm tra tính hợp lệ cú pháp XML
  validateXml(xmlContent: string): Promise<ApiResponse<ValidateXmlResult>> {
    return apiClient.post('/hrm/kpi-forms/validate-xml', { xmlContent }) as any;
  },

  // Đường dẫn download trực tiếp file .xml
  getDownloadUrl(formCode: string): string {
    return `/api/v1/admin/hrm/kpi-forms/${formCode}/download`;
  },
};
