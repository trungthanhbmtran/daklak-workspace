"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from "@/lib/axiosInstance";
import { createCrudHooks } from "@/lib/query-factory";

const API_BASE = '/documents';

// 1. Core CRUD Hooks using Factory
const documentCrud = createCrudHooks<any>(
  'documents',
  {
    list: (params) => apiClient.get(API_BASE, { params }),
    get: (id) => apiClient.get(`${API_BASE}/${id}`),
    create: (data) => apiClient.post(API_BASE, data),
    update: (id, data) => apiClient.put(`${API_BASE}/${id}`, data),
    delete: (id) => apiClient.delete(`${API_BASE}/${id}`),
  }
);

export const useListDocuments = documentCrud.useList;
export const useGetDocument = documentCrud.useDetail;
export const useCreateDocument = documentCrud.useCreate;
export const useUpdateDocument = documentCrud.useUpdate;
export const useDeleteDocument = documentCrud.useDelete;

// 2. Categories Hooks
export function useCategories(groupCode: string) {
  return useQuery({
    queryKey: ['document-categories', groupCode],
    queryFn: async () => {
      const response: any = await apiClient.get(`${API_BASE}/categories`, {
        params: { groupCode }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache for categories
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`${API_BASE}/categories`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-categories', variables.groupCode] });
      toast.success('Danh mục đã được tạo!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`${API_BASE}/categories/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-categories', variables.groupCode] });
      toast.success('Cập nhật danh mục thành công!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`${API_BASE}/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      toast.success('Đã xóa danh mục!');
    },
  });

  return {
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}

// 3. Specialized Hooks
export function useExtractMetadata() {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const response: any = await apiClient.post(`${API_BASE}/extract`, { fileId });
      return response.data;
    },
  });
}

export function useDocumentStats() {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: async () => {
      const response: any = await apiClient.get(`${API_BASE}/stats`);
      return response.data;
    },
  });
}

// 4. Backward Compatibility Hook (Legacy wrapper)
export function useDocuments() {
  const listDocs = useListDocuments({});
  const categoryMutations = useCategoryMutations();
  const extractMetadata = useExtractMetadata();

  return {
    useCategories,
    useListDocuments,
    useGetDocument,
    useDocumentStats,
    extractMetadata: extractMetadata.mutateAsync,
    ...categoryMutations,
    createDocument: useCreateDocument().mutateAsync,
    updateDocument: useUpdateDocument().mutateAsync,
    deleteDocument: useDeleteDocument().mutateAsync,
    isLoading: categoryMutations.isPending || extractMetadata.isPending
  };
}
