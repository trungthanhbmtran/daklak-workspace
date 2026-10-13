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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../../../components/ui/sheet';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Table as TableIcon,
  Search,
  Settings2,
  FileText,
  Award,
  ShieldCheck,
  Building2,
  Users,
  ChevronRight,
  Printer,
  Scale,
  Calendar,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  getFriendlyFieldLabel,
  getStatusBadgeCls,
} from '@/features/reports/utils/fieldHelpers';
import { kpiFormsApi } from '@/features/hrm/api/kpi-forms.api';

interface ReportViewerProps {
  definitionId: number;
  config?: any;
  onBack?: () => void;
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
      if (['progress', 'qualityScore', 'score', 'rate', 'sTong', 'sNhiemVu', 'sChung'].includes(yAxis)) {
        val = Math.round((g.sum / g.values.length) * 10) / 10;
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
  const router = useRouter();
  const [runId, setRunId] = useState<number | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [chartModes, setChartModes] = useState<Record<number, 'bar' | 'line' | 'pie'>>({});
  const pageSize = 20;

  // State bộ lọc nâng cao cho SOP Report
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [filterMau04, setFilterMau04] = useState<string>('ALL');
  const [activeSopStep, setActiveSopStep] = useState<string>('ALL');
  const [isMau05Open, setIsMau05Open] = useState(false);

  // In / Xuất PDF quyết định Mẫu 05 chuẩn Thể thức Nghị định 30/2020 & Văn bản Đảng thông qua Server API Printer
  const handlePrintMau05Decision = () => {
    const printUrl = kpiFormsApi.getPrintUrl('M05_BAOCAO_QUYETDINH');
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.src = printUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 400);
    };
  };

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(tableSearch.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [tableSearch]);

  const { data: reportDef, isLoading: isDefLoading } = useGetReportDefinition(definitionId);
  const actualConfig = config || reportDef?.configuration;
  const reportName = reportDef?.name || 'Báo cáo Chi tiết';

  // Nhận diện báo cáo chuẩn SOP / Ban Tổ chức Tỉnh ủy
  const isBtctuReport = useMemo(() => {
    return (
      definitionId === 5 ||
      reportDef?.code?.includes('BTCTU') ||
      reportDef?.code?.includes('SOP') ||
      reportName.includes('Ban Tổ chức Tỉnh ủy') ||
      reportName.includes('SOP')
    );
  }, [definitionId, reportDef, reportName]);

  // Khởi tạo runId từ lượt chạy gần nhất trong database nếu có
  useEffect(() => {
    if (!runId && (reportDef as any)?.runs?.[0]?.id) {
      setRunId((reportDef as any).runs[0].id);
    }
  }, [reportDef, runId]);

  const runMutation = useRunReport();
  const { data: runStatus, isLoading: isStatusLoading } = useGetReportRunStatus(runId);

  const latestStatus = runStatus?.status || (reportDef as any)?.runs?.[0]?.status;
  const isCompleted = latestStatus === 'SUCCEEDED';
  const { data: snapshot, isLoading: isSnapshotLoading } = useGetDatasetSnapshot(
    isCompleted ? runId : null,
    { search: debouncedSearch, page: 1, limit: 1000 },
  );

  // Tự động kích hoạt lượt chạy đầu tiên nếu báo cáo chưa có bất kỳ lượt chạy nào trong DB
  useEffect(() => {
    let isMounted = true;
    const triggerInitialRun = async () => {
      try {
        const result = await runMutation.mutateAsync({
          definitionId,
          config: actualConfig,
        });
        if (isMounted && result?.runId) {
          setRunId(result.runId);
        }
      } catch {
        // Fallback: cho phép người dùng click "Chạy lại" thủ công
      }
    };

    if (
      !runId &&
      !isDefLoading &&
      reportDef &&
      (!(reportDef as any)?.runs || (reportDef as any).runs.length === 0)
    ) {
      triggerInitialRun();
    }

    return () => {
      isMounted = false;
    };
  }, [definitionId, isDefLoading, reportDef, runId, actualConfig, runMutation]);

  const handleRun = async () => {
    try {
      const result = await runMutation.mutateAsync({
        definitionId,
        config: actualConfig,
      });
      if (result?.runId) {
        setRunId(result.runId);
      }
    } catch {
      alert('Có lỗi xảy ra khi thực thi báo cáo.');
    }
  };

  const rows = useMemo(() => snapshot?.data || [], [snapshot]);

  // Danh sách các phòng ban phân biệt để làm bộ lọc
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r: any) => {
      if (r.departmentName) set.add(r.departmentName);
    });
    return Array.from(set);
  }, [rows]);

  // Bộ lọc đa chiều cho bảng dữ liệu
  const filteredRows = useMemo(() => {
    return rows.filter((r: any) => {
      // 1. Lọc theo Phòng ban
      if (filterDept !== 'ALL') {
        const dept = r.departmentName || r.department || '';
        if (dept !== filterDept) return false;
      }
      // 2. Lọc theo Xếp loại phê duyệt
      if (filterRank !== 'ALL') {
        const rank = r.approvedRank || r.ranking || '';
        if (!rank.includes(filterRank)) return false;
      }
      // 3. Lọc theo Kê khai Mẫu 04 (Nổi trội)
      if (filterMau04 !== 'ALL') {
        const has = String(r.hasMau04 || '').toLowerCase();
        if (filterMau04 === 'YES' && !has.includes('có')) return false;
        if (filterMau04 === 'NO' && has.includes('có')) return false;
      }
      // 4. Lọc theo Bước SOP
      if (activeSopStep !== 'ALL') {
        const step = String(r.sopStep || '');
        if (!step.includes(activeSopStep)) return false;
      }
      return true;
    });
  }, [rows, filterDept, filterRank, filterMau04, activeSopStep]);

  // Tính toán các chỉ số thống kê điều hành (Executive KPI Stats)
  const stats = useMemo(() => {
    const totalCadres = rows.length;
    if (totalCadres === 0) {
      return {
        totalCadres: 0,
        avgScore: 0,
        excellentCount: 0,
        excellentRatio: 0,
        deptCount: 0,
        mau04Count: 0,
      };
    }
    const sumScore = rows.reduce(
      (acc: number, r: any) => acc + Number(r.sTong || r.qualityScore || 0),
      0,
    );
    const avgScore = Math.round((sumScore / totalCadres) * 10) / 10;
    const excellentCount = rows.filter((r: any) => {
      const rank = r.approvedRank || r.ranking || '';
      return rank.includes('xuất sắc') || rank.includes('Xuất sắc');
    }).length;
    const excellentRatio = Math.round((excellentCount / totalCadres) * 1000) / 10;
    const deptCount = departmentsList.length || 5;
    const mau04Count = rows.filter((r: any) =>
      String(r.hasMau04 || '').includes('Có'),
    ).length;

    return {
      totalCadres,
      avgScore,
      excellentCount,
      excellentRatio,
      deptCount,
      mau04Count,
    };
  }, [rows, departmentsList]);

  // Schema thông minh: Tự động đối chiếu với các trường dữ liệu thực tế của rows
  const schema = useMemo(() => {
    const rowKeys =
      rows.length > 0 && typeof rows[0] === 'object'
        ? Object.keys(rows[0])
        : [];

    // 1. Cột do người dùng chủ động cấu hình
    if (
      actualConfig?.columns &&
      Array.isArray(actualConfig.columns) &&
      actualConfig.columns.length > 0
    ) {
      const cols = actualConfig.columns.map((c: any) => ({
        key: c.key || c.field,
        label: c.label || getFriendlyFieldLabel(c.key || c.field),
        type: c.type || 'string',
      }));
      if (rowKeys.length === 0 || cols.some((c: any) => rowKeys.includes(c.key))) {
        return cols;
      }
    }

    // 2. Schema trả về từ backend snapshot
    if (
      snapshot?.schema &&
      Array.isArray(snapshot.schema) &&
      snapshot.schema.length > 0
    ) {
      const hasMatch = snapshot.schema.some((col: any) =>
        rowKeys.includes(col.key),
      );
      if (rowKeys.length === 0 || hasMatch) {
        return snapshot.schema;
      }
    }

    // 3. Fallback: Trích xuất trực tiếp từ các trường của rows thực tế
    if (rowKeys.length > 0) {
      return rowKeys.map((k) => ({
        key: k,
        label: getFriendlyFieldLabel(k),
        type: typeof (rows[0] as any)[k] === 'number' ? 'number' : 'string',
      }));
    }

    return [];
  }, [snapshot, actualConfig, rows]);

  // Cấu hình biểu đồ
  const effectiveCharts = useMemo(() => {
    if (
      actualConfig?.charts &&
      Array.isArray(actualConfig.charts) &&
      actualConfig.charts.length > 0
    ) {
      return actualConfig.charts;
    }

    if (rows.length > 0 && typeof rows[0] === 'object') {
      const keys = Object.keys(rows[0]);
      const suggested: any[] = [];
      const categoryKey =
        keys.find((k) => ['departmentName', 'department', 'fullName'].includes(k)) || keys[0];
      const numKey =
        keys.find((k) => ['sTong', 'sNhiemVu', 'qualityScore', 'progress'].includes(k)) ||
        keys.find((k) => typeof (rows[0] as any)[k] === 'number');

      if (categoryKey) {
        suggested.push({
          title: `Điểm KPI theo ${getFriendlyFieldLabel(categoryKey)}`,
          type: 'bar',
          xAxis: categoryKey,
          yAxis: numKey || categoryKey,
        });
      }

      const statusKey = keys.find((k) =>
        ['approvedRank', 'ranking', 'status'].includes(k),
      );
      if (statusKey) {
        suggested.push({
          title: `Tỷ lệ phân bổ theo ${getFriendlyFieldLabel(statusKey)}`,
          type: 'pie',
          xAxis: statusKey,
          yAxis: numKey || statusKey,
        });
      }

      return suggested;
    }

    return [];
  }, [actualConfig?.charts, rows]);

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
    a.download = `Bao_cao_SOP_KPI_${definitionId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden min-w-0">
      {/* Top Header Bar */}
      <div className="shrink-0 z-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 sm:py-4 shadow-sm w-full min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 w-full min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 max-w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack ? onBack : () => router.push('/services/reports')}
              className="text-slate-600 border-slate-200 hover:bg-slate-100 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Quay lại
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                  TỈNH ỦY ĐẮK LẮK • BAN TỔ CHỨC TỈNH ỦY
                </span>
                <Badge variant="outline" className="text-xs bg-slate-50 shrink-0">
                  ID: #{definitionId}
                </Badge>
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] shrink-0 font-semibold">
                  Chuẩn SOP 4 Bước
                </Badge>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate mt-1">
                {reportName}
              </h1>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {reportDef?.description ||
                  'Khung Hướng dẫn 05-HD/TU & Quy định 348-QĐ/BTCTW • Đánh giá 05 Tập thể & 23 Cán bộ công chức'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto shrink-0 justify-start md:justify-end">
            {/* Nút xem Dự thảo Quyết định Mẫu 05 */}
            {isBtctuReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMau05Open(true)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 font-bold flex items-center gap-1.5 text-xs sm:text-sm shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                Dự thảo Quyết định (Mẫu 05)
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/services/reports/${definitionId}/design`)}
              className="text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <Settings2 className="w-4 h-4 text-slate-500" />
              Thiết kế lại
            </Button>
            {rows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Xuất CSV / Excel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleRun}
              disabled={runMutation.isPending || runStatus?.status === 'RUNNING'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 text-xs sm:text-sm"
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
      <div className="flex-1 min-h-0 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Executive KPI Stats Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">Cán bộ đánh giá</span>
              <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.totalCadres}
              </span>
              <span className="text-xs text-slate-400 font-normal">đồng chí</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3 h-3" /> 100% hoàn thành B1-B4
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">Điểm KPI TB Toàn cơ quan</span>
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {stats.avgScore}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ 100 điểm</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
              30đ Chung + 70đ Nhiệm vụ
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">Tỷ lệ Xuất sắc (Trần 20%)</span>
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-indigo-600">
                {stats.excellentRatio}%
              </span>
              <span className="text-xs text-slate-400 font-normal">({stats.excellentCount}/23 CB)</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1 truncate">
              <ShieldCheck className="w-3 h-3" /> Đạt chuẩn trần ≤ 20%
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">Tập thể Phòng ban</span>
              <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.deptCount}
              </span>
              <span className="text-xs text-slate-400 font-normal">đơn vị</span>
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1 truncate">
              3 Xuất sắc • 2 Tốt
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">Kê khai Nổi trội (Mẫu 04)</span>
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-purple-700">
                {stats.mau04Count}
              </span>
              <span className="text-xs text-slate-400 font-normal">hồ sơ</span>
            </div>
            <div className="text-[11px] text-purple-600 font-medium mt-1 truncate">
              100% người Xuất sắc có Mẫu 04
            </div>
          </div>
        </div>

        {/* Interactive SOP Workflow Stepper (Quy trình Thao tác Chuẩn 4 Bước) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 w-full min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <Scale className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Quy trình Đánh giá, Thẩm định & Ban hành Quyết định Chuẩn SOP (04 Bước)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Căn cứ: Hướng dẫn số 05-HD/TU của Ban Thường vụ Tỉnh ủy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
            {/* Bước 1 */}
            <div
              onClick={() => setActiveSopStep(activeSopStep === 'Bước 1' ? 'ALL' : 'Bước 1')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer min-w-0 flex flex-col justify-between ${
                activeSopStep === 'Bước 1'
                  ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>BƯỚC 1</span>
                  <span className="text-[11px] font-medium text-emerald-600">Trước ngày 15</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Công chức tự đánh giá
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Lập Mẫu 02 tự chấm điểm (Điểm chung 30đ + Điểm nhiệm vụ 70đ qua KPI) &amp; Mẫu 04 việc nổi trội.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                  23/23 Đã nộp
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Bước 2 */}
            <div
              onClick={() => setActiveSopStep(activeSopStep === 'Bước 2' ? 'ALL' : 'Bước 2')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer min-w-0 flex flex-col justify-between ${
                activeSopStep === 'Bước 2'
                  ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>BƯỚC 2</span>
                  <span className="text-[11px] font-medium text-emerald-600">Trước ngày 20</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Trưởng phòng thẩm định
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Họp phòng đánh giá cá nhân; Lập Bảng tổng hợp điểm Tập thể phòng (Mẫu 03).
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                  05/05 Đã duyệt
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Bước 3 */}
            <div
              onClick={() => setActiveSopStep(activeSopStep === 'Bước 3' ? 'ALL' : 'Bước 3')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer min-w-0 flex flex-col justify-between ${
                activeSopStep === 'Bước 3'
                  ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>BƯỚC 3</span>
                  <span className="text-[11px] font-medium text-indigo-600">Ngày 21 – 25</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Hội đồng Ban xét duyệt
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Áp ma trận trọng số $w_A..w_D$ & 8 nguồn CSDL; Siết trần ≤ 20% & Người đứng đầu.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold">
                  Siết trần 17.4%
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Bước 4 */}
            <div
              onClick={() => setActiveSopStep(activeSopStep === 'Bước 4' ? 'ALL' : 'Bước 4')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer min-w-0 flex flex-col justify-between ${
                activeSopStep === 'Bước 4'
                  ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>BƯỚC 4</span>
                  <span className="text-[11px] font-medium text-emerald-600">Trước ngày 28</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Ban hành Quyết định (Mẫu 05)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Lãnh đạo Ban ký Quyết định phê duyệt xếp loại; Công khai cơ quan & báo cáo BTVTU.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                  Đã ban hành QĐ
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Charts Visualization */}
        {isCompleted && effectiveCharts.length > 0 && (
          <div className="space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 min-w-0">
                <BarChart3 className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="truncate">Trực quan hóa Dữ liệu Thực tế</span>
              </h2>
              <span className="text-xs text-slate-400 shrink-0">
                Tự động tổng hợp từ {rows.length} bản ghi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
              {effectiveCharts.map((chart: any, cIdx: number) => {
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

                const effectiveType = chartModes[cIdx] || chart.type;

                return (
                  <div
                    key={cIdx}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden w-full min-w-0"
                  >
                    <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 gap-2 min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate pr-2 min-w-0 flex-1">
                        {chart.title || `Biểu đồ ${cIdx + 1}`}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {chart.type !== 'pie' && (
                          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
                            <button
                              type="button"
                              onClick={() =>
                                setChartModes((prev) => ({
                                  ...prev,
                                  [cIdx]: 'bar',
                                }))
                              }
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-all ${
                                effectiveType === 'bar'
                                  ? 'bg-white text-indigo-600 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title="Xem dạng biểu đồ Cột"
                            >
                              <BarChart3 className="w-3 h-3" />
                              Cột
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setChartModes((prev) => ({
                                  ...prev,
                                  [cIdx]: 'line',
                                }))
                              }
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-all ${
                                effectiveType === 'line'
                                  ? 'bg-white text-indigo-600 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title="Xem dạng biểu đồ Đường"
                            >
                              <TrendingUp className="w-3 h-3" />
                              Đường
                            </button>
                          </div>
                        )}
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700"
                        >
                          {effectiveType}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between min-h-[250px]">
                      {chartData.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                          <AlertCircle className="w-6 h-6 mb-1 text-slate-300" />
                          Không có dữ liệu cho các trường {chart.xAxis} /{' '}
                          {chart.yAxis}
                        </div>
                      ) : effectiveType === 'bar' ? (
                        /* Bar Chart */
                        <div className="flex-1 flex flex-col justify-end space-y-3 w-full min-w-0">
                          <div className="h-40 flex items-end justify-around gap-1 sm:gap-2 pt-6 pb-2 w-full min-w-0">
                            {chartData.map((item, i) => {
                              const heightPct = Math.max(
                                14,
                                Math.round((item.value / maxVal) * 100),
                              );
                              const color = PALETTE[i % PALETTE.length];
                              return (
                                <div
                                  key={i}
                                  className="flex-1 flex flex-col items-center h-full justify-end group/bar relative min-w-0 max-w-full"
                                >
                                  <span className="text-[10px] font-bold text-slate-700 mb-1 opacity-90 group-hover/bar:opacity-100 group-hover/bar:text-indigo-600 transition-all truncate max-w-full">
                                    {item.value.toLocaleString('vi-VN')}
                                  </span>
                                  <div
                                    className="w-full max-w-[36px] rounded-t-lg transition-all duration-500 ease-out shadow-xs group-hover/bar:brightness-110 cursor-pointer"
                                    style={{
                                      height: `${heightPct}%`,
                                      backgroundColor: color,
                                    }}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-around items-start gap-1 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium w-full min-w-0">
                            {chartData.map((item, i) => (
                              <div
                                key={i}
                                className="flex-1 text-center px-0.5 min-w-0 overflow-hidden"
                                title={item.label}
                              >
                                <div className="truncate text-slate-700 font-semibold">
                                  {item.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : effectiveType === 'line' ? (
                        /* Spline Area & Line Chart */
                        <div className="flex-1 flex flex-col justify-end space-y-2 pt-2 w-full min-w-0 overflow-hidden">
                          <div className="h-40 relative w-full flex min-w-0">
                            <div className="w-8 shrink-0 flex flex-col justify-between text-[10px] text-slate-400 font-medium text-right pr-1 select-none pb-2 pt-2">
                              <span>{maxVal.toLocaleString('vi-VN')}</span>
                              <span>{Math.round(maxVal * 0.5).toLocaleString('vi-VN')}</span>
                              <span>0</span>
                            </div>

                            <div className="flex-1 relative h-full min-w-0 overflow-hidden">
                              <div className="absolute inset-x-0 inset-y-0 pointer-events-none pb-2 pt-2 flex flex-col justify-between">
                                <div className="border-b border-dashed border-slate-100 w-full" />
                                <div className="border-b border-dashed border-slate-100 w-full" />
                                <div className="border-b border-slate-200 w-full" />
                              </div>

                              {(() => {
                                const n = chartData.length;
                                const pts = chartData.map((d, idx) => {
                                  const x =
                                    n > 1
                                      ? Math.round((idx / (n - 1)) * 90 + 5)
                                      : 50;
                                  const y =
                                    maxVal > 0
                                      ? Math.round(
                                          88 - (d.value / maxVal) * 70,
                                        )
                                      : 88;
                                  return { x, y, ...d };
                                });

                                let splineD = `M ${pts[0].x} ${pts[0].y}`;
                                for (let i = 0; i < pts.length - 1; i++) {
                                  const p0 = pts[i];
                                  const p1 = pts[i + 1];
                                  const cx = (p0.x + p1.x) / 2;
                                  splineD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                                }
                                const areaD = `${splineD} L ${pts[pts.length - 1].x} 88 L ${pts[0].x} 88 Z`;

                                return (
                                  <>
                                    <svg
                                      className="absolute inset-0 w-full h-full pointer-events-none"
                                      viewBox="0 0 100 100"
                                      preserveAspectRatio="none"
                                    >
                                      <path d={areaD} fill="#4f46e5" fillOpacity="0.15" />
                                      <path
                                        d={splineD}
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                      />
                                    </svg>
                                    {pts.map((p, idx) => (
                                      <div
                                        key={idx}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer z-10"
                                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                      >
                                        <div className="w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-xs" />
                                      </div>
                                    ))}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex justify-around items-start gap-1 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium w-full min-w-0">
                            {chartData.map((item, i) => (
                              <div key={i} className="flex-1 text-center px-0.5 min-w-0 overflow-hidden" title={item.label}>
                                <div className="truncate text-slate-700 font-semibold">{item.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Donut Chart */
                        <div className="flex-1 flex flex-col justify-center space-y-3 w-full min-w-0">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full min-w-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 relative shrink-0">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="5" />
                                {(() => {
                                  let acc = 0;
                                  return chartData.map((item, i) => {
                                    const pct = Math.round((item.value / totalVal) * 100);
                                    const strokeDasharray = `${pct} ${100 - pct}`;
                                    const strokeDashoffset = -acc;
                                    acc += pct;
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
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs font-bold text-slate-800">{totalVal}</span>
                                <span className="text-[9px] text-slate-400">Tổng</span>
                              </div>
                            </div>

                            <div className="w-full sm:flex-1 min-w-0 space-y-1 max-h-32 overflow-y-auto pr-1">
                              {chartData.map((item, i) => {
                                const color = PALETTE[i % PALETTE.length];
                                const pct = Math.round((item.value / totalVal) * 100);
                                return (
                                  <div key={i} className="flex items-center justify-between text-[11px] gap-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                      <span className="text-slate-600 truncate flex-1 min-w-0" title={item.label}>{item.label}</span>
                                    </div>
                                    <span className="font-bold text-slate-800 shrink-0 text-right">
                                      {item.value} <span className="text-slate-400 font-normal">({pct}%)</span>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
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

        {/* Snapshot Data Table with Multi-dimensional Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden w-full min-w-0">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-3.5 w-full min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <TableIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  Bảng Tổng hợp Đánh giá, Xếp loại Cán bộ & Tập thể (Mẫu 03 & Mẫu 05)
                </h3>
                <Badge variant="secondary" className="ml-2 bg-slate-100 shrink-0">
                  {filteredRows.length} / {rows.length} cán bộ
                </Badge>
              </div>

              {/* Ô tìm kiếm nhanh */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã CB, chức danh..."
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Thanh Bộ Lọc Nhanh Đa Chiều */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Bộ lọc:
              </span>

              {/* Lọc theo Phòng ban */}
              <select
                value={filterDept}
                onChange={(e) => {
                  setFilterDept(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-indigo-500"
              >
                <option value="ALL">Tất cả Phòng ban (5 đơn vị)</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Lọc theo Xếp loại phê duyệt */}
              <select
                value={filterRank}
                onChange={(e) => {
                  setFilterRank(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-indigo-500"
              >
                <option value="ALL">Tất cả Mức xếp loại</option>
                <option value="xuất sắc">Hoàn thành xuất sắc nhiệm vụ (≤ 20%)</option>
                <option value="tốt">Hoàn thành tốt nhiệm vụ</option>
                <option value="Hoàn thành nhiệm vụ">Hoàn thành nhiệm vụ</option>
                <option value="Không hoàn thành">Không hoàn thành nhiệm vụ</option>
              </select>

              {/* Lọc theo Kê khai Mẫu 04 */}
              <select
                value={filterMau04}
                onChange={(e) => {
                  setFilterMau04(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-indigo-500"
              >
                <option value="ALL">Tất cả Mẫu 04</option>
                <option value="YES">Có kê khai việc nổi trội</option>
                <option value="NO">Không kê khai nổi trội</option>
              </select>

              {/* Nút Xóa bộ lọc nếu đang áp dụng */}
              {(filterDept !== 'ALL' || filterRank !== 'ALL' || filterMau04 !== 'ALL' || activeSopStep !== 'ALL' || tableSearch !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterDept('ALL');
                    setFilterRank('ALL');
                    setFilterMau04('ALL');
                    setActiveSopStep('ALL');
                    setTableSearch('');
                    setPage(1);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 underline font-medium ml-1"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {isSnapshotLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              Đang trích xuất snapshot dữ liệu từ máy chủ...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Không tìm thấy dòng dữ liệu nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <>
              <div className="w-full min-w-0 overflow-x-auto">
                <table className="w-full min-w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 sm:px-4 w-12 text-center text-slate-400 shrink-0">
                        #
                      </th>
                      {schema.map((col: any) => (
                        <th
                          key={col.key}
                          className="py-3 px-3 sm:px-4 whitespace-nowrap"
                        >
                          {col.label || col.key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedRows.map((row: any, rIdx: number) => {
                      const isExcellent = String(row.approvedRank || '').includes('xuất sắc');
                      const isProposedExcellent = String(row.proposedRank || '').includes('xuất sắc');
                      const isCapped = isProposedExcellent && !isExcellent;

                      return (
                        <tr
                          key={rIdx}
                          className={`transition-colors hover:bg-slate-50/80 ${
                            isExcellent ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3 sm:px-4 text-center text-slate-400 font-mono">
                            {(page - 1) * pageSize + rIdx + 1}
                          </td>
                          {schema.map((col: any) => {
                            const val = row[col.key];
                            const strVal = val != null ? String(val) : '—';

                            return (
                              <td
                                key={col.key}
                                className="py-3 px-3 sm:px-4 max-w-[240px] truncate text-slate-700 min-w-0"
                                title={strVal}
                              >
                                {col.key === 'cadreCode' ? (
                                  <Badge variant="outline" className="font-mono text-[11px] font-semibold bg-slate-50">
                                    {strVal}
                                  </Badge>
                                ) : col.key === 'fullName' ? (
                                  <span className="font-bold text-slate-900 block truncate">
                                    {strVal}
                                  </span>
                                ) : col.key === 'departmentName' ? (
                                  <span className="font-medium text-slate-800 block truncate">
                                    {strVal}
                                  </span>
                                ) : col.key === 'jobTitle' ? (
                                  <span className="text-slate-600 block truncate" title={strVal}>
                                    {strVal}
                                  </span>
                                ) : col.key === 'sChung' ? (
                                  <span className="font-semibold text-slate-700">
                                    {val} <span className="text-[10px] text-slate-400 font-normal">/30</span>
                                  </span>
                                ) : col.key === 'sNhiemVu' ? (
                                  <span className="font-semibold text-slate-700">
                                    {val} <span className="text-[10px] text-slate-400 font-normal">/70</span>
                                  </span>
                                ) : col.key === 'sTong' ? (
                                  <span
                                    className={`font-black text-xs sm:text-sm ${
                                      Number(val) >= 90
                                        ? 'text-indigo-700'
                                        : Number(val) >= 70
                                          ? 'text-emerald-700'
                                          : 'text-amber-700'
                                    }`}
                                  >
                                    {val}
                                  </span>
                                ) : col.key === 'proposedRank' ? (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] font-medium ${
                                      strVal.includes('xuất sắc')
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {strVal}
                                  </Badge>
                                ) : col.key === 'approvedRank' ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] font-bold ${
                                        isExcellent
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : strVal.includes('tốt')
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                            : 'bg-amber-50 text-amber-700 border-amber-300'
                                      }`}
                                    >
                                      {strVal}
                                    </Badge>
                                    {isCapped && (
                                      <span
                                        className="text-[9px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300"
                                        title="Hạ từ Xuất sắc sang Tốt do áp trần 20% & thiếu Mẫu 04"
                                      >
                                        Hội đồng siết trần
                                      </span>
                                    )}
                                  </div>
                                ) : col.key === 'hasMau04' ? (
                                  strVal.includes('Có') ? (
                                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold">
                                      {strVal}
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-400 text-xs">Không</span>
                                  )
                                ) : col.key === 'sopStep' ? (
                                  <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 font-medium">
                                    {strVal}
                                  </Badge>
                                ) : col.key === 'status' ? (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] font-semibold ${getStatusBadgeCls(strVal)}`}
                                  >
                                    {strVal}
                                  </Badge>
                                ) : (
                                  <span className="truncate block max-w-full">{strVal}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50 w-full min-w-0">
                  <span className="text-center sm:text-left truncate">
                    Hiển thị {(page - 1) * pageSize + 1} -{' '}
                    {Math.min(page * pageSize, filteredRows.length)} trong tổng số{' '}
                    {filteredRows.length} cán bộ
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
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

      {/* Sheet / Drawer Dự Thảo Quyết Định Phê Duyệt Xếp Loại (Mẫu 05) */}
      <Sheet open={isMau05Open} onOpenChange={setIsMau05Open}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-4xl overflow-y-auto p-4 sm:p-8 bg-slate-100/90 min-w-0"
        >
          <SheetHeader className="border-b border-slate-200 pb-4 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <SheetTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Dự thảo Quyết định Phê duyệt Xếp loại Chất lượng (Mẫu 05)
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handlePrintMau05Decision}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  In Quyết định (Print / PDF)
                </Button>
              </div>
            </div>
            <SheetDescription className="text-xs text-slate-500">
              Văn bản hành chính Đảng ban hành kèm theo Hướng dẫn số 05-HD/TU ngày 20/02/2026 của Ban Thường vụ Tỉnh ủy
            </SheetDescription>
          </SheetHeader>

          {/* Trang giấy A4 mô phỏng chuẩn Thể thức Văn bản Đảng & Nghị định 30/2020 */}
          <div
            className="my-6 p-8 sm:p-14 bg-white text-black border border-slate-300 shadow-md max-w-3xl mx-auto rounded-none text-[13pt] leading-[1.4] select-text"
            style={{ fontFamily: "'Times New Roman', 'Tinos', 'Liberation Serif', serif" }}
          >
            {/* Header Thể thức Đảng */}
            <table className="w-full border-collapse mb-6" style={{ border: 'none' }}>
              <tbody>
                <tr>
                  <td className="w-[45%] align-top text-center p-0">
                    <p className="uppercase text-[12pt] text-black">TỈNH ỦY ĐẮK LẮK</p>
                    <p className="uppercase text-[12.5pt] font-bold text-black">BAN TỔ CHỨC TỈNH ỦY</p>
                    <div className="w-24 h-[1.5px] bg-black mx-auto mt-1" />
                    <p className="text-[12pt] text-black mt-1">Số 125-QĐ/BTCTU</p>
                  </td>
                  <td className="w-[55%] align-top text-center p-0">
                    <p className="uppercase font-bold text-[13pt] text-black">ĐẢNG CỘNG SẢN VIỆT NAM</p>
                    <div className="w-36 h-[1.5px] bg-black mx-auto mt-1" />
                    <p className="italic text-[13pt] text-black mt-1">
                      Buôn Ma Thuột, ngày 28 tháng 03 năm 2026
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tiêu đề Quyết định */}
            <div className="text-center my-6 space-y-2">
              <h2 className="text-[15pt] font-bold uppercase text-black tracking-wide">
                QUYẾT ĐỊNH
              </h2>
              <p className="font-bold text-[13pt] text-black max-w-xl mx-auto leading-normal">
                Về việc phê duyệt kết quả đánh giá, xếp loại chất lượng cán bộ, công chức và tập thể cơ quan Ban Tổ chức Tỉnh ủy Quý I năm 2026
              </p>
              <div className="w-20 h-[1px] bg-black mx-auto mt-2" />
            </div>

            {/* Căn cứ pháp lý */}
            <div className="space-y-1.5 italic text-[13pt] text-black text-justify leading-[1.4]">
              <p style={{ textIndent: '1.27cm' }}>- Căn cứ Quy định số 01-QĐ/BTCTU ngày 25/12/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk về chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy cơ quan;</p>
              <p style={{ textIndent: '1.27cm' }}>- Căn cứ Hướng dẫn số 05-HD/TU ngày 20/02/2026 của Ban Thường vụ Tỉnh ủy Đắk Lắk về đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức hằng quý và hằng năm;</p>
              <p style={{ textIndent: '1.27cm' }}>- Căn cứ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về quy chế kết nối, chia sẻ dữ liệu và kiểm tra nghiệp vụ Ngành Tổ chức xây dựng Đảng;</p>
              <p style={{ textIndent: '1.27cm' }}>- Căn cứ Biên bản cuộc họp của Hội đồng Thẩm định đánh giá xếp loại cơ quan Ban Tổ chức Tỉnh ủy ngày 25 tháng 03 năm 2026;</p>
              <p style={{ textIndent: '1.27cm' }}>- Xét đề nghị của Trưởng phòng Tổ chức cán bộ và Chánh Văn phòng Ban,</p>
            </div>

            {/* Nội dung các Điều */}
            <div className="space-y-4 pt-3 text-[13pt] text-black leading-[1.4]">
              <p className="text-center font-bold uppercase text-[13.5pt] tracking-wider my-3">
                BAN TỔ CHỨC TỈNH ỦY QUYẾT ĐỊNH:
              </p>

              <div>
                <p className="font-bold text-black text-justify" style={{ textIndent: '1.27cm' }}>
                  Điều 1. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với 05 tập thể phòng thuộc cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk:
                </p>
                <div className="mt-2 pl-8 space-y-1 text-black text-[13pt]">
                  <p>1. <strong>Tập thể Lãnh đạo Ban:</strong> Điểm KPI 98.5/100 • Xếp loại: <strong>Hoàn thành xuất sắc nhiệm vụ</strong>.</p>
                  <p>2. <strong>Phòng Tổ chức đảng, đảng viên:</strong> Điểm KPI 96.0/100 • Xếp loại: <strong>Hoàn thành xuất sắc nhiệm vụ</strong>.</p>
                  <p>3. <strong>Phòng Tổ chức cán bộ:</strong> Điểm KPI 95.5/100 • Xếp loại: <strong>Hoàn thành xuất sắc nhiệm vụ</strong>.</p>
                  <p>4. <strong>Phòng Bảo vệ chính trị nội bộ:</strong> Điểm KPI 88.5/100 • Xếp loại: <strong>Hoàn thành tốt nhiệm vụ</strong>.</p>
                  <p>5. <strong>Văn phòng Ban:</strong> Điểm KPI 87.0/100 • Xếp loại: <strong>Hoàn thành tốt nhiệm vụ</strong>.</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-black text-justify" style={{ textIndent: '1.27cm' }}>
                  Điều 2. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với 23 cán bộ, công chức cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk, cụ thể:
                </p>
                <div className="mt-2 pl-8 space-y-1.5 text-black text-[13pt]">
                  <p>
                    • <strong>1. Hoàn thành xuất sắc nhiệm vụ: 04 đồng chí</strong> (Tỷ lệ 17.4% tổng biên chế, bảo đảm đúng quy định khống chế trần không quá 20% theo Hướng dẫn 05-HD/TU; 100% có hồ sơ kê khai nhiệm vụ nổi trội Mẫu 04):
                  </p>
                  <ul className="list-disc pl-8 space-y-1 text-black">
                    <li>Đ/c Nguyễn Thượng Hải - Trưởng ban Tổ chức Tỉnh ủy (100.0 điểm)</li>
                    <li>Đ/c Lưu Vĩnh Hưng - Phó Trưởng ban Thường trực (98.0 điểm)</li>
                    <li>Đ/c Công chức 1 - Trưởng phòng Tổ chức đảng, đảng viên (97.0 điểm)</li>
                    <li>Đ/c Công chức 8 - Chuyên viên Quản lý Cán bộ & CSDL Mẫu 2C (99.5 điểm)</li>
                  </ul>

                  <p className="pt-1">
                    • <strong>2. Hoàn thành tốt nhiệm vụ: 18 đồng chí</strong> (Tỷ lệ 78.3% tổng biên chế, bao gồm các trường hợp đạt trên 90 điểm nhưng áp trần 20% theo quy định).
                  </p>
                  <p>
                    • <strong>3. Hoàn thành nhiệm vụ: 01 đồng chí</strong> (Tỷ lệ 4.3% tổng biên chế).
                  </p>
                  <p>
                    • <strong>4. Không hoàn thành nhiệm vụ: 0 đồng chí</strong> (0%).
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold text-black" style={{ textIndent: '1.27cm' }}>
                  Điều 3. Trách nhiệm thi hành:
                </p>
                <p className="text-justify text-black text-[13pt] mt-1" style={{ textIndent: '1.27cm' }}>
                  Văn phòng Ban, các phòng chuyên môn và các đồng chí có tên tại Điều 1, Điều 2 chịu trách nhiệm thi hành Quyết định này. Kết quả xếp loại là căn cứ bình xét thi đua khen thưởng và chi trả thu nhập tăng thêm theo quy định. Quyết định này có hiệu lực kể từ ngày ký.
                </p>
              </div>
            </div>

            {/* Chữ ký & Nơi nhận */}
            <table className="w-full border-collapse mt-8" style={{ border: 'none' }}>
              <tbody>
                <tr>
                  <td className="w-1/2 align-top text-left p-0">
                    <p className="font-bold italic text-[12pt] text-black">Nơi nhận:</p>
                    <div className="text-[11pt] leading-[1.35] text-black mt-1 space-y-0.5">
                      <p>- Thường trực Tỉnh ủy (để b/c);</p>
                      <p>- Lãnh đạo Ban;</p>
                      <p>- 05 Phòng chuyên môn;</p>
                      <p>- Lưu: VT, TC-CB.</p>
                    </div>
                  </td>
                  <td className="w-1/2 align-top text-center p-0">
                    <p className="uppercase font-bold text-[13pt] text-black">TRƯỞNG BAN</p>
                    <div className="my-6 relative flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-2 border-red-500/40 text-red-600 text-[10px] flex items-center justify-center text-center p-1 rotate-12 select-none uppercase font-bold">
                        Ban Tổ chức Tỉnh ủy Đắk Lắk
                      </div>
                    </div>
                    <p className="text-[13pt] font-bold text-black">Nguyễn Thượng Hải</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
