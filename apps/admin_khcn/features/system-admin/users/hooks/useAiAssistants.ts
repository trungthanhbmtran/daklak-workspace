import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
      const { data } = await axios.get<AiAssistant[]>('/api/v1/admin/ai-assistants');
      return data;
    },
  });
};

export const useCreateAiAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; system_prompt: string; is_public: boolean }) => {
      const { data } = await axios.post('/api/v1/admin/ai-assistants', payload);
      return data;
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
      const { data } = await axios.put(`/api/v1/admin/ai-assistants/${payload.id}`, payload);
      return data;
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
      await axios.delete(`/api/v1/admin/ai-assistants/${id}`);
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
      const { data } = await axios.post(`/api/v1/admin/ai-assistants/${payload.assistantId}/knowledge-sources`, payload);
      return data;
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
