"use client";

import { useState } from "react";
import { 
  Search, Plus, Filter, MessageSquareShare, 
  Clock, CheckCircle2, Eye, AlertCircle, FileEdit, 
  Building2, ChevronRight
} from "lucide-react";
import Link from "next/link"; // Dùng để navigate vào trang chi tiết

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Import Modal Khởi tạo luồng (Giả định bạn đã lưu component này ở thư mục features)
import { ConsultationCreateModal } from "@/features/document/components/ConsultationCreateModal";

// Mock Data: Danh sách các luồng xin ý kiến do đơn vị mình làm chủ trì
const mockConsultations = [
  {
    id: "cs1",
    title: "Dự thảo Kế hoạch ứng dụng CNTT và Chuyển đổi số tỉnh Đắk Lắk giai đoạn 2026-2030",
    createdAt: "10/02/2026",
    deadline: "28/02/2026",
    status: "GATHERING",
    totalDepts: 15,
    repliedDepts: 12,
    isUrgent: true, // Sắp đến hạn
  },
  {
    id: "cs2",
    title: "Dự thảo Quyết định Quy định chức năng, nhiệm vụ, quyền hạn và cơ cấu tổ chức của Sở Khoa học và Công nghệ (sau sáp nhập)",
    createdAt: "05/02/2026",
    deadline: "15/02/2026",
    status: "COMPILED",
    totalDepts: 8,
    repliedDepts: 8,
    isUrgent: false,
  },
  {
    id: "cs3",
    title: "Dự thảo Tờ trình đề nghị xây dựng Nghị quyết hỗ trợ doanh nghiệp CNTT trên địa bàn tỉnh",
    createdAt: "22/02/2026",
    deadline: "15/03/2026",
    status: "GATHERING",
    totalDepts: 20,
    repliedDepts: 3,
    isUrgent: false,
  }
];

export default function ConsultationManagePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquareShare className="h-6 w-6 text-primary" /> Quản lý Luồng Lấy Ý Kiến
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tiến độ góp ý các dự thảo do đơn vị chủ trì soạn thảo phát hành.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-sm h-10 px-5 font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Khởi tạo luồng xin ý kiến
        </Button>
      </div>

      <Card className="border shadow-sm">
        {/* 2. THANH BỘ LỌC */}
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center rounded-t-xl">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên dự thảo..." 
              className="pl-9 h-10 bg-muted/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] font-medium h-10">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="GATHERING">Đang lấy ý kiến</SelectItem>
              <SelectItem value="COMPILED">Đã tổng hợp</SelectItem>
              <SelectItem value="CLOSED">Đã đóng luồng</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-10 text-muted-foreground">
            <Filter className="h-4 w-4 mr-2" /> Bộ lọc nâng cao
          </Button>
        </div>

        {/* 3. BẢNG DỮ LIỆU */}
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-5 py-4 font-semibold w-[35%]">Tên văn bản dự thảo</th>
                <th className="px-5 py-4 font-semibold w-40">Thời hạn</th>
                <th className="px-5 py-4 font-semibold w-64">Tiến độ phản hồi</th>
                <th className="px-5 py-4 font-semibold text-center w-32">Trạng thái</th>
                <th className="px-5 py-4 font-semibold text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background">
              {mockConsultations.map((item) => {
                const progressPercent = Math.round((item.repliedDepts / item.totalDepts) * 100);
                
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors cursor-pointer mb-1.5 line-clamp-2">
                        {item.title}
                      </p>
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <FileEdit className="h-3 w-3" /> Ngày phát hành: {item.createdAt}
                      </span>
                    </td>
                    
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-medium text-[13px]">{item.deadline}</span>
                        {item.isUrgent && item.status === "GATHERING" && (
                          <Badge variant="outline" className="w-fit text-[10px] bg-rose-50 text-rose-700 border-rose-200 shadow-none px-1.5 py-0 h-4">
                            Sắp hết hạn
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {item.repliedDepts}/{item.totalDepts} Đơn vị
                          </span>
                          <span className="font-bold text-primary">{progressPercent}%</span>
                        </div>
                        <Progress 
                          value={progressPercent} 
                          className={`h-2 ${progressPercent === 100 ? 'bg-emerald-100' : 'bg-primary/20'}`} 
                          style={{ backgroundColor: progressPercent === 100 ? '#66BB6A' : '#90A4AE' }}
                        />
                      </div>
                    </td>
                    
                    <td className="px-5 py-4 text-center">
                      {item.status === "GATHERING" ? (
                         <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-none border-blue-200">
                           <Clock className="h-3 w-3 mr-1" /> Đang lấy ý kiến
                         </Badge>
                      ) : (
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 shadow-none">
                           <CheckCircle2 className="h-3 w-3 mr-1" /> Đã tổng hợp
                         </Badge>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {/* Dùng Link của Next.js để trỏ vào trang Detail */}
                      <Link href={`/services/documents/consultations/${item.id}`}>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                          Chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Gọi Modal Khởi tạo luồng lấy ý kiến */}
      <ConsultationCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
