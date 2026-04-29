"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Calendar, User, Building2, ShieldCheck,
  Download, Printer, Share2, AlertCircle, Clock, Paperclip,
  CheckCircle2, X
} from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

export function DocumentDetailModal({ isOpen, onClose, documentId }: DocumentDetailModalProps) {
  const { useGetDocument } = useDocuments();
  const { data: doc, isLoading } = useGetDocument(documentId || "");

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "---";
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'FLASH': return <Badge className="bg-rose-500 text-white border-none font-black px-3 py-1">HỎA TỐC</Badge>;
      case 'URGENT': return <Badge className="bg-amber-500 text-white border-none font-black px-3 py-1">KHẨN</Badge>;
      default: return <Badge variant="secondary" className="font-bold px-3 py-1">BÌNH THƯỜNG</Badge>;
    }
  };

  const getSecurityBadge = (level: string) => {
    switch (level) {
      case 'TOP_SECRET': return <Badge className="bg-purple-600 text-white border-none font-black px-3 py-1">TUYỆT MẬT</Badge>;
      case 'SECRET': return <Badge className="bg-indigo-500 text-white border-none font-black px-3 py-1">TỐI MẬT</Badge>;
      case 'CONFIDENTIAL': return <Badge className="bg-blue-500 text-white border-none font-black px-3 py-1">MẬT</Badge>;
      default: return null;
    }
  };

  const handlePrint = () => {
    if (doc?.fileId) {
      toast.info("Đang chuẩn bị tệp tin để in...");
      const fileUrl = `/api/v1/admin/media/download/${doc.fileId}`;

      // Tạo một iframe ẩn để nạp file PDF và in
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = fileUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.print();
            // Xóa iframe sau khi in xong (hoặc sau một khoảng thời gian)
            setTimeout(() => document.body.removeChild(iframe), 1000);
          }
        }, 500);
      };
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (!doc?.fileId) {
      toast.error("Không có tệp tin để tải xuống");
      return;
    }
    // URL tải xuống chuẩn của hệ thống
    const downloadUrl = `/api/v1/admin/media/download/${doc.fileId}`;
    window.open(downloadUrl, '_blank');
    toast.success("Đang bắt đầu tải xuống...");
  };

  const handleShare = () => {
    const url = window.location.href + `?docId=${documentId}`;
    navigator.clipboard.writeText(url);
    toast.success(" đã sao chép liên kết văn bản vào bộ nhớ tạm!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background flex flex-col max-h-[90vh] print-content">
        <DialogHeader className="p-8 bg-muted/20 border-b shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Chi tiết văn bản</span>
                {doc?.isIncoming ? (
                  <Badge variant="outline" className="text-[10px] font-bold border-blue-200 text-blue-600 bg-blue-50">VĂN BẢN ĐẾN</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-200 text-emerald-600 bg-emerald-50">VĂN BẢN ĐI</Badge>
                )}
              </div>
              <DialogTitle className="text-2xl font-black leading-tight text-foreground line-clamp-2">
                {isLoading ? <Skeleton className="h-8 w-full" /> : (doc?.abstract || "Không có trích yếu")}
              </DialogTitle>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {doc && getUrgencyBadge(doc.urgency)}
              {doc && getSecurityBadge(doc.securityLevel)}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {isLoading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-40 w-full rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ) : !doc ? (
            <div className="py-20 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
              <p className="text-muted-foreground font-medium">Không tìm thấy thông tin văn bản này.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Thông tin chính */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Số / Ký hiệu</p>
                      <p className="font-mono font-black text-lg text-foreground">{doc.documentNumber}/{doc.notation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Cơ quan ban hành</p>
                      <p className="font-bold text-foreground text-sm">{doc.issuerName || '---'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Ngày ban hành</p>
                      <p className="font-bold text-foreground text-sm">{formatDate(doc.issueDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Người ký</p>
                      <p className="font-bold text-foreground text-sm">{doc.signerName || '---'}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{doc.signerPosition || '---'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-muted-foreground/10" />

              {/* Chi tiết nội dung */}
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Nội dung văn bản
                </h4>
                <div className="p-6 bg-muted/10 rounded-3xl border border-muted-foreground/10 leading-relaxed text-foreground/80 font-medium">
                  {doc.content || doc.abstract || "Nội dung chưa được cập nhật."}
                </div>
              </div>

              {/* Tệp đính kèm */}
              {doc.fileId && (
                <div className="space-y-4 no-print">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-blue-500" /> Tệp đính kèm
                  </h4>
                  <div
                    onClick={handleDownload}
                    className="group p-4 rounded-2xl border bg-background hover:bg-muted/10 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">File_Van_Ban_Goc.pdf</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Tệp văn bản chính • 1.2MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Metadata khác */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-muted/5 rounded-3xl">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Loại văn bản</p>
                  <p className="text-xs font-bold mt-1">Nghị định</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Số trang</p>
                  <p className="text-xs font-bold mt-1">{doc.pageCount || 1} trang</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Số bản lưu</p>
                  <p className="text-xs font-bold mt-1">{doc.attachmentCount || 0} bản</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Năm ngân sách</p>
                  <p className="text-xs font-bold mt-1">{doc.fiscalYear || '---'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/20 border-t shrink-0 flex items-center justify-between sm:justify-between gap-4 no-print">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline" size="sm" className="rounded-xl font-bold bg-background shadow-sm h-10 px-4"
            >
              <Printer className="h-4 w-4 mr-2" /> In văn bản
            </Button>
            <Button
              onClick={handleShare}
              variant="outline" size="sm" className="rounded-xl font-bold bg-background shadow-sm h-10 px-4"
            >
              <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
            </Button>
          </div>
          <Button onClick={onClose} className="rounded-xl font-bold px-8 h-10 bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all active:scale-95">
            Đóng lại
          </Button>
        </DialogFooter>

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none;
              border: none;
            }
            .custom-scrollbar {
              overflow: visible !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
