"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UploadCloud, Link as LinkIcon, FileText, X, CheckCircle2,
  CalendarIcon, Building2, UserCircle, Loader2, ShieldCheck, AlertTriangle
} from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const documentSchema = z.object({
  type: z.string().min(1, "Vui lòng chọn loại văn bản"),
  documentNumber: z.string().min(1, "Số/Ký hiệu không được để trống"),
  promulgationDate: z.string().min(1, "Vui lòng chọn ngày ban hành"),
  abstract: z.string().min(10, "Trích yếu phải có ít nhất 10 ký tự"),
  issuer: z.string().min(1, "Cơ quan ban hành không được để trống"),
  signer: z.string().min(1, "Người ký không được để trống"),
  urgency: z.enum(["NORMAL", "URGENT", "FLASH"]),
  linkedDocumentId: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export function DocumentUploadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // States quản lý tiến trình bóc tách OCR & Chữ ký số
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<'VALID' | 'INVALID' | 'NONE' | null>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: "CONG_VAN",
      documentNumber: "",
      promulgationDate: "",
      abstract: "",
      issuer: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
      signer: "",
      urgency: "NORMAL",
      linkedDocumentId: "",
    },
  });

  useEffect(() => {
    form.setValue("promulgationDate", new Date().toISOString().split('T')[0]);
  }, [form]);

  // Hàm giả lập luồng WebSocket nhận kết quả từ DOCUMENT_WORKER_SERVICE
  const processFileMetadata = (file: File) => {
    setIsProcessing(true);
    setSignatureStatus(null);

    // Giả lập delay 2 giây để quét OCR và Verify Chữ ký số
    setTimeout(() => {
      // 1. Kết quả kiểm tra chữ ký số (VGCA)
      setSignatureStatus('VALID');

      // 2. Tự động điền (Auto-fill) các trường bóc tách được từ file PDF
      form.setValue("type", "QUYET_DINH");
      form.setValue("documentNumber", "125/QĐ-SKHCN");
      form.setValue("abstract", "Quyết định về việc ban hành quy chế bảo đảm an toàn thông tin mạng trong hoạt động của cơ quan nhà nước.");
      form.setValue("signer", "Nguyễn Văn A");
      form.setValue("issuer", "Sở Khoa học và Công nghệ tỉnh Đắk Lắk");

      setIsProcessing(false);
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      processFileMetadata(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      processFileMetadata(file);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setSignatureStatus(null);
    form.reset();
  };

  const onSubmit = (values: DocumentFormValues) => {
    if (!uploadedFile) return alert("Vui lòng đính kèm file văn bản!");
    console.log("Payload lưu Database:", { ...values, signatureValid: signatureStatus === 'VALID' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UploadCloud className="h-5 w-5 text-primary" /> Vào sổ & Tải lên văn bản điện tử
          </DialogTitle>
          <DialogDescription>
            Tự động bóc tách siêu dữ liệu OCR và xác thực chứng thư số của Ban Cơ yếu Chính phủ.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="max-h-[75vh] overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin">

            {/* 1. KHU VỰC UPLOAD & QUÉT DỮ LIỆU */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> 1. Tệp văn bản đính kèm
              </h3>

              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:bg-muted/10 hover:border-primary/50"
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">Kéo thả tệp PDF vào đây để bóc tách tự động</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Hỗ trợ nhận diện OCR và Chữ ký số (Tối đa 20MB)</p>
                  <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </div>
              ) : (
                <div className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors ${isProcessing ? 'border-primary/50 bg-primary/5' : 'border-emerald-200 bg-emerald-50/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isProcessing ? 'bg-primary/20 text-primary' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {!isProcessing && (
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={resetUpload}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Thanh trạng thái xử lý */}
                  <div className="bg-background rounded-lg p-3 border text-sm flex items-center justify-between">
                    {isProcessing ? (
                      <span className="text-primary font-medium flex items-center gap-2 text-xs">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Hệ thống đang bóc tách OCR và kiểm tra chữ ký số...
                      </span>
                    ) : (
                      <div className="flex items-center gap-4">
                        {signatureStatus === 'VALID' ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold px-2 py-1 flex items-center gap-1.5 shadow-none">
                            <ShieldCheck className="h-3.5 w-3.5" /> Chữ ký số hợp lệ (VGCA)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300 font-semibold px-2 py-1 flex items-center gap-1.5 shadow-none">
                            <AlertTriangle className="h-3.5 w-3.5" /> Không có chữ ký số hợp lệ
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đã tự động điền thông tin OCR
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <Separator />

            {/* 2. SIÊU DỮ LIỆU VĂN BẢN (AUTO-FILLED) */}
            <section className={`space-y-4 transition-opacity duration-500 ${isProcessing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" /> 2. Trích xuất thông tin (Metadata)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="documentNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số / Ký hiệu văn bản <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="VD: 123/QĐ-UBND" className="font-mono bg-muted/20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="promulgationDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày ban hành <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} className="pl-9 bg-muted/20" />
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="abstract" render={({ field }) => (
                <FormItem>
                  <FormLabel>Trích yếu nội dung <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập tóm tắt nội dung văn bản..." className="resize-none h-20 bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="issuer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cơ quan ban hành <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="VD: UBND Tỉnh Đắk Lắk" {...field} className="pl-9 bg-muted/20" />
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="signer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người ký <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Nhập tên người ký..." {...field} className="pl-9 bg-muted/20" />
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            <Separator />

            {/* 3. KHU VỰC LIÊN KẾT & PHÂN LOẠI */}
            <section className={`space-y-4 transition-opacity duration-500 ${isProcessing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> 3. Phân loại & Liên kết
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại văn bản</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="CONG_VAN">Công văn</SelectItem>
                        <SelectItem value="QUYET_DINH">Quyết định</SelectItem>
                        <SelectItem value="TO_TRINH">Tờ trình</SelectItem>
                        <SelectItem value="BAO_CAO">Báo cáo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="urgency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ khẩn</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                        <SelectItem value="URGENT" className="text-amber-600 font-semibold">Khẩn</SelectItem>
                        <SelectItem value="FLASH" className="text-destructive font-bold">Hỏa tốc</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="linkedDocumentId" render={({ field }) => (
                <FormItem className="bg-muted/10 p-4 border rounded-lg border-dashed">
                  <FormLabel className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-primary" /> Hồ sơ/Văn bản liên quan (Tùy chọn)
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="Nhập số ký hiệu văn bản trước đó..." {...field} className="bg-background" />
                      <Button type="button" variant="secondary" className="shrink-0">Tra cứu</Button>
                    </div>
                  </FormControl>
                </FormItem>
              )} />
            </section>
          </form>
        </Form>

        <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
          <Button type="button" variant="ghost" onClick={onClose} className="w-24">Hủy bỏ</Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            className="w-32 shadow-md"
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Vào sổ văn bản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
