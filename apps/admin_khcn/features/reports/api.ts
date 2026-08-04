import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

// Định nghĩa các key
export const REPORT_KEYS = {
  all: ["reports"] as const,
  templates: () => [...REPORT_KEYS.all, "templates"] as const,
};

// --- API FETCHERS ---
export const fetchTemplates = async () => {
  const res = await api.get('/reports/templates', { baseURL: '/api/v1' });
  return res.data;
};

export const createTemplate = async (data: any) => {
  const res = await api.post('/reports/templates', data, { baseURL: '/api/v1' });
  return res.data;
};

export const deleteTemplate = async (id: string) => {
  const res = await api.delete(`/reports/templates/${id}`, { baseURL: '/api/v1' });
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
    queryFn: () => api.get("/reports/templates/widgets", { baseURL: '/api/v1' }).then(res => res.data),
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

export const previewReport = async (payload: any) => {
  // Use baseURL: '' to call Next.js local API route instead of backend API
  // Note: next.config.ts has basePath: '/admin', so the local route is /admin/api/reports/preview
  const res = await api.post('/admin/api/reports/preview', payload, { baseURL: '' });
  return res;
};

export function usePreviewReport(payload: any, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "preview", payload],
    queryFn: () => previewReport(payload),
    enabled,
    retry: false,
  });
}
