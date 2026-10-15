export type JoinType = "INNER" | "LEFT";
export type FilterOperator = "eq" | "contains" | "gt" | "lt";
export type AggregateFunction =
  "none" | "count" | "sum" | "avg" | "min" | "max";
export type ColumnType = "string" | "number" | "boolean" | "mixed";

export interface ReportSourceDef {
  id: string;
  endpoint: string;
  name?: string;
  fields: string[];
  upstream?: string;
  path?: string;
  method?: string;
  params?: Record<string, string>;
  body?: any;
}

export interface JoinDef {
  leftSource: string;
  rightSource: string;
  type: JoinType;
  conditions: Array<{
    leftField: string;
    rightField: string;
  }>;
}

export interface FilterDef {
  source: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

export interface ColumnDef {
  key: string;
  source: string;
  field: string;
  type: ColumnType;
  aggregate: AggregateFunction;
  label: string;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie";
  xAxis: string;
  yAxis: string;
  title?: string;
}

export interface ReportParameterDef {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'unit' | 'date';
  defaultValue?: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  description?: string;
}

export interface ReportSharingConfig {
  scope: 'ALL_UNITS' | 'SPECIFIC_UNITS' | 'PRIVATE';
  unitCodes?: string[];
  unitNames?: string[];
  isPublished?: boolean;
  publishedAt?: string;
}

export interface ReportConfigAST {
  version: number;
  sources: ReportSourceDef[];
  joins: JoinDef[];
  filters: FilterDef[];
  columns: ColumnDef[];
  groupBy: Array<{ source: string; field: string }>;
  sort?: {
    key: string;
    direction: "asc" | "desc";
  };
  charts?: ChartConfig[];
  parameters?: ReportParameterDef[];
  sharing?: ReportSharingConfig;
}

export interface ReportDefinition {
  id: number;
  code: string;
  name: string;
  description?: string;
  version: number;
  ownerId?: number;
  organizationId?: number;
  configuration: ReportConfigAST;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRun {
  id: number;
  reportDefinitionId: number;
  definitionVersion: number;
  status:
    "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "PARTIAL";
  rowCount?: number;
  errors?: any;
  startedAt?: string;
  endedAt?: string;
}

export interface DatasetSnapshot {
  schema: any;
  data: any[];
}

export type ReportPermission = "VIEW" | "EDIT" | "ADMIN";
export type ReportAssigneeType = "UNIT" | "USER" | "ROLE";

export interface ReportAssignment {
  id?: number;
  templateId: number;
  assigneeType: ReportAssigneeType | string;
  assigneeId: string;
  permissions: ReportPermission | string;
  createdAt?: string;
  assigneeName?: string;
  assigneeDetail?: string;
}
