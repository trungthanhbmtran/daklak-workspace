"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from "@/lib/axiosInstance";

const API_BASE = '/documents';

/**
 * Hàm hỗ trợ bóc tách mảng dữ liệu từ phản hồi API
 * Hỗ trợ các định dạng: [...] hoặc { data: [...] } hoặc { data: { data: [...] } }
 */
const extractDataArray = (res: any) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
};

// 1. Top-level Hooks
export const useCategories = (groupCode: string) => {
  return useQuery({
    queryKey: ['document-categories', groupCode],
    queryFn: async () => {
      const response: any = await apiClient.get(`/categories`, {
        params: { group: groupCode }
      });
      return extractDataArray(response);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useListDocuments = (params: any) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response: any = await apiClient.get(API_BASE, { params });
      // Trả về toàn bộ response để Page có thể lấy được cả meta nếu cần
      return response;
    },
  });
};

export const useListConsultations = (params?: any) => {
  return useQuery({
    queryKey: ['document-consultations', params],
    queryFn: async () => {
      const response: any = await apiClient.get(`${API_BASE}/consultations`, { params });
      return response;
    },
  });
};

export const useListMinutes = (params?: any) => {
  return useQuery({
    queryKey: ['document-minutes', params],
    queryFn: async () => {
      const response: any = await apiClient.get(`${API_BASE}/minutes`, { params });
      return response;
    },
  });
};

export const useGetDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      if (!id) return null;
      const response: any = await apiClient.get(`${API_BASE}/${id}`);
      return response?.data || response;
    },
    enabled: !!id,
  });
};

export const useDocumentStats = () => {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: async () => {
      const response: any = await apiClient.get(`${API_BASE}/stats`);
      return response?.data || response;
    },
  });
};

// 2. Main Hook Wrapper
export function useDocuments() {
  const queryClient = useQueryClient();

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => apiClient.post(API_BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Văn bản đã được lưu!');
    },
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (data: any) => apiClient.post(`${API_BASE}/consultations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-consultations'] });
      toast.success('Yêu cầu lấy ý kiến đã được phát hành!');
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiClient.put(`${API_BASE}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Cập nhật văn bản thành công!');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`${API_BASE}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đã xóa văn bản!');
    },
  });

  const extractMetadataMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response: any = await apiClient.post(`${API_BASE}/extract`, { fileId });
      return response?.data || response;
    },
  });

  const syncOnlineMutation = useMutation({
    mutationFn: async () => apiClient.post(`${API_BASE}/sync`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đã đồng bộ văn bản từ trục liên thông!');
    },
  });

  return {
    useCategories,
    useListDocuments,
    useListConsultations,
    useListMinutes,
    useGetDocument,
    useDocumentStats,
    createDocument: createDocumentMutation.mutateAsync,
    createConsultation: createConsultationMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    extractMetadata: extractMetadataMutation.mutateAsync,
    syncOnline: syncOnlineMutation.mutateAsync,
    isLoading:
      createDocumentMutation.isPending ||
      createConsultationMutation.isPending ||
      updateDocumentMutation.isPending ||
      deleteDocumentMutation.isPending ||
      extractMetadataMutation.isPending ||
      syncOnlineMutation.isPending,
  };
}

