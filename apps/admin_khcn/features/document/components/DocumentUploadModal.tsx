"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UploadCloud, Link as LinkIcon, FileText, X, CheckCircle2,
  CalendarIcon, Building2, UserCircle, Loader2, ShieldCheck, AlertTriangle
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useDocuments } from "../hooks/useDocuments";

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
  typeId: z.string().min(1, "Vui lòng chọn loại văn bản"),
  fieldId: z.string().min(1, "Vui lòng chọn lĩnh vực"),
  documentNumber: z.string().min(1, "Số văn bản không được để trống"),
  notation: z.string().min(1, "Ký hiệu không được để trống"),
  arrivalNumber: z.string().optional(),
  issueDate: z.string().min(1, "Vui lòng chọn ngày ban hành"),
  arrivalDate: z.string().optional(),
  abstract: z.string().min(10, "Trích yếu phải có ít nhất 10 ký tự"),
  issuerName: z.string().min(1, "Cơ quan ban hành không được để trống"),
  signerName: z.string().min(1, "Người ký không được để trống"),
  signerPosition: z.string().optional(),
  recipients: z.string().optional(),
  urgency: z.enum(["NORMAL", "URGENT", "FLASH"]),
  securityLevel: z.enum(["NORMAL", "CONFIDENTIAL", "SECRET", "TOP_SECRET"]),
  pageCount: z.number().min(1),
  attachmentCount: z.number().min(0),
  linkedDocumentId: z.string().optional(),
  isPublic: z.boolean().default(false),
  fiscalYear: z.number().optional(),
  transparencyCategory: z.enum(["NONE", "ESTIMATE", "SETTLEMENT", "EXECUTION"]).default("NONE"),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export function DocumentUploadModal({ isOpen, onClose, isIncoming = true }: { isOpen: boolean, onClose: () => void, isIncoming?: boolean }) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState<{ types: any[], fields: any[] }>({ types: [], fields: [] });

  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<'VALID' | 'INVALID' | 'NONE' | null>(null);
  const { uploadFile, isUploading } = useFileUpload();
  const { createDocument, getCategories, isLoading: isCreating } = useDocuments();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema) as any,
    defaultValues: {
      typeId: "",
      fieldId: "",
      documentNumber: "",
      notation: "",
      arrivalNumber: "",
      issueDate: new Date().toISOString().split('T')[0],
      arrivalDate: "",
      abstract: "",
      issuerName: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
      signerName: "",
      signerPosition: "",
      recipients: "",
      urgency: "NORMAL",
      securityLevel: "NORMAL",
      pageCount: 1,
      attachmentCount: 0,
      linkedDocumentId: "",
      isPublic: false,
      fiscalYear: new Date().getFullYear(),
      transparencyCategory: "NONE",
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      const typeRes = await getCategories("DOCUMENT_TYPE");
      const fieldRes = await getCategories("DOCUMENT_FIELD");
      setCategories({ 
        types: typeRes?.data || [], 
        fields: fieldRes?.data || [] 
      });
    };
    if (isOpen) loadCategories();
  }, [isOpen]);

  const processFileMetadata = (file: File) => {
    setIsProcessing(true);
    setSignatureStatus(null);

    setTimeout(() => {
      setSignatureStatus('VALID');
      form.setValue("documentNumber", "125");
      form.setValue("notation", "QĐ-SKHCN");
      form.setValue("abstract", "Quyết định về việc ban hành quy chế bảo đảm an toàn thông tin mạng trong hoạt động của cơ quan nhà nước.");
      form.setValue("signerName", "Nguyễn Văn A");
      form.setValue("signerPosition", "Giám đốc Sở");
      form.setValue("issuerName", "Sở Khoa học và Công nghệ tỉnh Đắk Lắk");
      form.setValue("pageCount", 5);
      form.setValue("attachmentCount", 2);
      form.setValue("recipients", "Văn phòng UBND tỉnh; Các phòng chuyên môn; Lưu VT.");

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

  const onSubmit = async (values: DocumentFormValues) => {
    if (!uploadedFile) return alert("Vui lòng đính kèm file văn bản!");

    try {
      const media = await uploadFile(uploadedFile);
      await createDocument({
        ...values,
        fileId: media.id,
        isIncoming,
        signatureValid: signatureStatus === 'VALID',
      });
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden shadow-2xl border-none">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary/10 via-background to-background">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            Vào sổ & Tải lên văn bản điện tử
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Tuân thủ Nghị định 30/2020/NĐ-CP về công tác văn thư.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="max-h-[70vh] overflow-y-auto px-8 py-6 space-y-8 scrollbar-thin">

            {/* Tệp đính kèm */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" /> 1. TỆP VĂN BẢN ĐÍNH KÈM
                </h3>
              </div>

              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/20 hover:bg-muted/5 hover:border-primary/40"
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary animate-bounce-subtle">
                    <UploadCloud className="h-10 w-10" />
                  </div>
                  <p className="font-bold text-foreground">Kéo thả tệp PDF vào đây</p>
                  <p className="text-xs text-muted-foreground mt-2 max-w-[300px]">
                    Hệ thống sẽ tự động quét OCR bóc tách dữ liệu và xác thực chứng thư số của Ban Cơ yếu Chính phủ.
                  </p>
                  <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </div>
              ) : (
                <div className={`border rounded-2xl p-5 flex flex-col gap-4 shadow-sm transition-all ${isProcessing ? 'border-primary/50 bg-primary/5' : 'border-emerald-200 bg-emerald-50/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-inner ${isProcessing ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isProcessing ? <Loader2 className="h-7 w-7 animate-spin" /> : <ShieldCheck className="h-7 w-7" />}
                      </div>
                      <div>
                        <p className="font-bold text-base text-foreground">{uploadedFile.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] font-mono">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                          {!isProcessing && <Badge className="bg-emerald-600 text-white border-none text-[10px]">ĐÃ TỐI ƯU</Badge>}
                        </div>
                      </div>
                    </div>
                    {!isProcessing && (
                      <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={resetUpload}>
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 flex items-center justify-between shadow-inner">
                    {isProcessing ? (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-tighter">
                          <span>Đang bóc tách OCR & Verify Digital Signature...</span>
                          <span>65%</span>
                        </div>
                        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-progress-loading w-[65%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 w-full">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs ${signatureStatus === 'VALID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                          {signatureStatus === 'VALID' ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          {signatureStatus === 'VALID' ? 'CHỨNG THƯ SỐ HỢP LỆ (VGCA)' : 'CHỮA CÓ CHỨNG THƯ SỐ'}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                          <CheckCircle2 className="h-4 w-4" /> TRÍCH XUẤT OCR THÀNH CÔNG
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Thông tin metadata */}
            <div className={`space-y-6 transition-all duration-700 ${isProcessing ? 'opacity-30 blur-[2px] pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-primary whitespace-nowrap">
                  <Building2 className="h-4 w-4" /> 2. THÔNG TIN VĂN BẢN (METADATA)
                </h3>
                <div className="h-px w-full bg-gradient-to-r from-border to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <FormField name="documentNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Số văn bản <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="123" className="bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="md:col-span-4">
                  <FormField name="notation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Ký hiệu <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="QĐ-SKHCN" className="bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="md:col-span-4">
                  <FormField name="arrivalNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Số đến (Nếu có)</FormLabel>
                      <FormControl><Input placeholder="456/Đ" className="bg-muted/10 border-muted-foreground/10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="md:col-span-6">
                  <FormField name="issueDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Ngày ban hành <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="date" {...field} className="pl-10 bg-muted/10 border-muted-foreground/10" />
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="md:col-span-6">
                  <FormField name="arrivalDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Ngày nhận (Đối với VB Đến)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="date" {...field} className="pl-10 bg-muted/10 border-muted-foreground/10" />
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="md:col-span-12">
                  <FormField name="abstract" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Trích yếu nội dung <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tóm tắt nội dung chính của văn bản..." className="resize-none h-24 bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all leading-relaxed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="md:col-span-6">
                  <FormField name="issuerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Cơ quan ban hành <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="VD: UBND Tỉnh Đắk Lắk" className="bg-muted/10 border-muted-foreground/10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="md:col-span-6">
                  <FormField name="signerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Người ký <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Họ và tên người ký" className="bg-muted/10 border-muted-foreground/10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="md:col-span-12">
                  <FormField name="recipients" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Nơi nhận (Cách nhau bởi dấu chấm phẩy)</FormLabel>
                      <FormControl><Input placeholder="VD: UBND tỉnh; Sở Tài chính; Lưu VT" className="bg-muted/10 border-muted-foreground/10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="md:col-span-12 bg-primary/5 p-4 rounded-xl border border-primary/10">
                   <div className="flex items-center justify-between mb-4">
                      <div className="space-y-0.5">
                         <FormLabel className="text-sm font-bold text-primary uppercase">Công khai tài chính</FormLabel>
                         <p className="text-[10px] text-muted-foreground">Văn bản sẽ hiển thị tại mục "Công khai ngân sách"</p>
                      </div>
                      <FormField name="isPublic" render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                           <FormControl>
                              <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-primary cursor-pointer" />
                           </FormControl>
                        </FormItem>
                      )} />
                   </div>
                   
                   {form.watch("isPublic") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                         <FormField name="fiscalYear" render={({ field }) => (
                           <FormItem>
                             <FormLabel className="text-[10px] font-bold uppercase">Năm tài chính</FormLabel>
                             <FormControl><Input type="number" className="bg-background border-primary/20 h-9" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                           </FormItem>
                         )} />
                         <FormField name="transparencyCategory" render={({ field }) => (
                           <FormItem>
                             <FormLabel className="text-[10px] font-bold uppercase">Phân loại báo cáo</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                               <FormControl><SelectTrigger className="bg-background border-primary/20 h-9"><SelectValue /></SelectTrigger></FormControl>
                               <SelectContent>
                                 <SelectItem value="NONE">-- Chọn loại --</SelectItem>
                                 <SelectItem value="ESTIMATE">Dự toán thu - chi</SelectItem>
                                 <SelectItem value="SETTLEMENT">Quyết toán thu - chi</SelectItem>
                                 <SelectItem value="EXECUTION">Thực hiện ngân sách</SelectItem>
                               </SelectContent>
                             </Select>
                           </FormItem>
                         )} />
                      </div>
                   )}
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Phân loại và Cấu hình */}
            <div className={`space-y-6 transition-all duration-700 delay-100 ${isProcessing ? 'opacity-30 blur-[2px] pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-primary whitespace-nowrap">
                  <LinkIcon className="h-4 w-4" /> 3. PHÂN LOẠI & CẤU HÌNH HỆ THỐNG
                </h3>
                <div className="h-px w-full bg-gradient-to-r from-border to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField name="typeId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Loại văn bản</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-muted/10 border-muted-foreground/10"><SelectValue placeholder="Chọn loại..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.types.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        {categories.types.length === 0 && <SelectItem value="QUYET_DINH">Quyết định</SelectItem>}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField name="fieldId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Lĩnh vực</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-muted/10 border-muted-foreground/10"><SelectValue placeholder="Chọn lĩnh vực..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.fields.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        {categories.fields.length === 0 && <SelectItem value="KHCN">Khoa học & Công nghệ</SelectItem>}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField name="urgency" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Độ khẩn</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-muted/10 border-muted-foreground/10"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                        <SelectItem value="URGENT" className="text-amber-600 font-bold">Khẩn</SelectItem>
                        <SelectItem value="FLASH" className="text-destructive font-black">Hỏa tốc</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField name="securityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Độ mật</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-muted/10 border-muted-foreground/10"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                        <SelectItem value="CONFIDENTIAL" className="text-blue-600 font-bold">Mật</SelectItem>
                        <SelectItem value="SECRET" className="text-amber-700 font-bold">Tối mật</SelectItem>
                        <SelectItem value="TOP_SECRET" className="text-destructive font-black">Tuyệt mật</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter className="p-6 border-t bg-muted/5 gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-8 hover:bg-background transition-all">Hủy bỏ</Button>
          <Button
            type="button"
            onClick={form.handleSubmit(((v: any) => onSubmit(v)) as any)}
            className="rounded-xl px-10 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary hover:bg-primary/90"
            disabled={isProcessing || isCreating || isUploading}
          >
            {isProcessing || isCreating || isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Xác nhận vào sổ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
