"use client";

import { useMemo, useState, useEffect } from "react";
import { Download, Calendar,
  Building2, PieChart, ShieldCheck, FileText,
  TrendingUp, ArrowUpRight, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocuments } from "@/features/document/hooks/useDocuments";
import { DocumentUploadModal } from "@/features/document/components/DocumentUploadModal";

export function TransparencyClient() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { useDocumentStats, useListDocuments } = useDocuments();
  const { data: stats } = useDocumentStats();
  const { data: reportsData, isLoading } = useListDocuments({
    isPublic: 'true',
    search: searchTerm,
    fiscalYear: fiscalYear,
  });

  const reports = useMemo(() => reportsData?.data ?? [], [reportsData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "---";
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? "---" : date.toLocaleDateString('vi-VN');
    } catch { return "---"; }
  };

  const totalReports = (stats?.outgoingTotal || 0) + (stats?.incomingTotal || 0);
  const publicCount = reports.length;

  if (!mounted) {
    return (
      <div className="p-6 space-y-6 bg-muted/5 min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" /> Công khai &amp; Minh bạch
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Quản lý và đăng tải các báo cáo tài chính, dự toán ngân sách theo quy định của Pháp luật.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shadow-sm"><TrendingUp className="h-4 w-4 mr-2" /> Thống kê báo cáo</Button>
          <Button className="shadow-sm bg-primary hover:bg-primary/90" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Đăng tải báo cáo mới
          </Button>
        </div>
      </div>

      <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border shadow-sm bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FileText className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tổng số báo cáo</p>
              <p className="text-2xl font-black text-foreground">{totalReports || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đã công khai</p>
              <p className="text-2xl font-black text-foreground">{publicCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Calendar className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hạn báo cáo</p>
              <p className="text-2xl font-black text-foreground">Q1/2026</p>
            </div>
          </CardContent>
        </Card>
      </div>

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

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Tên báo cáo công khai</th>
                <th className="px-6 py-4 w-32 text-center">Năm TC</th>
                <th className="px-6 py-4 w-40">Phân loại</th>
                <th className="px-6 py-4 w-40">Ngày đăng</th>
                <th className="px-6 py-4 text-right w-44">Tệp đính kèm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-background">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">Đang tải báo cáo...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">Chưa có báo cáo nào được công khai trong năm {fiscalYear}.</td></tr>
              ) : reports.map((report: any) => (
                <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{report.abstract}</p>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter mt-1.5">
                          <Building2 className="h-3 w-3" /> {report.issuerName || 'Sở Khoa học và Công nghệ'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Badge variant="outline" className="font-mono font-black text-primary border-primary/20 bg-primary/5 px-2 py-0.5">{report.fiscalYear || fiscalYear}</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <Badge className={`shadow-none font-bold text-[10px] ${report.transparencyCategory === 'ESTIMATE' ? 'bg-primary/10 text-primary' : report.transparencyCategory === 'SETTLEMENT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : report.transparencyCategory === 'EXECUTION' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : report.transparencyCategory === 'GENERAL' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-muted text-muted-foreground'}`}>
                      {report.transparencyCategory === 'ESTIMATE' ? 'Dự toán' : report.transparencyCategory === 'SETTLEMENT' ? 'Quyết toán' : report.transparencyCategory === 'EXECUTION' ? 'Thực hiện' : report.transparencyCategory === 'GENERAL' ? 'Thông tin chung' : 'Khác'}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground font-medium">{formatDate(report.createdAt)}</span>
                      {report.status === 'DRAFT' && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tighter">Đang soạn thảo</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {report.fileId && (
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[11px] font-black hover:bg-primary/10 hover:text-primary transition-all rounded-lg border border-transparent hover:border-primary/20" asChild>
                          <a href={`/api/v1/media/download/${report.fileId}`} target="_blank"><Download className="h-3.5 w-3.5 mr-1.5" /> Tải PDF</a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
