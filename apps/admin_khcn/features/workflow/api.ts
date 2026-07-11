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
  code?: string;
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
  list: (params: { skip?: number; take?: number; search?: string } = {}) =>
    apiClient.get("/workflow", { params }).then((res: any) => ({
      data: unwrapData<Workflow[]>(res),
      meta: unwrapMeta(res),
    })),

  listInstances: (params: { skip?: number; take?: number; search?: string; workflowId?: string; status?: string } = {}) =>
    apiClient.get("/workflow/instances", { params }).then((res: any) => ({
      data: unwrapData<WorkflowInstance[]>(res),
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

  getServices: () =>
    apiClient.get('/workflow/services').then((res: any) => unwrapData<any[]>(res)),

  getTriggers: () =>
    apiClient.get('/workflow/triggers').then((res: any) => unwrapData<any[]>(res)),

  getTaskRoles: () =>
    apiClient.get('/categories', { params: { group: 'TASK_ROLE' } }).then((res: any) => unwrapData<any[]>(res)),

  getStatuses: () =>
    apiClient.get('/categories', { params: { group: 'WORKFLOW_STATUS' } }).then((res: any) => unwrapData<any[]>(res)),

  getModules: () =>
    apiClient.get('/workflow/modules').then((res: any) => unwrapData<{ id: string; code: string; name: string; description?: string }[]>(res)),

  /** Lấy danh sách vị trí/chức danh tổ chức (JobTitle) để hiển thị trong thiết kế quyền workflow */
  getOrgRoles: () =>
    apiClient.get('/workflow/org-roles').then((res: any) => unwrapData<{ code: string; name: string; rank: number; authorityLevel?: string; category?: string }[]>(res)),

  publish: (id: string) =>
    apiClient.post(`/workflow/${id}/publish`).then((res: any) => unwrapData<Workflow>(res)),

  applyModule: (id: string, moduleCode: string) =>
    apiClient.post(`/workflow/${id}/apply-module`, { moduleCode }).then((res: any) => unwrapData<Workflow>(res)),
};
