import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";

export interface WorkflowPosition { x: number; y: number }
export interface WorkflowNodeData {
  label?: string;
  phaseId?: string;
  assignmentStrategy?: string;
  targetRole?: string;
  employeeCode?: string;
  inputHandles?: Array<string | null>;
  outputHandles?: Array<string | null>;
  [key: string]: unknown;
}
export interface WorkflowAssignmentRule { id: string; type: string; value: string }
export interface WorkflowNode {
  id: string;
  type: string;
  position?: WorkflowPosition;
  positionAbsolute?: WorkflowPosition;
  data: WorkflowNodeData;
  assignments?: WorkflowAssignmentRule[];
  [key: string]: unknown;
}
export interface WorkflowEdge {
  id: string;
  source?: string;
  target?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  action?: string;
  condition?: unknown;
  label?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface WorkflowPhase {
  id: string;
  name: string;
  description?: string;
  order: number;
}
export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  phases?: WorkflowPhase[];
  _uiMetadata?: Record<string, unknown>;
  viewport?: { x: number; y: number; zoom: number };
}
export interface Workflow {
  id: string;
  name: string;
  code: string;
  description?: string;
  organizationId?: string;
  ownerUnitCode?: string;
  status?: string;
  version?: number;
  definition?: WorkflowGraph | { graph?: WorkflowGraph };
  bpmnLogic?: WorkflowGraph;
  uiMetadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
export interface WorkflowInstance {
  id: string;
  workflowId?: string;
  workflowName?: string;
  status: string;
  currentNodeId?: string;
  processType?: string;
  businessId?: string;
  correlationId?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface ProcessType {
  id?: string;
  code: string;
  name: string;
  description?: string;
  ownerService?: string;
  validTriggers?: string[];
  validActions?: string[];
  isActive?: boolean;
}
export interface WorkflowModule { id: string; code: string; name: string; description?: string }
export interface WorkflowRole { code: string; name: string; rank: number; authorityLevel?: string; category?: string }
export interface WorkflowBinding {
  id: string;
  processTypeCode?: string;
  processType?: { code?: string; name?: string };
  definitionId?: string;
  definition?: { id?: string; name?: string; code?: string };
  pinnedVersionId?: string;
  trigger: string;
  status: string;
  priority?: number;
  organizationId?: string | null;
  createdAt?: string;
}
export interface PageMeta { total?: number; page?: number; pageSize?: number; totalPages?: number; hasNext?: boolean; hasPrev?: boolean }
export interface PageResult<T> { data: T[]; meta?: PageMeta }
export interface CreateBindingInput {
  processTypeCode: string;
  definitionId: string;
  trigger: string;
  pinnedVersionId?: string;
  priority?: number;
  criteria?: Record<string, unknown>;
  reason?: string;
}
export interface SaveWorkflowInput {
  name: string;
  code: string;
  description?: string;
  ownerUnitCode?: string;
  definition: WorkflowGraph;
}
export interface WorkflowActionInput {
  actionName: string;
  actionData?: Record<string, unknown>;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  note?: string;
}

export const workflowApi = {
  list: (params: { skip?: number; take?: number; search?: string } = {}) =>
    apiClient.get<any>("/workflow", { params }).then((res: any) => ({
      data: unwrapData<Workflow[]>(res, []),
      meta: res?.meta?.pagination || res?.meta || {},
    })),
  getOne: (id: string) => apiClient.get<any>(`/workflow/${encodeURIComponent(id)}`).then((r) => unwrapData<Workflow>(r)),
  create: (data: SaveWorkflowInput) => apiClient.post<any>("/workflow", data).then((r) => unwrapData<Workflow>(r)),
  update: (id: string, data: SaveWorkflowInput) => apiClient.put<any>(`/workflow/${encodeURIComponent(id)}`, data).then((r) => unwrapData<Workflow>(r)),
  delete: (id: string) => apiClient.delete<any>(`/workflow/${encodeURIComponent(id)}`).then((r) => unwrapData(r)),
  publish: (id: string) => apiClient.post<any>(`/workflow/${encodeURIComponent(id)}/publish`).then((r) => unwrapData<Workflow>(r)),
  getModules: () => apiClient.get<any>("/workflow/modules").then((r) => unwrapData<WorkflowModule[]>(r, [])),
  getOrgRoles: () => apiClient.get<any>("/workflow/org-roles").then((r) => unwrapData<WorkflowRole[]>(r, [])),
  getProcessTypes: (activeOnly = true) => apiClient.get<any>("/workflow/catalog/process-types", { params: { activeOnly } }).then((r) => unwrapData<ProcessType[]>(r, [])),
  getTriggers: () => apiClient.get<any>("/workflow/triggers").then((r) => unwrapData<Array<{ code?: string; value?: string; name?: string; label?: string }>>(r, [])),
  listBindings: (params: { processTypeCode?: string; status?: string; skip?: number; take?: number } = {}) =>
    apiClient.get<any>("/workflow/bindings", { params }).then((res: any) => ({
      data: unwrapData<WorkflowBinding[]>(res, []),
      meta: res?.meta?.pagination || res?.meta || {},
    })),
  createBinding: (input: CreateBindingInput) => apiClient.post<any>("/workflow/bindings", input).then((r) => unwrapData<WorkflowBinding>(r)),
  deactivateBinding: (id: string, reason?: string) => apiClient.post<any>(`/workflow/bindings/${encodeURIComponent(id)}/deactivate`, { reason }).then((r) => unwrapData<WorkflowBinding>(r)),
  listInstances: (params: { skip?: number; take?: number; search?: string; workflowId?: string; status?: string } = {}) =>
    apiClient.get<any>("/workflow/instances", { params }).then((res: any) => ({
      data: unwrapData<WorkflowInstance[]>(res, []),
      meta: res?.meta?.pagination || res?.meta || {},
    })),
  getInstance: (id: string) => apiClient.get<any>(`/workflow/instances/${encodeURIComponent(id)}`).then((r) => unwrapData<WorkflowInstance>(r)),
  getLogs: (id: string) => apiClient.get<any>(`/workflow/instances/${encodeURIComponent(id)}/logs`).then((r) => unwrapData(r, [])),
  submitAction: (instanceId: string, input: WorkflowActionInput) => apiClient.post<any>(`/workflow/instances/${encodeURIComponent(instanceId)}/action`, input).then((r) => unwrapData(r)),
};
