import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api/v1/admin/documents';

export function useDocuments() {
  const queryClient = useQueryClient();

  // 1. Categories
  const useCategories = (groupCode: string) => {
    return useQuery({
      queryKey: ['document-categories', groupCode],
      queryFn: async () => {
        const response = await fetch(`${API_BASE}/categories?groupCode=${groupCode}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const result = await response.json();
        return result.data;
      },
    });
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-categories', variables.groupCode] });
      toast.success('Danh mục đã được tạo!');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      toast.success('Cập nhật danh mục thành công!');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      toast.success('Đã xóa danh mục');
    },
  });

  // 2. Documents
  const useListDocuments = (filters: any) => {
    return useQuery({
      queryKey: ['documents', filters],
      queryFn: async () => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch documents');
        const result = await response.json();
        return result.data;
      },
    });
  };

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Văn bản đã được lưu vào sổ thành công!');
    },
    onError: () => toast.error('Có lỗi xảy ra khi lưu văn bản'),
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Cập nhật văn bản thành công!');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đã xóa văn bản');
    },
  });

  // 3. Consultations
  const useListConsultations = (filters: any) => {
    return useQuery({
      queryKey: ['consultations', filters],
      queryFn: async () => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}/consultations?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch consultations');
        const result = await response.json();
        return result.data;
      },
    });
  };

  const createConsultationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_BASE}/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create consultation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Đã tạo luồng lấy ý kiến thành công!');
    },
  });

  // 5. Minutes
  const useListMinutes = (filters: any) => {
    return useQuery({
      queryKey: ['minutes', filters],
      queryFn: async () => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}/minutes?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch minutes');
        const result = await response.json();
        return result.data;
      },
    });
  };

  const createMinutesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_BASE}/minutes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create minutes');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Biên bản đã được lưu thành công!');
    },
  });

  // 6. Statistics
  const useDocumentStats = () => {
    return useQuery({
      queryKey: ['document-stats'],
      queryFn: async () => {
        const response = await fetch(`${API_BASE}/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch statistics');
        const result = await response.json();
        return result.data;
      },
    });
  };

  // Compat for old code (if needed)
  const getCategories = async (groupCode: string) => {
    const response = await fetch(`${API_BASE}/categories?groupCode=${groupCode}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    const result = await response.json();
    return result.data;
  };

  return {
    useCategories,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    useListDocuments,
    createDocument: createDocumentMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    useListConsultations,
    useListMinutes,
    useDocumentStats,
    createConsultation: createConsultationMutation.mutateAsync,
    createMinutes: createMinutesMutation.mutateAsync,
    getCategories, // legacy support
    isLoading: 
      createDocumentMutation.isPending || 
      createConsultationMutation.isPending || 
      createMinutesMutation.isPending ||
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending,
  };
}
