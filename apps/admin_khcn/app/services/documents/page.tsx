"use client";

import { 
  Inbox, Send, FileText, AlertTriangle, Clock, 
  CheckCircle2, TrendingUp, BarChart3, Activity, 
  ShieldAlert, Calendar, ArrowRight, CornerUpRight,
  MessageSquareShare, PieChart, ClipboardCheck, Settings2
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useDocuments } from "@/features/document/hooks/useDocuments";
import { useUser } from "@/hooks/useUser";

export default function DocumentDashboardPage() {
  const { useDocumentStats, useListDocuments } = useDocuments();
  const { user } = useUser();
  
  const { data: stats, isLoading: statsLoading } = useDocumentStats();
  const { data: pendingTasksData, isLoading: tasksLoading } = useListDocuments({
    status: 'PROCESSING',
    // signerId: user?.id, // Uncomment if backend supports filtering by current user
  });

  const summaryStats = stats || {
    incomingTotal: 0,
    incomingPending: 0,
    incomingLate: 0,
    outgoingTotal: 0,
    urgentTotal: 0,
  };

  const myPendingTasks = pendingTasksData?.data || [];

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Bảng Điều Hành Văn Bản
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng hợp tình hình luân chuyển và xử lý văn bản điện tử toàn cơ quan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-background shadow-sm">
            <BarChart3 className="h-4 w-4 mr-2" /> Báo cáo thống kê
          </Button>
          <Link href="/admin/services/documents/incoming">
            <Button className="shadow-sm">
              Vào sổ văn bản ngay <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. THỐNG KÊ NHANH (QUICK STATS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm hover:border-blue-200 transition-colors bg-background">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Văn bản Đến</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-foreground">{summaryStats.incomingTotal}</h3>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                  {summaryStats.incomingPending} đang xử lý
                </span>
              </div>
            </div>
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Inbox className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:border-emerald-200 transition-colors bg-background">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Văn bản Đi</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-foreground">{summaryStats.outgoingTotal}</h3>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> Đã ban hành
                </span>
              </div>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Send className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm border-rose-100 bg-rose-50/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-rose-800">Quá hạn xử lý</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-rose-600">{summaryStats.incomingLate}</h3>
                <span className="text-xs font-medium text-rose-600">văn bản</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm border-amber-100 bg-amber-50/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800">Khẩn / Hỏa tốc</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-amber-600">{summaryStats.urgentTotal}</h3>
                <span className="text-xs font-medium text-amber-700">cần ưu tiên</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. KHU VỰC CHI TIẾT THEO LUỒNG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: Danh sách việc cần làm của cá nhân (Chiếm 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Văn bản chờ TÔI xử lý
                  </CardTitle>
                  <CardDescription>Các văn bản Lãnh đạo giao đích danh hoặc đang chờ bạn trình duyệt.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {myPendingTasks.length} nhiệm vụ
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {myPendingTasks.map((task: any) => (
                  <div key={task.id} className="p-5 hover:bg-muted/30 transition-colors bg-background flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {(task.urgency === "URGENT" || task.urgency === "FLASH") && (
                          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300 shadow-none text-[10px] px-1.5 py-0">
                            {task.urgency === "FLASH" ? "HỎA TỐC" : "KHẨN"}
                          </Badge>
                        )}
                        <span className="font-mono text-xs font-bold text-muted-foreground">{task.documentNumber || task.arrivalNumber || 'N/A'}</span>
                      </div>
                      <h4 className="font-bold text-foreground text-sm leading-snug line-clamp-2">
                        {task.abstract}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Nguồn: {task.issuerName || 'Nội bộ'}
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 sm:min-w-[140px] p-3 sm:p-0 bg-muted/10 sm:bg-transparent rounded-lg border sm:border-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Hạn xử lý</p>
                        <p className="text-sm font-bold text-amber-600 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {task.processingDeadline ? new Date(task.processingDeadline).toLocaleDateString('vi-VN') : 'Không có'}
                        </p>
                      </div>
                      
                      {/* Nút Xử lý điều hướng sang Không gian xử lý PDF */}
                      <Link href={`/services/documents/processing/${task.id}`} className="w-full sm:w-auto">
                        <Button size="sm" className="h-8 text-xs w-full shadow-sm">
                          Xử lý ngay <CornerUpRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t bg-muted/10 text-center">
                <Link href="/services/documents/processing">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                    Xem tất cả văn bản chờ xử lý <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* QUICK NAV: Các dịch vụ bổ sung */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/services/documents/consultations">
              <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer bg-background border shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <MessageSquareShare className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Lấy ý kiến</h5>
                    <p className="text-[10px] text-muted-foreground italic">Góp ý dự thảo</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link href="/services/documents/transparency">
              <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer bg-background border shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Công khai</h5>
                    <p className="text-[10px] text-muted-foreground italic">Minh bạch tài chính</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/services/documents/minutes">
              <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer bg-background border shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Biên bản họp</h5>
                    <p className="text-[10px] text-muted-foreground italic">Ghi chép hội nghị</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* CỘT PHẢI: Giám sát toàn hệ thống (Chiếm 1/3) */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/10 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tỷ lệ đúng hạn theo Phòng ban
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">Phòng Kế hoạch - Tài chính</span>
                  <span className="text-emerald-600">95%</span>
                </div>
                <Progress value={95} className="h-2 bg-muted overflow-hidden" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">Phòng Quản lý Khoa học</span>
                  <span className="text-blue-600">82%</span>
                </div>
                <Progress value={82} className="h-2 bg-muted overflow-hidden" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">Văn phòng Sở</span>
                  <span className="text-amber-600">60% (Cảnh báo trễ)</span>
                </div>
                <Progress value={60} className="h-2 bg-muted overflow-hidden" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/10 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Trạng thái Trục Liên thông
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-800">Trục Quốc gia (VDX)</span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 shadow-none border-emerald-200">Đã kết nối</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium text-blue-800">LGSP Tỉnh Đắk Lắk</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 shadow-none border-blue-200">Ổn định</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/services/documents/categories">
             <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-primary">
                <Settings2 className="h-4 w-4 mr-2" /> Thiết lập Danh mục chung
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
