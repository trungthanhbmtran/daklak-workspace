"use client";

import { useState } from "react";
import { 
  Search, CheckCircle2, XCircle, MessageCircleReply, 
  Globe, ShieldAlert, User, Clock, FileText, CheckSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Mock data: Các góp ý của người dân/doanh nghiệp từ Cổng TTĐT
const mockPublicFeedbacks = [
  {
    id: "fb1",
    draftTitle: "Dự thảo Kế hoạch ứng dụng CNTT và CĐS tỉnh Đắk Lắk giai đoạn 2026-2030",
    sender: "Trần Văn Dân",
    email: "dan.tran@email.com",
    address: "Phường Tân Lợi, TP. Buôn Ma Thuột",
    content: "Tôi đề nghị cần bổ sung thêm các chỉ tiêu cụ thể về việc đào tạo kỹ năng số cho người dân ở các xã vùng sâu vùng xa, hiện tại dự thảo nói còn quá chung chung.",
    time: "25/02/2026 08:30",
    status: "PENDING", 
    reply: null
  },
  {
    id: "fb2",
    draftTitle: "Dự thảo Kế hoạch ứng dụng CNTT và CĐS tỉnh Đắk Lắk giai đoạn 2026-2030",
    sender: "Công ty TNHH Công nghệ ABC",
    email: "contact@abc-tech.vn",
    address: "KCN Hòa Phú, Đắk Lắk",
    content: "Đề nghị Sở KH&CN xem xét thêm cơ chế hỗ trợ doanh nghiệp CNTT địa phương tham gia vào các dự án chuyển đổi số của tỉnh. Chúng tôi có đính kèm file phương án chi tiết.",
    time: "24/02/2026 15:45",
    status: "APPROVED",
    reply: "Sở Khoa học và Công nghệ xin tiếp thu ý kiến của Quý công ty và sẽ nghiên cứu bổ sung vào Mục III.2 của dự thảo. Trân trọng cảm ơn!"
  }
];

export default function PublicFeedbacksPage() {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Duyệt Góp ý Công chúng
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kiểm duyệt và phản hồi ý kiến của nhân dân, doanh nghiệp gửi qua Cổng Thông tin điện tử.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        {/* Bộ lọc */}
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center rounded-t-xl">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm theo tên người gửi, nội dung..." className="pl-9 h-10 bg-muted/20" />
          </div>
          <Select defaultValue="PENDING">
            <SelectTrigger className="w-[180px] h-10 font-medium"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ kiểm duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt (Hiện trên web)</SelectItem>
              <SelectItem value="REJECTED">Từ chối / Spam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {mockPublicFeedbacks.map((fb) => (
              <div key={fb.id} className="p-5 bg-background hover:bg-muted/10 transition-colors">
                
                {/* Tiêu đề dự thảo & Trạng thái */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Góp ý cho dự thảo:</p>
                    <h4 className="font-semibold text-sm line-clamp-1">{fb.draftTitle}</h4>
                  </div>
                  {fb.status === "PENDING" && <Badge variant="secondary" className="bg-amber-100 text-amber-700 shadow-none"><Clock className="h-3 w-3 mr-1" /> Chờ duyệt</Badge>}
                  {fb.status === "APPROVED" && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 shadow-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Đã công khai</Badge>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Cột trái: Thông tin người gửi */}
                  <div className="lg:col-span-1 border-r pr-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <div className="p-1.5 bg-muted rounded-full"><User className="h-4 w-4" /></div>
                      {fb.sender}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1.5 pl-8">
                      <p>Email: {fb.email}</p>
                      <p>Đ/c: {fb.address}</p>
                      <p className="mt-2 text-amber-600 font-medium">{fb.time}</p>
                    </div>
                  </div>

                  {/* Cột phải: Nội dung góp ý & Xử lý */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg border text-sm text-foreground leading-relaxed">
                      "{fb.content}"
                      {fb.id === "fb2" && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs bg-background">
                            <FileText className="h-3 w-3 mr-1.5" /> Phuong_an_chuyen_doi_so.pdf
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Khung Phản hồi của Sở (nếu đã trả lời) */}
                    {fb.reply && (
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm">
                        <p className="font-bold text-primary flex items-center gap-2 mb-1">
                          <ShieldAlert className="h-4 w-4" /> Cơ quan chủ trì phản hồi:
                        </p>
                        <p className="text-foreground">{fb.reply}</p>
                      </div>
                    )}

                    {/* Nút thao tác (Duyệt / Trả lời) */}
                    <div className="flex items-center gap-2 pt-2">
                      {fb.status === "PENDING" && (
                        <>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <CheckSquare className="h-4 w-4 mr-1.5" /> Duyệt cho hiển thị
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                            <XCircle className="h-4 w-4 mr-1.5" /> Đánh dấu Spam
                          </Button>
                        </>
                      )}
                      
                      {!fb.reply && (
                        <Button variant="secondary" size="sm" onClick={() => setReplyingTo(fb.id)}>
                          <MessageCircleReply className="h-4 w-4 mr-1.5" /> Viết phản hồi / Tiếp thu
                        </Button>
                      )}
                    </div>

                    {/* Khung nhập phản hồi (Mở ra khi bấm "Viết phản hồi") */}
                    {replyingTo === fb.id && (
                      <div className="mt-4 space-y-3 p-4 border rounded-lg bg-background shadow-sm">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Nội dung giải trình (Sẽ Public lên web):</p>
                        <Textarea placeholder="Nhập nội dung phản hồi chính thức của Cơ quan nhà nước..." className="h-24 resize-none" />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Hủy bỏ</Button>
                          <Button size="sm" className="shadow-sm">Gửi phản hồi</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
