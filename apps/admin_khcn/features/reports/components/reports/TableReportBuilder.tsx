"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  emptyTableConfig,
  useReportSources,
  useTablePreview,
  useSaveTableReport,
} from "../../table-api";
import type {
  TableConfig,
  TableSource,
  TableResult,
  TableColumn,
  ColumnType,
  Aggregate,
} from "../../table-api";
import { ReportTable } from "./ReportTable";

const selectClass = "h-9 w-full rounded-md border bg-background px-2 text-sm";
const message = (error: unknown) =>
  error instanceof Error ? error.message : "Không thể xử lý báo cáo";

export function TableReportBuilder({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: () => void;
}) {
  const sources = useReportSources(),
    preview = useTablePreview(),
    save = useSaveTableReport();
  const [title, setTitle] = useState("Bảng báo cáo mới");
  const [source, setSource] = useState<TableSource>({
    upstream: "",
    path: "",
    params: {},
  });
  const [paramsText, setParamsText] = useState("{}");
  const [config, setConfig] = useState<TableConfig>(emptyTableConfig);
  const [result, setResult] = useState<TableResult>();
  const [lastRun, setLastRun] = useState("");
  const selectedSource = sources.data?.find((s) => s.name === source.upstream);
  const busy = preview.isPending || save.isPending;
  const signature = JSON.stringify({ source, config, paramsText });
  const current = lastRun === signature && !!result;
  function updateConfig(patch: Partial<TableConfig>) {
    setConfig((c) => ({ ...c, ...patch, page: 1 }));
  }
  function changeColumn(key: string, patch: Partial<TableColumn>) {
    updateConfig({
      columns: config.columns.map((c) =>
        c.key === key ? { ...c, ...patch } : c,
      ),
    });
  }
  function resetSource(patch: Partial<TableSource>) {
    setSource((s) => ({ ...s, ...patch }));
    setConfig(emptyTableConfig());
    setResult(undefined);
    setLastRun("");
    preview.reset();
  }
  function params(): Record<string, string> {
    const parsed: unknown = JSON.parse(paramsText);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      Object.values(parsed).some((v) => typeof v !== "string")
    )
      throw new Error(
        'Tham số phải là object JSON với giá trị chuỗi, ví dụ {"page":"1"}.',
      );
    return parsed as Record<string, string>;
  }
  async function run(analyze = false, page = 1) {
    try {
      const nextSource = { ...source, params: params() };
      const nextConfig = analyze
        ? { ...emptyTableConfig(), dataPath: config.dataPath }
        : { ...config, page };
      const next = await preview.mutateAsync({
        source: nextSource,
        config: nextConfig,
      });
      const resolved = {
        ...nextConfig,
        dataPath: next.selectedPath,
        page: next.meta.page,
      };
      setSource(nextSource);
      setConfig(resolved);
      setResult(next);
      setLastRun(
        JSON.stringify({ source: nextSource, config: resolved, paramsText }),
      );
    } catch (error) {
      toast.error(message(error));
    }
  }
  async function handleSave() {
    if (!current || !config.columns.length || !title.trim()) return;
    try {
      await save.mutateAsync({ title: title.trim(), source, table: config });
      toast.success("Đã lưu bảng báo cáo");
      onSave();
    } catch (error) {
      toast.error(message(error));
    }
  }
  return (
    <div className="space-y-5 rounded-2xl border bg-background p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            Xây dựng bảng báo cáo liên thông
          </h2>
          <p className="text-sm text-muted-foreground">
            Chọn nguồn → phân tích trường → gán cột → lọc và tổng hợp → xem
            trước và lưu
          </p>
        </div>
        <Button variant="outline" onClick={onBack} disabled={busy}>
          Trở lại
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,440px)_1fr]">
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <label className="block space-y-2">
            <span>Tên báo cáo</span>
            <Input
              value={title}
              maxLength={255}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span>Nguồn API</span>
            <select
              className={selectClass}
              value={source.upstream}
              onChange={(e) =>
                resetSource({ upstream: e.target.value, path: "", params: {} })
              }
            >
              <option value="">Chọn nguồn đã đăng ký</option>
              {sources.data?.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {sources.isLoading && (
            <p role="status" className="text-sm">
              Đang tải nguồn liên thông...
            </p>
          )}
          {sources.isError && (
            <div role="alert" className="text-sm text-destructive">
              Không tải được nguồn: {message(sources.error)}{" "}
              <Button
                variant="outline"
                size="sm"
                onClick={() => sources.refetch()}
              >
                Thử lại
              </Button>
            </div>
          )}
          {sources.isSuccess && sources.data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Chưa có nguồn GET phù hợp quyền truy cập. Hãy cấu hình nguồn trong
              mục Liên thông.
            </p>
          )}
          <label className="block space-y-2">
            <span>Đường dẫn API (GET)</span>
            <Input
              value={source.path}
              placeholder="/api/danh-sach"
              onChange={(e) => resetSource({ path: e.target.value })}
              list="report-source-paths"
            />
            <datalist id="report-source-paths">
              {selectedSource?.paths
                .filter((p) => !p.includes("*"))
                .map((p) => (
                  <option key={p} value={p} />
                ))}
            </datalist>
            {selectedSource && (
              <span className="block text-xs text-muted-foreground break-all">
                Đường dẫn cho phép:{" "}
                {selectedSource.paths.join(", ") || "Chưa cấu hình"}
              </span>
            )}
          </label>
          <label className="block space-y-2">
            <span>Tham số nguồn (JSON)</span>
            <textarea
              className="min-h-20 w-full rounded-md border bg-background p-2 font-mono text-sm"
              value={paramsText}
              onChange={(e) => {
                setParamsText(e.target.value);
                setResult(undefined);
                setConfig(emptyTableConfig());
                setLastRun("");
              }}
            />
          </label>
          <label className="block space-y-2">
            <span>Đường dẫn danh sách trong kết quả JSON</span>
            <Input
              value={config.dataPath}
              placeholder="Ví dụ: data.items; để trống để nhận diện"
              list="report-data-paths"
              onChange={(e) => {
                updateConfig({
                  dataPath: e.target.value,
                  columns: [],
                  groupBy: [],
                  filters: [],
                  sort: undefined,
                });
                setResult(undefined);
              }}
            />
            <datalist id="report-data-paths">
              {result?.candidates.map((p) => (
                <option key={p} value={p}>
                  {p || "(Danh sách tại gốc)"}
                </option>
              ))}
            </datalist>
          </label>
          <Button
            variant="outline"
            disabled={!source.upstream || !source.path}
            onClick={() => run(true)}
          >
            Phân tích dữ liệu
          </Button>
          {!!result?.candidates.length && (
            <p className="text-xs text-muted-foreground break-all">
              Danh sách tìm thấy:{" "}
              {result.candidates.map((p) => p || "(gốc)").join(", ")}
            </p>
          )}
          {!!result?.fields.length && (
            <div className="space-y-3">
              <h3 className="font-semibold">Gán trường vào cột hiển thị</h3>
              <p className="text-xs text-muted-foreground">
                Kiểu dữ liệu được nhận diện trên tối đa 100 dòng mẫu. Chọn tối
                đa 30 cột; dùng kiểu chữ cho mã định danh.
              </p>
              <div className="max-h-48 overflow-auto rounded-md border p-3 space-y-2">
                {result.fields.map((field) => (
                  <label
                    key={field.path}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={config.columns.some(
                        (c) => c.path === field.path,
                      )}
                      onChange={(e) => {
                        const columns = e.target.checked
                          ? [
                              ...config.columns,
                              {
                                key:
                                  "c_" +
                                  Date.now() +
                                  "_" +
                                  config.columns.length,
                                path: field.path,
                                label: field.path,
                                type:
                                  field.type === "mixed"
                                    ? "string"
                                    : field.type,
                                aggregate: "none",
                              } as TableColumn,
                            ]
                          : config.columns.filter((c) => c.path !== field.path);
                        updateConfig({ columns, sort: undefined });
                      }}
                      disabled={
                        !config.columns.some((c) => c.path === field.path) &&
                        config.columns.length >= 30
                      }
                    />
                    <span className="break-all">{field.path}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {field.type}
                      {field.nullable ? " · có thể trống" : ""}
                    </span>
                  </label>
                ))}
              </div>
              {config.columns.map((col) => (
                <div key={col.key} className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-medium break-all">{col.path}</p>
                  <Input
                    aria-label={"Tên cột " + col.path}
                    value={col.label}
                    maxLength={120}
                    onChange={(e) =>
                      changeColumn(col.key, { label: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      aria-label={"Kiểu dữ liệu " + col.path}
                      className={selectClass}
                      value={col.type}
                      onChange={(e) =>
                        changeColumn(col.key, {
                          type: e.target.value as ColumnType,
                          aggregate: "none",
                        })
                      }
                    >
                      <option value="string">Chữ</option>
                      <option value="number">Số</option>
                      <option value="boolean">Có/Không</option>
                    </select>
                    <select
                      aria-label={"Phép tổng hợp " + col.path}
                      className={selectClass}
                      value={col.aggregate}
                      onChange={(e) =>
                        changeColumn(col.key, {
                          aggregate: e.target.value as Aggregate,
                        })
                      }
                    >
                      <option value="none">Chi tiết</option>
                      <option value="count">Đếm dòng</option>
                      {col.type === "number" && (
                        <>
                          <option value="sum">Tổng</option>
                          <option value="avg">Trung bình</option>
                          <option value="min">Nhỏ nhất</option>
                          <option value="max">Lớn nhất</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              ))}
              <label className="block space-y-2">
                <span>Nhóm theo trường</span>
                <select
                  className={selectClass}
                  value={config.groupBy[0] || ""}
                  onChange={(e) =>
                    updateConfig({
                      groupBy: e.target.value ? [e.target.value] : [],
                    })
                  }
                >
                  <option value="">Không nhóm</option>
                  {result.fields.map((f) => (
                    <option key={f.path} value={f.path}>
                      {f.path}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-muted-foreground">
                Khi nhóm/tổng hợp, cột chi tiết phải là trường nhóm. Các cột
                khác cần chọn phép tổng hợp.
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold">Bộ lọc dữ liệu</h3>
                {config.filters.map((filter, i) => (
                  <div key={i} className="space-y-2 rounded-md border p-2">
                    <select
                      aria-label="Trường lọc"
                      className={selectClass}
                      value={filter.path}
                      onChange={(e) =>
                        updateConfig({
                          filters: config.filters.map((f, index) =>
                            index === i ? { ...f, path: e.target.value } : f,
                          ),
                        })
                      }
                    >
                      <option value="">Chọn trường lọc</option>
                      {result.fields.map((f) => (
                        <option key={f.path} value={f.path}>
                          {f.path}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Điều kiện lọc"
                      className={selectClass}
                      value={filter.operator}
                      onChange={(e) =>
                        updateConfig({
                          filters: config.filters.map((f, index) =>
                            index === i
                              ? {
                                  ...f,
                                  operator: e.target.value as typeof f.operator,
                                }
                              : f,
                          ),
                        })
                      }
                    >
                      <option value="eq">Bằng</option>
                      <option value="contains">Chứa</option>
                      <option value="gt">Lớn hơn</option>
                      <option value="lt">Nhỏ hơn</option>
                    </select>
                    <Input
                      aria-label="Giá trị lọc"
                      value={filter.value}
                      onChange={(e) =>
                        updateConfig({
                          filters: config.filters.map((f, index) =>
                            index === i ? { ...f, value: e.target.value } : f,
                          ),
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateConfig({
                          filters: config.filters.filter(
                            (_, index) => index !== i,
                          ),
                        })
                      }
                    >
                      Bỏ bộ lọc
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={config.filters.length >= 10}
                  onClick={() =>
                    updateConfig({
                      filters: [
                        ...config.filters,
                        { path: "", operator: "eq", value: "" },
                      ],
                    })
                  }
                >
                  Thêm bộ lọc
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-2">
                  <span>Sắp xếp theo</span>
                  <select
                    className={selectClass}
                    value={config.sort?.key || ""}
                    onChange={(e) =>
                      updateConfig({
                        sort: e.target.value
                          ? {
                              key: e.target.value,
                              direction: config.sort?.direction || "asc",
                            }
                          : undefined,
                      })
                    }
                  >
                    <option value="">Không sắp xếp</option>
                    {config.columns.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span>Thứ tự</span>
                  <select
                    className={selectClass}
                    disabled={!config.sort}
                    value={config.sort?.direction || "asc"}
                    onChange={(e) =>
                      config.sort &&
                      updateConfig({
                        sort: {
                          ...config.sort,
                          direction: e.target.value as "asc" | "desc",
                        },
                      })
                    }
                  >
                    <option value="asc">Tăng dần</option>
                    <option value="desc">Giảm dần</option>
                  </select>
                </label>
              </div>
              <label className="block space-y-2">
                <span>Số dòng mỗi trang</span>
                <select
                  className={selectClass}
                  value={config.pageSize}
                  onChange={(e) =>
                    updateConfig({ pageSize: Number(e.target.value) })
                  }
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={
                !config.columns.length || !source.upstream || !source.path
              }
              onClick={() => run()}
            >
              Xem trước bảng
            </Button>
            <Button
              variant="outline"
              disabled={!current || !config.columns.length || !title.trim()}
              onClick={handleSave}
            >
              Lưu báo cáo
            </Button>
          </div>
        </fieldset>
        <div className="min-w-0 space-y-4 rounded-xl border p-4">
          <h3 className="font-semibold">{title}</h3>
          {busy && (
            <p role="status" className="text-sm">
              Đang xử lý...
            </p>
          )}
          {preview.isError && (
            <p role="alert" className="text-sm text-destructive">
              {message(preview.error)}
            </p>
          )}
          {!result ? (
            <p className="py-12 text-center text-muted-foreground">
              Chọn nguồn và phân tích dữ liệu để bắt đầu.
            </p>
          ) : (
            <>
              {!current && (
                <p role="status" className="text-sm text-amber-700">
                  Cấu hình đã thay đổi. Nhấn Xem trước bảng để cập nhật trước
                  khi lưu.
                </p>
              )}
              <ReportTable
                result={result}
                busy={busy}
                onPage={
                  current && result.columns.length
                    ? (page) => run(false, page)
                    : undefined
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
