"use client";

import React, { useCallback, useState, useMemo } from "react";
import {
  Plus, Filter,
  Clock, CheckCircle2, Eye, AlertCircle,
  Building2, ChevronRight, Activity,
  RotateCcw, ListFilter, LayoutGrid, Calendar
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConsultationCreateModal } from "@/features/document/components/ConsultationCreateModal";
import { useListConsultations } from "@/features/document/hooks/useDocuments";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// ─── ConsultationRow — memoized ───────────────────────────────────────────────

interface ConsultationRowProps {
  item: any;
  stats: { total: number };
}

const ConsultationRow = React.memo(function ConsultationRow({ item, stats }: ConsultationRowProps) {
  const progressPercent = item.totalUnits > 0
    ? Math.round((item.totalResponses / item.totalUnits) * 100)
    : 0;
  const isClosed = item.status === "CLOSED";
  const isUrgent = item.isUrgent && !isClosed;

  return (
    <TableRow className="hover:bg-muted/10 transition-all group">
      {/* Title */}
      <TableCell className="px-8 py-6">
        <p className="font-black text-foreground text-base leading-snug group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
          {item.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="outline" className="font-mono text-[9px] h-5 rounded-md border-muted-foreground/20">
            ID: {item.id.split("-")[0].toUpperCase()}
          </Badge>
          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            PHÁT HÀNH: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </TableCell>

      {/* Deadline */}
      <TableCell className="px-6 py-6">
        <span className={cn(
          "font-mono font-black text-sm px-3 py-1.5 rounded-xl w-fit border",
          isUrgent ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-muted/50 text-foreground border-transparent",
        )}>
          {new Date(item.deadline).toLocaleDateString("vi-VN")}
        </span>
        {isUrgent && (
          <div className="flex items-center gap-1 text-[10px] font-black text-rose-600 animate-pulse uppercase tracking-tight mt-1">
            <AlertCircle className="h-3 w-3" /> Hỏa tốc ưu tiên
          </div>
        )}
      </TableCell>

      {/* Progress */}
      <TableCell className="px-6 py-6">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-tighter">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              {item.totalResponses}/{item.totalUnits} ĐƠN Vị ĐÃ PHẢN HỒI
            </span>
            <span className={cn("font-black text-sm", progressPercent === 100 ? "text-emerald-600" : "text-primary")}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden shadow-inner border border-muted/50">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-out shadow-lg",
                progressPercent === 100 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary shadow-primary/20",
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </TableCell>

      {/* Status badge */}
      <TableCell className="px-6 py-6 text-center">
        {!isClosed ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-wider shadow-sm">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" /> Đang lấy ý kiến
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-wider shadow-sm opacity-80">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn tất
          </div>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/services/documents/consultations/${item.id}`}>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20">
                    <Eye className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="rounded-xl font-bold bg-foreground text-background">Xem chi tiết</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Link href={`/services/documents/consultations/${item.id}`}>
            <Button size="sm" className="h-11 px-5 rounded-2xl font-black text-[11px] bg-background text-foreground border-2 border-muted-foreground/10 hover:bg-muted/10 shadow-sm">
              QUẢN LÝ <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
});


export function ConsultationManageClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const router = useRouter();
  const pathname = usePathname();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: consultationsData, isLoading } = useListConsultations({
    search: searchTerm,
    status: statusFilter === "ALL" ? "" : statusFilter,
  });

  const consultations = useMemo(() => consultationsData?.data ?? [], [consultationsData]);

  const stats = useMemo(() => {
    const total = consultations.length;
    const active = consultations.filter((c: any) => c.status === "OPEN").length;
    const closed = consultations.filter((c: any) => c.status === "CLOSED").length;
    const urgent = consultations.filter((c: any) => c.isUrgent && c.status === "OPEN").length;
    return { total, active, closed, urgent };
  }, [consultations]);

  const resetFilters = useCallback(() => {
    router.replace(pathname);
    setStatusFilter("ALL");
  }, [router, pathname]);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-muted/5 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
            <Activity className="h-4 w-4" /> TRUNG TÂM ĐIỀU HÀNH
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Quản lý Luồng Lấy Ý Kiến</h2>
          <p className="text-muted-foreground font-medium max-w-2xl">Hệ thống giám sát và đôn đốc tiến độ góp ý các văn bản dự thảo do đơn vị chủ trì.</p>
        </div>
        <Button
        onClick={handleOpenModal}
          className="flex-1 md:flex-none shadow-xl shadow-primary/20 h-12 px-8 font-black rounded-2xl bg-primary hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2 stroke-[3px]" /> KHỞI TẠO LUỒNG MỚI
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng đợt lấy ý kiến", value: stats.total, icon: LayoutGrid, color: "bg-blue-500", text: "text-blue-600" },
          { label: "Đang lấy ý kiến", value: stats.active, icon: Clock, color: "bg-amber-500", text: "text-amber-600" },
          { label: "Đã hoàn thành", value: stats.closed, icon: CheckCircle2, color: "bg-emerald-500", text: "text-emerald-600" },
          { label: "Yêu cầu hỏa tốc", value: stats.urgent, icon: AlertCircle, color: "bg-rose-500", text: "text-rose-600" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-lg shadow-foreground/5 rounded-3xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  <p className="text-3xl font-black text-foreground">{s.value}</p>
                </div>
                <div className={cn("p-3 rounded-2xl text-white shadow-lg", s.color)}>
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full", s.color)} style={{ width: stats.total > 0 ? `${(s.value / stats.total) * 100}%` : '0%' }} />
                </div>
                <span className={cn("text-[10px] font-black", s.text)}>
                  {stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl shadow-foreground/5 rounded-[32px] overflow-hidden bg-background/60 backdrop-blur-xl border border-white/20">
        <div className="p-6 border-b border-muted/50 flex flex-col lg:flex-row gap-4 items-center">
          <Search placeholder="Tìm theo tiêu đề văn bản dự thảo..." className="flex-1 w-full lg:w-auto" />
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-muted/30 border-none font-bold text-sm shadow-none">
                <div className="flex items-center gap-2"><ListFilter className="h-4 w-4 text-primary" /><SelectValue placeholder="Trạng thái" /></div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="ALL" className="rounded-xl font-medium">Tất cả trạng thái</SelectItem>
                <SelectItem value="OPEN" className="rounded-xl font-medium">Đang lấy ý kiến</SelectItem>
                <SelectItem value="CLOSED" className="rounded-xl font-medium">Đã kết thúc</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== "ALL") && (
              <Button variant="ghost" onClick={resetFilters} className="h-12 rounded-2xl px-4 font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <RotateCcw className="h-4 w-4 mr-2" /> ĐẶT LẠI
              </Button>
            )}
            <Button variant="outline" className="h-12 rounded-2xl border-muted-foreground/20 font-bold px-6">
              <Filter className="h-4 w-4 mr-2" /> BỘ LỌC KHÁC
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b">
                  <Skeleton className="h-12 flex-1 rounded-lg" />
                  <Skeleton className="h-12 w-32 rounded-lg" />
                  <Skeleton className="h-12 w-48 rounded-lg" />
                </div>
              ))}
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-32 text-center flex flex-col items-center justify-center space-y-6">
              <div className="p-8 bg-muted/20 rounded-[40px]">
                <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-full">
                  <LayoutGrid className="h-10 w-10 text-muted-foreground/30" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Không tìm thấy dữ liệu</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                  Không tìm thấy đợt lấy ý kiến nào phù hợp với bộ lọc hiện tại.
                </p>
              </div>
              <Button onClick={resetFilters} variant="outline" className="rounded-2xl h-12 px-8 border-primary/20 text-primary font-bold hover:bg-primary/5">
                Xóa toàn bộ bộ lọc
              </Button>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] text-muted-foreground uppercase bg-muted/20">
                    <TableHead className="px-8 py-5 font-black tracking-widest w-[40%]">Nội dung dự thảo văn bản</TableHead>
                    <TableHead className="px-6 py-5 font-black tracking-widest w-48">Thời hạn xử lý</TableHead>
                    <TableHead className="px-6 py-5 font-black tracking-widest w-72">Tiến độ phản hồi</TableHead>
                    <TableHead className="px-6 py-5 font-black tracking-widest text-center w-40">Tình trạng</TableHead>
                    <TableHead className="px-8 py-5 font-black tracking-widest text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((item: any) => (
                    <ConsultationRow key={item.id} item={item} stats={stats} />
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <ConsultationCreateModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
