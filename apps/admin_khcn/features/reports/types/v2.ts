export type JoinType = 'INNER' | 'LEFT';
export type FilterOperator = 'eq' | 'contains' | 'gt' | 'lt';
export type AggregateFunction = 'none' | 'count' | 'sum' | 'avg' | 'min' | 'max';
export type ColumnType = 'string' | 'number' | 'boolean' | 'mixed';

export interface ReportSourceDef {
  id: string;
  endpoint: string;
  fields: string[];
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

export interface ReportConfigAST {
  version: number;
  sources: ReportSourceDef[];
  joins: JoinDef[];
  filters: FilterDef[];
  columns: ColumnDef[];
  groupBy: Array<{ source: string; field: string }>;
  sort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
}

export interface ReportDefinition {
  id: number;
  code: string;
  name: string;
  description?: string;
  version: number;
  configuration: ReportConfigAST;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRun {
  id: number;
  reportDefinitionId: number;
  definitionVersion: number;
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'PARTIAL';
  rowCount?: number;
  errors?: any;
  startedAt?: string;
  endedAt?: string;
}

export interface DatasetSnapshot {
  schema: any;
  data: any[];
}
