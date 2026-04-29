"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from "@/lib/axiosInstance";

const API_BASE = '/documents';

// 1. Top-level Hooks (Đảm bảo định danh ổn định cho React)
export const useCategories = (groupCode: string) => {
  return useQuery({
    queryKey: ['document-categories', groupCode],
    queryFn: async () => {
      const response: any = await apiClient.get(`/categories`, {
        params: { group: groupCode }
      });
      // apiClient.interceptors.response đã bóc lớp data đầu tiên
      const data = Array.isArray(response) ? response : (response?.data || []);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useListDocuments = (params: any) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response: any = await apiClient.get(API_BASE, { params });
      // Nếu API trả về { data: [], meta: {} }
      return response.data || response;
    },
  });
};

export const useGetDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      if (!id) return null;
      const response: any = await apiClient.get(`${API_BASE}/${id}`);
      return response.data || response;
    },
    enabled: !!id,
  });
};

export const useDocumentStats = () => {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: async () => {
      const response: any = await apiClient.get(`${API_BASE}/stats`);
      return response.data || response;
    },
  });
};

// 2. Main Hook Wrapper (Backward Compatibility)
export function useDocuments() {
  const queryClient = useQueryClient();

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => apiClient.post(API_BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Văn bản đã được lưu!');
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
      return response.data || response;
    },
  });

  return {
    useCategories,
    useListDocuments,
    useGetDocument,
    useDocumentStats,
    createDocument: createDocumentMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    extractMetadata: extractMetadataMutation.mutateAsync,
    isLoading:
      createDocumentMutation.isPending ||
      updateDocumentMutation.isPending ||
      deleteDocumentMutation.isPending ||
      extractMetadataMutation.isPending,
  };
}
