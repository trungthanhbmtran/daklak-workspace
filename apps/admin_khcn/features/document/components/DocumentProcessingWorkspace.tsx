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
import { useDocuments, useDocumentLogs } from "@/features/document/hooks/useDocuments";
import { toast } from "sonner";

export default function DocumentProcessingWorkspace({ document }: { document?: any }) {
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [transCategory, setTransCategory] = useState("GENERAL");
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [isSaving, setIsSaving] = useState(false);

  const { updateDocument } = useDocuments();
  const { data: logs = [], isLoading: isLoadingLogs } = useDocumentLogs(document?.id);

  useEffect(() => {
    if (document) {
      setIsPublic(!!document.isPublic);
      setTransCategory(document.transparencyCategory || "GENERAL");
      setFiscalYear(document.fiscalYear?.toString() || "2026");
    }
  }, [document]);

  const handleAction = async (status: string, actionLabel: string) => {
    if (!comment && status !== 'PUBLISHED') {
      toast.error("Vui lòng nhập ý kiến xử lý");
      return;
    }

    setIsSaving(true);
    try {
      await updateDocument({
        id: document.id,
        status,
        comment, // Sẽ được log Record phía backend
        isPublic,
        transparencyCategory: isPublic ? transCategory : null,
        fiscalYear: isPublic ? parseInt(fiscalYear) : null,
      });
      setComment("");
    } catch (error) {
      console.error(`${actionLabel} error:`, error);
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
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground truncate max-w-[800px]">{document.documentNumber || document.arrivalNumber}: {document.abstract}</h2>
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
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" /> In phiếu</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Tải về</Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* CỘT TRÁI: Trình xem văn bản */}
        <div className="flex-1 bg-muted/20 border rounded-lg flex flex-col overflow-hidden relative shadow-inner">
          <div className="bg-background border-b p-2 flex justify-center items-center gap-4 text-sm text-muted-foreground shrink-0">
            <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {document.fileId ? `Tai_lieu_${(document.id || 'file').slice(0, 5)}.pdf` : 'Chưa có tệp đính kèm'}</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl h-full bg-white shadow-md border rounded p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Stamp className="h-16 w-16 text-rose-500/20 mb-4 transform -rotate-12" />
              <p>Trình xem văn bản (PDF Viewer)</p>
              <p className="text-xs mt-2 italic">Hệ thống đang tích hợp bộ ký số trực tiếp trên văn bản</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Thao tác & Lịch sử */}
        <div className="w-[420px] flex flex-col gap-4 shrink-0">

          {/* Card Thao tác Tổng hợp */}
          <Card className="border shadow-md shrink-0 border-primary/10">
            <CardHeader className="p-4 border-b bg-primary/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-primary" /> Xử lý & Công khai
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-muted-foreground flex justify-between">
                  Ý kiến xử lý / Bút phê:
                  <span className="text-[10px] lowercase font-normal italic">Bắt buộc khi chuyển xử lý</span>
                </label>
                <Textarea
                  placeholder="Nhập nội dung trình Lãnh đạo hoặc ghi chú luân chuyển..."
                  className="h-24 resize-none text-sm border-primary/10 focus-visible:ring-primary/20"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* Publication Settings Integrated */}
              <div className="p-3 rounded-lg border bg-emerald-50/30 border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     {isPublic ? <Globe2 className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                     <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">{isPublic ? 'Công khai văn bản' : 'Lưu hành nội bộ'}</span>
                   </div>
                   <Switch checked={isPublic} onCheckedChange={setIsPublic} className="data-[state=checked]:bg-emerald-600" />
                </div>
                
                {isPublic && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-700">LOẠI CÔNG KHAI:</label>
                      <Select value={transCategory} onValueChange={setTransCategory}>
                        <SelectTrigger className="h-8 text-[11px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">Chung</SelectItem>
                          <SelectItem value="ESTIMATE">Dự toán</SelectItem>
                          <SelectItem value="SETTLEMENT">Quyết toán</SelectItem>
                          <SelectItem value="EXECUTION">Thực hiện</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-700">NĂM:</label>
                      <Select value={fiscalYear} onValueChange={setFiscalYear}>
                        <SelectTrigger className="h-8 text-[11px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="w-full shadow-sm bg-blue-600 hover:bg-blue-700 h-9 text-xs"
                  onClick={() => handleAction('PROCESSING', 'Chuyển xử lý')}
                  disabled={isSaving}
                >
                  <CornerUpRight className="h-3.5 w-3.5 mr-2" /> Chuyển xử lý
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-9 text-xs font-bold"
                  onClick={() => handleAction('PUBLISHED', 'Kết thúc')}
                  disabled={isSaving}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-2" /> Kết thúc hồ sơ
                </Button>
                <Button variant="outline" className="w-full text-foreground border-border hover:bg-muted col-span-2 h-9 text-xs">
                  <FileSignature className="h-3.5 w-3.5 mr-2" /> Ký số & Trình duyệt (VGCA)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Lịch sử (Real Timeline) */}
          <Card className="border shadow-sm flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/10 shrink-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Lịch sử luân chuyển
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              {isLoadingLogs ? (
                <div className="flex justify-center p-4 text-xs text-muted-foreground animate-pulse">Đang tải lịch sử...</div>
              ) : logs.length === 0 ? (
                <div className="text-center p-8 text-xs text-muted-foreground italic">Chưa có lịch sử xử lý</div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                  {logs.map((log: any) => (
                    <div key={log.id} className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-primary/10 text-primary shadow-sm shrink-0 z-10">
                        <CheckCheck className="h-4 w-4" />
                      </div>
                      <div className="flex-1 p-3 rounded-lg border bg-background shadow-sm text-[13px]">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-primary text-xs">{log.userName || "Hệ thống"}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <span className="font-medium text-foreground block mb-1">{log.action}</span>
                        {log.note && (
                          <div className="mt-2 p-2 bg-amber-50/50 border border-amber-100 rounded text-xs text-foreground italic flex gap-2">
                            <MessageSquare className="h-3 w-3 shrink-0 mt-0.5 text-amber-600" />
                            <span>"{log.note}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
