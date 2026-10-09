import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axiosInstance";
import { ReportDefinition, ReportRun, DatasetSnapshot } from "../types";

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: string) => [...reportKeys.lists(), { filters }] as const,
  catalog: () => [...reportKeys.all, "catalog"] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  runs: (id: string) => [...reportKeys.detail(id), "runs"] as const,
  runStatus: (runId: string) =>
    [...reportKeys.all, "runStatus", runId] as const,
  snapshot: (runId: string) => [...reportKeys.all, "snapshot", runId] as const,
  dashboardStats: () => [...reportKeys.all, "dashboardStats"] as const,
};

export const useGetReportCatalog = () => {
  return useQuery({
    queryKey: reportKeys.catalog(),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/reports/catalog");
      if (data?.success === false) {
        throw new Error(
          data.message || "Không thể tải danh mục nguồn báo cáo.",
        );
      }
      return (Array.isArray(data?.data) ? data.data : []) as {
        endpoint: string;
        name: string;
        fields: string[];
        upstream?: string;
        path?: string;
      }[];
    },
  });
};

export const useGetReportDefinitions = () => {
  return useQuery({
    queryKey: reportKeys.lists(),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/reports/definitions");
      return data.data as ReportDefinition[];
    },
  });
};

export const useGetReportDefinition = (id: string) => {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/reports/definitions/${id}`);
      return data.data as ReportDefinition;
    },
    enabled: !!id,
  });
};

export const useCreateReportDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ReportDefinition>) => {
      const { data } = await axiosInstance.post(
        "/reports/definitions",
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
};

export const useRunReport = () => {
  return useMutation({
    mutationFn: async (payload: { definitionId: number; config: any }) => {
      const { data } = await axiosInstance.post("/reports/runs", payload);
      return data.data as { runId: number };
    },
  });
};

export const useGetReportRunStatus = (runId: string, enabled = true) => {
  const [retryCount, setRetryCount] = useState(0);

  return useQuery({
    queryKey: reportKeys.runStatus(runId),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/reports/runs/${runId}/status`);
      setRetryCount((prev) => prev + 1);
      return data.data as ReportRun;
    },
    enabled: !!runId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "QUEUED" || status === "RUNNING") {
        // Exponential backoff: 2s, 3s, 4.5s, 6.75s... max 10s
        return Math.min(2000 * Math.pow(1.5, retryCount), 10000);
      }
      return false;
    },
  });
};

export const useGetDatasetSnapshot = (runId: string) => {
  return useQuery({
    queryKey: reportKeys.snapshot(runId),
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/reports/runs/${runId}/snapshot`,
      );
      return data.data as DatasetSnapshot;
    },
    enabled: !!runId,
  });
};

export const useAssignReport = () => {
  return useMutation({
    mutationFn: async (payload: {
      templateId: number;
      assigneeType: string;
      assigneeId: string;
      permissions?: string;
    }) => {
      const { data } = await axiosInstance.post(
        `/reports/templates/${payload.templateId}/assignments`,
        {
          assigneeType: payload.assigneeType,
          assigneeId: payload.assigneeId,
          permissions: payload.permissions || "VIEW",
        },
      );
      return data;
    },
  });
};

export const useGetReportDashboardStats = () => {
  return useQuery({
    queryKey: reportKeys.dashboardStats(),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/reports/dashboard-stats");
      return data.data as {
        totalReports: number;
        totalRuns: number;
        totalShared: number;
        processingRuns: number;
      };
    },
  });
};
