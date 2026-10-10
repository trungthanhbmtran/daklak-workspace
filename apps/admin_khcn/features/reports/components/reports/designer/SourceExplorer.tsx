"use client";
import React, { useState } from "react";
import { ReportSourceDef } from "../../../types";
import { Button } from "../../../../../components/ui/button";
import { useGetReportCatalog } from "../../../api";
import axiosInstance from "../../../../../lib/axiosInstance";
import type { ApiResponse } from "../../../../../lib/api.types";

interface SourceExplorerProps {
  onAddSource: (source: ReportSourceDef) => void;
}

export const SourceExplorer: React.FC<SourceExplorerProps> = ({
  onAddSource,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
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
    data: catalog = [],
    isLoading,
    isError,
    error,
  } = useGetReportCatalog();

  const previewSource = async (item: any, dataPath = "") => {
    const key = item.endpoint as string;
    setPreviews((current) => ({
      ...current,
      [key]: { ...current[key], loading: true, error: undefined },
    }));
    try {
      const source = { upstream: item.upstream, path: item.path, params: {} };
      const baseConfig = {
        version: 1,
        dataPath,
        columns: [],
        groupBy: [],
        filters: [],
        page: 1,
        pageSize: 10,
      };
      const inspected = await axiosInstance.post<ApiResponse<any>>(
        "/reports/table/preview",
        { source, config: baseConfig },
      );
      const schema = (inspected as unknown as ApiResponse<any>).data;
      if (
        !schema ||
        !Array.isArray(schema.candidates) ||
        !Array.isArray(schema.fields)
      ) {
        throw new Error("API không trả về cấu trúc dữ liệu xem trước hợp lệ.");
      }

      const selectedPath = dataPath || schema.selectedPath || "";
      if (!selectedPath && schema.candidates.length > 0) {
        setPreviews((current) => ({
          ...current,
          [key]: {
            candidates: schema.candidates,
            fields: [],
            rows: [],
            selectedPath: "",
          },
        }));
        return;
      }
      if (schema.fields.length === 0) {
        setPreviews((current) => ({
          ...current,
          [key]: {
            candidates: schema.candidates,
            fields: [],
            rows: [],
            selectedPath,
          },
        }));
        return;
      }

      const columns = schema.fields
        .slice(0, 30)
        .map((field: any, index: number) => ({
          key: `field_${index}`,
          path: field.path,
          label: field.path,
          type:
            field.type === "number" || field.type === "boolean"
              ? field.type
              : "string",
          aggregate: "none",
        }));
      const result = await axiosInstance.post<ApiResponse<any>>(
        "/reports/table/preview",
        { source, config: { ...baseConfig, dataPath: selectedPath, columns } },
      );
      const preview = (result as unknown as ApiResponse<any>).data;
      setPreviews((current) => ({
        ...current,
        [key]: {
          candidates: preview.candidates,
          fields: preview.fields,
          rows: preview.rows,
          selectedPath: preview.selectedPath,
        },
      }));
    } catch (error: any) {
      setPreviews((current) => ({
        ...current,
        [key]: {
          ...current[key],
          error:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể đọc dữ liệu từ API này.",
        },
      }));
    } finally {
      setPreviews((current) => ({
        ...current,
        [key]: { ...current[key], loading: false },
      }));
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="font-semibold mb-4 text-lg text-slate-800">
        Nguồn Dữ Liệu
      </h3>
      <input
        type="text"
        placeholder="Tìm kiếm API nguồn..."
        className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-2 mb-4 w-full text-sm outline-none transition-all shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="text-center text-sm text-slate-500 py-4">
            Đang tải danh mục...
          </div>
        ) : isError ? (
          <div className="text-center text-sm text-red-600 py-4">
            {error instanceof Error
              ? error.message
              : "Không thể tải danh mục nguồn dữ liệu."}
          </div>
        ) : (
          catalog
            .filter((c: any) =>
              c.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((item: any) => (
              <div
                key={item.endpoint}
                className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-200 transition-colors group"
              >
                <h4 className="font-medium text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400 mb-3 font-mono bg-slate-50 p-1 rounded mt-1">
                  {item.upstream && item.path
                    ? `${item.upstream}${item.path}`
                    : item.endpoint}
                </p>
                {Array.isArray(item.fields) && item.fields.length > 0 && (
                  <p className="text-xs text-slate-500 mb-3">
                    Schema khai báo: {item.fields.slice(0, 6).join(", ")}
                    {item.fields.length > 6 ? ", …" : ""}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
                  onClick={() =>
                    onAddSource({
                      id: item.endpoint,
                      endpoint: item.endpoint,
                      fields: item.fields,
                      upstream: item.upstream,
                      path: item.path,
                    })
                  }
                >
                  Thêm vào không gian
                </Button>
                {item.upstream && item.path && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs mt-2 hover:bg-emerald-50 hover:text-emerald-700 border-slate-200"
                    disabled={previews[item.endpoint]?.loading}
                    onClick={() => previewSource(item)}
                  >
                    {previews[item.endpoint]?.loading
                      ? "Đang đọc dữ liệu…"
                      : "Xem dữ liệu API trả về"}
                  </Button>
                )}
                {previews[item.endpoint] && (
                  <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                    {previews[item.endpoint].error && (
                      <p className="text-red-600">
                        {previews[item.endpoint].error}
                      </p>
                    )}
                    {!previews[item.endpoint].error &&
                      (previews[item.endpoint].candidates?.length ?? 0) > 1 && (
                        <label className="block text-slate-600 mb-2">
                          Danh sách bản ghi
                          <select
                            className="mt-1 block w-full rounded border p-1"
                            value={previews[item.endpoint].selectedPath || ""}
                            onChange={(event) =>
                              previewSource(item, event.target.value)
                            }
                          >
                            <option value="">Chọn đường dẫn dữ liệu</option>
                            {previews[item.endpoint].candidates?.map((path) => (
                              <option key={path} value={path}>
                                {path || "(mảng gốc)"}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    {!previews[item.endpoint].error &&
                      (previews[item.endpoint].fields?.length ?? 0) > 0 && (
                        <>
                          <p className="font-medium text-slate-700 mb-1">
                            Trường thực tế:{" "}
                            {previews[item.endpoint].fields?.length}
                            {previews[item.endpoint].selectedPath
                              ? ` · ${previews[item.endpoint].selectedPath}`
                              : ""}
                          </p>
                          <p className="text-slate-500 mb-2">
                            {previews[item.endpoint].fields
                              ?.map(
                                (field) =>
                                  `${field.path} (${field.type}${field.nullable ? ", có thể trống" : ""})`,
                              )
                              .join(" · ")}
                          </p>
                          {(previews[item.endpoint].rows?.length ?? 0) > 0 ? (
                            <div className="max-h-48 overflow-auto rounded border bg-white">
                              <table className="min-w-full text-left">
                                <thead>
                                  <tr>
                                    {previews[item.endpoint].fields
                                      ?.slice(0, 8)
                                      .map((field) => (
                                        <th
                                          key={field.path}
                                          className="border-b px-2 py-1 font-medium"
                                        >
                                          {field.path}
                                        </th>
                                      ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previews[item.endpoint].rows
                                    ?.slice(0, 10)
                                    .map((row, index) => (
                                      <tr key={index}>
                                        {previews[item.endpoint].fields
                                          ?.slice(0, 8)
                                          .map((field, fieldIndex) => (
                                            <td
                                              key={field.path}
                                              className="max-w-40 truncate border-b px-2 py-1"
                                            >
                                              {String(
                                                row[`field_${fieldIndex}`] ??
                                                  "",
                                              )}
                                            </td>
                                          ))}
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-slate-500">
                              API chưa trả về bản ghi mẫu cho đường dẫn này.
                            </p>
                          )}
                        </>
                      )}
                  </div>
                )}
              </div>
            ))
        )}
        {!isLoading && catalog.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-4">
            Chưa có nguồn dữ liệu. Kiểm tra quyền REPORT:READ và
            INTEGRATION:VIEW trên API Manager.
          </div>
        )}
      </div>
    </div>
  );
};
