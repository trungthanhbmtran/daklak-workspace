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
  Share2,
  Compass,
  Globe,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { ReportShareModal } from './ReportShareModal';
import { ReportEmbedModal } from './ReportEmbedModal';
import { DAKLAK_UNITS } from './designer/Canvas';

export const DAKLAK_DOMAINS = [
  { code: 'DANG', name: 'Khối Cơ quan Đảng Tỉnh ủy', shortName: 'Khối Đảng', description: 'Ban Tổ chức, Tuyên giáo, Dân vận, Kiểm tra, Nội chính, Văn phòng' },
  { code: 'SO_NGANH', name: 'Khối Sở, Ban, Ngành Tỉnh', shortName: 'Khối Sở Ngành', description: 'Sở KH&CN, Nội vụ, Tài chính, Kế hoạch & Đầu tư, Văn phòng UBND' },
  { code: 'DIA_PHUONG', name: 'Khối UBND Quận, Huyện, Thị xã', shortName: 'Khối Địa phương', description: 'TP. Buôn Ma Thuột, Thị xã Buôn Hồ, Huyện Krông Pắc, Ea H\'leo...' },
];

import {
  getFriendlyFieldLabel,
  getStatusBadgeCls,
  fixMojibake,
  getShortChartLabel,
} from '@/features/reports/utils/fieldHelpers';
import {
  getMau05DecisionData,
  printMau05Decision,
} from '@/features/reports/utils/mau05DecisionHelper';

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

  let effectiveXAxis = xAxis;
  if (xAxis === 'employeeName' && rows.some((r) => r.departmentName || r.organName)) {
    // Nếu xAxis là 'employeeName': Nếu có nhiều hơn 8 nhân sự, ưu tiên nhóm theo phòng ban để biểu đồ không bị dồn nén!
    const uniqueEmployees = new Set(rows.map((r) => r.employeeName || r.fullName).filter(Boolean));
    if (uniqueEmployees.size > 8) {
      effectiveXAxis = rows.some((r) => r.departmentName) ? 'departmentName' : 'organName';
    }
  }

  const groups: Record<string, { count: number; sum: number; values: number[] }> =
    {};

  for (const row of rows) {
    const rawX = row[effectiveXAxis] || row[xAxis];
    const key =
      rawX != null && rawX !== '' ? fixMojibake(String(rawX).trim()) : 'Chưa phân loại';
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

  // Nhận diện biểu đồ phân bổ thi đua / xếp loại / cơ cấu để ưu tiên lấy số lượng cán bộ
  const isDistribution =
    ['ranking', 'approvedRank', 'proposedRank', 'status', 'quarterYear', 'sopStep'].includes(xAxis) ||
    ['ranking', 'approvedRank', 'proposedRank', 'status', 'quarterYear', 'sopStep'].includes(effectiveXAxis) ||
    yAxis === 'count' ||
    yAxis === xAxis;

  const result: AggregatedItem[] = Object.entries(groups).map(([label, g]) => {
    let val = g.count;
    if (!isDistribution && g.values.length > 0) {
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

  // State phân quyền chia sẻ và lăng kính dữ liệu đa chiều
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [dataLensMode, setDataLensMode] = useState<'ALL' | 'DOMAIN' | 'UNIT'>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('DANG');
  const [selectedUnitScope, setSelectedUnitScope] = useState<string>('A15.05');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(tableSearch.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [tableSearch]);

  const { data: reportDef, isLoading: isDefLoading } = useGetReportDefinition(definitionId);

  // Bảo đảm actualConfig luôn là Object hợp lệ (giải mã chuỗi JSON nếu lưu trữ dạng string)
  const actualConfig = useMemo(() => {
    const raw = config || reportDef?.configuration;
    if (!raw) return null;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }, [config, reportDef?.configuration]);

  const reportName = reportDef?.name || 'Báo cáo Chi tiết';

  // Nhận diện báo cáo chuẩn SOP / Ban Tổ chức Tỉnh ủy
  const isBtctuReport = useMemo(() => {
    return (
      definitionId === 5 ||
      definitionId === 12 ||
      reportDef?.code?.includes('BTCTU') ||
      reportDef?.code?.includes('SOP') ||
      reportName.includes('Ban Tổ chức Tỉnh ủy') ||
      reportName.includes('SOP')
    );
  }, [definitionId, reportDef, reportName]);

  // Nhận diện Bàn làm việc Nhiệm vụ Cá nhân & Điều phối HRM
  const isPersonalWorkbench = useMemo(() => {
    return (
      definitionId === 17 ||
      reportDef?.code === 'REP_PERSONAL_WORKBENCH' ||
      reportDef?.code?.includes('PERSONAL') ||
      reportName.includes('Bàn làm việc') ||
      reportName.includes('Cá nhân')
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
  const isCompleted =
    latestStatus === 'SUCCEEDED' ||
    (reportDef as any)?.runs?.[0]?.status === 'SUCCEEDED';

  const { data: snapshot, isLoading: isSnapshotLoading } = useGetDatasetSnapshot(
    runId ? runId : null,
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

  const handleRun = async (overrideParams?: Record<string, any>) => {
    try {
      let runParams: Record<string, any> | undefined;
      if (overrideParams?.params) {
        runParams = overrideParams.params;
      } else if (dataLensMode === 'UNIT' && selectedUnitScope !== 'ALL') {
        runParams = { from_organ_id: selectedUnitScope, scope: 'UNIT' };
      } else if (dataLensMode === 'DOMAIN' && selectedDomain !== 'ALL_DOMAINS') {
        runParams = { group: selectedDomain, scope: 'DOMAIN' };
      } else {
        runParams = { scope: 'ALL' };
      }

      const result = await runMutation.mutateAsync({
        definitionId,
        config: actualConfig,
        params: runParams,
      });
      if (result?.runId) {
        setRunId(result.runId);
      }
    } catch {
      alert('Có lỗi xảy ra khi thực thi báo cáo.');
    }
  };

  const rows = useMemo(() => {
    let rawData = snapshot?.data;
    // Phòng thủ nếu data bị bọc lồng [ { schema, data: [...] } ]
    if (
      Array.isArray(rawData) &&
      rawData.length === 1 &&
      rawData[0] &&
      typeof rawData[0] === 'object' &&
      Array.isArray(rawData[0].data)
    ) {
      rawData = rawData[0].data;
    }
    const rawRows = Array.isArray(rawData)
      ? rawData
      : Array.isArray(snapshot)
      ? snapshot
      : [];
    if (!Array.isArray(rawRows)) return [];
    return rawRows.map((row: any) => {
      if (!row || typeof row !== 'object') return row;
      const cleanRow: any = {};
      for (const [k, v] of Object.entries(row)) {
        cleanRow[k] = typeof v === 'string' ? fixMojibake(v) : v;
      }
      return cleanRow;
    });
  }, [snapshot]);

  // Source of Truth duy nhất đồng bộ cho cả bản hiển thị (Sheet) và bản in (Print / PDF)
  const mau05Data = useMemo(() => getMau05DecisionData(rows), [rows]);

  // In / Xuất PDF quyết định Mẫu 05 chuẩn Thể thức Nghị định 30/2020 & Văn bản Đảng đồng bộ từ 1 nguồn duy nhất
  const handlePrintMau05Decision = () => {
    printMau05Decision(mau05Data);
  };

  // Danh sách các phòng ban phân biệt để làm bộ lọc
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r: any) => {
      const dept = r.departmentName || r.department || r.organName;
      if (dept) set.add(dept);
    });
    return Array.from(set);
  }, [rows]);

  // Bộ lọc đa chiều cho bảng dữ liệu bám sát 3 Lăng kính
  const filteredRows = useMemo(() => {
    return rows.filter((r: any) => {
      // 0. LỌC THEO LĂNG KÍNH (DATA LENS)
      if (dataLensMode === 'DOMAIN') {
        if (selectedDomain !== 'ALL_DOMAINS') {
          const uCode = String(r.from_organ_id || r.organ_id || r.unitCode || '').toLowerCase();
          const uName = String(r.organName || r.departmentName || '').toLowerCase();
          const uGroup = String(r.group || '').toLowerCase();

          if (selectedDomain === 'DANG') {
            const isDang = uCode.startsWith('a15') || uName.includes('đảng') || uName.includes('tỉnh ủy') || uGroup.includes('đảng');
            if (!isDang) return false;
          } else if (selectedDomain === 'SO_NGANH') {
            const isLocal = uName.includes('huyện') || uName.includes('thị xã') || uName.includes('buôn ma thuột') || uName.includes('tp.');
            const isSoNganh = (uCode.startsWith('h15') && !isLocal) || uName.includes('sở') || uGroup.includes('sở');
            if (!isSoNganh) return false;
          } else if (selectedDomain === 'DIA_PHUONG') {
            const isLocal = uName.includes('huyện') || uName.includes('thị xã') || uName.includes('buôn ma thuột') || uName.includes('tp.') || uGroup.includes('địa phương');
            if (!isLocal) return false;
          }
        }
      } else if (dataLensMode === 'UNIT') {
        if (selectedUnitScope !== 'ALL') {
          const u = selectedUnitScope.toLowerCase();
          const rowUnit = String(r.from_organ_id || r.organ_id || r.unitCode || r.departmentId || '').toLowerCase();
          const rowName = String(r.organName || r.departmentName || '').toLowerCase();
          if (!rowUnit.includes(u) && !rowName.includes(u)) {
            return false;
          }
        }
      }

      // 1. Lọc theo Phòng ban
      if (filterDept !== 'ALL') {
        const dept = r.departmentName || r.department || r.organName || '';
        if (dept !== filterDept) return false;
      }
      // 2. Lọc theo Xếp loại phê duyệt
      if (filterRank !== 'ALL') {
        const rank = String(r.approvedRank || r.ranking || '').toLowerCase();
        if (!rank.includes(filterRank.toLowerCase())) return false;
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
  }, [rows, dataLensMode, selectedDomain, selectedUnitScope, filterDept, filterRank, filterMau04, activeSopStep]);

  // Tính toán các chỉ số thống kê điều hành bám sát lăng kính đang chọn (Dynamic KPIs)
  const stats = useMemo(() => {
    const activeDataset = filteredRows;
    const totalCadres = activeDataset.length;
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
    const sumScore = activeDataset.reduce(
      (acc: number, r: any) => acc + Number(r.sTong || r.qualityScore || r.score || 0),
      0,
    );
    const avgScore = Math.round((sumScore / totalCadres) * 10) / 10;
    const excellentCount = activeDataset.filter((r: any) => {
      const rank = String(r.approvedRank || r.ranking || '').toLowerCase();
      return rank.includes('xuất sắc');
    }).length;
    const excellentRatio = Math.round((excellentCount / totalCadres) * 1000) / 10;

    const deptsInActive = new Set<string>();
    activeDataset.forEach((r: any) => {
      const dept = r.departmentName || r.department || r.organName;
      if (dept) deptsInActive.add(dept);
    });
    const deptCount = deptsInActive.size || (departmentsList.length > 0 ? departmentsList.length : 1);
    const mau04Count = activeDataset.filter((r: any) =>
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
  }, [filteredRows, rows, departmentsList]);

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

    // 3. Fallback: Trích xuất trực tiếp từ các trường của rows thực tế, loại trừ các metadata wrapper keys
    if (rowKeys.length > 0) {
      return rowKeys
        .filter((k) => !['schema', 'data', 'total', 'filteredTotal', 'page', 'limit'].includes(k))
        .map((k) => ({
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
                {isBtctuReport ? (
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                    TỈNH ỦY ĐẮK LẮK • BAN TỔ CHỨC TỈNH ỦY
                  </span>
                ) : (
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                    HỆ THỐNG QUẢN TRỊ ĐIỀU HÀNH TỈNH ĐẮK LẮK
                  </span>
                )}
                <Badge variant="outline" className="text-xs bg-slate-50 shrink-0">
                  ID: #{definitionId}
                </Badge>
                {isBtctuReport ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] shrink-0 font-semibold">
                    Chuẩn SOP 4 Bước
                  </Badge>
                ) : isPersonalWorkbench ? (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] shrink-0 font-semibold">
                    Bàn làm việc Cá nhân (HRM)
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[11px] shrink-0 font-semibold">
                    {reportDef?.code || 'Báo cáo Hệ thống'}
                  </Badge>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate mt-1">
                {reportName}
              </h1>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {reportDef?.description ||
                  (isBtctuReport
                    ? 'Khung Hướng dẫn 05-HD/TU & Quy định 348-QĐ/BTCTW • Đánh giá 05 Tập thể & 23 Cán bộ công chức'
                    : isPersonalWorkbench
                    ? 'Bàn làm việc cá nhân: Theo dõi chỉ số năng suất, xu hướng điểm KPI và tiến độ nhiệm vụ công việc'
                    : 'Báo cáo tổng hợp trích xuất số liệu phân tích thời gian thực')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full xl:w-auto shrink-0 justify-start xl:justify-end min-w-0">
            {/* Nút xem Dự thảo Quyết định Mẫu 05 */}
            {isBtctuReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMau05Open(true)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 font-bold flex items-center gap-1.5 text-xs shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="hidden md:inline">Dự thảo QĐ (Mẫu 05)</span>
                <span className="md:hidden">Mẫu 05</span>
              </Button>
            )}

            {/* Nút Chuyển nhanh tới Dashboard HRM */}
            {isPersonalWorkbench && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/services/hrm/work-plans/tasks/dashboard')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 font-bold flex items-center gap-1.5 text-xs shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="hidden md:inline">Dashboard Công việc HRM</span>
                <span className="md:hidden">Dashboard HRM</span>
              </Button>
            )}

            {/* Nút Phân quyền chia sẻ báo cáo cho các đơn vị */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
              title="Phân quyền chia sẻ báo cáo cho các đơn vị, cơ quan Đảng, Sở Ban Ngành"
            >
              <Share2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden lg:inline">Chia sẻ cho Đơn vị</span>
              <span className="lg:hidden">Chia sẻ</span>
            </Button>

            {/* Nút Nhúng Widget Báo cáo vào Dashboard Dịch vụ */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmbedModalOpen(true)}
              className="bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
              title="Lấy mã nhúng hoặc xem trước widget để tích hợp vào Dashboard các dịch vụ"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden lg:inline">Nhúng vào Dashboard</span>
              <span className="lg:hidden">Nhúng</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/services/reports/${definitionId}/design`)}
              className="text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-xs"
            >
              <Settings2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="hidden sm:inline">Thiết kế lại</span>
            </Button>
            {rows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-xs"
              >
                <Download className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Xuất CSV</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleRun}
              disabled={runMutation.isPending || runStatus?.status === 'RUNNING'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 text-xs"
            >
              <RefreshCw
                className={`w-4 h-4 shrink-0 ${
                  runMutation.isPending || runStatus?.status === 'RUNNING'
                    ? 'animate-spin'
                    : ''
                }`}
              />
              <span>{runMutation.isPending ? 'Đang gửi...' : 'Chạy lại'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* ────────────────── THANH ĐIỀU KHIỂN LĂNG KÍNH BÁO CÁO ĐA CHIỀU (MULTI-PERSPECTIVE DATA SLICER) ────────────────── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs w-full min-w-0 space-y-3">
          {/* Hàng 1: Chọn Chế độ Lăng Kính (Toàn tỉnh / Theo Lĩnh vực / Theo Đơn vị) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0 uppercase tracking-wide">
                <Compass className="w-4 h-4 text-indigo-600" />
                Lăng kính Số liệu:
              </span>

              <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setDataLensMode('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    dataLensMode === 'ALL'
                      ? 'bg-white shadow-xs text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  Toàn tỉnh (Toàn cảnh)
                </button>

                <button
                  type="button"
                  onClick={() => setDataLensMode('DOMAIN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    dataLensMode === 'DOMAIN'
                      ? 'bg-white shadow-xs text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Theo Khối / Lĩnh vực
                </button>

                <button
                  type="button"
                  onClick={() => setDataLensMode('UNIT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    dataLensMode === 'UNIT'
                      ? 'bg-white shadow-xs text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  Theo Đơn vị cụ thể
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500">
                Hiển thị: <strong className="text-indigo-700 font-bold">{filteredRows.length}</strong> / {rows.length} cán bộ
              </span>
            </div>
          </div>

          {/* Hàng 2: Bộ lọc tương ứng theo từng Lăng Kính */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
            {dataLensMode === 'ALL' && (
              <div className="flex items-center gap-2 text-slate-600">
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 py-1 px-2.5 font-normal">
                  🌐 Đang xem: Tổng hợp toàn bộ các sở, ban, ngành, cơ quan Đảng và UBND quận huyện trên địa bàn tỉnh Đắk Lắk.
                </Badge>
              </div>
            )}

            {dataLensMode === 'DOMAIN' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500">Chọn khối phụ trách:</span>
                <Button
                  type="button"
                  variant={selectedDomain === 'ALL_DOMAINS' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDomain('ALL_DOMAINS')}
                  className={`text-xs h-7 rounded-lg font-medium ${
                    selectedDomain === 'ALL_DOMAINS'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Tất cả các khối
                </Button>
                {DAKLAK_DOMAINS.map((domain) => (
                  <Button
                    key={domain.code}
                    type="button"
                    variant={selectedDomain === domain.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDomain(domain.code)}
                    className={`text-xs h-7 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      selectedDomain === domain.code
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {domain.name}
                    {selectedDomain === domain.code && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </Button>
                ))}
              </div>
            )}

            {dataLensMode === 'UNIT' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500">Chọn đơn vị:</span>
                <Button
                  type="button"
                  variant={selectedUnitScope === 'A15.05' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedUnitScope('A15.05')}
                  className={`text-xs h-7 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    selectedUnitScope === 'A15.05'
                      ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-300'
                      : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Ban Tổ chức Tỉnh ủy (A15.05)
                  {selectedUnitScope === 'A15.05' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </Button>

                <Button
                  type="button"
                  variant={selectedUnitScope === 'H15.20' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedUnitScope('H15.20')}
                  className={`text-xs h-7 rounded-lg font-medium ${
                    selectedUnitScope === 'H15.20'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Sở Khoa học và Công nghệ (H15.20)
                </Button>

                <Button
                  type="button"
                  variant={selectedUnitScope === 'H15.25' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedUnitScope('H15.25')}
                  className={`text-xs h-7 rounded-lg font-medium ${
                    selectedUnitScope === 'H15.25'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Văn phòng UBND Tỉnh (H15.25)
                </Button>

                <select
                  value={selectedUnitScope}
                  onChange={(e) => setSelectedUnitScope(e.target.value)}
                  className="text-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">-- Danh mục đơn vị khác --</option>
                  {DAKLAK_UNITS.map((unit) => (
                    <option key={unit.code} value={unit.code}>
                      [{unit.group}] {unit.name} ({unit.code})
                    </option>
                  ))}
                </select>

                {selectedUnitScope !== 'ALL' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUnitScope('ALL')}
                    className="text-[11px] h-7 px-2 text-rose-600 hover:bg-rose-50"
                  >
                    Xem tất cả đơn vị
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Executive KPI Stats Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">{isPersonalWorkbench ? 'Chỉ số & Nhiệm vụ cá nhân' : isBtctuReport ? 'Cán bộ đánh giá' : 'Tổng số bản ghi'}</span>
              <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.totalCadres}
              </span>
              <span className="text-xs text-slate-400 font-normal">{isPersonalWorkbench ? 'chỉ số / việc' : isBtctuReport ? 'đồng chí' : 'nhân sự'}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3 h-3" /> {isPersonalWorkbench ? 'Dữ liệu thời gian thực HRM' : isBtctuReport ? '100% hoàn thành B1-B4' : 'Dữ liệu thời gian thực'}
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">{isPersonalWorkbench ? 'Điểm KPI TB Cá nhân' : isBtctuReport ? 'Điểm KPI TB Toàn cơ quan' : 'Điểm đánh giá TB'}</span>
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {stats.avgScore}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ 100 điểm</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
              {isPersonalWorkbench ? 'Xu hướng 6 tháng & nhiệm vụ giao' : isBtctuReport ? '30đ Chung + 70đ Nhiệm vụ' : 'Thang điểm đánh giá 100'}
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">{isPersonalWorkbench ? 'Nhiệm vụ Hoàn thành' : isBtctuReport ? 'Tỷ lệ Xuất sắc (Trần 20%)' : 'Xếp loại Xuất sắc'}</span>
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-indigo-600">
                {isPersonalWorkbench ? stats.excellentCount : `${stats.excellentRatio}%`}
              </span>
              <span className="text-xs text-slate-400 font-normal">({stats.excellentCount}/{stats.totalCadres} {isPersonalWorkbench ? 'việc' : 'CB'})</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1 truncate">
              <ShieldCheck className="w-3 h-3" /> {isPersonalWorkbench ? `${stats.excellentCount} mục hoàn thành / xuất sắc` : isBtctuReport ? 'Đạt chuẩn trần ≤ 20%' : `${stats.excellentCount} nhân sự Xuất sắc`}
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="truncate">{isPersonalWorkbench ? 'Đơn vị công tác' : 'Tập thể Phòng ban'}</span>
              <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.deptCount}
              </span>
              <span className="text-xs text-slate-400 font-normal">đơn vị</span>
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1 truncate">
              {isPersonalWorkbench ? `${stats.deptCount} phòng ban theo dõi tải` : isBtctuReport ? '3 Xuất sắc • 2 Tốt' : `${stats.deptCount} phòng ban tham gia`}
            </div>
          </div>

          {isBtctuReport ? (
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
          ) : (
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span className="truncate">{isPersonalWorkbench ? 'Bàn làm việc Cá nhân' : 'Trạng thái Báo cáo'}</span>
                <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-600">
                  {isPersonalWorkbench ? 'Sẵn sàng' : 'Hoàn thành'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                {isPersonalWorkbench ? 'Đồng bộ HRM Task Dashboard' : `Phiên bản v${reportDef?.version || 1}`}
              </div>
            </div>
          )}
        </div>

        {/* Interactive SOP Workflow Stepper (Quy trình Thao tác Chuẩn 4 Bước) */}
        {isBtctuReport && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 w-full min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <Scale className="w-5 h-5 text-indigo-600 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Quy trình Đánh giá, Thẩm định &amp; Ban hành Quyết định Chuẩn SOP (04 Bước)
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
                    Áp ma trận trọng số $w_A..w_D$ &amp; 8 nguồn CSDL; Siết trần ≤ 20% &amp; Người đứng đầu.
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
                    Lãnh đạo Ban ký Quyết định phê duyệt xếp loại; Công khai cơ quan &amp; báo cáo BTVTU.
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
        )}

        {/* Dynamic Charts Visualization */}
        {(isCompleted || rows.length > 0) && effectiveCharts.length > 0 && (
          <div className="space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 min-w-0">
                <BarChart3 className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="truncate">Trực quan hóa Dữ liệu Thực tế</span>
              </h2>
              <span className="text-xs text-slate-400 shrink-0">
                Tự động tổng hợp từ {filteredRows.length} bản ghi
                {filteredRows.length !== rows.length && ` (trong tổng số ${rows.length})`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
              {effectiveCharts.map((chart: any, cIdx: number) => {
                const chartData = aggregateData(
                  filteredRows,
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
                      <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate pr-2 min-w-0 flex-1" title={fixMojibake(chart.title)}>
                        {fixMojibake(chart.title) || `Biểu đồ ${cIdx + 1}`}
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
                                <div className="truncate text-slate-700 font-semibold" title={item.label}>
                                  {getShortChartLabel(item.label)}
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
                                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer z-10 group/pt"
                                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                      >
                                        <span className="text-[10px] font-bold text-indigo-700 bg-white/95 px-1 py-0.2 rounded border border-indigo-100 shadow-xs mb-0.5 whitespace-nowrap">
                                          {p.value.toLocaleString('vi-VN')}
                                        </span>
                                        <div className="w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-xs group-hover/pt:scale-125 transition-transform" />
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
                                <div className="truncate text-slate-700 font-semibold" title={item.label}>
                                  {getShortChartLabel(item.label)}
                                </div>
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
                                      <span className="text-slate-600 truncate flex-1 min-w-0" title={item.label}>{fixMojibake(item.label)}</span>
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
                        <span>Trục X: {getFriendlyFieldLabel(chart.xAxis)}</span>
                        <span>Trục Y: {getFriendlyFieldLabel(chart.yAxis)}</span>
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
                  {isBtctuReport
                    ? 'Bảng Tổng hợp Đánh giá, Xếp loại Cán bộ & Tập thể (Mẫu 03 & Mẫu 05)'
                    : (reportDef?.name || 'Bảng Dữ liệu Chi tiết Báo cáo')}
                </h3>
                <Badge variant="secondary" className="ml-2 bg-slate-100 shrink-0">
                  {filteredRows.length} / {rows.length} {rows.length === 1 ? 'bản ghi' : 'cán bộ / bản ghi'}
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
                <option value="ALL">Tất cả Phòng ban ({departmentsList.length > 0 ? `${departmentsList.length} đơn vị` : 'Toàn bộ'})</option>
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
                <option value="xuất sắc">Hoàn thành xuất sắc{isBtctuReport ? ' (≤ 20%)' : ''}</option>
                <option value="tốt">Hoàn thành tốt</option>
                <option value="hoàn thành">Hoàn thành nhiệm vụ</option>
                <option value="chưa hoàn thành">Chưa hoàn thành / Không hoàn thành</option>
              </select>

              {/* Lọc theo Kê khai Mẫu 04 */}
              {(isBtctuReport || rows.some((r: any) => r.hasMau04 !== undefined)) && (
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
              )}

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
                                ) : col.key === 'fullName' || col.key === 'employeeName' ? (
                                  <span className="font-bold text-slate-900 block truncate">
                                    {strVal}
                                  </span>
                                ) : col.key === 'departmentName' || col.key === 'department' ? (
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
                                ) : col.key === 'sTong' || col.key === 'qualityScore' ? (
                                  <span
                                    className={`font-black text-xs sm:text-sm ${
                                      Number(val) >= 90
                                        ? 'text-indigo-700'
                                        : Number(val) >= 70
                                          ? 'text-emerald-700'
                                          : Number(val) >= 50
                                            ? 'text-amber-700'
                                            : 'text-rose-700'
                                    }`}
                                  >
                                    {val} {col.key === 'qualityScore' ? <span className="text-[10px] text-slate-400 font-normal">/100</span> : ''}
                                  </span>
                                ) : col.key === 'taskCount' || col.key === 'completedCount' ? (
                                  <span className="font-semibold text-slate-700">
                                    {val}
                                  </span>
                                ) : col.key === 'proposedRank' ? (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] font-medium ${
                                      strVal.toLowerCase().includes('xuất sắc')
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {strVal}
                                  </Badge>
                                ) : col.key === 'approvedRank' || col.key === 'ranking' ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] font-bold ${
                                        strVal.toLowerCase().includes('xuất sắc')
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : strVal.toLowerCase().includes('tốt')
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                            : strVal.toLowerCase().includes('chưa') || strVal.toLowerCase().includes('không')
                                              ? 'bg-rose-50 text-rose-700 border-rose-300'
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

          {/* Trang giấy A4 mô phỏng chuẩn Thể thức Văn bản Đảng & Nghị định 30/2020 - Đồng bộ 100% từ Source of Truth duy nhất */}
          <div
            className="my-6 p-8 sm:p-14 bg-white text-black border border-slate-300 shadow-md max-w-3xl mx-auto rounded-none text-[13pt] leading-[1.4] select-text"
            style={{ fontFamily: "'Times New Roman', 'Tinos', 'Liberation Serif', serif" }}
          >
            {/* Header Thể thức Đảng */}
            <table className="w-full border-collapse mb-6" style={{ border: 'none' }}>
              <tbody>
                <tr>
                  <td className="w-[45%] align-top text-center p-0">
                    <p className="uppercase text-[12pt] text-black">{mau05Data.agencyName}</p>
                    <p className="uppercase text-[12.5pt] font-bold text-black">{mau05Data.organizationName}</p>
                    <div className="w-24 h-[1.5px] bg-black mx-auto mt-1" />
                    <p className="text-[12pt] text-black mt-1">Số {mau05Data.decisionNumber}</p>
                  </td>
                  <td className="w-[55%] align-top text-center p-0">
                    <p className="uppercase font-bold text-[13pt] text-black">ĐẢNG CỘNG SẢN VIỆT NAM</p>
                    <div className="w-36 h-[1.5px] bg-black mx-auto mt-1" />
                    <p className="italic text-[13pt] text-black mt-1">
                      {mau05Data.decisionDate}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tiêu đề Quyết định */}
            <div className="text-center my-6 space-y-2">
              <h2 className="text-[15pt] font-bold uppercase text-black tracking-wide">
                {mau05Data.documentTitle}
              </h2>
              <p className="font-bold text-[13pt] text-black max-w-xl mx-auto leading-normal">
                {mau05Data.subTitle}
              </p>
              <div className="w-20 h-[1px] bg-black mx-auto mt-2" />
            </div>

            {/* Căn cứ pháp lý */}
            <div className="space-y-1.5 italic text-[13pt] text-black text-justify leading-[1.4]">
              {mau05Data.legalBases.map((base: string, idx: number) => (
                <p key={idx} style={{ textIndent: '1.27cm' }}>- {base}</p>
              ))}
            </div>

            {/* Nội dung các Điều */}
            <div className="space-y-4 pt-3 text-[13pt] text-black leading-[1.4]">
              <p className="text-center font-bold uppercase text-[13.5pt] tracking-wider my-3">
                {mau05Data.organizationName} QUYẾT ĐỊNH:
              </p>

              <div>
                <p className="font-bold text-black text-justify" style={{ textIndent: '1.27cm' }}>
                  Điều 1. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với 05 tập thể phòng thuộc cơ quan {mau05Data.organizationName} Đắk Lắk:
                </p>
                <div className="mt-2 pl-8 space-y-1 text-black text-[13pt]">
                  {mau05Data.collectives.map((c: any, idx: number) => (
                    <p key={idx}>
                      {idx + 1}. <strong>{c.name}:</strong> Điểm KPI {c.score.toFixed(1)}/100 • Xếp loại: <strong>{c.rank}</strong>.
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-black text-justify" style={{ textIndent: '1.27cm' }}>
                  Điều 2. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với {mau05Data.individuals.total} cán bộ, công chức cơ quan {mau05Data.organizationName} Đắk Lắk, cụ thể:
                </p>
                <div className="mt-2 pl-8 space-y-1.5 text-black text-[13pt]">
                  <p>
                    • <strong>1. Hoàn thành xuất sắc nhiệm vụ: 0{mau05Data.individuals.excellentCount} đồng chí</strong> (Tỷ lệ {mau05Data.individuals.excellentRatio} tổng biên chế, bảo đảm đúng quy định khống chế trần không quá 20% theo Hướng dẫn 05-HD/TU; 100% có hồ sơ kê khai nhiệm vụ nổi trội Mẫu 04):
                  </p>
                  <ul className="list-disc pl-8 space-y-1 text-black">
                    {mau05Data.individuals.excellentList.map((cadre: any, idx: number) => (
                      <li key={idx}>
                        Đ/c {cadre.name} - {cadre.title} ({cadre.score.toFixed(1)} điểm)
                      </li>
                    ))}
                  </ul>

                  <p className="pt-1">
                    • <strong>2. Hoàn thành tốt nhiệm vụ: {mau05Data.individuals.goodCount} đồng chí</strong> (Tỷ lệ {mau05Data.individuals.goodRatio} tổng biên chế, bao gồm các trường hợp đạt trên 90 điểm nhưng áp trần 20% theo quy định).
                  </p>
                  <p>
                    • <strong>3. Hoàn thành nhiệm vụ: 0{mau05Data.individuals.satisfactoryCount} đồng chí</strong> (Tỷ lệ {mau05Data.individuals.satisfactoryRatio} tổng biên chế).
                  </p>
                  <p>
                    • <strong>4. Không hoàn thành nhiệm vụ: 0{mau05Data.individuals.unsatisfactoryCount} đồng chí</strong> ({mau05Data.individuals.unsatisfactoryRatio}).
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
                      {mau05Data.recipients.map((r: string, idx: number) => (
                        <p key={idx}>{r}</p>
                      ))}
                    </div>
                  </td>
                  <td className="w-1/2 align-top text-center p-0">
                    <p className="uppercase font-bold text-[13pt] text-black">{mau05Data.signerTitle}</p>
                    <div className="my-6 relative flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-2 border-red-500/40 text-red-600 text-[10px] flex items-center justify-center text-center p-1 rotate-12 select-none uppercase font-bold">
                        Ban Tổ chức Tỉnh ủy Đắk Lắk
                      </div>
                    </div>
                    <p className="text-[13pt] font-bold text-black">{mau05Data.signerName}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal Phân quyền & Chia sẻ Báo cáo cho các đơn vị */}
      {reportDef && (
        <ReportShareModal
          report={reportDef}
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
        />
      )}

      {/* Modal Nhúng Báo Cáo vào Dashboard */}
      {reportDef && (
        <ReportEmbedModal
          open={isEmbedModalOpen}
          onOpenChange={setIsEmbedModalOpen}
          reportId={definitionId}
          reportCode={reportDef.code}
          reportName={reportDef.name}
          reportDescription={reportDef.description}
        />
      )}
    </div>
  );
};
