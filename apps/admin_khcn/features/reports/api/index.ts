import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axiosInstance";
import type { ApiResponse } from "../../../lib/api.types";
import {
  ReportDefinition,
  ReportRun,
  DatasetSnapshot,
  ReportSourceDef,
  ReportAssignment,
} from "../types";

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: string) => [...reportKeys.lists(), { filters }] as const,
  catalog: () => [...reportKeys.all, "catalog"] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: number | string) => [...reportKeys.details(), Number(id)] as const,
  assignments: (id: number | string) =>
    [...reportKeys.detail(id), "assignments"] as const,
  runs: (id: number | string) => [...reportKeys.detail(id), "runs"] as const,
  runStatus: (runId: number | string) =>
    [...reportKeys.all, "runStatus", Number(runId)] as const,
  snapshot: (runId: number | string) =>
    [...reportKeys.all, "snapshot", Number(runId)] as const,
  dashboardStats: () => [...reportKeys.all, "dashboardStats"] as const,
};

/**
 * Helper an toàn để bóc tách dữ liệu từ Gateway envelope ({ success, data }).
 */
function unwrapData<T>(res: any, fallback: T): T {
  if (res == null) return fallback;
  if (typeof res === "object" && "data" in res && res.data !== undefined) {
    return res.data as T;
  }
  return res as T;
}

export const useGetReportCatalog = () => {
  return useQuery({
    queryKey: reportKeys.catalog(),
    queryFn: async () => {
      type ReportCatalogItem = ReportSourceDef & { name: string };
      const response = await axiosInstance.get<ApiResponse<ReportCatalogItem[]>>(
        "/reports/catalog",
      );
      const envelope = response as unknown as ApiResponse<ReportCatalogItem[]>;
      if (envelope?.success === false) {
        throw new Error(
          envelope.message || "Không thể tải danh mục nguồn báo cáo.",
        );
      }
      return Array.isArray(envelope?.data) ? envelope.data : [];
    },
  });
};

export const useGetReportDefinitions = () => {
  return useQuery({
    queryKey: reportKeys.lists(),
    queryFn: async () => {
      const res: any = await axiosInstance.get("/reports/definitions");
      const list = unwrapData<ReportDefinition[]>(res, []);
      return Array.isArray(list) ? list : [];
    },
  });
};

export const useGetReportDefinition = (id?: number | string | null) => {
  const numericId = Number(id);
  const isValid = Number.isInteger(numericId) && numericId > 0;

  return useQuery({
    queryKey: reportKeys.detail(isValid ? numericId : 0),
    queryFn: async () => {
      const res: any = await axiosInstance.get(`/reports/definitions/${numericId}`);
      return unwrapData<ReportDefinition>(res, null as any);
    },
    enabled: isValid,
  });
};

export const useCreateReportDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ReportDefinition>) => {
      const res: any = await axiosInstance.post(
        "/reports/definitions",
        payload,
      );
      return unwrapData(res, res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportKeys.dashboardStats() });
    },
  });
};

export const useRunReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { definitionId: number; config?: any; params?: Record<string, any> }) => {
      const body = {
        reportDefinitionId: payload.definitionId,
        definitionId: payload.definitionId,
        config: payload.config,
        params: payload.params,
      };
      const res: any = await axiosInstance.post("/reports/runs", body);
      const data = unwrapData<any>(res, res);
      const runId = typeof data === "object" ? (data.runId ?? data.id) : data;
      return { runId: Number(runId) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.dashboardStats() });
    },
  });
};

export const useGetReportRunStatus = (runId?: number | string | null, enabled = true) => {
  const numericId = Number(runId);
  const isValid = Number.isInteger(numericId) && numericId > 0;

  return useQuery({
    queryKey: reportKeys.runStatus(isValid ? numericId : 0),
    queryFn: async () => {
      const res: any = await axiosInstance.get(`/reports/runs/${numericId}/status`);
      return unwrapData<ReportRun>(res, {
        id: numericId,
        reportDefinitionId: 0,
        definitionVersion: 1,
        status: "RUNNING",
      });
    },
    enabled: isValid && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "QUEUED" || status === "RUNNING") {
        const count = query.state.dataUpdateCount || 0;
        return Math.min(1500 * Math.pow(1.3, count), 6000);
      }
      return false;
    },
  });
};

