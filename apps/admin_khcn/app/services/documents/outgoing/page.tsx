"use client";

import { useState } from "react";
import { 
  Search, Plus, Filter, Eye, Download, Calendar, 
  Send, CheckCircle2, Building2, Globe, FileText,
  User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import Modal Tải lên Văn bản (Tái sử dụng cho luồng Vào sổ văn bản đi)
import { DocumentUploadModal } from "@/features/document/components/DocumentUploadModal";

// Mock Data: Danh sách văn bản do Sở ban hành và gửi đi
const mockOutgoingDocuments = [
  {
    id: "out1",
    documentNumber: "85/BC-SKHCN",
    title: "Báo cáo tình hình hoạt động khoa học công nghệ và đổi mới sáng tạo tháng 02 năm 2026",
    type: "Báo cáo",
    issueDate: "25/02/2026",
    signer: "Trần Văn A (Giám đốc)",
    recipients: ["UBND Tỉnh Đắk Lắk", "Bộ Khoa học và Công nghệ"],
    status: "SENT_AXIS", // Đã gửi qua trục liên thông
    isUrgent: false,
  },
  {
    id: "out2",
    documentNumber: "125/QĐ-SKHCN",
    title: "Quyết định về việc ban hành quy chế bảo đảm an toàn thông tin mạng trong hoạt động của cơ quan nhà nước",
    type: "Quyết định",
    issueDate: "20/02/2026",
    signer: "Nguyễn Thị B (Phó Giám đốc)",
    recipients: ["Các phòng, đơn vị trực thuộc", "Cổng thông tin điện tử (để đăng tải)"],
    status: "PUBLISHED_INTERNAL", // Phát hành nội bộ
    isUrgent: false,
  },
  {
    id: "out3",
    documentNumber: "45/GM-SKHCN",
    title: "Giấy mời tham dự Hội thảo ứng dụng AI trong quản lý hành chính công tại TP. Buôn Ma Thuột",
    type: "Giấy mời",
    issueDate: "24/02/2026",
    signer: "Trần Văn A (Giám đốc)",
    recipients: ["UBND các Huyện, Thị xã, Thành phố", "Sở Thông tin và Truyền thông"],
    status: "SENDING", // Đang gửi
    isUrgent: true, // Hỏa tốc / Khẩn
  }
];

export default function OutgoingDocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Sổ Văn bản Đi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý văn bản, quyết định do Sở Khoa học và Công nghệ tỉnh Đắk Lắk ban hành và phát hành.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-sm h-10 px-5 font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Phát hành văn bản mới
        </Button>
      </div>

      <Card className="border shadow-sm">
        {/* 2. THANH BỘ LỌC */}
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center rounded-t-xl">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo số ký hiệu, trích yếu, nơi nhận..." 
              className="pl-9 h-10 bg-muted/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] font-medium h-10">
              <SelectValue placeholder="Loại văn bản" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại VB</SelectItem>
              <SelectItem value="CONG_VAN">Công văn</SelectItem>
              <SelectItem value="QUYET_DINH">Quyết định</SelectItem>
              <SelectItem value="BAO_CAO">Báo cáo</SelectItem>
              <SelectItem value="GIAY_MOI">Giấy mời</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-10 text-muted-foreground">
            <Filter className="h-4 w-4 mr-2" /> Lọc nâng cao
          </Button>
        </div>

        {/* 3. BẢNG DỮ LIỆU */}
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-5 py-4 font-semibold w-40">Số / Ký hiệu</th>
                <th className="px-5 py-4 font-semibold w-[35%]">Trích yếu nội dung</th>
                <th className="px-5 py-4 font-semibold w-56">Nơi nhận</th>
                <th className="px-5 py-4 font-semibold w-40">Người ký & Ngày Ban hành</th>
                <th className="px-5 py-4 font-semibold text-center w-36">Trạng thái phát hành</th>
                <th className="px-5 py-4 font-semibold text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background">
              {mockOutgoingDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors group">
                  
                  {/* Số ký hiệu & Độ khẩn */}
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-primary block text-[13px]">{doc.documentNumber}</span>
                    <Badge variant="outline" className="mt-1.5 text-[10px] bg-muted/50 text-muted-foreground shadow-none px-1.5 py-0">
                      {doc.type}
                    </Badge>
                  </td>
                  
                  {/* Trích yếu */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer">
                      {doc.isUrgent && <span className="text-destructive font-bold mr-1">[KHẨN]</span>}
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Bản điện tử đã ký số (VGCA)
                      </span>
                    </div>
                  </td>
                  
                  {/* Nơi nhận (Hiển thị dạng Badge gộp nếu quá nhiều) */}
                  <td className="px-5 py-4 font-medium">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start gap-1.5 text-[12px] text-foreground">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-tight">{doc.recipients[0]}</span>
                      </div>
                      {doc.recipients.length > 1 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="w-fit text-[10px] cursor-help bg-muted text-muted-foreground hover:bg-muted/80">
                                +{doc.recipients.length - 1} nơi nhận khác
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs p-2 max-w-[250px] space-y-1">
                              <p className="font-bold border-b pb-1 mb-1">Danh sách nơi nhận:</p>
                              {doc.recipients.map((r, i) => (
                                <p key={i}>- {r}</p>
                              ))}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>
                  
                  {/* Người ký & Thời gian */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 text-[13px]">
                      <span className="font-medium flex items-center gap-1.5 text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> {doc.signer}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {doc.issueDate}
                      </span>
                    </div>
                  </td>
                  
                  {/* Trạng thái liên thông */}
                  <td className="px-5 py-4 text-center">
                    {doc.status === "SENT_AXIS" && (
                      <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 shadow-none border-emerald-200">
                        <Globe className="h-3 w-3 mr-1" /> Liên thông QG
                      </Badge>
                    )}
                    {doc.status === "PUBLISHED_INTERNAL" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shadow-none">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Đã ban hành
                      </Badge>
                    )}
                    {doc.status === "SENDING" && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 shadow-none">
                        <Send className="h-3 w-3 mr-1 animate-pulse" /> Đang chuyển
                      </Badge>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Gọi Modal Tải lên Văn bản (Dùng form chung đã thiết kế) */}
      <DocumentUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
