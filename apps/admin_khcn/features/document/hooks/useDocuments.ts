/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";
import { unwrapData } from "@/lib/api-helper";

const API_BASE = '/documents';

// ─── Top-level Query Hooks ────────────────────────────────────────────────────

/** Lấy danh mục tài liệu — trả về array thẳng (đã bóc .data) */
export const useCategories = (groupCode: string) => {
  return useQuery({
    queryKey: ['document-categories', groupCode],
    queryFn: async (): Promise<any[]> => {
      const res = await apiClient.get(`/categories`, { params: { group: groupCode } });
      return unwrapData<any[]>(res, []);
    },
    staleTime: 5 * 60 * 1000,
  });
};

/** Lấy danh sách tài liệu — trả về array thẳng, kèm getter .data cho backward-compat */
export const useListDocuments = (params: any) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get(API_BASE, { params }) as any;
    },
    select: (res) => unwrapData<any[]>(res, []),
  });
};

/** Lấy danh sách đợt lấy ý kiến — trả về array thẳng, kèm getter .data */
export const useListConsultations = (params?: any) => {
  return useQuery({
    queryKey: ['document-consultations', params],
    queryFn: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get(`${API_BASE}/consultations`, { params }) as any;
    },
    select: (res) => unwrapData<any[]>(res, []),
  });
};

/** Lấy chi tiết 1 đợt lấy ý kiến — trả về entity thẳng (đã bóc .data) */
export const useGetConsultation = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: async (): Promise<any> => {
      if (!id) return null;
      const res = await apiClient.get(`${API_BASE}/consultations/${id}`);
      return unwrapData<any>(res, null);
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

/** Lấy danh sách phản hồi theo đợt — trả về array thẳng */
export const useListResponses = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['consultation-responses', id],
    queryFn: async (): Promise<any[]> => {
      if (!id) return [];
      const res = await apiClient.get(`${API_BASE}/consultations/${id}/responses`);
      return unwrapData<any[]>(res, []);
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

/** Lấy danh sách biên bản — trả về array thẳng, kèm getter .data */
export const useListMinutes = (params?: any) => {
  return useQuery({
    queryKey: ['document-minutes', params],
    queryFn: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get(`${API_BASE}/minutes`, { params }) as any;
    },
    select: (res) => unwrapData<any[]>(res, []),
  });
};

/** Lấy chi tiết 1 tài liệu — trả về entity thẳng */
export const useGetDocument = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async (): Promise<any> => {
      if (!id) return null;
      const res = await apiClient.get(`${API_BASE}/${id}`);
      return unwrapData<any>(res, null);
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

/** Lấy thống kê tài liệu — trả về entity thẳng */
export const useDocumentStats = () => {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: async (): Promise<any> => {
      const res = await apiClient.get(`${API_BASE}/stats`);
      return unwrapData<any>(res, null);
    },
  });
};

/** Lấy logs của tài liệu — trả về array thẳng */
export const useDocumentLogs = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['document-logs', id],
    queryFn: async (): Promise<any[]> => {
      if (!id) return [];
      const res = await apiClient.get(`${API_BASE}/${id}/logs`);
      return unwrapData<any[]>(res, []);
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

/** Lấy danh sách góp ý công chúng — trả về array thẳng */
export const usePublicComments = (consultationId?: string, status?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['public-comments', consultationId, status],
    queryFn: async (): Promise<any[]> => {
      const url = consultationId
        ? `${API_BASE}/consultations/${consultationId}/public-comments`
        : `${API_BASE}/consultations/public-comments`;
      const res = await apiClient.get(url, { params: { status } });
      return unwrapData<any[]>(res, []);
    },
    enabled: options?.enabled ?? true,
  });
};

/** Lấy cấu hình trạng thái kết nối LGSP */
export const useLgspConfig = () => {
  return useQuery({
    queryKey: ['lgsp-config'],
    queryFn: async (): Promise<any> => {
      const res = await apiClient.get(`${API_BASE}/lgsp/config`);
      return unwrapData<any>(res, null);
    },
  });
};

/** Lấy danh sách cơ quan đơn vị liên thông LGSP */
export const useLgspAgencies = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: ['lgsp-agencies', params],
    queryFn: async (): Promise<any[]> => {
      const res = await apiClient.get(`${API_BASE}/lgsp/agencies`, { params });
      return unwrapData<any[]>(res, []);
    },
  });
};

/** Tra cứu trạng thái gửi văn bản qua LGSP */
export const useLgspSentStatus = (documentId: string, lgspDocId?: string) => {
  return useQuery({
    queryKey: ['lgsp-sent-status', documentId, lgspDocId],
    queryFn: async (): Promise<any> => {
      if (!documentId) return null;
      const res = await apiClient.get(`${API_BASE}/${documentId}/lgsp-status`, {
        params: { lgspDocId },
      });
      return unwrapData<any>(res, null);
    },
    enabled: !!documentId,
  });
};

/** Thẩm định kiểm tra kết nối tới hạ tầng LGSP Đắk Lắk */
export const useTestLgspConnection = () => {
  return useMutation({
    mutationFn: async (): Promise<any> => {
      const res = await apiClient.get(`${API_BASE}/lgsp/test-connection`);
      return unwrapData<any>(res, null);
    },
  });
};

