"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import type {
  TableConfig,
  TableResult,
  TableSource,
  ReportSourceOption,
} from "../../../../shared/reporting/table-contract";
export type {
  TableConfig,
  TableResult,
  TableSource,
  TableColumn,
  TableField,
  ColumnType,
  Aggregate,
} from "../../../../shared/reporting/table-contract";

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
async function post<T>(path: string, body: unknown): Promise<T> {
  // axiosInstance already unwraps the Axios response.
  const result = (await api.post(path, body)) as unknown as Envelope<T>;
  if (!result.success)
    throw new Error(result.message || "Không thể lấy dữ liệu báo cáo");
  return result.data;
}
export const emptyTableConfig = (): TableConfig => ({
  version: 1,
  dataPath: "",
  columns: [],
  groupBy: [],
  filters: [],
  page: 1,
  pageSize: 20,
});
export function useReportSources() {
  return useQuery({
    queryKey: ["reports", "table", "sources"],
    queryFn: () => post<ReportSourceOption[]>("/reports/table/sources", {}),
    staleTime: 60000,
    retry: false,
  });
}
export function previewTable(source: TableSource, config: TableConfig) {
  return post<TableResult>("/reports/table/preview", { source, config });
}
export function useTablePreview() {
  return useMutation({
    mutationFn: ({
      source,
      config,
    }: {
      source: TableSource;
      config: TableConfig;
    }) => previewTable(source, config),
  });
}
export function useSaveTableReport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      source,
      table,
    }: {
      title: string;
      source: TableSource;
      table: TableConfig;
    }) =>
      post("/reports/templates", {
        title,
        description: "Bảng báo cáo dữ liệu liên thông",
        layout: {},
        widgets: [
          {
            title,
            chartType: "TABLE",
            dataSourceCode: source.upstream,
            xAxisKey: table.columns[0]?.key || "",
            yAxisKey: table.columns[1]?.key || "",
            config: { source, table: { ...table, page: 1 } },
          },
        ],
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["reports"] }),
  });
}
