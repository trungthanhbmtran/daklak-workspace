import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../../lib/axiosInstance';
import { ReportDefinition, ReportRun, DatasetSnapshot } from '../../types/v2';

export const reportKeys = {
  all: ['v2-reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters: string) => [...reportKeys.lists(), { filters }] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  runs: (id: string) => [...reportKeys.detail(id), 'runs'] as const,
  runStatus: (runId: string) => [...reportKeys.all, 'runStatus', runId] as const,
  snapshot: (runId: string) => [...reportKeys.all, 'snapshot', runId] as const,
};

export const useGetReportDefinitions = () => {
  return useQuery({
    queryKey: reportKeys.lists(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/admin/reports/v2/definitions');
      return data.data as ReportDefinition[];
    },
  });
};

export const useGetReportDefinition = (id: string) => {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/reports/v2/definitions/${id}`);
      return data.data as ReportDefinition;
    },
    enabled: !!id,
  });
};

export const useCreateReportDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ReportDefinition>) => {
      const { data } = await axiosInstance.post('/admin/reports/v2/definitions', payload);
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
      const { data } = await axiosInstance.post('/admin/reports/v2/runs', payload);
      return data.data as { runId: number };
    },
  });
};

export const useGetReportRunStatus = (runId: string, enabled = true) => {
  return useQuery({
    queryKey: reportKeys.runStatus(runId),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/reports/v2/runs/${runId}/status`);
      return data.data as ReportRun;
    },
    enabled: !!runId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'QUEUED' || status === 'RUNNING' ? 2000 : false;
    },
  });
};

export const useGetDatasetSnapshot = (runId: string) => {
  return useQuery({
    queryKey: reportKeys.snapshot(runId),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/reports/v2/runs/${runId}/snapshot`);
      return data.data as DatasetSnapshot;
    },
    enabled: !!runId,
  });
};
