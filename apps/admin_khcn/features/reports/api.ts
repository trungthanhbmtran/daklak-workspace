import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

// Định nghĩa các key
export const REPORT_KEYS = {
  all: ["reports"] as const,
  templates: () => [...REPORT_KEYS.all, "templates"] as const,
};

// --- API FETCHERS ---
export const fetchTemplates = async () => {
  const res = await api.get('/api/v1/reports/templates');
  return res.data;
};

export const createTemplate = async (data: any) => {
  const res = await api.post('/api/v1/reports/templates', data);
  return res.data;
};

export const deleteTemplate = async (id: string) => {
  const res = await api.delete(`/api/v1/reports/templates/${id}`);
  return res.data;
};

// --- HOOKS ---
export function useTemplates() {
  return useQuery({
    queryKey: REPORT_KEYS.templates(),
    queryFn: fetchTemplates,
  });
}

export function useWidgets() {
  return useQuery({
    queryKey: ["reports", "widgets", "list"],
    queryFn: () => api.get("/api/v1/reports/templates/widgets").then(res => res.data),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      // Tự động invalidate để refresh danh sách
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.templates() });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.templates() });
    },
  });
}
