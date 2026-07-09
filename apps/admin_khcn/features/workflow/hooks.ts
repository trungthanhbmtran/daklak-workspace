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
