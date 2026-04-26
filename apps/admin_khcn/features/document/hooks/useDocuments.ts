import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api/v1/admin/documents';

export function useDocuments() {
  const queryClient = useQueryClient();

  // 1. Categories
  const useCategories = (type: string) => {
    return useQuery({
      queryKey: ['document-categories', type],
      queryFn: async () => {
        const response = await fetch(`${API_BASE}/categories?type=${type}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const result = await response.json();
        return result.data;
      },
    });
  };

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
        return result;
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
        return result;
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

  // 4. Minutes
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

  // Compat for old code (if needed)
  const getCategories = async (type: string) => {
    const response = await fetch(`${API_BASE}/categories?type=${type}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    const result = await response.json();
    return result.data;
  };

  return {
    useCategories,
    useListDocuments,
    createDocument: createDocumentMutation.mutateAsync,
    useListConsultations,
    createConsultation: createConsultationMutation.mutateAsync,
    createMinutes: createMinutesMutation.mutateAsync,
    getCategories, // legacy support
    isLoading: createDocumentMutation.isPending || createConsultationMutation.isPending || createMinutesMutation.isPending,
  };
}
