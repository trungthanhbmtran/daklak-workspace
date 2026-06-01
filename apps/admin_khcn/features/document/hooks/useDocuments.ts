"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

const API_BASE = '/documents';

// ─── Top-level Query Hooks ────────────────────────────────────────────────────

/** Lấy danh mục tài liệu — trả về array thẳng (đã bóc .data) */
export const useCategories = (groupCode: string) => {
  return useQuery({
    queryKey: ['document-categories', groupCode],
    queryFn: async (): Promise<any[]> => {
      const res = await apiClient.get(`/categories`, { params: { group: groupCode } }) as any as ApiResponse<any[]>;
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/** Lấy danh sách tài liệu — trả về ApiResponse đầy đủ (consumer đọc .data + .meta) */
export const useListDocuments = (params: any) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get(API_BASE, { params }) as any;
    },
  });
};

/** Lấy danh sách đợt lấy ý kiến — trả về ApiResponse đầy đủ */
export const useListConsultations = (params?: any) => {
  return useQuery({
    queryKey: ['document-consultations', params],
    queryFn: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get(`${API_BASE}/consultations`, { params }) as any;
    },
  });
};

/** Lấy chi tiết 1 đợt lấy ý kiến — trả về entity thẳng (đã bóc .data) */
export const useGetConsultation = (id: string) => {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: async (): Promise<any> => {
      if (!id) return null;
      const res = await apiClient.get(`${API_BASE}/consultations/${id}`) as any as ApiResponse<any>;
      return res.data ?? null;
    },
    enabled: !!id,
  });
};

/** Lấy danh sách phản hồi theo đợt — trả về array thẳng */
export const useListResponses = (id: string) => {
  return useQuery({
    queryKey: ['consultation-responses', id],
    queryFn: async (): Promise<any[]> => {
      if (!id) return [];
      const res = await apiClient.get(`${API_BASE}/consultations/${id}/responses`) as any as ApiResponse<any[]>;
      return res.data ?? [];
    },
    enabled: !!id,
  });
};

/** Lấy danh sách biên bản — trả về ApiResponse đầy đủ */
export const useListMinutes = (params?: any) => {
  return useQuery({
    queryKey: ['document-minutes', params],
    queryFn: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get(`${API_BASE}/minutes`, { params }) as any;
    },
  });
};

/** Lấy chi tiết 1 tài liệu — trả về entity thẳng */
export const useGetDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async (): Promise<any> => {
      if (!id) return null;
      const res = await apiClient.get(`${API_BASE}/${id}`) as any as ApiResponse<any>;
      return res.data ?? null;
    },
    enabled: !!id,
  });
};

/** Lấy thống kê tài liệu — trả về entity thẳng */
export const useDocumentStats = () => {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: async (): Promise<any> => {
      const res = await apiClient.get(`${API_BASE}/stats`) as any as ApiResponse<any>;
      return res.data ?? null;
    },
  });
};

/** Lấy logs của tài liệu — trả về array thẳng */
export const useDocumentLogs = (id: string) => {
  return useQuery({
    queryKey: ['document-logs', id],
    queryFn: async (): Promise<any[]> => {
      if (!id) return [];
      const res = await apiClient.get(`${API_BASE}/${id}/logs`) as any as ApiResponse<any[]>;
      return res.data ?? [];
    },
    enabled: !!id,
  });
};

/** Lấy danh sách góp ý công chúng — trả về array thẳng */
export const usePublicComments = (consultationId?: string, status?: string) => {
  return useQuery({
    queryKey: ['public-comments', consultationId, status],
    queryFn: async (): Promise<any[]> => {
      const url = consultationId
        ? `${API_BASE}/consultations/${consultationId}/public-comments`
        : `${API_BASE}/consultations/public-comments`;
      const res = await apiClient.get(url, { params: { status } }) as any as ApiResponse<any[]>;
      return res.data ?? [];
    },
  });
};

// ─── Helper: bóc array từ ApiResponse (cho backward-compat) ──────────────────
/** @deprecated Dùng trực tiếp res.data thay vì hàm này */
export const extractDataArray = (res: ApiResponse<any[]> | null | undefined): any[] => {
  if (!res) return [];
  return Array.isArray(res.data) ? res.data : [];
};

// ─── Main Mutations Hook ──────────────────────────────────────────────────────
export function useDocuments() {
  const queryClient = useQueryClient();

  const createDocumentMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(API_BASE, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast.success('Văn bản đã được lưu!'); },
  });

  const createConsultationMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`${API_BASE}/consultations`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-consultations'] }); toast.success('Yêu cầu lấy ý kiến đã được phát hành!'); },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`${API_BASE}/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['document-logs', variables.id] });
      toast.success('Cập nhật văn bản thành công!');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast.success('Đã xóa văn bản!'); },
  });

  const extractMetadataMutation = useMutation({
    mutationFn: async (fileId: string): Promise<any> => {
      const res = await apiClient.post(`${API_BASE}/extract`, { fileId }) as any as ApiResponse<any>;
      return res.data;
    },
  });

  const syncOnlineMutation = useMutation({
    mutationFn: () => apiClient.post(`${API_BASE}/sync`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast.success('Đã đồng bộ văn bản từ trục liên thông!'); },
  });

  const moderateCommentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(`${API_BASE}/consultations/public-comments/${id}/moderate`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['public-comments'] }); toast.success('Đã cập nhật trạng thái kiểm duyệt!'); },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`${API_BASE}/categories`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-categories'] }); toast.success('Đã tạo danh mục mới!'); },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`${API_BASE}/categories/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-categories'] }); toast.success('Đã cập nhật danh mục!'); },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`${API_BASE}/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-categories'] }); toast.success('Đã xóa danh mục!'); },
  });

  const createMinutesMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`${API_BASE}/minutes`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['document-minutes'] }); toast.success('Đã lưu biên bản cuộc họp!'); },
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
    // Mutations
    createDocument: createDocumentMutation.mutateAsync,
    createConsultation: createConsultationMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    extractMetadata: extractMetadataMutation.mutateAsync,
    syncOnline: syncOnlineMutation.mutateAsync,
    moderateComment: moderateCommentMutation.mutateAsync,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    createMinutes: createMinutesMutation.mutateAsync,
    isLoading:
      createDocumentMutation.isPending ||
      createConsultationMutation.isPending ||
      updateDocumentMutation.isPending ||
      deleteDocumentMutation.isPending ||
      extractMetadataMutation.isPending ||
      syncOnlineMutation.isPending ||
      moderateCommentMutation.isPending ||
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending ||
      createMinutesMutation.isPending,
  };
}
