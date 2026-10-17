"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetReportDefinitions,
  useGetReportDefinition,
  useGetDatasetSnapshot,
  useRunReport,
} from "@/features/reports/api";
import {
  fixMojibake,
  getShortChartLabel,
  getFriendlyFieldLabel,
} from "@/features/reports/utils/fieldHelpers";

const PALETTE = [
  "#4f46e5", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#3b82f6", // Blue
];

export interface EmbeddedReportWidgetProps {
  /** Mã định danh số (id) hoặc mã code (ví dụ: 'REP_DOC_STATS', 'REP_HRM_TASKS', 'REP_EMP_QUALITY') */
  reportIdOrCode: number | string;
  /** Tiêu đề tùy biến (nếu để trống, tự lấy từ tên ReportDefinition) */
  title?: string;
  /** Mô tả ngắn (tùy chọn) */
  description?: string;
  /** Chiều cao container biểu đồ (mặc định: 260px) */
  chartHeight?: number;
  /** Số cột hiển thị nếu có nhiều biểu đồ: 1 hoặc 2 (mặc định: 2) */
  columns?: 1 | 2;
  /** Chỉ hiển thị biểu đồ theo index cụ thể (nếu chỉ muốn nhúng 1 biểu đồ) */
  chartIndex?: number;
  /** Cho phép chuyển đổi dạng biểu đồ Cột / Đường (mặc định: true) */
  allowToggleType?: boolean;
  /** Hiển thị nút "Xem chi tiết báo cáo ->" (mặc định: true) */
  showDetailLink?: boolean;
  /** Hỗ trợ thu gọn/mở rộng widget (mặc định: true) */
  collapsible?: boolean;
  /** Mặc định thu gọn (mặc định: false) */
  defaultCollapsed?: boolean;
  /** Tùy biến class container */
  className?: string;
}

