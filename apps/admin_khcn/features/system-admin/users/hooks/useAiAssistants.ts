import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axiosInstance';
import type { ApiResponse } from '@/lib/api.types';
import { unwrapData } from '@/lib/api-helper';
import { toast } from 'sonner';

export interface AiAssistant {
  id: string;
  user_id: number;
  name: string;
  description: string;
  system_prompt: string;
  is_public: boolean;
  knowledge_sources: any[];
  tools: any[];
}

export const useGetAiAssistants = () => {
  return useQuery({
    queryKey: ['aiAssistants'],
    queryFn: async () => {
      const res = await apiClient.get<any, ApiResponse<AiAssistant[]>>('/ai-assistants');
      return unwrapData<AiAssistant[]>(res, []);
    },
  });
};

export const useCreateAiAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; system_prompt: string; is_public: boolean }) => {
      const res = await apiClient.post<any, ApiResponse<AiAssistant>>('/ai-assistants', payload);
      return unwrapData<AiAssistant>(res, {} as AiAssistant);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAssistants'] });
      toast.success('Tạo Trợ lý AI thành công!');
    },
    onError: () => {
      toast.error('Lỗi khi tạo Trợ lý AI');
    }
  });
};

export const useUpdateAiAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; name: string; description?: string; system_prompt: string; is_public: boolean }) => {
      const res = await apiClient.put<any, ApiResponse<AiAssistant>>(`/ai-assistants/${payload.id}`, payload);
      return unwrapData<AiAssistant>(res, {} as AiAssistant);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAssistants'] });
      toast.success('Cập nhật Trợ lý AI thành công!');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật Trợ lý AI');
    }
  });
};

export const useDeleteAiAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/ai-assistants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAssistants'] });
      toast.success('Xoá Trợ lý AI thành công!');
    },
    onError: () => {
      toast.error('Lỗi khi xoá Trợ lý AI');
    }
  });
};

export const useAddKnowledgeSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { assistantId: string; type: string; title: string; content: string }) => {
      const res = await apiClient.post<any, ApiResponse<any>>(`/ai-assistants/${payload.assistantId}/knowledge-sources`, payload);
      return unwrapData<any>(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAssistants'] });
      toast.success('Thêm nguồn tri thức thành công!');
    },
    onError: () => {
      toast.error('Lỗi khi thêm nguồn tri thức');
    }
  });
};
