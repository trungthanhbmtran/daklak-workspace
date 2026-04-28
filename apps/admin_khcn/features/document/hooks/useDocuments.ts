import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from "@/lib/axiosInstance";

const API_BASE = '/documents';

export function useDocuments() {
  const queryClient = useQueryClient();

  // 1. Categories
  const useCategories = (groupCode: string) => {
    return useQuery({
      queryKey: ['document-categories', groupCode],
      queryFn: async () => {
        const response: any = await apiClient.get(`${API_BASE}/categories`, {
          params: { groupCode }
        });
        return response.data;
      },
    });
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response: any = await apiClient.post(`${API_BASE}/categories`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-categories', variables.groupCode] });
      toast.success('Danh mục đã được tạo!');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response: any = await apiClient.put(`${API_BASE}/categories/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-categories', variables.groupCode] });
      toast.success('Cập nhật danh mục thành công!');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.delete(`${API_BASE}/categories/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      toast.success('Đã xóa danh mục!');
    },
  });

  // 2. Documents
  const useListDocuments = (params: any) => {
    return useQuery({
      queryKey: ['documents', params],
      queryFn: async () => {
        const response: any = await apiClient.get(API_BASE, { params });
        return response.data;
      },
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

  // 3. Consultations
  const useListConsultations = (params: any) => {
    return useQuery({
      queryKey: ['consultations', params],
      queryFn: async () => {
        const response: any = await apiClient.get(`${API_BASE}/consultations`, { params });
        return response.data;
      },
    });
  };

  const createConsultationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response: any = await apiClient.post(`${API_BASE}/consultations`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Đợt lấy ý kiến đã được tạo!');
    },
  });

  // 4. Minutes
  const useListMinutes = (params: any) => {
    return useQuery({
      queryKey: ['minutes', params],
      queryFn: async () => {
        const response: any = await apiClient.get(`${API_BASE}/minutes`, { params });
        return response.data;
      },
    });
  };

  const createMinutesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response: any = await apiClient.post(`${API_BASE}/minutes`, data);
      return response;
    },
    onSuccess: () => {
      toast.success('Biên bản đã được lưu thành công!');
    },
  });

  // 5. Statistics
  const useDocumentStats = () => {
    return useQuery({
      queryKey: ['document-stats'],
      queryFn: async () => {
        const response: any = await apiClient.get(`${API_BASE}/stats`);
        return response.data;
      },
    });
  };

  // Compat for old code (if needed)
  const getCategories = async (groupCode: string) => {
    const response: any = await apiClient.get(`${API_BASE}/categories`, { params: { groupCode } });
    return response.data;
  };

  const extractMetadataMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response: any = await apiClient.post(`${API_BASE}/extract`, { fileId });
      return response.data;
    },
  });

  return {
    useCategories,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    useListDocuments,
    createDocument: createDocumentMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    useGetDocument,
    useListConsultations,
    useListMinutes,
    useDocumentStats,
    extractMetadata: extractMetadataMutation.mutateAsync,
    createConsultation: createConsultationMutation.mutateAsync,
    createMinutes: createMinutesMutation.mutateAsync,
    getCategories, // legacy support
    isLoading:
      createDocumentMutation.isPending ||
      extractMetadataMutation.isPending ||
      createConsultationMutation.isPending ||
      createMinutesMutation.isPending ||
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending,
  };
}
