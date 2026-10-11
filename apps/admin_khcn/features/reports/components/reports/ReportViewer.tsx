"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  useGetReportRunStatus,
  useGetDatasetSnapshot,
  useRunReport,
  useGetReportDefinition,
} from '../../api';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  CheckCircle2,
  AlertCircle,
  Table as TableIcon,
  Search,
} from 'lucide-react';

interface ReportViewerProps {
  definitionId: number;
  config?: any;
  onBack: () => void;
}

interface AggregatedItem {
  label: string;
  value: number;
  count: number;
}

const PALETTE = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
];

function aggregateData(
  rows: any[],
  xAxis: string,
  yAxis: string,
): AggregatedItem[] {
  if (!rows || rows.length === 0 || !xAxis) return [];

  const groups: Record<string, { count: number; sum: number; values: number[] }> =
    {};

  for (const row of rows) {
    const rawX = row[xAxis];
    const key =
      rawX != null && rawX !== '' ? String(rawX).trim() : 'Chưa phân loại';
    if (!groups[key]) {
      groups[key] = { count: 0, sum: 0, values: [] };
    }
    groups[key].count++;

    const yVal = Number(row[yAxis]);
    if (!isNaN(yVal)) {
      groups[key].sum += yVal;
      groups[key].values.push(yVal);
    }
  }

  const result: AggregatedItem[] = Object.entries(groups).map(([label, g]) => {
    let val = g.count;
    if (g.values.length > 0) {
      if (['progress', 'qualityScore', 'score', 'rate'].includes(yAxis)) {
        val = Math.round(g.sum / g.values.length);
      } else if (
        ['viewCount', 'taskCount', 'docCount', 'pageCount'].includes(yAxis)
      ) {
        val = g.sum;
      } else {
        val = g.count;
      }
    }
    return { label, value: val, count: g.count };
  });

  return result.sort((a, b) => b.value - a.value).slice(0, 8);
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  definitionId,
  config,
  onBack,
}) => {
  const [runId, setRunId] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: reportDef, isLoading: isDefLoading } = useGetReportDefinition(
    definitionId.toString(),
  );
  const actualConfig = config || reportDef?.configuration;
  const reportName = reportDef?.name || 'Báo cáo Chi tiết';

  const runMutation = useRunReport();
  const { data: runStatus, isLoading: isStatusLoading } = useGetReportRunStatus(
    runId!,
    !!runId,
  );

  const isCompleted = runStatus?.status === 'SUCCEEDED';
  const { data: snapshot, isLoading: isSnapshotLoading } = useGetDatasetSnapshot(
    isCompleted ? runId! : '',
  );

  // Tự động kích hoạt lượt chạy đầu tiên khi mở báo cáo
  useEffect(() => {
    let isMounted = true;
    const triggerInitialRun = async () => {
      try {
        const result = await runMutation.mutateAsync({
          definitionId,
          config: actualConfig,
        });
        if (isMounted && result?.runId) {
          setRunId(result.runId.toString());
        }
      } catch (err) {
        // Fallback: nếu lỗi mutation, vẫn cho phép người dùng ấn Chạy lại thủ công
      }
    };

    if (!runId && definitionId) {
      triggerInitialRun();
    }

    return () => {
      isMounted = false;
    };
  }, [definitionId]);

  const handleRun = async () => {
    try {
      const result = await runMutation.mutateAsync({
        definitionId,
        config: actualConfig,
      });
      if (result?.runId) {
        setRunId(result.runId.toString());
      }
    } catch {
      alert('Có lỗi xảy ra khi thực thi báo cáo.');
    }
  };

  const rows = useMemo(() => snapshot?.data || [], [snapshot]);
  const schema = useMemo(() => snapshot?.schema || [], [snapshot]);

  // Bộ lọc dữ liệu bảng
  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return rows;
    const q = tableSearch.toLowerCase();
    return rows.filter((r: any) =>
      Object.values(r).some((val) => String(val ?? '').toLowerCase().includes(q)),
    );
  }, [rows, tableSearch]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;

  // Xuất file CSV UTF-8 BOM chuẩn Excel
  const handleExportCSV = () => {
    if (!rows.length || !schema.length) return;
    const headers = schema.map((c: any) => `"${c.label || c.key}"`).join(',');
    const body = rows
      .map((row: any) =>
        schema
          .map((col: any) => {
            const val = row[col.key] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(','),
      )
      .join('\n');

    const csvContent = '\uFEFF' + headers + '\n' + body;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_${definitionId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-6 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="text-slate-600 border-slate-200 hover:bg-slate-100 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Quay lại
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 truncate">
                  {reportName}
                </h1>
                <Badge variant="outline" className="text-xs bg-slate-50">
                  ID: #{definitionId}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {reportDef?.description ||
                  'Báo cáo động trực quan từ cơ sở dữ liệu hệ thống.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {rows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Xuất CSV / Excel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleRun}
              disabled={runMutation.isPending || runStatus?.status === 'RUNNING'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  runMutation.isPending || runStatus?.status === 'RUNNING'
                    ? 'animate-spin'
                    : ''
                }`}
              />
              {runMutation.isPending ? 'Đang gửi lệnh...' : 'Chạy lại (Run)'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        {/* Status Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-600'
                  : runStatus?.status === 'FAILED'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : runStatus?.status === 'FAILED' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Activity className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Trạng thái thực thi
                </span>
                {runId && (
                  <Badge variant="secondary" className="text-[11px]">
                    Run #{runId}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {isStatusLoading || runMutation.isPending
                  ? 'Đang kết nối hệ thống...'
                  : runStatus?.status === 'SUCCEEDED'
                    ? 'Thành công (Dữ liệu đã sẵn sàng)'
                    : runStatus?.status === 'FAILED'
                      ? 'Lỗi thực thi'
                      : 'Đang xử lý trong hàng đợi (Queued)...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <div>
              <span className="text-slate-400 block">Số dòng kết quả</span>
              <span className="text-sm font-bold text-slate-800">
                {rows.length} bản ghi
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Nguồn dữ liệu</span>
              <span className="text-sm font-bold text-slate-800">
                {actualConfig?.sources?.[0]?.name ||
                  actualConfig?.sources?.[0]?.endpoint ||
                  'Hệ thống CSDL'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Thời gian cập nhật</span>
              <span className="text-sm font-bold text-slate-800">
                {new Date().toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Charts Visualization */}
        {isCompleted && actualConfig?.charts && actualConfig.charts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Trực quan hóa Dữ liệu Thực tế
              </h2>
              <span className="text-xs text-slate-400">
                Tự động tổng hợp từ {rows.length} bản ghi
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {actualConfig.charts.map((chart: any, cIdx: number) => {
                const chartData = aggregateData(
                  rows,
                  chart.xAxis,
                  chart.yAxis,
                );
                const maxVal = Math.max(
                  ...chartData.map((d) => d.value),
                  1,
                );
                const totalVal =
                  chartData.reduce((acc, d) => acc + d.value, 0) || 1;

                return (
                  <div
                    key={cIdx}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                  >
                    <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-sm text-slate-800 truncate pr-2">
                        {chart.title || `Biểu đồ ${cIdx + 1}`}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700"
                      >
                        {chart.type}
                      </Badge>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between min-h-[260px]">
                      {chartData.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                          <AlertCircle className="w-6 h-6 mb-1 text-slate-300" />
                          Không có dữ liệu cho các trường {chart.xAxis} /{' '}
                          {chart.yAxis}
                        </div>
                      ) : chart.type === 'bar' ? (
                        /* Real Bar Chart */
                        <div className="flex-1 flex flex-col justify-end space-y-3">
                          <div className="h-44 flex items-end justify-around gap-2 pt-6 pb-2">
                            {chartData.map((item, i) => {
                              const heightPct = Math.max(
                                14,
                                Math.round((item.value / maxVal) * 100),
                              );
                              const color = PALETTE[i % PALETTE.length];
                              return (
                                <div
                                  key={i}
                                  className="flex-1 flex flex-col items-center h-full justify-end group/bar relative min-w-0"
                                >
                                  {/* Value tooltip */}
                                  <span className="text-[11px] font-bold text-slate-700 mb-1 opacity-80 group-hover/bar:opacity-100 transition-opacity">
                                    {item.value}
                                  </span>
                                  {/* Bar column */}
                                  <div
                                    className="w-full max-w-[42px] rounded-t-lg transition-all duration-500 ease-out shadow-sm group-hover/bar:brightness-110"
                                    style={{
                                      height: `${heightPct}%`,
                                      backgroundColor: color,
                                    }}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Labels row */}
                          <div className="flex justify-around gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            {chartData.map((item, i) => (
                              <div
                                key={i}
                                className="flex-1 text-center truncate px-0.5"
                                title={item.label}
                              >
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : chart.type === 'line' ? (
                        /* Real Line Chart */
                        <div className="flex-1 flex flex-col justify-end space-y-3">
                          <div className="h-44 relative w-full pt-4">
                            <svg
                              className="w-full h-full overflow-visible"
                              viewBox="0 0 100 50"
                              preserveAspectRatio="none"
                            >
                              <defs>
                                <linearGradient
                                  id={`grad-${cIdx}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="#4f46e5"
                                    stopOpacity="0.25"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="#4f46e5"
                                    stopOpacity="0.0"
                                  />
                                </linearGradient>
                              </defs>
                              {(() => {
                                const n = chartData.length;
                                const step = n > 1 ? 80 / (n - 1) : 0;
                                const pts = chartData.map((d, idx) => {
                                  const x = 10 + idx * step;
                                  const y =
                                    42 -
                                    Math.round((d.value / maxVal) * 34);
                                  return { x, y, ...d };
                                });
                                const polyPoints = pts
                                  .map((p) => `${p.x},${p.y}`)
                                  .join(' ');
                                const areaPoints = `10,48 ${polyPoints} ${
                                  pts[pts.length - 1].x
                                },48`;

                                return (
                                  <>
                                    <polygon
                                      points={areaPoints}
                                      fill={`url(#grad-${cIdx})`}
                                    />
                                    <polyline
                                      fill="none"
                                      stroke="#4f46e5"
                                      strokeWidth="2.5"
                                      points={polyPoints}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    {pts.map((p, idx) => (
                                      <g key={idx}>
                                        <circle
                                          cx={p.x}
                                          cy={p.y}
                                          r="3"
                                          fill="#ffffff"
                                          stroke="#4f46e5"
                                          strokeWidth="2"
                                        />
                                        <text
                                          x={p.x}
                                          y={p.y - 4}
                                          fontSize="4.5"
                                          fontWeight="bold"
                                          fill="#374151"
                                          textAnchor="middle"
                                        >
                                          {p.value}
                                        </text>
                                      </g>
                                    ))}
                                  </>
                                );
                              })()}
                            </svg>
                          </div>
                          {/* Labels row */}
                          <div className="flex justify-between gap-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            {chartData.map((item, i) => (
                              <div
                                key={i}
                                className="text-center truncate px-0.5"
                                style={{ width: `${100 / chartData.length}%` }}
                                title={item.label}
                              >
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Real Pie / Donut Chart with Legend */
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                          <div className="flex items-center justify-center gap-6">
                            {/* SVG Donut */}
                            <div className="w-28 h-28 relative shrink-0">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="transparent"
                                  stroke="#f1f5f9"
                                  strokeWidth="5"
                                />
                                {(() => {
                                  let accumulatedPct = 0;
                                  return chartData.map((item, i) => {
                                    const pct = Math.round(
                                      (item.value / totalVal) * 100,
                                    );
                                    const strokeDasharray = `${pct} ${
                                      100 - pct
                                    }`;
                                    const strokeDashoffset = -accumulatedPct;
                                    accumulatedPct += pct;
                                    const color = PALETTE[i % PALETTE.length];
                                    return (
                                      <circle
                                        key={i}
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="transparent"
                                        stroke={color}
                                        strokeWidth="5"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        pathLength="100"
                                      />
                                    );
                                  });
                                })()}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xs font-bold text-slate-800">
                                  {totalVal}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  Tổng
                                </span>
                              </div>
                            </div>

                            {/* Legend */}
                            <div className="flex-1 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {chartData.map((item, i) => {
                                const color = PALETTE[i % PALETTE.length];
                                const pct = Math.round(
                                  (item.value / totalVal) * 100,
                                );
                                return (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: color }}
                                      ></span>
                                      <span
                                        className="text-slate-600 truncate"
                                        title={item.label}
                                      >
                                        {item.label}
                                      </span>
                                    </div>
                                    <span className="font-bold text-slate-800 shrink-0">
                                      {item.value}{' '}
                                      <span className="text-slate-400 font-normal">
                                        ({pct}%)
                                      </span>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Trục hoành / tung info */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Trục X: {chart.xAxis}</span>
                        <span>Trục Y: {chart.yAxis}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Snapshot Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Dữ liệu Bản ghi Thực tế (Dataset Snapshot)
              </h3>
              <Badge variant="secondary" className="ml-2 bg-slate-100">
                {filteredRows.length} dòng
              </Badge>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm trong bảng..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {isSnapshotLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              Đang trích xuất snapshot dữ liệu từ máy chủ...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Không tìm thấy dòng dữ liệu nào phù hợp.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center text-slate-400">
                        #
                      </th>
                      {schema.map((col: any) => (
                        <th
                          key={col.key}
                          className="py-3 px-4 whitespace-nowrap"
                        >
                          {col.label || col.key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedRows.map((row: any, rIdx: number) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">
                          {(page - 1) * pageSize + rIdx + 1}
                        </td>
                        {schema.map((col: any) => {
                          const val = row[col.key];
                          const strVal =
                            val != null ? String(val) : '—';
                          const isNumber =
                            typeof val === 'number' ||
                            !isNaN(Number(val)) && val !== '';

                          return (
                            <td
                              key={col.key}
                              className="py-3 px-4 max-w-xs truncate text-slate-700"
                              title={strVal}
                            >
                              {col.key === 'status' ? (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-semibold ${
                                    strVal === 'COMPLETED' ||
                                    strVal === 'DONE' ||
                                    strVal === 'PUBLISHED'
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                      : strVal === 'TODO' ||
                                          strVal === 'PROCESSING'
                                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                                        : 'text-slate-600 bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  {strVal}
                                </Badge>
                              ) : col.key === 'progress' ||
                                col.key === 'qualityScore' ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-600 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Number(val || 0),
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-slate-800">
                                    {val}%
                                  </span>
                                </div>
                              ) : (
                                <span>{strVal}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                  <span>
                    Hiển thị {(page - 1) * pageSize + 1} -{' '}
                    {Math.min(page * pageSize, filteredRows.length)} trong tổng số{' '}
                    {filteredRows.length} bản ghi
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-7 px-2 text-xs"
                    >
                      Trước
                    </Button>
                    <span className="px-2 font-medium text-slate-700">
                      Trang {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="h-7 px-2 text-xs"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
