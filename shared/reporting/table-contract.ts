/** Versioned configuration stored in ReportWidget.config.table. */
export type ColumnType = 'string' | 'number' | 'boolean';
export type Aggregate = 'none' | 'count' | 'sum' | 'avg' | 'min' | 'max';
export interface TableColumn { key: string; path: string; label: string; type: ColumnType; aggregate: Aggregate }
export interface TableConfig {
  version: 1; dataPath: string; columns: TableColumn[]; groupBy: string[];
  filters: { path: string; operator: 'eq' | 'contains' | 'gt' | 'lt'; value: string }[];
  sort?: { key: string; direction: 'asc' | 'desc' };
  page: number; pageSize: number;
}
export interface TableSource { upstream: string; path: string; params: Record<string, string> }
export interface ReportSourceOption { name: string; paths: string[] }
export interface TableField { path: string; type: ColumnType | 'mixed'; nullable: boolean }
export interface TableResult {
  candidates: string[]; selectedPath: string; fields: TableField[]; columns: TableColumn[];
  rows: Record<string, string | number | boolean | null>[];
  meta: { inputRows: number; matchedRows: number; total: number; page: number; pageSize: number;
    totalPages: number; generatedAt: string; scope: 'source-response'; warnings: string[] };
}

