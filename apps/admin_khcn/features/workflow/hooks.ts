import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workflowApi } from "./api";

export const workflowKeys = {
  all: ["workflow"] as const,
  definitions: (params?: { search?: string }) => ["workflow", "definitions", params] as const,
  definition: (id?: string) => ["workflow", "definition", id] as const,
  bindings: ["workflow", "bindings"] as const,
  instances: ["workflow", "instances"] as const,
  processTypes: ["workflow", "process-types"] as const,
  modules: ["workflow", "modules"] as const,
  roles: ["workflow", "roles"] as const,
  triggers: ["workflow", "triggers"] as const,
};

export function useWorkflowDefinitions(params?: { search?: string }) {
  return useQuery({ queryKey: workflowKeys.definitions(params), queryFn: () => workflowApi.list({ ...params, skip: 0, take: 100 }) });
}
export function useWorkflowDefinition(id?: string) {
  return useQuery({ queryKey: workflowKeys.definition(id), queryFn: () => workflowApi.getOne(id!), enabled: Boolean(id) });
}
export function useWorkflowModules() { return useQuery({ queryKey: workflowKeys.modules, queryFn: workflowApi.getModules }); }
export function useWorkflowRoles() { return useQuery({ queryKey: workflowKeys.roles, queryFn: workflowApi.getOrgRoles }); }
export function useWorkflowProcessTypes() { return useQuery({ queryKey: workflowKeys.processTypes, queryFn: () => workflowApi.getProcessTypes(true) }); }
export function useWorkflowTriggers() { return useQuery({ queryKey: workflowKeys.triggers, queryFn: workflowApi.getTriggers }); }
export function useWorkflowBindings() { return useQuery({ queryKey: workflowKeys.bindings, queryFn: () => workflowApi.listBindings({ skip: 0, take: 100 }) }); }
export function useWorkflowInstances(params: { search?: string; status?: string } = {}) {
  return useQuery({ queryKey: [...workflowKeys.instances, params], queryFn: () => workflowApi.listInstances({ ...params, skip: 0, take: 100 }) });
}
export function useWorkflowLogs(instanceId?: string) {
  return useQuery({ queryKey: ["workflow", "logs", instanceId], queryFn: () => workflowApi.getLogs(instanceId!), enabled: Boolean(instanceId) });
}
export function useSaveWorkflow() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id?: string; data: Parameters<typeof workflowApi.create>[0] }) => id ? workflowApi.update(id, data) : workflowApi.create(data), onSuccess: (workflow) => { void client.invalidateQueries({ queryKey: workflowKeys.definitions() }); void client.invalidateQueries({ queryKey: workflowKeys.definition(workflow.id) }); } });
}
export function usePublishWorkflow() {
  const client = useQueryClient();
  return useMutation({ mutationFn: workflowApi.publish, onSuccess: (workflow) => { void client.invalidateQueries({ queryKey: workflowKeys.definitions() }); void client.invalidateQueries({ queryKey: workflowKeys.definition(workflow.id) }); } });
}
export function useCreateWorkflowBinding() {
  const client = useQueryClient();
  return useMutation({ mutationFn: workflowApi.createBinding, onSuccess: () => client.invalidateQueries({ queryKey: workflowKeys.bindings }) });
}
export function useDeactivateWorkflowBinding() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, reason }: { id: string; reason?: string }) => workflowApi.deactivateBinding(id, reason), onSuccess: () => client.invalidateQueries({ queryKey: workflowKeys.bindings }) });
}
