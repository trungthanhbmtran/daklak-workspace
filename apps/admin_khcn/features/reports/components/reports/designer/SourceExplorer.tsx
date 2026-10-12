"use client";
import React, { useState, useMemo } from "react";
import { ReportSourceDef } from "../../../types";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { useGetReportCatalog } from "../../../api";
import axiosInstance from "../../../../../lib/axiosInstance";
import type { ApiResponse } from "../../../../../lib/api.types";
import {
  Database,
  Radio,
  Search,
  Eye,
  Plus,
  RefreshCw,
  Server,
  Layers,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

interface SourceExplorerProps {
  onAddSource: (source: ReportSourceDef) => void;
}

type SourceCategory = "all" | "system" | "api";

export const SourceExplorer: React.FC<SourceExplorerProps> = ({
  onAddSource,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SourceCategory>("all");
  const [previews, setPreviews] = useState<
    Record<
      string,
      {
        loading?: boolean;
        error?: string;
        selectedPath?: string;
        candidates?: string[];
        fields?: { path: string; type: string; nullable: boolean }[];
        rows?: Record<string, unknown>[];
      }
    >
  >({});

  const {
    data: rawCatalog = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetReportCatalog();

  // Phân loại nguồn thành Hệ thống nội bộ hoặc API Manager
  const catalog = useMemo(() => {
    return rawCatalog.map((item: any) => {
      const isApi =
        item.endpoint?.includes("|") ||
        item.name?.toLowerCase().includes("liên thông api") ||
        (item.upstream && !item.upstream.includes("-service"));

      const method = (item.method || "GET").toUpperCase();

      return {
        ...item,
        isApi,
        method,
      };
    });
  }, [rawCatalog]);

  const counts = useMemo(() => {
    const total = catalog.length;
    const apiCount = catalog.filter((c) => c.isApi).length;
    const systemCount = total - apiCount;
    return { total, apiCount, systemCount };
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      // Lọc theo Tab loại nguồn
      if (selectedCategory === "system" && item.isApi) return false;
      if (selectedCategory === "api" && !item.isApi) return false;

      // Lọc theo từ khóa tìm kiếm
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(term);
      const matchEndpoint = item.endpoint?.toLowerCase().includes(term);
      const matchPath = item.path?.toLowerCase().includes(term);
      const matchUpstream = item.upstream?.toLowerCase().includes(term);
      return matchName || matchEndpoint || matchPath || matchUpstream;
    });
  }, [catalog, selectedCategory, searchTerm]);

  const previewSource = async (item: any, dataPath?: string) => {
    const key = item.endpoint as string;

    // Toggle đóng xem trước nếu người dùng bấm lại nút khi đang hiển thị
    if (
      dataPath === undefined &&
      previews[key] &&
      !previews[key].loading &&
      (previews[key].fields?.length || previews[key].error)
    ) {
      setPreviews((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      return;
    }

    setPreviews((current) => ({
      ...current,
      [key]: { ...current[key], loading: true, error: undefined },
    }));

    try {
      const source = {
        upstream: item.upstream,
        path: item.path,
        method: item.method || "GET",
        params: {},
      };
      const baseConfig = {
        version: 1,
        dataPath: dataPath ?? "",
        columns: [],
        groupBy: [],
        filters: [],
        page: 1,
        pageSize: 10,
      };

      // 1. Gọi preview lần 1 để lấy schema cấu trúc dữ liệu và candidates
      const inspected = await axiosInstance.post<ApiResponse<any>>(
        "/reports/table/preview",
        { source, config: baseConfig },
      );
      const schema = (inspected as unknown as ApiResponse<any>)?.data;
      if (!schema || !Array.isArray(schema.fields)) {
        throw new Error("API không trả về cấu trúc dữ liệu xem trước hợp lệ.");
      }

      const candidates: string[] =
        Array.isArray(schema.candidates) && schema.candidates.length > 0
          ? schema.candidates
          : [""];

      // Xác định selectedPath:
      const effectivePath =
        dataPath !== undefined
          ? dataPath
          : schema.selectedPath || candidates[0] || "";

      // 2. Chuẩn bị danh sách columns để gọi lấy mẫu bản ghi rows
      const targetFields =
        schema.fields.length > 0
          ? schema.fields
          : (item.fields || []).map((f: string) => ({
              path: f,
              type: "string",
            }));

      const columns = targetFields
        .slice(0, 30)
        .map((field: any, index: number) => ({
          key: `field_${index}`,
          path: typeof field === "string" ? field : field.path,
          label: typeof field === "string" ? field : field.path,
          type:
            typeof field === "object" &&
            (field.type === "number" || field.type === "boolean")
              ? field.type
              : "string",
          aggregate: "none",
        }));

      // 3. Gọi lần 2 để lấy dữ liệu bản ghi thực tế (rows)
      let rows: any[] = [];
      try {
        const result = await axiosInstance.post<ApiResponse<any>>(
          "/reports/table/preview",
          {
            source,
            config: {
              ...baseConfig,
              dataPath: effectivePath,
              columns,
            },
          },
        );
        const preview = (result as unknown as ApiResponse<any>)?.data;
        if (Array.isArray(preview?.rows) && preview.rows.length > 0) {
          rows = preview.rows;
        }
      } catch {
        // Vẫn giữ fields để người dùng xem được cấu trúc schema
      }

      setPreviews((current) => ({
        ...current,
        [key]: {
          candidates,
          fields: targetFields,
          rows,
          selectedPath: effectivePath,
          loading: false,
          error: undefined,
        },
      }));
    } catch (err: any) {
      setPreviews((current) => ({
        ...current,
        [key]: {
          ...current[key],
          loading: false,
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Không thể đọc dữ liệu từ API này.",
        },
      }));
    }
  };

  return (
    <div className="p-3 sm:p-4 flex flex-col h-full w-full min-w-0 bg-slate-50/50">
      {/* Header & Title */}
      <div className="flex items-center justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-4 h-4 text-indigo-600 shrink-0" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800 tracking-tight truncate">
            Nguồn Dữ Liệu
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="h-7 px-2 text-xs text-slate-500 hover:text-indigo-600 shrink-0"
          title="Làm mới danh mục"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center p-1 bg-slate-200/70 rounded-lg mb-3 shrink-0 min-w-0">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-md transition-all text-center truncate ${
            selectedCategory === "all"
              ? "bg-white text-indigo-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Tất cả ({counts.total})
        </button>
        <button
          onClick={() => setSelectedCategory("system")}
          className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-md transition-all text-center truncate ${
            selectedCategory === "system"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Hệ thống ({counts.systemCount})
        </button>
        <button
          onClick={() => setSelectedCategory("api")}
          className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-md transition-all text-center truncate ${
            selectedCategory === "api"
              ? "bg-white text-purple-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          API Manager ({counts.apiCount})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3 shrink-0 min-w-0">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Tìm tên, URL API, mã nguồn..."
          className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-8 pr-3 py-1.5 w-full text-xs outline-none transition-all shadow-xs bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-w-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 text-xs">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mb-2" />
            <span>Đang tải danh mục nguồn dữ liệu...</span>
          </div>
        ) : isError ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center text-xs text-red-600">
            <AlertCircle className="w-4 h-4 mx-auto mb-1 text-red-500" />
            <span>
              {error instanceof Error
                ? error.message
                : "Không thể tải danh mục nguồn dữ liệu."}
            </span>
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div className="p-4 bg-white border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
            <HelpCircle className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
            <p className="font-medium text-slate-700 mb-1">
              Không tìm thấy nguồn dữ liệu phù hợp
            </p>
            <p className="text-[11px] text-slate-400">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc."
                : "Vào mục API Manager để cấu hình thêm kết nối API hệ thống."}
            </p>
          </div>
        ) : (
          filteredCatalog.map((item: any) => {
            const previewState = previews[item.endpoint];
            const previewFields = previewState?.fields?.map((f: any) => f.path);
            const effectiveFields =
              Array.isArray(item.fields) && item.fields.length > 0
                ? item.fields
                : previewFields && previewFields.length > 0
                  ? previewFields
                  : [];

            return (
              <div
                key={item.endpoint}
                className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-indigo-300 transition-all group min-w-0 flex flex-col"
              >
                {/* Header Card: Badges & Name */}
                <div className="flex items-start justify-between gap-1.5 mb-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {item.isApi ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold px-1.5 py-0 flex items-center gap-1 shrink-0"
                      >
                        <Radio className="w-2.5 h-2.5" />
                        API Manager
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold px-1.5 py-0 flex items-center gap-1 shrink-0"
                      >
                        <Server className="w-2.5 h-2.5" />
                        Hệ thống
                      </Badge>
                    )}

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold px-1.5 py-0 shrink-0 ${
                        item.method === "POST"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {item.method}
                    </Badge>
                  </div>
                </div>

                <h4 className="font-semibold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-1 min-w-0 break-words">
                  {item.name}
                </h4>

                {/* Path or Endpoint URL */}
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-md mb-2 border border-slate-100 min-w-0 break-all select-all">
                  {item.upstream && item.path
                    ? `${item.upstream}${item.path}`
                    : item.endpoint}
                </div>

                {/* Schema Fields count */}
                {effectiveFields.length > 0 ? (
                  <div className="text-[11px] text-slate-500 mb-2.5 flex items-center gap-1 min-w-0">
                    <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {effectiveFields.length} trường:{" "}
                      {effectiveFields.slice(0, 4).join(", ")}
                      {effectiveFields.length > 4 ? "..." : ""}
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-600 mb-2.5 flex items-center gap-1 min-w-0">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      Chưa định nghĩa schema (bấm xem để nạp trường)
                    </span>
                  </div>
                )}

                {/* Actions Button */}
                <div className="flex flex-col gap-1.5 mt-auto pt-1">
                  <Button
                    size="sm"
                    className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-1.5 h-7.5 shadow-xs"
                    onClick={() =>
                      onAddSource({
                        id: item.endpoint,
                        endpoint: item.endpoint,
                        name: item.name || item.endpoint,
                        fields: effectiveFields,
                        upstream: item.upstream,
                        path: item.path,
                        method: item.method,
                      })
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm vào mô hình
                  </Button>

                  {item.upstream && item.path && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full text-[11px] h-7 border-slate-200 flex items-center justify-center gap-1.5 transition-colors ${
                        previewState && !previewState.error && !previewState.loading
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                      disabled={previewState?.loading}
                      onClick={() => previewSource(item)}
                    >
                      {previewState?.loading ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>Đang đọc dữ liệu...</span>
                        </>
                      ) : previewState && !previewState.error ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Đang xem dữ liệu (Bấm để ẩn)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Xem dữ liệu API trả về</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Live Preview Panel */}
                {previewState && (
                  <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-xs min-w-0 animate-in fade-in duration-200">
                    {previewState.error && (
                      <p className="text-red-600 text-[11px] break-words">
                        {previewState.error}
                      </p>
                    )}

                    {!previewState.error &&
                      (previewState.candidates?.length ?? 0) > 1 && (
                        <div className="mb-2">
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Chọn đường dẫn dữ liệu mảng:
                          </label>
                          <select
                            className="block w-full rounded border border-slate-200 bg-white p-1 text-[11px] outline-none"
                            value={previewState.selectedPath || ""}
                            onChange={(e) =>
                              previewSource(item, e.target.value)
                            }
                          >
                            <option value="">Chọn đường dẫn dữ liệu</option>
                            {previewState.candidates?.map((path) => (
                              <option key={path} value={path}>
                                {path || "(mảng gốc)"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    {!previewState.error &&
                      (previewState.fields?.length ?? 0) > 0 && (
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between text-[11px] text-slate-700 font-medium">
                            <span>
                              Trường phát hiện: {previewState.fields?.length}
                            </span>
                            {previewState.selectedPath && (
                              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                                {previewState.selectedPath}
                              </span>
                            )}
                          </div>

                          {(previewState.rows?.length ?? 0) > 0 ? (
                            <div className="max-h-40 overflow-auto rounded border border-slate-200 bg-white text-[11px]">
                              <table className="min-w-full text-left">
                                <thead className="bg-slate-50">
                                  <tr>
                                    {previewState.fields
                                      ?.slice(0, 6)
                                      .map((f: any, fIdx: number) => {
                                        const colName =
                                          typeof f === "string" ? f : f.path;
                                        return (
                                          <th
                                            key={fIdx}
                                            className="border-b px-2 py-1 font-semibold text-slate-700 text-[10px]"
                                          >
                                            {colName}
                                          </th>
                                        );
                                      })}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previewState.rows
                                    ?.slice(0, 5)
                                    .map((row: any, rIdx: number) => (
                                      <tr
                                        key={rIdx}
                                        className="hover:bg-slate-50"
                                      >
                                        {previewState.fields
                                          ?.slice(0, 6)
                                          .map((f: any, fIdx: number) => {
                                            const fieldPath =
                                              typeof f === "string"
                                                ? f
                                                : f.path;
                                            const cellVal =
                                              row[`field_${fIdx}`] ??
                                              row[fieldPath] ??
                                              row[Object.keys(row)[fIdx]] ??
                                              "";
                                            return (
                                              <td
                                                key={fIdx}
                                                className="max-w-[120px] truncate border-b px-2 py-1 text-slate-600 text-[10px]"
                                                title={String(cellVal)}
                                              >
                                                {String(cellVal)}
                                              </td>
                                            );
                                          })}
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">
                              API đã phản hồi nhưng chưa có bản ghi mẫu.
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
