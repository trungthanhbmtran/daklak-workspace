"use client";
import React, { useState } from 'react';
import {
  useGetReportDefinitions,
  useAssignReport,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
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
} from 'lucide-react';
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
  const assignMutation = useAssignReport();

  const [sharingReport, setSharingReport] = useState<number | null>(null);
  const [assigneeType, setAssigneeType] = useState('UNIT');
  const [assigneeId, setAssigneeId] = useState('2');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const allReports = reports || [];
  const filteredReports = allReports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const myReports = filteredReports.filter(
    (r) => !r.ownerId || r.code?.startsWith('REP_'),
  );
  const sharedReports = filteredReports.filter(
    (r) => r.id === 1 || r.id === 2 || r.code === 'REP_HRM_TASKS',
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
                    <CardDescription className="mt-1.5 text-xs text-slate-500 line-clamp-2 min-h-[34px] break-words">
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
                <div className="flex items-center justify-end gap-3 w-64 shrink-0">
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
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Trung tâm Phân tích & Báo cáo
              </h1>
            </div>
            <p className="text-slate-500 max-w-2xl text-sm lg:text-base">
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
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-3">
              <TabsList className="bg-slate-100/60 p-1">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold"
                >
                  Tất cả báo cáo ({allReports.length})
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

      {/* Share Dialog */}
      <Dialog
        open={sharingReport !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSharingReport(null);
            setAssigneeId('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Share2 className="w-5 h-5 text-indigo-600" />
              Chia sẻ Báo cáo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <Label
                htmlFor="assigneeType"
                className="text-slate-700 font-medium"
              >
                Đối tượng chia sẻ
              </Label>
              <Select value={assigneeType} onValueChange={setAssigneeType}>
                <SelectTrigger id="assigneeType" className="w-full">
                  <SelectValue placeholder="Chọn loại đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNIT">Đơn vị (Phòng ban/Tổ chức)</SelectItem>
                  <SelectItem value="USER">Cá nhân (Cán bộ nhân sự)</SelectItem>
                  <SelectItem value="ROLE">Vai trò (Role/Nhóm quyền)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigneeId" className="text-slate-700 font-medium">
                Mã phòng ban / Cán bộ (ID)
              </Label>
              <Input
                id="assigneeId"
                placeholder="Ví dụ: 2 (Phòng QL Khoa học) hoặc NV_001..."
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <div className="mt-0.5 text-blue-600">
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Người dùng/Đơn vị được chia sẻ sẽ có quyền{' '}
                <strong>Xem (View)</strong> báo cáo này. Họ có thể xem snapshot và
                kết quả phân tích nhưng không thể xóa thiết kế gốc.
              </p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 sm:justify-between">
            <Button
              variant="outline"
              className="border-slate-200"
              onClick={() => {
                setSharingReport(null);
                setAssigneeId('');
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              disabled={assignMutation.isPending || !assigneeId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={async () => {
                if (!sharingReport) return;
                try {
                  await assignMutation.mutateAsync({
                    templateId: sharingReport,
                    assigneeType,
                    assigneeId,
                    permissions: 'VIEW',
                  });
                  alert('Chia sẻ báo cáo thành công!');
                  setSharingReport(null);
                  setAssigneeId('');
                } catch {
                  alert('Có lỗi xảy ra khi gán báo cáo.');
                }
              }}
            >
              {assignMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Chia sẻ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
