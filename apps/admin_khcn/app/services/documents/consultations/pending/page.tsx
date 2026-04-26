"use client";

import { useState } from "react";
import { 
  Clock, Search, Filter, Eye, 
  MessageSquare, User, Calendar,
  AlertTriangle, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock Data: Các văn bản chờ ý kiến từ đơn vị TÔI
const mockPendingConsultations = [
  {
    id: "pcon-1",
    title: "Dự thảo Đề án phát triển hệ sinh thái khởi nghiệp đổi mới sáng tạo tỉnh đến năm 2030",
    issuer: "Sở Kế hoạch và Đầu tư",
    assignedDate: "20/02/2026",
    deadline: "27/02/2026",
    urgency: "KHẨN",
    isRead: false,
  },
  {
    id: "pcon-2",
    title: "Dự thảo Quy định về quản lý nhiệm vụ khoa học công nghệ cấp cơ sở",
    issuer: "Phòng Quản lý Khoa học",
    assignedDate: "18/02/2026",
    deadline: "25/02/2026",
    urgency: "BÌNH THƯỜNG",
    isRead: true,
  }
];

export default function PendingConsultationsPage() {
  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Link href="/services/documents/consultations">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                   <ArrowLeft className="h-4 w-4" />
                </Button>
             </Link>
             <h2 className="text-2xl font-bold tracking-tight text-foreground">Văn bản chờ Ý kiến</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Danh sách các dự thảo văn bản đang chờ bạn hoặc đơn vị bạn tham gia đóng góp ý kiến.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center rounded-t-xl">
           <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm dự thảo..." className="pl-9 h-10 bg-muted/20 border-none" />
           </div>
           <Button variant="outline" className="h-10"><Filter className="h-4 w-4 mr-2" /> Lọc</Button>
        </div>

        <CardContent className="p-0">
           <div className="divide-y divide-border/50 bg-background">
              {mockPendingConsultations.map((con) => (
                <div key={con.id} className={`p-5 hover:bg-muted/30 transition-all cursor-pointer flex items-center gap-5 ${!con.isRead ? 'bg-primary/[0.02]' : ''}`}>
                   <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-muted-foreground/10 group">
                      <MessageSquare className={`h-6 w-6 ${!con.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                   </div>
                   
                   <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                         {!con.isRead && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{con.issuer}</span>
                         {con.urgency === 'KHẨN' && <Badge className="bg-amber-100 text-amber-700 shadow-none text-[9px] px-1.5 py-0">KHẨN</Badge>}
                      </div>
                      <h4 className={`text-base leading-snug ${!con.isRead ? 'font-black text-foreground' : 'font-bold text-muted-foreground'}`}>
                         {con.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                         <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Nhận ngày: {con.assignedDate}</span>
                         <span className={`flex items-center gap-1.5 font-bold ${new Date(con.deadline) < new Date() ? 'text-destructive' : 'text-amber-600'}`}>
                            <Clock className="h-3.5 w-3.5" /> Hạn góp ý: {con.deadline}
                         </span>
                      </div>
                   </div>

                   <div className="shrink-0 flex gap-2">
                      <Button variant="outline" className="rounded-xl font-bold text-xs h-9">
                         Góp ý ngay
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                         <Eye className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="p-4 bg-muted/5 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Lưu ý: Sau thời hạn góp ý, hệ thống sẽ tự động khóa chức năng đóng góp.
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
