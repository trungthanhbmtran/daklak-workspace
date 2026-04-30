"use client";

import { useState } from "react";
import { 
  Search, CheckCircle2, XCircle, MessageCircleReply, 
  Globe, ShieldAlert, User, Clock, FileText, CheckSquare,
  Mail, Phone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useDocuments, usePublicComments } from "@/features/document/hooks/useDocuments";

export default function PublicFeedbacksPage() {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  
  const { data: comments, isLoading } = usePublicComments(undefined, filterStatus);
  const { moderateComment, isLoading: isActionLoading } = useDocuments();

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await moderateComment({ id, status });
    } catch (error) {
      console.error("Moderation error:", error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Duyệt Góp ý Công chúng
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kiểm duyệt và phê duyệt ý kiến đóng góp từ người dân, doanh nghiệp.
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
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
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">Đang tải dữ liệu...</div>
            ) : comments?.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">Không có góp ý nào.</div>
            ) : comments.map((fb: any) => (
              <div key={fb.id} className={`p-5 transition-colors ${
                fb.status === 'APPROVED' ? 'bg-emerald-50/20' : 
                fb.status === 'REJECTED' ? 'bg-red-50/20' : 
                'bg-background hover:bg-muted/10'
              }`}>
                
                {/* Tiêu đề dự thảo & Trạng thái */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Góp ý cho dự thảo:</p>
                    <h4 className="font-bold text-sm text-foreground">{fb.draftTitle || 'Văn bản dự thảo'}</h4>
                  </div>
                  <Badge className={`shadow-none font-bold text-[10px] uppercase px-2 py-0.5 ${
                    fb.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    fb.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {fb.status === 'PENDING' && <><Clock className="h-2.5 w-2.5 mr-1" /> Chờ duyệt</>}
                    {fb.status === 'APPROVED' && <><CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Đã duyệt</>}
                    {fb.status === 'REJECTED' && <><XCircle className="h-2.5 w-2.5 mr-1" /> Từ chối</>}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Cột trái: Thông tin người gửi */}
                  <div className="lg:col-span-1 border-r pr-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <div className="p-1.5 bg-muted rounded-full"><User className="h-4 w-4" /></div>
                      {fb.fullName}
                    </div>
                    <div className="text-[11px] text-muted-foreground space-y-1.5 pl-8">
                      {fb.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {fb.email}</p>}
                      {fb.phoneNumber && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {fb.phoneNumber}</p>}
                      <p className="mt-2 text-primary/60 font-bold">{new Date(fb.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Cột phải: Nội dung góp ý & Xử lý */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="bg-muted/30 p-4 rounded-xl border border-muted/50 text-sm text-foreground leading-relaxed italic">
                      "{fb.content}"
                    </div>

                    {/* Nút thao tác (Duyệt / Trả lời) */}
                    <div className="flex items-center gap-2 pt-2">
                      {fb.status === "PENDING" && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold text-xs h-9 px-4"
                            onClick={() => handleModerate(fb.id, 'APPROVED')}
                            disabled={isActionLoading}
                          >
                            <CheckSquare className="h-4 w-4 mr-1.5" /> Phê duyệt cho hiển thị
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-100 hover:bg-red-50 font-bold text-xs h-9 px-4"
                            onClick={() => handleModerate(fb.id, 'REJECTED')}
                            disabled={isActionLoading}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" /> Từ chối / Spam
                          </Button>
                        </>
                      )}
                      
                      {fb.status !== 'PENDING' && (
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground" onClick={() => handleModerate(fb.id, 'PENDING')}>
                          Khôi phục trạng thái chờ duyệt
                        </Button>
                      )}
                    </div>
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
