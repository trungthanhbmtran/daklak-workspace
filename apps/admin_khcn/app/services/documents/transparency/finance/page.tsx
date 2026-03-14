"use client";

import { useState } from "react";
import { 
  Search, Plus, Filter, Download, FileText, 
  PieChart, Building2, Calendar, CheckCircle2, 
  FileSpreadsheet, AlertCircle, Clock, TrendingUp,
  Globe2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Chuẩn hóa Danh mục theo Thông tư 61/2017/TT-BTC
const CATEGORY_CONFIG: Record<string, { label: string, color: string }> = {
  ESTIMATE: { label: "Dự toán NSNN", color: "bg-blue-100 text-blue-700 border-blue-200" },
  EXECUTION: { label: "Tình hình thực hiện", color: "bg-amber-100 text-amber-700 border-amber-200" },
  SETTLEMENT: { label: "Quyết toán NSNN", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  FUNDS: { label: "Các quỹ tài chính", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

// Mock Data chuẩn form mẫu Nhà nước
const mockFinancialReports = [
  {
    id: "f1",
    title: "Quyết định công khai dự toán thu - chi ngân sách nhà nước năm 2026",
    documentNumber: "15/QĐ-SKHCN",
    year: "2026",
    category: "ESTIMATE",
    publishedAt: "10/01/2026",
    status: "PUBLISHED",
    files: [
      { type: "PDF", name: "Quyet_dinh_du_toan_2026_signed.pdf", size: "1.2 MB" },
      { type: "EXCEL", name: "Phu_luc_Bieu_mau_01_04.xlsx", size: "450 KB" }
    ]
  },
  {
    id: "f2",
    title: "Báo cáo tình hình thực hiện dự toán ngân sách quý I năm 2026",
    documentNumber: "42/BC-SKHCN",
    year: "2026",
    category: "EXECUTION",
    publishedAt: "15/04/2026",
    status: "DRAFT", // Đang chờ duyệt
    files: [
      { type: "PDF", name: "Bao_cao_thuc_hien_Q1.pdf", size: "800 KB" }
    ]
  },
  {
    id: "f3",
    title: "Quyết định công khai quyết toán thu, chi ngân sách nhà nước năm 2025",
    documentNumber: "128/QĐ-SKHCN",
    year: "2025",
    category: "SETTLEMENT",
    publishedAt: "25/02/2026", // Thường quyết toán năm trước sẽ công khai vào đầu năm sau
    status: "PUBLISHED",
    files: [
      { type: "PDF", name: "Quyet_toan_NSNN_2025_signed.pdf", size: "2.1 MB" },
      { type: "EXCEL", name: "Bieu_mau_quyet_toan_01_06.xlsx", size: "850 KB" }
    ]
  }
];

export default function FinancialTransparencyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      
      {/* 1. HEADER & THỐNG KÊ NHANH */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <PieChart className="h-6 w-6 text-primary" /> Quản trị Công khai Tài chính
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý và minh bạch số liệu ngân sách nhà nước theo <strong className="text-foreground">Thông tư 61/2017/TT-BTC</strong>.
            </p>
          </div>
          <Button className="shadow-sm font-semibold h-10 px-5">
            <Plus className="h-4 w-4 mr-2" /> Tạo hồ sơ công khai mới
          </Button>
        </div>

        {/* Thẻ Thống kê (Quick Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border shadow-sm bg-background">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-full"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Tổng hồ sơ năm 2026</p>
                <h3 className="text-2xl font-black text-foreground mt-0.5">12</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm bg-background">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full"><CheckCircle2 className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Đã hiển thị trên Cổng TTĐT</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-0.5">10</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm bg-background">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-full"><Clock className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Đang chờ phê duyệt</p>
                <h3 className="text-2xl font-black text-amber-600 mt-0.5">02</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. KHU VỰC BỘ LỌC VÀ TÌM KIẾM */}
      <Card className="border shadow-sm">
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center rounded-t-xl">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo số ký hiệu, tên quyết định, báo cáo..." 
              className="pl-9 h-10 bg-muted/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[140px] font-semibold h-10">
              <SelectValue placeholder="Năm tài chính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">Năm 2026</SelectItem>
              <SelectItem value="2025">Năm 2025</SelectItem>
              <SelectItem value="2024">Năm 2024</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] font-medium h-10">
              <SelectValue placeholder="Loại công khai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả danh mục</SelectItem>
              <SelectItem value="ESTIMATE">Dự toán thu - chi</SelectItem>
              <SelectItem value="EXECUTION">Tình hình thực hiện (Quý/Năm)</SelectItem>
              <SelectItem value="SETTLEMENT">Quyết toán NSNN</SelectItem>
              <SelectItem value="FUNDS">Công khai các Quỹ</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-10 text-muted-foreground">
            <Filter className="h-4 w-4 mr-2" /> Lọc thêm
          </Button>
        </div>

        {/* 3. BẢNG DỮ LIỆU CHUẨN MỰC */}
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-5 py-4 font-semibold w-[35%]">Văn bản / Quyết định công khai</th>
                <th className="px-5 py-4 font-semibold w-36">Phân loại</th>
                <th className="px-5 py-4 font-semibold text-center w-28">Năm TC</th>
                <th className="px-5 py-4 font-semibold w-32">Ngày công khai</th>
                <th className="px-5 py-4 font-semibold w-48">Tài liệu đính kèm (PDF/Excel)</th>
                <th className="px-5 py-4 font-semibold text-center w-32">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background">
              {mockFinancialReports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors cursor-pointer mb-1">
                      {report.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Số: {report.documentNumber}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-5 py-4">
                    <Badge variant="outline" className={`font-medium text-[11px] shadow-none ${CATEGORY_CONFIG[report.category]?.color}`}>
                      {CATEGORY_CONFIG[report.category]?.label}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="font-mono font-bold text-foreground text-sm">
                      {report.year}
                    </span>
                  </td>
                  
                  <td className="px-5 py-4 text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 text-[13px]">
                      <Calendar className="h-3.5 w-3.5" /> {report.publishedAt}
                    </div>
                  </td>
                  
                  <td className="px-5 py-4">
                    <TooltipProvider>
                      <div className="flex flex-col gap-1.5">
                        {report.files.map((file, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer group/file w-fit">
                                {file.type === "PDF" ? (
                                  <div className="p-1 bg-rose-100 text-rose-700 rounded"><FileText className="h-3.5 w-3.5" /></div>
                                ) : (
                                  <div className="p-1 bg-emerald-100 text-emerald-700 rounded"><FileSpreadsheet className="h-3.5 w-3.5" /></div>
                                )}
                                <span className="text-xs font-medium text-foreground group-hover/file:text-primary line-clamp-1 max-w-[130px]">
                                  {file.name}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {file.name} ({file.size}) - Bấm để tải xuống
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TooltipProvider>
                  </td>

                  <td className="px-5 py-4 text-center">
                    {report.status === "PUBLISHED" ? (
                       <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 shadow-none border-emerald-200">
                         <Globe2 className="h-3 w-3 mr-1" /> Công khai
                       </Badge>
                    ) : (
                       <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 shadow-none">
                         <Clock className="h-3 w-3 mr-1" /> Chờ duyệt
                       </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
