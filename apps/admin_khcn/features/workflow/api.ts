import apiClient from "@/lib/axiosInstance";

export interface WorkflowDefinition {
  nodes: any[];
  edges: any[];
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: string;
  currentNodeId?: string;
  context: any;
  createdAt: string;
  updatedAt: string;
  workflowName?: string;
}

export const workflowApi = {
  list: (params: { skip?: number; take?: number } = {}) =>
    apiClient.get("/admin/workflow", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta,
    })),

  getOne: (id: string) =>
    apiClient.get(`/admin/workflow/${id}`).then((res: any) => res.data),

  create: (data: Partial<Workflow>) =>
    apiClient.post("/admin/workflow", data).then((res: any) => res.data),

  update: (id: string, data: Partial<Workflow>) =>
    apiClient.put(`/admin/workflow/${id}`, data).then((res: any) => res.data),

  delete: (id: string) =>
    apiClient.delete(`/admin/workflow/${id}`).then((res: any) => res.data),

  start: (id: string, initialContext: any = {}) =>
    apiClient.post(`/admin/workflow/${id}/start`, { initialContext }).then((res: any) => res.data),

  resume: (instanceId: string, nodeId: string, actionData: any = {}) =>
    apiClient.post(`/admin/workflow/instances/${instanceId}/resume/${nodeId}`, { actionData }).then((res: any) => res.data),

  getInstance: (id: string) =>
    apiClient.get(`/admin/workflow/instances/${id}`).then((res: any) => res.data),

  getLogs: (instanceId: string) =>
    apiClient.get(`/admin/workflow/instances/${instanceId}/logs`).then((res: any) => res.data || []),
};
