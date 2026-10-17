"use client";
import React, { useState, useEffect } from 'react';
import {
  useGetReportDefinitions,
  useGetReportDashboardStats,
} from '../../api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import dynamic from 'next/dynamic';

const ReportShareModal = dynamic(
  () => import('./ReportShareModal').then((m) => m.ReportShareModal),
  { ssr: false }
);
import { Input } from '../../../../components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../components/ui/tabs';
import { Badge } from '../../../../components/ui/badge';
import {
  BarChart3,
  PieChart,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  FileSpreadsheet,
  Activity,
  Share2,
  Play,
  Settings2,
  MoreHorizontal,
  ArrowLeft,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Award,
  ExternalLink,
  Briefcase,
  Landmark,
} from 'lucide-react';
import { EmbeddedReportWidget } from '../EmbeddedReportWidget';
import { BtcFinanceDashboardTab } from './BtcFinanceDashboardTab';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

import { ReportDefinition } from '../../types';

export const ReportWorkspace = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (
        tab &&
        [
          'all',
          'finance-mof',
          'btctu-kpi',
          'personal-workbench',
          'my-reports',
          'shared',
          'recent',
        ].includes(tab)
      ) {
        setSelectedTab(tab);
      }
    }
  }, []);
  const {
    data: reports,
    isLoading,
    refetch: refetchReports,
    isRefetching: isRefetchingReports,
  } = useGetReportDefinitions();
  const {
    data: stats,
    refetch: refetchStats,
    isRefetching: isRefetchingStats,
  } = useGetReportDashboardStats();

  const [sharingReport, setSharingReport] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const allReports = reports || [];
  const currentSharingReport = allReports.find((r) => r.id === sharingReport) || null;
  const filteredReports = allReports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const myReports = filteredReports;
  const sharedReports = filteredReports.filter(
    (r) =>
      r.organizationId != null ||
      r.code?.includes('BTCTU') ||
      r.code?.includes('DOC') ||
      r.configuration?.sharing?.scope === 'ALL_UNITS' ||
      r.configuration?.sharing?.scope === 'SPECIFIC_UNITS',
  );
  const recentReports = [...filteredReports].slice(0, 3);

  const handleRefreshAll = () => {
    refetchReports();
    refetchStats();
  };

  const renderReportGrid = (items: ReportDefinition[]) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
            ></div>
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 mb-5 rounded-full bg-indigo-50 flex items-center justify-center">
            <FileSpreadsheet className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Không có báo cáo nào
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại. Hãy tạo một báo
            cáo mới hoặc làm mới dữ liệu.
          </p>
          <Button
            onClick={() => router.push('/services/reports/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thiết kế Báo cáo ngay
          </Button>
        </div>
      );
    }

    return (
      <div
        className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1'
        }`}
      >
        {items.map((report) => (
          <Card
            key={report.id}
            className={`group overflow-hidden border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-indigo-300 bg-white ${
              viewMode === 'list'
                ? 'flex flex-row items-center'
                : 'flex flex-col'
            }`}
          >
            <CardHeader
              className={`pb-4 ${
                viewMode === 'list' ? 'flex-1 py-4' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-1 p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {report.name}
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-xs text-slate-500 line-clamp-2 min-h-[34px] wrap-break-word">
                      {report.description ||
                        'Báo cáo động trực quan, liên kết dữ liệu theo thời gian thực từ các phân hệ quản lý.'}
                    </CardDescription>
                  </div>
                </div>

                {viewMode === 'grid' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 -mr-2 text-slate-400 hover:text-slate-600"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => router.push(`/services/reports/${report.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2 text-indigo-600" /> Chạy
                        báo cáo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/services/reports/${report.id}/design`)
                        }
                      >
                        <Settings2 className="w-4 h-4 mr-2" /> Thiết kế lại
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSharingReport(report.id)}
                      >
                        <Share2 className="w-4 h-4 mr-2" /> Chia sẻ phân quyền
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {viewMode === 'grid' && (
                <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600 font-medium text-[11px]"
                  >
                    V{report.version || 1}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[11px]"
                  >
                    Dữ liệu thật
                  </Badge>
                  <span className="text-[11px] text-slate-400 ml-auto flex items-center">
                    {report.updatedAt
                      ? new Date(report.updatedAt).toLocaleDateString('vi-VN')
                      : 'Hôm nay'}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent
              className={`${
                viewMode === 'list'
                  ? 'py-4 pr-6 pl-0 w-auto'
                  : 'pt-0 pb-5 px-6'
              }`}
            >
              {viewMode === 'list' ? (
                <div className="flex items-center justify-end gap-2 w-72 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    title="Chia sẻ phân quyền"
                    onClick={() => setSharingReport(report.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    onClick={() =>
                      router.push(`/services/reports/${report.id}/design`)
                    }
                  >
                    Thiết kế
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                    onClick={() => router.push(`/services/reports/${report.id}`)}
                  >
                    <Play className="w-4 h-4 mr-1.5" /> Chạy báo cáo
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 mt-1">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white border-slate-200 hover:bg-slate-50 hover:text-indigo-600 text-slate-700 font-medium transition-colors text-xs"
                    size="sm"
                    onClick={() =>
                      router.push(`/services/reports/${report.id}/design`)
                    }
                  >
                    <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Thiết kế
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm font-medium transition-colors text-xs"
                    size="sm"
                    onClick={() => router.push(`/services/reports/${report.id}`)}
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Xem trước & Chạy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
      <div className="w-full flex-1 mx-auto p-6 lg:p-8 space-y-8">
        {/* Enterprise Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 text-slate-500 hover:text-slate-800"
              onClick={() => router.push('/hub')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về Hub điều khiển
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Trung tâm Phân tích & Báo cáo
              </h1>
            </div>
            <p className="text-slate-500 max-w-2xl text-xs sm:text-sm">
              Nền tảng BI (Business Intelligence) hợp nhất tỉnh Đắk Lắk. Tự định
              nghĩa cấu trúc dữ liệu, thiết kế biểu đồ động và phân tích số liệu
              thực tế từ các phân hệ chính quyền.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isRefetchingReports || isRefetchingStats ? 'animate-spin' : ''
                }`}
              />
              Làm mới
            </Button>
            <Button
              onClick={() => router.push('/services/reports/new')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo báo cáo mới
            </Button>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">
                    Tổng số báo cáo
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.totalReports ?? allReports.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400">
                <span>4 Báo cáo CSDL chuyên ngành</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">
                    Lượt chạy báo cáo
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.totalRuns ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400">
                <span>Tổng số lượt trích xuất dữ liệu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">
                    Đã chia sẻ (Shared)
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.totalShared ?? 1}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400">
                <span>Phân quyền theo phòng ban/cán bộ</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-indigo-100">
                    Trạng thái phân tích
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats?.processingRuns ?? 0} Đang chạy
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-indigo-100">
                <span>Hệ thống kết nối thời gian thực</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Workspace */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="px-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-3">
              <TabsList className="bg-slate-100/60 p-1 flex-wrap h-auto">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold"
                >
                  Tất cả báo cáo ({allReports.length})
                </TabsTrigger>
                <TabsTrigger
                  value="finance-mof"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold flex items-center gap-1.5 text-emerald-800 data-[state=active]:text-emerald-700 font-bold"
                >
                  <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                  Giám sát Tài chính (Bộ TC)
                </TabsTrigger>
                <TabsTrigger
                  value="btctu-kpi"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold flex items-center gap-1.5 text-blue-700 data-[state=active]:text-blue-600"
                >
                  <Award className="w-3.5 h-3.5" />
                  Dashboard Toàn tỉnh (BTCTU)
                </TabsTrigger>
                <TabsTrigger
                  value="personal-workbench"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold flex items-center gap-1.5 text-indigo-700 data-[state=active]:text-indigo-600"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Bàn làm việc Cá nhân (HRM)
                </TabsTrigger>
                <TabsTrigger
                  value="my-reports"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold"
                >
                  Của tôi ({myReports.length})
                </TabsTrigger>
                <TabsTrigger
                  value="shared"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold"
                >
                  Được chia sẻ ({sharedReports.length})
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold"
                >
                  Mở gần đây ({recentReports.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm báo cáo..."
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-md ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-slate-200'
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-md ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-slate-200'
                    }`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent
              value="all"
              className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {renderReportGrid(filteredReports)}
            </TabsContent>

            <TabsContent
              value="finance-mof"
              className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <BtcFinanceDashboardTab />
            </TabsContent>

            <TabsContent
              value="btctu-kpi"
              className="p-6 m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0"
            >
              {/* Provincial Executive Dashboard Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/80 border border-blue-200/80 p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-blue-700 text-white hover:bg-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium shadow-xs">
                        <Award className="w-3.5 h-3.5 mr-1" />
                        Ban Tổ chức Tỉnh ủy Đắk Lắk
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-800 bg-white/80 text-xs font-medium">
                        Mã thiết kế: REP_BTCTU_SOP_KPI (#12)
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs flex items-center gap-1 font-medium">
                        <Activity className="w-3 h-3 text-emerald-600" />
                        Chuẩn SOP Bước 4 (QĐ 39-QĐ/TU & HD 05-HD/TU)
                      </Badge>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Trung tâm Báo Cáo & Chỉ Số Điều Hành Toàn Tỉnh
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Phân hệ tổng hợp số liệu điều hành, đánh giá xếp loại thi đua cán bộ, giám sát tiến độ công việc và tỷ lệ hoàn thành nhiệm vụ theo chuẩn định lượng OKR/KPI Ban Tổ chức Tỉnh ủy. Khống chế áp trần tối đa 20% Hoàn thành xuất sắc nhiệm vụ.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Button
                      onClick={() => router.push('/services/reports/12')}
                      className="bg-blue-700 hover:bg-blue-800 text-white text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Xem toàn màn hình (#12)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/services/reports/12/design')}
                      className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Settings2 className="w-4 h-4 text-slate-500" />
                      Thiết kế & Tùy biến
                    </Button>
                  </div>
                </div>
              </div>

              {/* Provincial Executive Quick Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Tổng số Cán bộ theo dõi</span>
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">23</span>
                      <span className="text-xs text-slate-400 font-normal">cán bộ</span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" /> 05 phòng ban chuẩn QĐ 01
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Điểm KPI Trung bình cơ quan</span>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-600">91.8</span>
                      <span className="text-xs text-slate-400 font-normal">/ 100 điểm</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1 truncate">
                      Vượt mức trung bình chuẩn (≥85đ)
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Tỷ lệ Xuất sắc (Áp trần ≤20%)</span>
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-600">17.4%</span>
                      <span className="text-xs text-slate-400 font-normal">(4/23 cán bộ)</span>
                    </div>
                    <div className="text-[11px] text-amber-700 font-semibold mt-1 truncate">
                      Đạt chuẩn trần theo Hướng dẫn 05
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Tiến độ Quy trình SOP</span>
                      <Clock className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-indigo-600">100%</span>
                      <span className="text-xs text-slate-400 font-normal">Bước 4/4</span>
                    </div>
                    <div className="text-[11px] text-indigo-700 font-semibold mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" /> Đã ban hành QĐ chính thức
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Embedded Report Engine: 4 Charts for BTCTU SOP KPI */}
              <div className="w-full min-w-0">
                <EmbeddedReportWidget
                  reportIdOrCode="REP_BTCTU_SOP_KPI"
                  title="Biểu đồ Phân tích Đánh giá & Xếp loại Cán bộ (Ban Tổ chức Tỉnh ủy)"
                  description="Dữ liệu tổng hợp từ 23 cán bộ: Phân bổ xếp loại thi đua, tiến độ SOP 4 bước, điểm trung bình theo 5 phòng ban và xếp hạng năng suất cá nhân."
                  columns={2}
                  chartHeight={280}
                  showDetailLink={true}
                  allowToggleType={true}
                />
              </div>

              {/* Quick Navigation Cards to HRM & Services */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div
                  onClick={() => router.push('/services/hrm/employees')}
                  className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Hồ sơ Cán bộ & Vị trí việc làm (HRM)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Quản lý 22 VTVL định biên, phân công nhiệm vụ và thông tin lý lịch cán bộ 05 phòng ban.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => router.push('/services/hrm/work-plans/tasks/dashboard')}
                  className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      Dashboard Nhiệm vụ & Công việc
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Theo dõi tiến độ giao việc, rà soát văn bản chỉ đạo và nhật ký điều phối công tác.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => router.push('/services/reports/new')}
                  className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      Thiết kế Báo cáo Mới
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Tạo mẫu báo cáo tùy chỉnh với nguồn dữ liệu liên thông từ HRM, Văn bản, Cổng thông tin.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="personal-workbench"
              className="p-6 m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0"
            >
              {/* Personal Workbench Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-sky-50/80 border border-indigo-100 p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-medium shadow-xs">
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        Bàn làm việc Cá nhân HRM
                      </Badge>
                      <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-white/80 text-xs font-medium">
                        Mã thiết kế: REP_PERSONAL_WORKBENCH (#17)
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs flex items-center gap-1 font-medium">
                        <Activity className="w-3 h-3 text-emerald-600" />
                        Đồng bộ dữ liệu thời gian thực
                      </Badge>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Không gian Báo cáo & Thống kê Cá nhân
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Phân hệ dành riêng cho cán bộ, chuyên viên tự theo dõi tiến độ công việc, điểm số KPI cá nhân qua các tháng, tỷ lệ hoàn thành nhiệm vụ và mức độ phân bổ tải công việc giữa các phòng ban.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Button
                      onClick={() => router.push('/services/reports/17')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Xem toàn màn hình (#17)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/services/hrm/work-plans/tasks/dashboard')}
                      className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                      Dashboard Công việc HRM
                    </Button>
                  </div>
                </div>
              </div>

              {/* Personal Quick Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Điểm KPI Bình quân</span>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-600">91.5</span>
                      <span className="text-xs text-slate-400 font-normal">/ 100 điểm</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Xu hướng 6 tháng gần nhất
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Nhiệm vụ theo dõi</span>
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">17</span>
                      <span className="text-xs text-slate-400 font-normal">chỉ số / việc</span>
                    </div>
                    <div className="text-[11px] text-indigo-600 font-semibold mt-1 truncate">
                      Cân đối qua 5 phòng ban
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Tỷ lệ hoàn thành đúng hạn</span>
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-blue-600">88.2%</span>
                      <span className="text-xs text-slate-400 font-normal">(15/17 việc)</span>
                    </div>
                    <div className="text-[11px] text-blue-600 font-semibold mt-1 truncate">
                      Đạt chỉ tiêu tiến độ quy định
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Xếp loại Cá nhân dự kiến</span>
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-black text-amber-600">Xuất sắc</span>
                    </div>
                    <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Đạt chuẩn SOP Bước 4
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Embedded Report Engine: 4 Charts */}
              <div className="w-full min-w-0">
                <EmbeddedReportWidget
                  reportIdOrCode="REP_PERSONAL_WORKBENCH"
                  title="Biểu đồ Phân tích Năng lực & Tiến độ Cá nhân (Report Engine)"
                  description="Dữ liệu tổng hợp từ 17 chỉ số nghiệp vụ: Tiến độ 6 tháng gần nhất, cơ cấu trạng thái công việc và cân đối tải phòng ban."
                  columns={2}
                  chartHeight={270}
                  showDetailLink={true}
                  allowToggleType={true}
                />
              </div>

              {/* Quick Navigation Cards to HRM Workflows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div
                  onClick={() => router.push('/services/hrm/work-plans/tasks')}
                  className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      Nhiệm vụ & Tiến độ công việc
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Xem danh sách công việc được giao, cập nhật tiến độ, báo cáo vướng mắc và nhật ký giải quyết.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => router.push('/services/hrm/work-plans/tasks/dashboard')}
                  className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      Dashboard Nhiệm vụ HRM
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Chuyển sang Bàn làm việc công việc của HRM để quản lý trạng thái, xuất mẫu 05 và phân loại chi tiết.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => router.push('/services/hrm/work-plans/evaluation-forms')}
                  className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                      Phiếu Đánh giá & Xếp loại
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Xem các biểu mẫu đánh giá SOP định kỳ, tự chấm điểm KPI và gửi đề xuất khen thưởng Mẫu 04.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="my-reports"
              className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {renderReportGrid(myReports)}
            </TabsContent>

            <TabsContent
              value="shared"
              className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {renderReportGrid(sharedReports)}
            </TabsContent>

            <TabsContent
              value="recent"
              className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {renderReportGrid(recentReports)}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enterprise Report Share Modal */}
      {sharingReport !== null && (
        <ReportShareModal
          report={currentSharingReport}
          open={sharingReport !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSharingReport(null);
            }
          }}
        />
      )}
    </div>
  );
};
