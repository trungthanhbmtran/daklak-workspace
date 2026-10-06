export type JoinType = 'INNER' | 'LEFT';
export type FilterOperator = 'eq' | 'contains' | 'gt' | 'lt';
export type AggregateFunction = 'none' | 'count' | 'sum' | 'avg' | 'min' | 'max';
export type ColumnType = 'string' | 'number' | 'boolean' | 'mixed';

export interface ReportSourceDef {
  id: string;          // Alias name (e.g., "HRM_TASK_STATS")
  endpoint: string;    // Registered endpoint code
  fields: string[];    // Allowlisted fields to select
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
  key: string;         // Resulting column key
  source: string;      // Source alias
  field: string;       // Field path
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

export interface CompiledPlan {
  executionOrder: string[]; // Source aliases in order of fetching/joining
  joins: JoinDef[];
  maxFanoutLimit: number;
  maxRowLimit: number;
}
