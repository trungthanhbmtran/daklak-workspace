/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";

export interface Position {
  x?: number;
  y?: number;
}

export interface Measured {
  width?: number;
  height?: number;
}

export interface WorkflowNode {
  id: string;
  nodeKey?: string;
  type?: string;
  name?: string;
  propertiesJson?: string;
  
  // React Flow Properties
  position?: Position;
  data?: Record<string, any>;
  width?: number;
  height?: number;
  selected?: boolean;
  positionAbsolute?: Position;
  dragging?: boolean;
  measured?: Measured;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  
  // React Flow Properties
  source?: string;
  target?: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  label?: string;
  data?: Record<string, any>;
  type?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export type WorkflowVersionStatus = "DRAFT" | "PUBLISHED" | "DEPRECATED" | string;

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  /** Danh sách (list) không trả graph; dùng getOne để lấy sơ đồ. */
  definition?: WorkflowDefinition;
  /** Trạng thái phiên bản mới nhất theo WorkflowResponse.status */
  status?: WorkflowVersionStatus;
  /** @deprecated Backend không trả trường này; dùng isWorkflowPublished(). */
  active?: boolean;
  trigger: string;
  code?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const isWorkflowPublished = (w?: Pick<Workflow, "status" | "active"> | null) =>
  !!w && (w.status === "PUBLISHED" || w.active === true);

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: string;
  currentNodeId?: string;
  context: any;
  createdAt: string;
  updatedAt: string;
  workflowName?: string;
  processType?: string;
  businessId?: string;
  correlationId?: string;
  allowedActions?: string[];
  stateVersion?: number;
  organizationId?: string;
  businessType?: string;
  lastCommandId?: string;
  lastCommandStatus?: string;
  lastCommandError?: string;
}

/**
 * Helper để bóc tách dữ liệu từ Gateway response chuẩn hóa.
 */
function unwrapData<T>(res: any): T {
  return res.data as T;
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

  listInstances: (params: { skip?: number; take?: number; search?: string; workflowId?: string; status?: string; processType?: string; businessId?: string; } = {}) =>
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

  startByProcessType: (data: { processTypeCode: string; trigger?: string; businessId?: string; businessType?: string; initialContext?: any; idempotencyKey?: string; correlationId?: string; }) =>
    apiClient.post('/workflow/instances/start-by-type', data).then((res: any) => unwrapData<WorkflowInstance>(res)),

  submitAction: (instanceId: string, data: { actionName: string; actionData?: any; expectedVersion?: number; idempotencyKey?: string; correlationId?: string; note?: string; }) =>
    apiClient.post(`/workflow/instances/${instanceId}/action`, data).then((res: any) => unwrapData<{ accepted: boolean; status: string; commandId: string; newVersion: number; }>(res)),

  getInstance: (id: string) =>
    apiClient.get(`/workflow/instances/${id}`).then((res: any) => unwrapData<WorkflowInstance>(res)),

  getLogs: (instanceId: string) =>
    apiClient.get(`/workflow/instances/${instanceId}/logs`).then((res: any) => unwrapData<any[]>(res)),

  // Catalog & Binding
  getProcessTypes: (activeOnly?: boolean) =>
    apiClient.get('/workflow/catalog/process-types', { params: { activeOnly } }).then((res: any) => unwrapData<any[]>(res)),
  
  getProcessBindings: (params: { processTypeCode?: string; organizationId?: string; status?: string; skip?: number; take?: number; } = {}) =>
    apiClient.get('/workflow/bindings', { params }).then((res: any) => ({
      data: unwrapData<any[]>(res),
      meta: unwrapMeta(res),
    })),

  createProcessBinding: (data: any) =>
    apiClient.post('/workflow/bindings', data).then((res: any) => unwrapData<any>(res)),

  deactivateProcessBinding: (id: string, reason?: string) =>
    apiClient.post(`/workflow/bindings/${id}/deactivate`, { reason }).then((res: any) => unwrapData<any>(res)),

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

  getOrgRoles: () =>
    apiClient.get('/workflow/org-roles').then((res: any) => unwrapData<{ code: string; name: string; rank: number; authorityLevel?: string; category?: string }[]>(res)),

  publish: (id: string) =>
    apiClient.post(`/workflow/${id}/publish`).then((res: any) => unwrapData<Workflow>(res)),

  applyModule: (id: string, moduleCode: string) =>
    apiClient.post(`/workflow/${id}/apply-module`, { moduleCode }).then((res: any) => unwrapData<Workflow>(res)),
};
