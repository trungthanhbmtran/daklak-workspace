import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

// Định nghĩa các key
export const REPORT_KEYS = {
  all: ["reports"] as const,
  templates: () => [...REPORT_KEYS.all, "templates"] as const,
};

// --- API FETCHERS ---
export const fetchTemplates = async () => {
  const res = await api.get('/reports/templates');
  return res.data;
};

export const createTemplate = async (data: any) => {
  const res = await api.post('/reports/templates', data);
  return res.data;
};

export const deleteTemplate = async (id: string) => {
  const res = await api.delete(`/reports/templates/${id}`);
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
    queryFn: () => api.get("/reports/templates/widgets").then(res => res.data),
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
  // Check if it's a DB internal source
  if (payload.type === 'db') {
    let endpoint = '';
    switch (payload.sourceId) {
      case 'HRM_TASK_STATS': endpoint = '/reports/tasks'; break;
      case 'DOC_STATS': endpoint = '/reports/documents'; break;
      case 'POST_STATS': endpoint = '/reports/posts'; break;
      case 'KPI_STATS': endpoint = '/reports/kpis'; break;
      default: throw new Error("Nguồn dữ liệu nội bộ không hợp lệ");
    }
    const res = await api.get(endpoint, { params: payload.params });
    return { success: true, data: res.data?.data || res.data };
  }

  // If it's an API integration source, use the unified Execute Integration engine
  if (payload.type === 'api') {
    const res = await api.post(`/workflow/integrations/${payload.integrationId}/execute`, {
      endpointId: payload.endpointId,
      body: payload.body,
      params: payload.params,
    });
    return { success: true, data: res.data?.data || res.data };
  }

  throw new Error("Loại nguồn dữ liệu không được hỗ trợ");
};

export function usePreviewReport(payload: any, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "preview", payload],
    queryFn: () => previewReport(payload),
    enabled,
    retry: false,
  });
}