export const useGetDatasetSnapshot = (
  runId?: number | string | null,
  options?: { limit?: number; page?: number; search?: string },
) => {
  const numericId = Number(runId);
  const isValid = Number.isInteger(numericId) && numericId > 0;
  const limit = options?.limit ?? 1000;
  const page = options?.page ?? 1;
  const search = options?.search ?? '';

  return useQuery({
    queryKey: [...reportKeys.snapshot(isValid ? numericId : 0), { limit, page, search }],
    queryFn: async () => {
      const res: any = await axiosInstance.get(
        `/reports/runs/${numericId}/snapshot`,
        { params: { limit, page, search: search.trim() || undefined } },
      );
      let snapshot = unwrapData<any>(res, {
        schema: [],
        data: [],
      });
      // Phòng thủ: nếu gateway hoặc middleware bọc snapshot container thành mảng 1 phần tử
      if (
        Array.isArray(snapshot) &&
        snapshot.length === 1 &&
        snapshot[0] &&
        typeof snapshot[0] === 'object' &&
        ('data' in snapshot[0] || 'schema' in snapshot[0])
      ) {
        snapshot = snapshot[0];
      }

      const rawData = Array.isArray(snapshot?.data)
        ? snapshot.data
        : Array.isArray(snapshot)
        ? snapshot
        : [];
      return {
        schema: Array.isArray(snapshot?.schema) ? snapshot.schema : [],
        data: rawData,
        total: Number(snapshot?.total ?? rawData.length),
        filteredTotal: Number(snapshot?.filteredTotal ?? rawData.length),
      };
    },
    enabled: isValid,
  });
};

export const useGetReportAssignments = (templateId?: number | string | null) => {
  const numericId = Number(templateId);
  const isValid = Number.isInteger(numericId) && numericId > 0;

  return useQuery({
    queryKey: reportKeys.assignments(isValid ? numericId : 0),
    queryFn: async () => {
      const res: any = await axiosInstance.get(
        `/reports/templates/${numericId}/assignments`,
      );
      const list = unwrapData<ReportAssignment[]>(res, []);
      return Array.isArray(list) ? list : [];
    },
    enabled: isValid,
  });
};

export const useAssignReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      templateId: number;
      assigneeType: string;
      assigneeId: string;
      permissions?: string;
    }) => {
      const res: any = await axiosInstance.post(
        `/reports/templates/${payload.templateId}/assignments`,
        {
          assigneeType: payload.assigneeType,
          assigneeId: payload.assigneeId,
          permissions: payload.permissions || "VIEW",
        },
      );
      return unwrapData(res, res);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.assignments(variables.templateId),
      });
      queryClient.invalidateQueries({ queryKey: reportKeys.dashboardStats() });
    },
  });
};

export const useRemoveReportAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      templateId: number;
      assigneeType: string;
      assigneeId: string;
    }) => {
      const res: any = await axiosInstance.delete(
        `/reports/templates/${payload.templateId}/assignments`,
        {
          params: {
            assigneeType: payload.assigneeType,
            assigneeId: payload.assigneeId,
          },
        },
      );
      return unwrapData(res, res);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.assignments(variables.templateId),
      });
      queryClient.invalidateQueries({ queryKey: reportKeys.dashboardStats() });
    },
  });
};

export const useGetReportDashboardStats = () => {
  return useQuery({
    queryKey: reportKeys.dashboardStats(),
    queryFn: async () => {
      const res: any = await axiosInstance.get("/reports/dashboard-stats");
      const stats = unwrapData<any>(res, {});
      return {
        totalReports: Number(stats?.totalReports ?? 0),
        totalRuns: Number(stats?.totalRuns ?? 0),
        totalShared: Number(stats?.totalShared ?? 0),
        processingRuns: Number(stats?.processingRuns ?? 0),
      };
    },
  });
};

/**
 * Gọi backend API kết xuất báo cáo (Excel, CSV, PDF, HTML, Decision) từ DatasetSnapshot thực tế
 */
export async function downloadReportRunExport(
  runId: number | string,
  format: 'excel' | 'csv' | 'pdf' | 'html' | 'decision' = 'excel',
  search?: string,
): Promise<void> {
  const numericId = Number(runId);
  if (!numericId) throw new Error('Mã lần chạy báo cáo không hợp lệ');

  const response: any = await axiosInstance.get(
    `/reports/runs/${numericId}/export`,
    {
      params: { format, search: search?.trim() || undefined },
      responseType: 'blob',
    },
  );

  const isDoc = ['html', 'pdf', 'decision'].includes(format);
  const contentType = isDoc
    ? 'text/html;charset=utf-8;'
    : 'text/csv;charset=utf-8;';

  const blob =
    response instanceof Blob
      ? response
      : new Blob([response], { type: contentType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  const prefix = format === 'decision' ? 'Quyet_Dinh_Mau05' : 'Bang_Tong_Hop_KPI';
  const ext = isDoc ? 'html' : 'csv';
  link.download = `${prefix}_${numericId}_${dateStr}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Mở cửa sổ in / xuất PDF trực tiếp từ nội dung văn bản chuẩn do Backend kết xuất
 */
export async function printReportRunExport(
  runId: number | string,
  format: 'html' | 'decision' = 'html',
  search?: string,
): Promise<void> {
  const numericId = Number(runId);
  if (!numericId) throw new Error('Mã lần chạy báo cáo không hợp lệ');

  const response: any = await axiosInstance.get(
    `/reports/runs/${numericId}/export`,
    {
      params: { format, search: search?.trim() || undefined },
      responseType: 'text',
    },
  );

  const htmlContent = typeof response === 'string' ? response : (unwrapData<string>(response, '') || '');
  if (!htmlContent) throw new Error('Không nhận được nội dung văn bản từ máy chủ');

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc || !iframe.contentWindow) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);
}

