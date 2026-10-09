import type { AxiosResponse } from "axios";
import apiClient from "@/lib/axiosInstance";

export interface WorkflowPosition { x: number; y: number }
export interface WorkflowNodeData {
  label?: string;
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
export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  _uiMetadata?: Record<string, unknown>;
  viewport?: { x: number; y: number; zoom: number };
}
export interface Workflow {
  id: string;
  name: string;
  code: string;
  description?: string;
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

type GatewayEnvelope<T> = T | { success?: boolean; data: T; meta?: PageMeta };
function unwrap<T>(response: AxiosResponse<GatewayEnvelope<T>>): T {
  const body = response.data;
  return typeof body === "object" && body !== null && "data" in body ? body.data : body as T;
}
function page<T>(response: AxiosResponse<GatewayEnvelope<T[]>>): PageResult<T> {
  const body = response.data;
  if (typeof body === "object" && body !== null && "data" in body) {
    return { data: body.data, meta: body.meta };
  }
  return { data: body as T[] };
}

export const workflowApi = {
  list: (params: { skip?: number; take?: number; search?: string } = {}) =>
    apiClient.get<GatewayEnvelope<Workflow[]>>("/workflow", { params }).then(page<Workflow>),
  getOne: (id: string) => apiClient.get<GatewayEnvelope<Workflow>>(`/workflow/${encodeURIComponent(id)}`).then(unwrap<Workflow>),
  create: (data: SaveWorkflowInput) => apiClient.post<GatewayEnvelope<Workflow>>("/workflow", data).then(unwrap<Workflow>),
  update: (id: string, data: SaveWorkflowInput) => apiClient.put<GatewayEnvelope<Workflow>>(`/workflow/${encodeURIComponent(id)}`, data).then(unwrap<Workflow>),
  delete: (id: string) => apiClient.delete<GatewayEnvelope<{ success: boolean }>>(`/workflow/${encodeURIComponent(id)}`).then(unwrap),
  publish: (id: string) => apiClient.post<GatewayEnvelope<Workflow>>(`/workflow/${encodeURIComponent(id)}/publish`).then(unwrap<Workflow>),
  getModules: () => apiClient.get<GatewayEnvelope<WorkflowModule[]>>("/workflow/modules").then(unwrap<WorkflowModule[]>),
  getOrgRoles: () => apiClient.get<GatewayEnvelope<WorkflowRole[]>>("/workflow/org-roles").then(unwrap<WorkflowRole[]>),
  getProcessTypes: (activeOnly = true) => apiClient.get<GatewayEnvelope<ProcessType[]>>("/workflow/catalog/process-types", { params: { activeOnly } }).then(unwrap<ProcessType[]>),
  getTriggers: () => apiClient.get<GatewayEnvelope<Array<{ code?: string; value?: string; name?: string; label?: string }>>>("/workflow/triggers").then(unwrap),
  listBindings: (params: { processTypeCode?: string; status?: string; skip?: number; take?: number } = {}) => apiClient.get<GatewayEnvelope<WorkflowBinding[]>>("/workflow/bindings", { params }).then(page<WorkflowBinding>),
  createBinding: (input: CreateBindingInput) => apiClient.post<GatewayEnvelope<WorkflowBinding>>("/workflow/bindings", input).then(unwrap<WorkflowBinding>),
  deactivateBinding: (id: string, reason?: string) => apiClient.post<GatewayEnvelope<WorkflowBinding>>(`/workflow/bindings/${encodeURIComponent(id)}/deactivate`, { reason }).then(unwrap<WorkflowBinding>),
  listInstances: (params: { skip?: number; take?: number; search?: string; workflowId?: string; status?: string } = {}) => apiClient.get<GatewayEnvelope<WorkflowInstance[]>>("/workflow/instances", { params }).then(page<WorkflowInstance>),
  getInstance: (id: string) => apiClient.get<GatewayEnvelope<WorkflowInstance>>(`/workflow/instances/${encodeURIComponent(id)}`).then(unwrap<WorkflowInstance>),
  getLogs: (id: string) => apiClient.get<GatewayEnvelope<Array<Record<string, unknown>>>>(`/workflow/instances/${encodeURIComponent(id)}/logs`).then(unwrap),
  submitAction: (instanceId: string, input: WorkflowActionInput) => apiClient.post<GatewayEnvelope<{ accepted: boolean; status: string; commandId: string; newVersion: number }>>(`/workflow/instances/${encodeURIComponent(instanceId)}/action`, input).then(unwrap),
};