// ─── Helper: bóc array từ ApiResponse (cho backward-compat) ──────────────────
/** @deprecated Dùng trực tiếp res.data thay vì hàm này */
export const extractDataArray = (res: ApiResponse<any[]> | null | undefined): any[] => {
  return unwrapData<any[]>(res, []);
};

// ─── Main Mutations Hook ──────────────────────────────────────────────────────
export function useDocuments() {
  const queryClient = useQueryClient();

  const createDocumentMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (data: any) => apiClient.post(API_BASE, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast.success('Văn bản đã được lưu!'); },
  });

  const createConsultationMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (data: any) => apiClient.post(`${API_BASE}/consultations`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-consultations'] }); toast.success('Yêu cầu lấy ý kiến đã được phát hành!'); },
  });

  const updateDocumentMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: ({ id, ...data }: any) => apiClient.put(`${API_BASE}/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['document-logs', variables.id] });
      toast.success('Cập nhật văn bản thành công!');
    },
  });

  const deleteDocumentMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast.success('Đã xóa văn bản!'); },
  });

  const extractMetadataMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: async (fileId: string): Promise<any> => {
      const res = await apiClient.post(`${API_BASE}/extract`, { fileId }) as any as ApiResponse<any>;
      return res.data;
    },
  });

  
  
  const moderateCommentMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(`${API_BASE}/consultations/public-comments/${id}/moderate`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['public-comments'] }); toast.success('Đã cập nhật trạng thái kiểm duyệt!'); },
  });

  const createCategoryMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (data: any) => apiClient.post(`${API_BASE}/categories`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-categories'] }); toast.success('Đã tạo danh mục mới!'); },
  });

  const updateCategoryMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: ({ id, ...data }: any) => apiClient.put(`${API_BASE}/categories/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-categories'] }); toast.success('Đã cập nhật danh mục!'); },
  });

  const deleteCategoryMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (id: string) => apiClient.delete(`${API_BASE}/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-categories'] }); toast.success('Đã xóa danh mục!'); },
  });

  const createMinutesMutation = useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (data: any) => apiClient.post(`${API_BASE}/minutes`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-minutes'] }); toast.success('Đã lưu biên bản cuộc họp!'); },
  });

  const syncLgspMutation = useMutation({
    mutationFn: () => apiClient.post(`${API_BASE}/lgsp/sync`),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (res?.success === false) {
        toast.error(res?.message || 'Không thể đồng bộ văn bản từ trục LGSP');
      } else {
        toast.success(res?.message || 'Đồng bộ văn bản từ trục LGSP thành công!');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Lỗi đồng bộ văn bản từ trục LGSP');
    },
  });

  const sendLgspDocumentMutation = useMutation({
    mutationFn: ({ id, receiverCode }: { id: string; receiverCode: string }) =>
      apiClient.post(`${API_BASE}/${id}/send-lgsp`, { receiverCode }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (res?.success === false) {
        toast.error(res?.message || 'Không thể gửi văn bản lên trục LGSP');
      } else {
        toast.success(res?.message || 'Văn bản đã được gửi lên trục liên thông LGSP!');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Lỗi gửi văn bản lên trục LGSP');
    },
  });

  const updateLgspConfigMutation = useMutation({
    mutationFn: (config: any) => apiClient.post(`${API_BASE}/lgsp/config`, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lgsp-config'] });
      toast.success('Cập nhật cấu hình kết nối LGSP thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Lỗi cập nhật cấu hình LGSP');
    },
  });

  const testLgspConnectionMutation = useMutation({
    mutationFn: async (): Promise<any> => {
      const res = await apiClient.get(`${API_BASE}/lgsp/test-connection`) as any;
      return unwrapData(res);
    },
  });

  return {
    // Query hooks (re-exported từ top-level)
    useCategories,
    useListDocuments,
    useListConsultations,
    useListMinutes,
    useGetDocument,
    useGetConsultation,
    useListResponses,
    useDocumentStats,
    useDocumentLogs,
    usePublicComments,
    useLgspConfig,
    useLgspAgencies,
    useLgspSentStatus,
    useTestLgspConnection,
    // Mutations
    createDocument: createDocumentMutation.mutateAsync,
    createConsultation: createConsultationMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    extractMetadata: extractMetadataMutation.mutateAsync,
    moderateComment: moderateCommentMutation.mutateAsync,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    createMinutes: createMinutesMutation.mutateAsync,
    syncLgsp: syncLgspMutation.mutateAsync,
    sendLgspDocument: sendLgspDocumentMutation.mutateAsync,
    updateLgspConfig: updateLgspConfigMutation.mutateAsync,
    testLgspConnection: testLgspConnectionMutation.mutateAsync,
    isSyncingLgsp: syncLgspMutation.isPending,
    isSendingLgsp: sendLgspDocumentMutation.isPending,
    isTestingLgspConnection: testLgspConnectionMutation.isPending,
    isLoading:
      createDocumentMutation.isPending ||
      createConsultationMutation.isPending ||
      updateDocumentMutation.isPending ||
      deleteDocumentMutation.isPending ||
      extractMetadataMutation.isPending ||
      moderateCommentMutation.isPending ||
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending ||
      createMinutesMutation.isPending ||
      syncLgspMutation.isPending ||
      sendLgspDocumentMutation.isPending ||
      updateLgspConfigMutation.isPending ||
      testLgspConnectionMutation.isPending,
  };
}
