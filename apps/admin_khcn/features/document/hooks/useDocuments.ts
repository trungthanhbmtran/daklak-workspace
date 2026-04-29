"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from "@/lib/axiosInstance";

const API_BASE = '/documents';

export function useDocuments() {
  const queryClient = useQueryClient();

  // 1. Categories (Sử dụng API dùng chung hệ thống /api/v1/admin/categories)
  const useCategories = (groupCode: string) => {
    return useQuery({
      queryKey: ['document-categories', groupCode],
      queryFn: async () => {
        const response: any = await apiClient.get(`/categories`, {
          params: { group: groupCode }
        });
        const data = Array.isArray(response) ? response : (response?.data || []);
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  // 2. Documents CRUD
  const useListDocuments = (params: any) => {
    return useQuery({
      queryKey: ['documents', params],
      queryFn: async () => {
        const response: any = await apiClient.get(API_BASE, { params });
        return response.data;
      },
    });
  };

  const useGetDocument = (id: string) => {
    return useQuery({
      queryKey: ['document', id],
      queryFn: async () => {
        if (!id) return null;
        const response: any = await apiClient.get(`${API_BASE}/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response: any = await apiClient.post(API_BASE, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Văn bản đã được lưu!');
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response: any = await apiClient.put(`${API_BASE}/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Cập nhật văn bản thành công!');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.delete(`${API_BASE}/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đã xóa văn bản!');
    },
  });

  // 3. Specialized
  const extractMetadataMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response: any = await apiClient.post(`${API_BASE}/extract`, { fileId });
      return response.data;
    },
  });

  const useDocumentStats = () => {
    return useQuery({
      queryKey: ['document-stats'],
      queryFn: async () => {
        const response: any = await apiClient.get(`${API_BASE}/stats`);
        return response.data;
      },
    });
  };

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
