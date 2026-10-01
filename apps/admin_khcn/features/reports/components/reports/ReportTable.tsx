"use client";

import { Button } from "@/components/ui/button";
import type { TableResult } from "../../table-api";

export function ReportTable({
  result,
  onPage,
  busy = false,
}: {
  result: TableResult;
  onPage?: (page: number) => void;
  busy?: boolean;
}) {
  const { meta } = result;
  return (
    <div className="space-y-3" aria-busy={busy}>
      <p className="text-sm text-muted-foreground">
        {meta.inputRows} dòng nguồn · {meta.matchedRows} dòng sau lọc ·{" "}
        {meta.total} dòng kết quả
      </p>
      <p className="text-xs text-muted-foreground">
        Tính trên dữ liệu API trả về; nguồn có phân trang có thể chưa bao gồm
        toàn bộ dữ liệu. Cập nhật:{" "}
        {new Date(meta.generatedAt).toLocaleString("vi-VN")}
      </p>
      {meta.warnings.map((warning, i) => (
        <p key={i} role="status" className="text-sm text-amber-700">
          {warning}
        </p>
      ))}
      <div className="max-h-[440px] overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background">
            <tr>
              {result.columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="whitespace-nowrap border-b px-4 py-3 text-left font-semibold"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(1, result.columns.length)}
                  className="p-8 text-center text-muted-foreground"
                >
                  {result.columns.length
                    ? "Không có dữ liệu phù hợp"
                    : "Chọn các cột để hiển thị bảng"}
                </td>
              </tr>
            ) : (
              result.rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {result.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {row[col.key] == null
                        ? "—"
                        : typeof row[col.key] === "number"
                          ? new Intl.NumberFormat("vi-VN", {
                              maximumFractionDigits: 4,
                            }).format(row[col.key] as number)
                          : typeof row[col.key] === "boolean"
                            ? row[col.key]
                              ? "Có"
                              : "Không"
                            : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onPage && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={busy || meta.page <= 1}
            onClick={() => onPage(meta.page - 1)}
          >
            Trước
          </Button>
          <span className="text-sm">
            Trang {meta.page} / {Math.max(1, meta.totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || meta.page >= meta.totalPages}
            onClick={() => onPage(meta.page + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