export function EmbeddedReportWidget({
  reportIdOrCode,
  title,
  description,
  chartHeight = 240,
  columns = 2,
  chartIndex,
  allowToggleType = true,
  showDetailLink = true,
  collapsible = true,
  defaultCollapsed = false,
  className = "",
}: EmbeddedReportWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const isCode = typeof reportIdOrCode === "string" && isNaN(Number(reportIdOrCode));
  const numericId = !isCode ? Number(reportIdOrCode) : 0;

  // 1. Tải danh sách nếu tìm theo code
  const { data: allDefs, isLoading: isAllDefsLoading } = useGetReportDefinitions();
  const matchedDefByCode = useMemo(() => {
    if (!isCode || !allDefs) return null;
    return allDefs.find((d: any) => d.code === reportIdOrCode);
  }, [isCode, allDefs, reportIdOrCode]);

  const effectiveId = numericId || matchedDefByCode?.id || 0;

  // 2. Lấy chi tiết ReportDefinition
  const { data: reportDef, isLoading: isDefLoading } = useGetReportDefinition(
    effectiveId > 0 ? effectiveId : null,
  );

  const activeDef = reportDef || matchedDefByCode;

  // 3. Trích xuất actualConfig an toàn
  const actualConfig = useMemo(() => {
    const raw = activeDef?.configuration;
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }, [activeDef?.configuration]);

  // 4. Lấy runId mới nhất có trạng thái SUCCEEDED
  const [activeRunId, setActiveRunId] = useState<number | null>(null);

  useEffect(() => {
    const runs = (activeDef as any)?.runs;
    if (Array.isArray(runs) && runs.length > 0) {
      const succeededRun = runs.find((r: any) => r.status === "SUCCEEDED");
      if (succeededRun?.id) {
        setActiveRunId(succeededRun.id);
        return;
      }
      if (runs[0]?.id) {
        setActiveRunId(runs[0].id);
      }
    }
  }, [activeDef]);

  // Mutation hỗ trợ kích hoạt chạy lại
  const runMutation = useRunReport();
  const handleRefresh = async () => {
    if (!effectiveId) return;
    try {
      const res = await runMutation.mutateAsync({
        definitionId: effectiveId,
        config: actualConfig,
      });
      if (res?.runId) {
        setActiveRunId(res.runId);
      }
    } catch {
      // Fallback
    }
  };

  // 5. Tải dữ liệu DatasetSnapshot
  const { data: snapshot, isLoading: isSnapshotLoading } = useGetDatasetSnapshot(
    activeRunId ? activeRunId : null,
    { limit: 1000 },
  );

  const rows = useMemo(() => {
    if (!snapshot) return [];
    if (Array.isArray(snapshot.data)) return snapshot.data;
    if (Array.isArray((snapshot as any)?.data?.data)) return (snapshot as any).data.data;
    if (Array.isArray(snapshot)) return snapshot;
    return [];
  }, [snapshot]);

  // 6. Danh sách biểu đồ cần render
  const effectiveCharts = useMemo(() => {
    let list: any[] = [];
    if (actualConfig?.charts && Array.isArray(actualConfig.charts)) {
      list = actualConfig.charts;
    }
    if (typeof chartIndex === "number" && chartIndex >= 0 && chartIndex < list.length) {
      return [list[chartIndex]];
    }
    return list;
  }, [actualConfig?.charts, chartIndex]);

  // Chế độ xem biểu đồ (bar/line toggle)
  const [chartModes, setChartModes] = useState<Record<number, string>>({});

  // 7. Hàm tổng hợp dữ liệu biểu đồ
  const aggregateData = (dataset: any[], xField: string, yField: string) => {
    if (!dataset || dataset.length === 0 || !xField) return [];

    const map = new Map<string, { value: number; count: number }>();
    const isCountMetric =
      !yField ||
      yField === "id" ||
      yField === "count" ||
      ((xField === "ranking" || xField === "approvedRank" || xField === "urgency" || xField === "status") &&
        (!yField || yField === "id" || yField === "count" || yField === xField));

    const isSumMetric =
      Boolean(yField) &&
      (yField.toLowerCase().includes("tasks") ||
        yField.toLowerCase().includes("total") ||
        yField.toLowerCase().includes("amount") ||
        yField.toLowerCase().includes("quantity") ||
        yField.toLowerCase().includes("thuc_hien") ||
        yField.toLowerCase().includes("giai_ngan") ||
        yField.toLowerCase().includes("kim_ngach") ||
        yField.toLowerCase().includes("du_toan") ||
        yField.toLowerCase().includes("chi") ||
        yField.toLowerCase().includes("thu") ||
        yField.toLowerCase().includes("von") ||
        yField.toLowerCase().includes("tien") ||
        yField.toLowerCase().includes("so_luong") ||
        yField.toLowerCase().includes("doanh_thu"));

    dataset.forEach((row) => {
      const rawKey = row[xField];
      if (rawKey == null) return;
      const strRawKey = String(rawKey).trim();
      if (
        strRawKey === "" ||
        strRawKey === "—" ||
        strRawKey === "-" ||
        strRawKey.toLowerCase() === "n/a" ||
        strRawKey.toLowerCase() === "null"
      ) {
        return;
      }

      const key = fixMojibake(strRawKey);

      const current = map.get(key) || { value: 0, count: 0 };
      current.count += 1;

      if (isCountMetric) {
        current.value += 1;
      } else {
        const num = Number(row[yField]);
        if (!isNaN(num)) {
          current.value += num;
        } else {
          current.value += 1;
        }
      }
      map.set(key, current);
    });

    const result = Array.from(map.entries()).map(([label, stats]) => ({
      label,
      value: isCountMetric
        ? stats.value
        : isSumMetric
        ? stats.value
        : Math.round((stats.value / (stats.count || 1)) * 10) / 10,
      count: stats.count,
    }));

    return result.slice(0, 12);
  };

  const isLoading = isAllDefsLoading || isDefLoading || isSnapshotLoading || runMutation.isPending;
  const displayTitle =
    title ||
    (activeDef?.name ? fixMojibake(activeDef.name) : "") ||
    "Biểu đồ Báo cáo Phân tích";
  const displayDescription =
    description ||
    (activeDef?.description ? fixMojibake(activeDef.description) : "") ||
    "Dữ liệu trực quan hóa động được thiết kế từ Report Service";

  // Loading state
  if (isLoading && rows.length === 0) {
    return (
      <Card className={`border shadow-xs bg-background min-w-0 ${className}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[220px] text-muted-foreground gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-medium">Đang đồng bộ biểu đồ từ Report Service...</p>
        </CardContent>
      </Card>
    );
  }

  // Fallback: Không tìm thấy định nghĩa báo cáo
  if (!activeDef) {
    return (
      <Card className={`border border-dashed shadow-xs bg-muted/20 min-w-0 ${className}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px] text-muted-foreground gap-1.5 text-center">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="text-xs font-semibold text-foreground">
            Chưa tìm thấy thiết kế báo cáo ({String(reportIdOrCode)})
          </p>
          <p className="text-[11px] text-muted-foreground">
            Vui lòng cấu hình mẫu báo cáo trong mục Báo cáo & Thống kê hệ thống.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fallback: Chưa có biểu đồ nào được cấu hình
  if (effectiveCharts.length === 0) {
    return null;
  }

  return (
    <Card className={`border shadow-xs bg-background overflow-hidden min-w-0 ${className}`}>
      {/* Header Widget */}
      <CardHeader className="p-4 sm:p-5 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold shrink-0">
              <Layers className="h-3 w-3 mr-1 inline" /> Báo cáo Động
            </Badge>
            <CardTitle className="text-sm sm:text-base font-bold text-foreground truncate min-w-0">
              {displayTitle}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground line-clamp-1">
            {displayDescription}
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={runMutation.isPending}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Làm mới dữ liệu từ Report Service"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${runMutation.isPending ? "animate-spin" : ""}`} />
            <span className="sr-only sm:not-sr-only sm:ml-1 text-[11px]">Cập nhật</span>
          </Button>

          {showDetailLink && effectiveId > 0 && (
            <Link href={`/services/reports/${effectiveId}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/5 font-medium flex items-center gap-1"
              >
                Chi tiết
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}

          {collapsible && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title={isCollapsed ? "Mở rộng biểu đồ" : "Thu gọn biểu đồ"}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Charts Grid */}
      {!isCollapsed && (
        <CardContent className="p-4 sm:p-6 min-w-0">
        <div
          className={`grid gap-5 min-w-0 ${
            columns === 1 || effectiveCharts.length === 1
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {effectiveCharts.map((chart: any, cIdx: number) => {
            const chartData = aggregateData(rows, chart.xAxis, chart.yAxis);
            const maxVal = Math.max(...chartData.map((d) => d.value), 1);
            const totalVal = chartData.reduce((acc, d) => acc + d.value, 0) || 1;
            const effectiveType = chartModes[cIdx] || chart.type || "bar";
            const chartLabel =
              fixMojibake(chart.title) ||
              `${getFriendlyFieldLabel(chart.xAxis)} (${effectiveType.toUpperCase()})`;

            return (
              <div
                key={cIdx}
                className="bg-card border rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-primary/30 transition-colors min-w-0 overflow-hidden"
              >
                {/* Tiêu đề biểu đồ con & Switcher */}
                <div className="flex items-center justify-between pb-3 border-b gap-2 min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate min-w-0 flex-1" title={chartLabel}>
                    {chartLabel}
                  </h4>

                  <div className="flex items-center gap-1 shrink-0">
                    {allowToggleType && chart.type !== "pie" && (
                      <div className="inline-flex bg-muted p-0.5 rounded-md border text-[10px]">
                        <button
                          type="button"
                          onClick={() => setChartModes((prev) => ({ ...prev, [cIdx]: "bar" }))}
                          className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                            effectiveType === "bar"
                              ? "bg-background text-primary shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Cột
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartModes((prev) => ({ ...prev, [cIdx]: "line" }))}
                          className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                            effectiveType === "line"
                              ? "bg-background text-primary shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Đường
                        </button>
                      </div>
                    )}

                    <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0.5">
                      {effectiveType}
                    </Badge>
                  </div>
                </div>

                {/* Vẽ Biểu đồ Thực tế */}
                <div className="pt-4 flex-1 flex flex-col justify-end min-w-0" style={{ minHeight: `${chartHeight}px` }}>
                  {chartData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs py-8">
                      <AlertCircle className="h-5 w-5 mb-1.5 opacity-40" />
                      Không có dữ liệu cho {chart.xAxis}
                    </div>
                  ) : effectiveType === "bar" ? (
                    /* Biểu đồ Cột (Bar Chart) */
                    <div className="flex-1 flex flex-col justify-end space-y-2 w-full min-w-0">
                      <div className="h-36 flex items-end justify-around gap-1.5 pt-4 pb-1 w-full min-w-0">
                        {chartData.map((item, i) => {
                          const heightPct = Math.max(12, Math.round((item.value / maxVal) * 100));
                          const color = PALETTE[i % PALETTE.length];
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center h-full justify-end group/bar relative min-w-0"
                            >
                              <span className="text-[10px] font-bold text-foreground mb-1 opacity-80 group-hover/bar:opacity-100 group-hover/bar:text-primary transition-all truncate">
                                {item.value.toLocaleString("vi-VN")}
                              </span>
                              <div
                                className="w-full max-w-[32px] rounded-t-md transition-all duration-300 shadow-2xs group-hover/bar:brightness-110"
                                style={{ height: `${heightPct}%`, backgroundColor: color }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Trục X nhãn */}
                      <div className="flex justify-around items-start gap-1 pt-2 border-t text-[10px] text-muted-foreground font-medium w-full min-w-0">
                        {chartData.map((item, i) => (
                          <div key={i} className="flex-1 text-center px-0.5 min-w-0 overflow-hidden" title={item.label}>
                            <p className="truncate text-foreground/80 font-semibold text-[10px]">
                              {getShortChartLabel(item.label)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : effectiveType === "line" ? (
                    /* Biểu đồ Đường (Spline Line Chart) */
                    <div className="flex-1 flex flex-col justify-end space-y-2 pt-2 w-full min-w-0 overflow-hidden">
                      <div className="h-36 relative w-full flex min-w-0">
                        <div className="w-6 shrink-0 flex flex-col justify-between text-[9px] text-muted-foreground font-medium text-right pr-1 select-none pb-1">
                          <span>{maxVal}</span>
                          <span>{Math.round(maxVal / 2)}</span>
                          <span>0</span>
                        </div>

                        <div className="flex-1 relative h-full min-w-0 overflow-hidden">
                          <div className="absolute inset-x-0 inset-y-0 pointer-events-none pb-1 flex flex-col justify-between">
                            <div className="border-b border-dashed w-full opacity-30" />
                            <div className="border-b border-dashed w-full opacity-30" />
                            <div className="border-b w-full opacity-60" />
                          </div>

                          {(() => {
                            const n = chartData.length;
                            const pts = chartData.map((d, idx) => {
                              const x = n > 1 ? Math.round((idx / (n - 1)) * 90 + 5) : 50;
                              const y = maxVal > 0 ? Math.round(86 - (d.value / maxVal) * 70) : 86;
                              return { x, y, ...d };
                            });

                            let splineD = `M ${pts[0].x} ${pts[0].y}`;
                            for (let i = 0; i < pts.length - 1; i++) {
                              const p0 = pts[i];
                              const p1 = pts[i + 1];
                              const cx = (p0.x + p1.x) / 2;
                              splineD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                            }
                            const areaD = `${splineD} L ${pts[pts.length - 1].x} 86 L ${pts[0].x} 86 Z`;

                            return (
                              <>
                                <svg
                                  className="absolute inset-0 w-full h-full pointer-events-none"
                                  viewBox="0 0 100 100"
                                  preserveAspectRatio="none"
                                >
                                  <path d={areaD} fill="#4f46e5" fillOpacity="0.12" />
                                  <path
                                    d={splineD}
                                    fill="none"
                                    stroke="#4f46e5"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                </svg>

                                {pts.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group/dot cursor-pointer"
                                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                  >
                                    <div className="w-2 h-2 rounded-full bg-white border-2 border-indigo-600 shadow-xs group-hover/dot:scale-150 transition-transform" />
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/dot:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                                      {p.label}: {p.value}
                                    </div>
                                  </div>
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Trục X nhãn */}
                      <div className="flex justify-around items-start gap-1 pt-2 border-t text-[10px] text-muted-foreground font-medium w-full min-w-0">
                        {chartData.map((item, i) => (
                          <div key={i} className="flex-1 text-center px-0.5 min-w-0 overflow-hidden" title={item.label}>
                            <p className="truncate text-foreground/80 font-semibold text-[10px]">
                              {getShortChartLabel(item.label)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Biểu đồ Tròn / Tỷ lệ (Pie / Donut Chart) */
                    <div className="flex-1 flex flex-col justify-center space-y-3 pt-2 w-full min-w-0">
                      <div className="space-y-2">
                        {chartData.map((item, i) => {
                          const pct = Math.round((item.value / totalVal) * 1000) / 10;
                          const color = PALETTE[i % PALETTE.length];
                          return (
                            <div key={i} className="space-y-1 min-w-0">
                              <div className="flex justify-between items-center text-xs min-w-0">
                                <span className="text-[11px] font-medium text-foreground truncate min-w-0 flex-1 pr-2" title={item.label}>
                                  <span
                                    className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 shrink-0 align-middle"
                                    style={{ backgroundColor: color }}
                                  />
                                  {item.label}
                                </span>
                                <span className="text-[11px] font-bold text-foreground shrink-0">
                                  {item.value.toLocaleString("vi-VN")}{" "}
                                  <span className="text-muted-foreground font-normal">({pct}%)</span>
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, backgroundColor: color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      )}
    </Card>
  );
}
