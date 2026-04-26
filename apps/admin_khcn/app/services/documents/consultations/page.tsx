"use client";

import { useState } from "react";
import { 
  Search, Filter, Plus, Clock, 
  MessageSquareShare, CheckCircle2, 
  Users, Download, Calendar, 
  ChevronRight, ArrowRight, BarChart3
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Mock Data: Các đợt lấy ý kiến dự thảo
const mockConsultations = [
  {
    id: "con-1",
    title: "Dự thảo Kế hoạch ứng dụng CNTT và CĐS tỉnh Đắk Lắk giai đoạn 2026-2030",
    issuer: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
    deadline: "28/02/2026",
    status: "OPEN", // Đang lấy ý kiến
    progress: 80, // 12/15 đơn vị
    responses: 12,
    totalTargets: 15,
    isUrgent: true,
  },
  {
    id: "con-2",
    title: "Dự thảo Quyết định sáp nhập Sở Thông tin Truyền thông vào Sở Khoa học Công nghệ",
    issuer: "UBND Tỉnh",
    deadline: "20/02/2026",
    status: "CLOSED", // Đã kết thúc
    progress: 100,
    responses: 10,
    totalTargets: 10,
    isUrgent: false,
  }
];

export default function ConsultationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquareShare className="h-7 w-7 text-primary" /> Quản lý Lấy ý kiến dự thảo
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi và tổng hợp phản hồi từ các đơn vị về các dự thảo văn bản quy phạm pháp luật.
          </p>
        </div>
        <div className="flex gap-2">
           <Link href="/services/documents/consultations/manage">
              <Button variant="outline" className="shadow-sm">
                <BarChart3 className="h-4 w-4 mr-2" /> Báo cáo tổng hợp
              </Button>
           </Link>
           <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Tạo luồng lấy ý kiến mới
           </Button>
        </div>
      </div>

      {/* 2. ACTIONS/FILTERS */}
      <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm rounded-xl">
        <div className="p-4 flex flex-wrap gap-4 items-center">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm tên dự thảo, đơn vị chủ trì..." className="pl-10 h-11 bg-background border-muted rounded-xl" />
           </div>
           <Select defaultValue="OPEN">
              <SelectTrigger className="w-[180px] h-11 rounded-xl">
                 <SelectValue />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="OPEN">Đang lấy ý kiến</SelectItem>
                 <SelectItem value="CLOSED">Đã kết thúc</SelectItem>
                 <SelectItem value="PENDING">Chờ kích hoạt</SelectItem>
              </SelectContent>
           </Select>
           <Button variant="outline" className="h-11 rounded-xl border-dashed">
              <Filter className="h-4 w-4 mr-2" /> Lọc nâng cao
           </Button>
        </div>
      </Card>

      {/* 3. LIST OF CONSULTATIONS */}
      <div className="grid grid-cols-1 gap-6">
        {mockConsultations.map((con) => (
          <Card key={con.id} className="border-none shadow-xl shadow-foreground/5 overflow-hidden group hover:shadow-primary/5 transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                       {con.isUrgent && <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 shadow-none font-bold text-[10px] uppercase">Hỏa tốc</Badge>}
                       <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-tighter text-muted-foreground">{con.id}</Badge>
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                      {con.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" /> Chủ trì: <strong className="text-foreground">{con.issuer}</strong>
                    </p>
                  </div>
                  <Badge className={`px-4 py-1.5 rounded-full shadow-none font-bold text-xs ${
                    con.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {con.status === 'OPEN' ? 'ĐANG LẤY Ý KIẾN' : 'ĐÃ KẾT THÚC'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                         <span>Tiến độ phản hồi</span>
                         <span className="text-primary">{con.responses} / {con.totalTargets} Đơn vị</span>
                      </div>
                      <div className="space-y-1.5">
                         <Progress value={con.progress} className="h-2.5 bg-muted rounded-full" />
                         <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                            <span>Bắt đầu: 15/02/2026</span>
                            <span className={con.status === 'OPEN' ? 'text-rose-600' : ''}>Hạn chót: {con.deadline}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted/20 rounded-xl p-3 border border-dashed border-muted-foreground/20">
                         <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Tệp tài liệu gốc</p>
                         <Button variant="ghost" className="w-full justify-start h-8 px-2 text-xs font-bold hover:bg-background">
                            <Download className="h-4 w-4 mr-2 text-primary" /> Du-thao-ke-hoach-v1.pdf
                         </Button>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                         <Link href={`/services/documents/consultations/${con.id}`}>
                            <Button size="sm" className="h-10 px-5 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10">
                               Chi tiết <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                         </Link>
                         <Button variant="outline" size="sm" className="h-10 px-5 rounded-xl font-bold">
                            Tổng hợp
                         </Button>
                      </div>
                   </div>
                </div>
              </div>
              
              {/* Sidebar của Card (Trạng thái đơn vị) */}
              <div className="w-full lg:w-72 bg-muted/10 border-l border-muted p-6 flex flex-col gap-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Đơn vị tiêu biểu</h4>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-medium truncate flex-1 mr-2">Sở Tài chính</span>
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-medium truncate flex-1 mr-2">Sở Kế hoạch & Đầu tư</span>
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-medium truncate flex-1 mr-2">UBND TP. Buôn Ma Thuột</span>
                       <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                 </div>
                 <div className="mt-auto pt-4 border-t border-muted-foreground/10">
                    <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary hover:no-underline">
                       Xem toàn bộ danh sách (15) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                 </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
