"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Download, Calendar, Building2, FileText,
  TrendingUp, ArrowUpRight, Plus, PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { useDocuments } from "@/features/document/hooks/useDocuments";
import { DocumentUploadModal } from "@/features/document/components/DocumentUploadModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return "---";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "---" : d.toLocaleDateString("vi-VN");
  } catch { return "---"; }
}

const CATEGORY_MAP: Record<string, string> = {
  ESTIMATE: "Dự toán",
  SETTLEMENT: "Quyết toán",
  EXECUTION: "Thực hiện",
  GENERAL: "Thông tin chung",
};

function categoryBadgeClass(cat: string): string {
  return {
    ESTIMATE: "bg-primary/10 text-primary",
    SETTLEMENT: "bg-emerald-500/10 text-emerald-600",
    EXECUTION: "bg-amber-500/10 text-amber-600",
    GENERAL: "bg-indigo-500/10 text-indigo-600",
  }[cat] ?? "bg-muted text-muted-foreground";
}

// ─── ReportRow — memoized ─────────────────────────────────────────────────────

interface ReportRowProps {
  report: any;
  fiscalYear: string;
}

const ReportRow = React.memo(function ReportRow({ report, fiscalYear }: ReportRowProps) {
  return (
    <TableRow className="hover:bg-primary/[0.02] transition-colors group">
      {/* Name + issuer */}
      <TableCell className="px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {report.abstract}
            </p>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter mt-1.5">
              <Building2 className="h-3 w-3" /> {report.issuerName || "Sở Khoa học và Công nghệ"}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Fiscal year */}
      <TableCell className="px-6 py-5 text-center">
        <Badge variant="outline" className="font-mono font-black text-primary border-primary/20 bg-primary/5 px-2 py-0.5">
          {report.fiscalYear || fiscalYear}
        </Badge>
      </TableCell>

      {/* Category */}
      <TableCell className="px-6 py-5">
        <Badge className={`shadow-none font-bold text-[10px] ${categoryBadgeClass(report.transparencyCategory)}`}>
          {CATEGORY_MAP[report.transparencyCategory] ?? "Khác"}
        </Badge>
      </TableCell>

      {/* Date */}
      <TableCell className="px-6 py-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground font-medium">{formatDate(report.createdAt)}</span>
          {report.status === "DRAFT" && (
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">Đang soạn thảo</span>
          )}
        </div>
      </TableCell>

      {/* File + link */}
      <TableCell className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2">
          {report.fileId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[11px] font-black hover:bg-primary/10 hover:text-primary rounded-lg border border-transparent hover:border-primary/20"
              asChild
            >
              <a href={`/api/v1/media/download/${report.fileId}`} target="_blank">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Tải PDF
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function TransparencyClient() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [isModalOpen, setIsModalOpen] = useState(false);


  const { useDocumentStats, useListDocuments } = useDocuments();
  const { data: stats } = useDocumentStats();
  const { data: reportsData, isLoading } = useListDocuments({
    isPublic: "true",
    search: searchTerm,
    fiscalYear,
  });

  const reports = useMemo(() => reportsData?.data ?? [], [reportsData]);
  const totalReports = (stats?.outgoingTotal || 0) + (stats?.incomingTotal || 0);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" /> Công khai &amp; Minh bạch
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Quản lý và đăng tải các báo cáo tài chính, dự toán ngân sách theo quy định của Pháp luật.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shadow-sm">
            <TrendingUp className="h-4 w-4 mr-2" /> Thống kê báo cáo
          </Button>
          <Button className="shadow-sm bg-primary hover:bg-primary/90" onClick={handleOpenModal}>
            <Plus className="h-4 w-4 mr-2" /> Đăng tải báo cáo mới
          </Button>
        </div>
      </div>

      <DocumentUploadModal isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Tổng số báo cáo", value: totalReports || 0, icon: FileText },
          { label: "Đã công khai", value: reports.length || 0, icon: FileText },
          { label: "Hạn báo cáo", value: "Q1/2026", icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border border-border shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="border shadow-xl shadow-foreground/5 rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs defaultValue="all" className="w-full sm:w-auto">
              <TabsList className="bg-background border h-10 p-1">
                <TabsTrigger value="all" className="text-xs font-bold">Tất cả</TabsTrigger>
                <TabsTrigger value="estimate" className="text-xs font-bold">Dự toán</TabsTrigger>
                <TabsTrigger value="settlement" className="text-xs font-bold">Quyết toán</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2 w-full sm:w-auto">
              <Search placeholder="Tìm báo cáo..." className="flex-1 sm:w-64" />
              <Select value={fiscalYear} onValueChange={setFiscalYear}>
                <SelectTrigger className="w-[110px] h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] text-muted-foreground uppercase bg-muted/20 tracking-widest font-black">
                  <TableHead className="px-6 py-4">Tên báo cáo công khai</TableHead>
                  <TableHead className="px-6 py-4 w-32 text-center">Năm TC</TableHead>
                  <TableHead className="px-6 py-4 w-40">Phân loại</TableHead>
                  <TableHead className="px-6 py-4 w-40">Ngày đăng</TableHead>
                  <TableHead className="px-6 py-4 text-right w-44">Tệp đính kèm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j} className="px-6 py-5"><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                      Chưa có báo cáo nào được công khai trong năm {fiscalYear}.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report: any) => (
                    <ReportRow key={report.id} report={report} fiscalYear={fiscalYear} />
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="p-4 border-t bg-muted/5 text-center">
            <Button variant="ghost" size="sm" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
              Tải về toàn bộ hồ sơ năm {fiscalYear}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
