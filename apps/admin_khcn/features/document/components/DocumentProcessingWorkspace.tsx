"use client";

import { useState, useEffect } from "react";
import {
  FileSignature, CornerUpRight, MessageSquare, History,
  CheckCheck, XCircle, FileText, Download, Printer, Stamp,
  Globe2, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments } from "@/features/document/hooks/useDocuments";

// Dữ liệu mô phỏng luồng xử lý
const workflowHistory = [
  { id: 1, user: "Nguyễn Thị Thu (Văn thư)", action: "Vào sổ văn bản đến", time: "25/02/2026 08:30", note: "" },
  { id: 2, user: "Trần Văn Lãnh (Giám đốc Sở)", action: "Phân xử lý", time: "25/02/2026 09:15", note: "Giao đồng chí Mạnh chủ trì, phối hợp với các phòng ban liên quan tham mưu phản hồi trước ngày 28/02." },
  { id: 3, user: "Mạnh (Chuyên viên CNTT)", action: "Tiếp nhận xử lý", time: "25/02/2026 10:00", note: "" },
];

export default function DocumentProcessingWorkspace({ document }: { document?: any }) {
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [transCategory, setTransCategory] = useState("GENERAL");
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [isSaving, setIsSaving] = useState(false);

  const { updateDocument } = useDocuments();

  useEffect(() => {
    if (document) {
      setIsPublic(!!document.isPublic);
      setTransCategory(document.transparencyCategory || "GENERAL");
      setFiscalYear(document.fiscalYear?.toString() || "2026");
    }
  }, [document]);

  const handleSavePublicity = async () => {
    setIsSaving(true);
    try {
      await updateDocument({
        id: document.id,
        isPublic,
        transparencyCategory: isPublic ? transCategory : null,
        fiscalYear: isPublic ? parseInt(fiscalYear) : null,
      });
    } catch (error) {
      console.error("Save publicity error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground italic">
        Đang tải thông tin văn bản xử lý...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-muted/5 gap-4 p-4 overflow-y-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-background p-3 rounded-lg border shadow-sm shrink-0">
        <div>
          <h2 className="text-lg font-bold text-foreground">{document.documentNumber || document.arrivalNumber}: {document.abstract}</h2>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            {(document.urgency === 'URGENT' || document.urgency === 'FLASH') && (
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 shadow-none px-1.5 py-0 h-4 text-[10px]">
                {document.urgency === 'FLASH' ? 'HỎA TỐC' : 'KHẨN'}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              Hạn xử lý: {document.processingDeadline ? new Date(document.processingDeadline).toLocaleDateString('vi-VN') : 'Không có hạn'}
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span>Nguồn: {document.issuerName || 'Nội bộ'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" /> In phiếu xử lý</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Tải tệp gốc</Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* CỘT TRÁI: Trình xem PDF (PDF Viewer Placeholder) */}
        <div className="flex-1 bg-muted/20 border rounded-lg flex flex-col overflow-hidden relative shadow-inner">
          <div className="bg-background border-b p-2 flex justify-center items-center gap-4 text-sm text-muted-foreground shrink-0">
            <span>Trang 1 / 3</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {document.fileId ? `Tai_lieu_${(document.id || 'file').slice(0, 5)}.pdf` : 'Chưa có tệp đính kèm'}</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl h-full bg-white shadow-md border rounded p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Stamp className="h-16 w-16 text-rose-500/20 mb-4 transform -rotate-12" />
              <p>Khu vực hiển thị nội dung tệp PDF văn bản gốc</p>
              <p className="text-xs mt-2">Hỗ trợ cuộn, phóng to, thu nhỏ và kéo thả chữ ký số</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Thao tác & Lịch sử luân chuyển */}
        <div className="w-[400px] flex flex-col gap-4 shrink-0">

          {/* Card Thao tác (Hành động của user hiện tại) */}
          <Card className="border shadow-sm shrink-0">
            <CardHeader className="p-4 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-primary" /> Xử lý văn bản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Ý kiến xử lý / Bút phê:</label>
                <Textarea
                  placeholder="Nhập nội dung trình Lãnh đạo hoặc ghi chú luân chuyển..."
                  className="h-24 resize-none text-sm"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full shadow-sm bg-blue-600 hover:bg-blue-700">
                  <CornerUpRight className="h-4 w-4 mr-2" /> Chuyển xử lý
                </Button>
                <Button variant="outline" className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  <CheckCheck className="h-4 w-4 mr-2" /> Kết thúc / Lưu hồ sơ
                </Button>
                <Button variant="outline" className="w-full text-foreground border-border hover:bg-muted col-span-2 mt-1">
                  <FileSignature className="h-4 w-4 mr-2" /> Ký số & Trình duyệt (VGCA)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Công khai (Publicity Settings) */}
          <Card className="border shadow-sm shrink-0">
            <CardHeader className="p-4 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-emerald-600" /> Cấu hình Công khai
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   {isPublic ? <Globe2 className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                   <span className="text-sm font-medium">{isPublic ? 'Đang công khai' : 'Đang lưu nội bộ'}</span>
                 </div>
                 <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              
              {isPublic && (
                <div className="space-y-4 pt-4 border-t border-dashed">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-muted-foreground">Phạm vi công khai:</label>
                    <Select value={transCategory} onValueChange={setTransCategory}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Chọn loại công khai" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">Công khai chung (Trục VDX)</SelectItem>
                        <SelectItem value="ESTIMATE">Dự toán ngân sách</SelectItem>
                        <SelectItem value="SETTLEMENT">Quyết toán ngân sách</SelectItem>
                        <SelectItem value="EXECUTION">Thực hiện dự toán</SelectItem>
                        <SelectItem value="CONSULTATION">Lấy ý kiến nhân dân</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {transCategory !== 'GENERAL' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase text-muted-foreground">Năm tài chính:</label>
                      <Select value={fiscalYear} onValueChange={setFiscalYear}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-bold"
                onClick={handleSavePublicity}
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu cấu hình công khai'}
              </Button>
            </CardContent>
          </Card>

          {/* Card Lịch sử (Workflow Timeline) */}
          <Card className="border shadow-sm flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/10 shrink-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Lịch sử luân chuyển
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {workflowHistory.map((step, index) => (
                  <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-2 md:left-1/2 z-10">
                      <CheckCheck className="h-3 w-3" />
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] ml-10 md:ml-0 p-3 rounded-lg border bg-background shadow-sm text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-primary text-xs">{step.user}</span>
                      </div>
                      <span className="font-medium text-foreground block mb-1">{step.action}</span>
                      {step.note && (
                        <div className="mt-2 p-2 bg-amber-50/50 border border-amber-100 rounded text-xs text-foreground italic flex gap-2">
                          <MessageSquare className="h-3 w-3 shrink-0 mt-0.5 text-amber-600" />
                          <span>"{step.note}"</span>
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground mt-2 block">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
