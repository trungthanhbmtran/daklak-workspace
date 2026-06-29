import { useQuery } from '@tanstack/react-query';
import { workflowApi } from './api';

export function useWorkflowLogs(instanceId?: string) {
  return useQuery({
    queryKey: ['workflow', 'logs', instanceId],
    queryFn: () => workflowApi.getLogs(instanceId!),
    enabled: !!instanceId,
  });
}
