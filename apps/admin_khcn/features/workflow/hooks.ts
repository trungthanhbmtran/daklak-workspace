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

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useSubmitAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { instanceId: string; data: { actionName: string; actionData?: any; expectedVersion?: number; idempotencyKey?: string; correlationId?: string; note?: string; } }) => 
      workflowApi.submitAction(params.instanceId, params.data),
    onSuccess: (data, variables) => {
      // Invalidate queries so instances refresh
      queryClient.invalidateQueries({ queryKey: ['workflow', 'instances'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', 'instances', variables.instanceId] });
      queryClient.invalidateQueries({ queryKey: ['workflow', 'logs', variables.instanceId] });
    }
  });
}

export function useWorkflowDefinitions(params?: { search?: string }) {
  return useQuery({
    queryKey: ['workflow', 'definitions', params],
    queryFn: () => workflowApi.list(params),
  });
}

export function useProcessTypes(activeOnly?: boolean) {
  return useQuery({
    queryKey: ['workflow', 'processTypes', activeOnly],
    queryFn: () => workflowApi.getProcessTypes(activeOnly),
  });
}

export function useProcessBindings(params?: { processTypeCode?: string; organizationId?: string; status?: string; skip?: number; take?: number; }) {
  return useQuery({
    queryKey: ['workflow', 'processBindings', params],
    queryFn: () => workflowApi.getProcessBindings(params),
  });
}
