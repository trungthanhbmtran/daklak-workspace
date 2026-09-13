/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { workflowApi } from "@/features/workflow/api";

export function useWorkflowDynamics() {
  const { data, isLoading } = useQuery({
    queryKey: ["workflow-dynamics"],
    queryFn: async () => {
      const [svcs, trigs, roles, modules, org] = await Promise.all([
        workflowApi.getServices(),
        workflowApi.getTriggers(),
        workflowApi.getTaskRoles().catch(() => []),
        workflowApi.getModules().catch(() => []),
        workflowApi.getOrgRoles().catch(() => []),
      ]);
      return {
        dynamicServices: svcs || [],
        dynamicTriggers: trigs || [],
        taskRoles: roles || [],
        workflowModules: modules || [],
        orgRoles: org || [],
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    dynamicServices: data?.dynamicServices || [],
    dynamicTriggers: data?.dynamicTriggers || [],
    taskRoles: data?.taskRoles || [],
    workflowModules: data?.workflowModules || [],
    orgRoles: data?.orgRoles || [],
    isLoading,
  };
}
