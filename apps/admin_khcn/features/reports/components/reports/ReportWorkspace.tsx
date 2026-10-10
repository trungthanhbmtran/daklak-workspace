"use client";
import React, { useState } from 'react';
import { useGetReportDefinitions, useCreateReportDefinition, useAssignReport, useGetReportDashboardStats } from '../../api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Badge } from '../../../../components/ui/badge';
import { BarChart3, PieChart, Plus, Search, Filter, LayoutGrid, List, FileSpreadsheet, Activity, Share2, Play, Settings2, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

import { ReportDesigner } from './designer/ReportDesigner';
import { ReportViewer } from './ReportViewer';
import { ReportConfigAST } from '../../types';

export const ReportWorkspace = () => {
  const router = useRouter();
  const { data: reports, isLoading } = useGetReportDefinitions();
  const { data: stats } = useGetReportDashboardStats();
  const createMutation = useCreateReportDefinition();
  const assignMutation = useAssignReport();
  
  const [isDesigning, setIsDesigning] = useState(false);
  const [viewingReport, setViewingReport] = useState<{ id: number, config: any } | null>(null);
  const [sharingReport, setSharingReport] = useState<number | null>(null);
  const [assigneeType, setAssigneeType] = useState('USER');
  const [assigneeId, setAssigneeId] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveConfig = async (config: ReportConfigAST) => {
    await createMutation.mutateAsync({
      name: 'Báo cáo mới ' + new Date().getTime(),
      configuration: config,
    });
    setIsDesigning(false);
  };

  const filteredReports = reports?.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  if (isDesigning) {
    return (
      <ReportDesigner
        onSave={handleSaveConfig}
        onCancel={() => setIsDesigning(false)}
      />
    );
  }

  if (viewingReport) {
    return (
      <ReportViewer
        definitionId={viewingReport.id}
        config={viewingReport.config}
        onBack={() => setViewingReport(null)}
      />
    );
  }

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
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Trung tâm Phân tích & Báo cáo</h1>
            </div>
            <p className="text-slate-500 max-w-2xl text-sm lg:text-base">
              Nền tảng BI (Business Intelligence) hợp nhất. Tự định nghĩa cấu trúc dữ liệu, thiết kế biểu đồ động và chia sẻ phân tích một cách linh hoạt.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" className="hidden sm:flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200">
              <Settings2 className="w-4 h-4" />
              Cấu hình chung
            </Button>
            <Button
              onClick={() => setIsDesigning(true)}
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
                  <p className="text-sm font-medium text-slate-500">Tổng số báo cáo</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalReports ?? reports?.length ?? 0}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-400">Dữ liệu thực tế từ hệ thống</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">Lượt chạy báo cáo</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalRuns ?? 0}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-400">Tổng số lượt truy xuất dữ liệu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">Đã chia sẻ (Shared)</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalShared ?? 0}</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-400">Tổng số phân quyền đã cấp</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-indigo-100">Báo cáo đang phân tích</p>
                  <p className="text-3xl font-bold text-white">{stats?.processingRuns ?? 0}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-indigo-100">Hệ thống đang chạy nền (Queue)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Workspace */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-3">
              <TabsList className="bg-slate-100/50 p-1">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Tất cả báo cáo</TabsTrigger>
                <TabsTrigger value="my-reports" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Của tôi</TabsTrigger>
                <TabsTrigger value="shared" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Được chia sẻ</TabsTrigger>
                <TabsTrigger value="recent" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Mở gần đây</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Tìm kiếm báo cáo..." 
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0 border-slate-200">
                  <Filter className="w-4 h-4 text-slate-600" />
                </Button>
                <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="all" className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-56 rounded-xl bg-slate-100 animate-pulse border border-slate-200"></div>
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                    <FileSpreadsheet className="w-12 h-12 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có dữ liệu báo cáo</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Không tìm thấy báo cáo nào phù hợp với bộ lọc hiện tại. Hãy tạo một báo cáo mới để bắt đầu phân tích dữ liệu.
                  </p>
                  <Button
                    onClick={() => setIsDesigning(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thiết kế Báo cáo ngay
                  </Button>
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredReports.map((report: any) => (
                    <Card key={report.id} className={`group overflow-hidden border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-indigo-200 bg-white ${viewMode === 'list' ? 'flex flex-row items-center' : 'flex flex-col'}`}>
                      <CardHeader className={`pb-4 ${viewMode === 'list' ? 'flex-1 py-4' : ''}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                              <PieChart className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {report.name}
                              </CardTitle>
                              <CardDescription className="mt-1.5 text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                                {report.description || 'Báo cáo cấu hình động, cho phép tự định nghĩa biểu đồ và truy xuất nguồn dữ liệu tuỳ chọn.'}
                              </CardDescription>
                            </div>
                          </div>
                          {viewMode === 'grid' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0 -mr-2 text-slate-400 hover:text-slate-600">
                                  <MoreHorizontal className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setViewingReport({ id: report.id, config: report.configuration })}>
                                  <Play className="w-4 h-4 mr-2 text-indigo-600" /> Chạy báo cáo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDesigning(true)}>
                                  <Settings2 className="w-4 h-4 mr-2" /> Cấu hình lại
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSharingReport(report.id)}>
                                  <Share2 className="w-4 h-4 mr-2" /> Chia sẻ phân quyền
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {viewMode === 'grid' && (
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium hover:bg-slate-200">Phiên bản V{report.version || 1}</Badge>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">Hoạt động</Badge>
                            <span className="text-xs text-slate-400 ml-auto flex items-center">
                              {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                            </span>
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent className={`${viewMode === 'list' ? 'py-4 pr-6 pl-0 w-auto' : 'pt-0 pb-5 px-6'}`}>
                        {viewMode === 'list' ? (
                          <div className="flex items-center justify-end gap-3 w-64 shrink-0">
                            <div className="flex -space-x-2 mr-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700">
                                {report.name ? report.name.charAt(0).toUpperCase() : 'R'}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700" onClick={() => setIsDesigning(true)}>Thiết kế</Button>
                            <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => setViewingReport({ id: report.id, config: report.configuration })}>
                              <Play className="w-4 h-4 mr-1.5" /> Chạy
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-3 mt-1">
                            <Button variant="outline" className="flex-1 bg-white border-slate-200 hover:bg-slate-50 hover:text-indigo-600 text-slate-700 font-medium transition-colors" size="sm" onClick={() => setIsDesigning(true)}>
                              <Settings2 className="w-4 h-4 mr-2" /> Thiết kế
                            </Button>
                            <Button variant="default" className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm font-medium transition-colors" size="sm" onClick={() => setViewingReport({ id: report.id, config: report.configuration })}>
                              <Play className="w-4 h-4 mr-1.5" /> Chạy báo cáo
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Empty states for other tabs */}
            {['my-reports', 'shared', 'recent'].map(tab => (
              <TabsContent key={tab} value={tab} className="p-12 text-center text-slate-500 m-0">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>Mục này chưa có dữ liệu hiển thị.</p>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={sharingReport !== null} onOpenChange={(open) => {
        if (!open) {
          setSharingReport(null);
          setAssigneeId('');
        }
      }}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Share2 className="w-5 h-5 text-indigo-600" />
              Chia sẻ Báo cáo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="assigneeType" className="text-slate-700 font-medium">Đối tượng chia sẻ</Label>
              <Select value={assigneeType} onValueChange={setAssigneeType}>
                <SelectTrigger id="assigneeType" className="w-full">
                  <SelectValue placeholder="Chọn loại đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Cá nhân (Người dùng)</SelectItem>
                  <SelectItem value="UNIT">Đơn vị (Phòng ban/Tổ chức)</SelectItem>
                  <SelectItem value="ROLE">Vai trò (Role/Nhóm quyền)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigneeId" className="text-slate-700 font-medium">Mã định danh (ID)</Label>
              <Input
                id="assigneeId"
                placeholder="Ví dụ: USER-123 hoặc UNIT-HR..."
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <div className="mt-0.5 text-blue-600"><Activity className="w-4 h-4" /></div>
              <p className="text-sm text-blue-800 leading-relaxed">
                Người dùng/Đơn vị được chia sẻ sẽ có quyền <strong>Xem (View)</strong> báo cáo này. Họ không thể chỉnh sửa thiết kế gốc.
              </p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 sm:justify-between">
            <Button variant="outline" className="border-slate-200" onClick={() => {
              setSharingReport(null);
              setAssigneeId('');
            }}>
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
                    permissions: 'VIEW'
                  });
                  alert('Gán báo cáo thành công!');
                  setSharingReport(null);
                  setAssigneeId('');
                } catch(err) {
                  alert('Có lỗi xảy ra khi gán báo cáo.');
                }
              }}
            >
              {assignMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : 'Xác nhận Chia sẻ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
