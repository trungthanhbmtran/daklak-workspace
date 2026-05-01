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
  trigger: string;
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

/**
 * Helper để bóc tách dữ liệu từ Gateway response chuẩn hóa.
 */
function unwrapData<T>(res: any): T {
  // Chuẩn hóa: Gateway trả về { success: true, data: T, meta: ... }
  // Axios interceptor trả về res = { success: true, data: T, meta: ... }
  return (res?.data ?? res) as T;
}

function unwrapMeta(res: any): any {
  return res?.meta;
}

export const workflowApi = {
  list: (params: { skip?: number; take?: number } = {}) =>
    apiClient.get("/workflow", { params }).then((res: any) => ({
      data: unwrapData<Workflow[]>(res),
      meta: unwrapMeta(res),
    })),

  getOne: (id: string) =>
    apiClient.get(`/workflow/${id}`).then((res: any) => unwrapData<Workflow>(res)),

  create: (data: Partial<Workflow>) =>
    apiClient.post("/workflow", data).then((res: any) => unwrapData<Workflow>(res)),

  update: (id: string, data: Partial<Workflow>) =>
    apiClient.put(`/workflow/${id}`, data).then((res: any) => unwrapData<Workflow>(res)),

  delete: (id: string) =>
    apiClient.delete(`/workflow/${id}`).then((res: any) => unwrapData<any>(res)),

  start: (id: string, initialContext: any = {}) =>
    apiClient.post(`/workflow/${id}/start`, { initialContext }).then((res: any) => unwrapData<WorkflowInstance>(res)),

  resume: (instanceId: string, nodeId: string, actionData: any = {}) =>
    apiClient.post(`/workflow/instances/${instanceId}/resume/${nodeId}`, { actionData }).then((res: any) => unwrapData<WorkflowInstance>(res)),

  getInstance: (id: string) =>
    apiClient.get(`/workflow/instances/${id}`).then((res: any) => unwrapData<WorkflowInstance>(res)),

  getLogs: (instanceId: string) =>
    apiClient.get(`/workflow/instances/${instanceId}/logs`).then((res: any) => unwrapData<any[]>(res)),
};
