import React from 'react';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}
