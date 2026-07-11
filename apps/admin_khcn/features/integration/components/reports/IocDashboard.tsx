"use client";

import React, { useState, useCallback } from "react";
import { Activity, RefreshCw, Database, AlertCircle, CheckCircle2, ChevronRight, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIntegrationConnectionList, useExecuteIntegration, IntegrationConnection } from "../../api";
import { toast } from "sonner";

function getMethodColor(method: string) {
  switch (method?.toUpperCase()) {
    case "GET": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "POST": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
    case "PUT": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "DELETE": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  }
}

function JsonViewer({ data }: { data: any }) {
  if (!data) return <p className="text-slate-400 text-sm italic">Không có dữ liệu</p>;

  const isArray = Array.isArray(data);
  const isObject = typeof data === "object";

  if (isArray && data.length > 0 && typeof data[0] === "object") {
    const keys = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {keys.map(k => (
                <th key={k} className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider whitespace-nowrap">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {data.slice(0, 50).map((row: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                {keys.map(k => (
                  <td key={k} className="px-4 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[200px] truncate" title={String(row[k] ?? "")}>
                    {String(row[k] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 50 && (
          <div className="px-4 py-2 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Hiển thị 50 / {data.length} bản ghi
          </div>
        )}
      </div>
    );
  }

  return (
    <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl overflow-auto max-h-[400px] border border-slate-200 dark:border-slate-700">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function EndpointPanel({ connection }: { connection: IntegrationConnection }) {
  const [results, setResults] = useState<Record<string, { loading: boolean; data: any; error: string | null }>>({});
  const executeMutation = useExecuteIntegration();

  const handleExecute = useCallback(async (endpoint: { name: string; method: string; path: string }) => {
    const key = endpoint.path;
    setResults(prev => ({ ...prev, [key]: { loading: true, data: null, error: null } }));
    try {
      const res = await executeMutation.mutateAsync({
        code: connection.code,
        endpointPath: endpoint.path,
        method: endpoint.method,
      });
      const data = res?.data ?? res;
      setResults(prev => ({ ...prev, [key]: { loading: false, data, error: null } }));
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Lỗi không xác định";
      setResults(prev => ({ ...prev, [key]: { loading: false, data: null, error: errorMsg } }));
      toast.error(`Lỗi gọi ${endpoint.name}: ${errorMsg}`);
    }
  }, [connection.code, executeMutation]);

  const endpoints = (connection.endpoints || []) as Array<{ name: string; method: string; path: string; description?: string }>;

  if (endpoints.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Chưa có endpoints nào được cấu hình</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {endpoints.map((ep, idx) => {
        const key = ep.path;
        const result = results[key];
        return (
          <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {/* Endpoint Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
              <Badge className={`font-mono text-xs px-2 py-0.5 rounded-md border-0 ${getMethodColor(ep.method)}`}>
                {ep.method}
              </Badge>
              <code className="text-sm text-slate-700 dark:text-slate-300 font-mono flex-1">{ep.path}</code>
              <Button
                size="sm"
                onClick={() => handleExecute(ep)}
                disabled={result?.loading}
                className="h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg"
              >
                {result?.loading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Play className="w-3 h-3 mr-1" />
                )}
                Lấy dữ liệu
              </Button>
            </div>

            {/* Description */}
            {ep.description && (
              <p className="px-4 py-1 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
                {ep.description}
              </p>
            )}

            {/* Result */}
            {result && !result.loading && (
              <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                {result.error ? (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{result.error}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Dữ liệu trả về thành công
                    </div>
                    <JsonViewer data={result.data} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function IocDashboard() {
  const { data: connections = [], isLoading, refetch } = useIntegrationConnectionList();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const activeConnections = connections.filter(c => c.isActive);
  const selectedConnection = connections.find(c => c.code === selectedCode);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            Dữ liệu Live từ API Tích hợp
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gọi trực tiếp các API đã kết nối (IOC, LGSP...) và xem kết quả realtime
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          disabled={isLoading}
          className="rounded-xl border-slate-200 dark:border-slate-700 h-10 px-4"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : activeConnections.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
          <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Chưa có kết nối API nào</h3>
          <p className="text-slate-500 text-sm">Vào trang "Quản lý API" để thêm và cấu hình kết nối IOC-api-DLK.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left: Connection List */}
          <div className="w-full lg:w-72 shrink-0 space-y-2">
            {activeConnections.map(conn => (
              <button
                key={conn.code}
                onClick={() => setSelectedCode(conn.code === selectedCode ? null : conn.code)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedCode === conn.code
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10 shadow-sm shadow-violet-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{conn.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{conn.code}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 ml-2 shrink-0 transition-transform ${selectedCode === conn.code ? "rotate-90 text-violet-500" : ""}`} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                    {conn.type}
                  </Badge>
                  <span className="text-xs text-slate-400">{(conn.endpoints as any[])?.length || 0} endpoints</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Endpoint Explorer */}
          <div className="flex-1 min-h-0">
            {selectedConnection ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{selectedConnection.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedConnection.baseUrl}</p>
                </div>
                <EndpointPanel connection={selectedConnection} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <Activity className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-4" />
                <p className="text-slate-400 font-medium">Chọn một kết nối để xem và lấy dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
