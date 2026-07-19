import { useQuery } from '@tanstack/react-query';
import { workflowApi } from './api';

export function useWorkflowLogs(instanceId?: string) {
  return useQuery({
    queryKey: ['workflow', 'logs', instanceId],
    queryFn: () => workflowApi.getLogs(instanceId!),
    enabled: !!instanceId,
  });
}

export function useWorkflowStatuses() {
  return useQuery({
    queryKey: ['workflow', 'statuses'],
    queryFn: () => workflowApi.getStatuses(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

import { useInfiniteQuery } from '@tanstack/react-query';

export function useWorkflowInstances(params?: { search?: string, status?: string }) {
  const pageSize = 15;
  return useInfiniteQuery({
    queryKey: ['workflow', 'instances', params],
    queryFn: async ({ pageParam = 1 }) => {
      return await workflowApi.listInstances({
        skip: (pageParam - 1) * pageSize,
        take: pageSize,
        search: params?.search,
        status: params?.status,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + (page.data?.length || 0), 0);
      const total = lastPage.meta?.total || 0;
      if (currentCount < total) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });
}
