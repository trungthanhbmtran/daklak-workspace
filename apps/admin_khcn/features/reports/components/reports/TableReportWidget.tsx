"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { previewTable } from "../../table-api";
import type { TableSource, TableConfig } from "../../table-api";
import { ReportTable } from "./ReportTable";

export function TableReportWidget({ id, source, table }: { id: number | string; source: TableSource; table: TableConfig }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["reports", "table", id, source, table, page],
    queryFn: () => previewTable(source, { ...table, page }),
    staleTime: 60000, retry: false, refetchOnWindowFocus: false,
  });
  return <div className="space-y-3">
    <div className="flex justify-end"><Button variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}>Làm mới</Button></div>
    {query.isFetching && <p role="status" className="text-sm text-muted-foreground">Đang lấy dữ liệu báo cáo...</p>}
    {query.isError ? <div role="alert" className="text-sm text-destructive">{query.error.message}<Button variant="outline" size="sm" onClick={() => query.refetch()}>Thử lại</Button></div> :
      query.data ? <ReportTable result={query.data} onPage={setPage} busy={query.isFetching} /> : null}
  </div>;
}

