"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PieChart, UploadCloud, CheckCircle2, FileText,
  X, FileSpreadsheet, Building2, Calendar, ShieldCheck, FileArchive,
  FilePlus,
  Loader2
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const financeSchema = z.object({
  title: z.string().min(10, "Tên hồ sơ công khai phải dài hơn 10 ký tự"),
  documentNumber: z.string().min(2, "Vui lòng nhập số Quyết định"),
  year: z.string().min(4, "Vui lòng chọn năm tài chính"),
  period: z.string(), // Kỳ báo cáo (Cả năm, Quý 1, Quý 2...)
  category: z.enum(["ESTIMATE", "EXECUTION", "SETTLEMENT", "FUNDS"]),
});

type FinanceFormValues = z.infer<typeof financeSchema>;

export function FinanceUploadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  // Tách biệt 2 loại file để validate chuẩn nhà nước
  const [decisionPdf, setDecisionPdf] = useState<File | null>(null);
  const [attachmentExcels, setAttachmentExcels] = useState<File[]>([]);
  const { uploadFile, isUploading } = useFileUpload();

  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      title: "",
      documentNumber: "",
      year: "",
      period: "YEAR",
      category: "ESTIMATE",
    },
  });

  // Tự động sinh tên Quyết định theo chuẩn hành chính khi đổi loại báo cáo/năm
  const watchCategory = form.watch("category");
  const watchYear = form.watch("year");
  const watchPeriod = form.watch("period");

  useEffect(() => {
    form.setValue("year", new Date().getFullYear().toString());
  }, [form]);

  useEffect(() => {
    let autoTitle = "";
    const periodText = watchPeriod === "YEAR" ? "năm" : watchPeriod === "Q1" ? "Quý I năm" : watchPeriod === "Q2" ? "Quý II năm" : watchPeriod === "Q3" ? "Quý III năm" : watchPeriod === "Q4" ? "Quý IV năm" : "6 tháng đầu năm";

    if (watchCategory === "ESTIMATE") autoTitle = `Quyết định công khai dự toán thu - chi ngân sách nhà nước ${periodText} ${watchYear}`;
    if (watchCategory === "EXECUTION") autoTitle = `Báo cáo tình hình thực hiện dự toán ngân sách nhà nước ${periodText} ${watchYear}`;
    if (watchCategory === "SETTLEMENT") autoTitle = `Quyết định công khai quyết toán thu, chi ngân sách nhà nước ${periodText} ${watchYear}`;
    if (watchCategory === "FUNDS") autoTitle = `Báo cáo thu chi các quỹ tài chính ngoài ngân sách nhà nước ${periodText} ${watchYear}`;

    // Chỉ ghi đè nếu user chưa tự gõ (dirty check)
    if (!form.getFieldState("title").isDirty) {
      form.setValue("title", autoTitle);
    }
  }, [watchCategory, watchYear, watchPeriod, form]);

  const handleDecisionPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setDecisionPdf(e.target.files[0]);
    e.target.value = '';
  };

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachmentExcels((prev) => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removeExcel = (indexToRemove: number) => {
    setAttachmentExcels(attachmentExcels.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (values: FinanceFormValues) => {
    if (!decisionPdf) return alert("BẮT BUỘC: Vui lòng đính kèm File PDF Quyết định công khai (Có dấu/Chữ ký số)!");
    if (attachmentExcels.length === 0) return alert("BẮT BUỘC: Vui lòng đính kèm ít nhất 1 biểu mẫu phụ lục (File Excel)!");

    try {
      // 1. Upload file Quyết định chính
      const decisionMedia = await uploadFile(decisionPdf);

      // 2. Upload các file phụ lục song song
      const excelUploads = await Promise.all(
        attachmentExcels.map(file => uploadFile(file))
      );

      console.log("Dữ liệu sẵn sàng lưu DB:", {
        ...values,
        decisionFile: {
          id: decisionMedia.id,
          url: decisionMedia.downloadUrl
        },
        attachments: excelUploads.map(m => ({
          id: m.id,
          url: m.downloadUrl,
          name: m.fileName
        }))
      });

      onClose();
      form.reset();
      setDecisionPdf(null);
      setAttachmentExcels([]);
    } catch (error) {
      console.error("Lỗi khi xử lý hồ sơ tài chính:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 shadow-2xl overflow-hidden bg-background">
        <DialogHeader className="p-5 border-b bg-muted/20 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <PieChart className="h-5 w-5 text-primary" /> Lập Hồ sơ Công khai Ngân sách
          </DialogTitle>
          <DialogDescription>
            Đăng tải Quyết định và các Phụ lục Biểu mẫu theo đúng quy định tại Thông tư 90/2018/TT-BTC.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">

            {/* 1. THÔNG TIN HỒ SƠ */}
            <section className="space-y-4">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b pb-2">
                <Building2 className="h-4 w-4 text-primary" /> 1. Định danh Hồ sơ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase text-foreground/80">Phân loại <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="font-semibold bg-muted/10 h-10"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ESTIMATE">Dự toán NSNN</SelectItem>
                        <SelectItem value="EXECUTION">Tình hình thực hiện NSNN</SelectItem>
                        <SelectItem value="SETTLEMENT">Quyết toán NSNN</SelectItem>
                        <SelectItem value="FUNDS">Các quỹ tài chính</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-foreground/80">Năm <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="font-mono bg-muted/10 h-10"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="period" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-foreground/80">Kỳ báo cáo <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="bg-muted/10 h-10"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="YEAR">Cả năm</SelectItem>
                        <SelectItem value="Q1">Quý I</SelectItem>
                        <SelectItem value="Q2">Quý II</SelectItem>
                        <SelectItem value="Q3">Quý III</SelectItem>
                        <SelectItem value="Q4">Quý IV</SelectItem>
                        <SelectItem value="HALF">6 Tháng đầu năm</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="documentNumber" render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel className="text-xs font-bold uppercase text-foreground/80">Số Quyết định <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 15/QĐ-UBND" className="font-mono h-10 bg-muted/10 uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel className="text-xs font-bold uppercase text-foreground/80">Tên Quyết định / Báo cáo <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên quyết định công khai..." className="font-semibold h-10 bg-muted/10" {...field} />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground mt-1">Hệ thống đã tự động đề xuất tên chuẩn theo Thông tư.</p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            {/* 2. HỒ SƠ PHÁP LÝ (BẢN DẤU ĐỎ/CHỮ KÝ SỐ) */}
            <section className="space-y-4 bg-rose-50/50 p-4 border border-rose-100 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[13px] font-bold text-rose-800 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> 2. Quyết định pháp lý (Bản PDF có chữ ký số) <span className="text-destructive">*</span>
                  </h3>
                  <p className="text-[11px] text-rose-600/80 mt-1">Bản scan có dấu đỏ hoặc bản điện tử có chữ ký số VGCA của Thủ trưởng đơn vị.</p>
                </div>

                <input id="decision-pdf-upload" type="file" className="hidden" accept=".pdf" onChange={handleDecisionPdfChange} />
                {!decisionPdf && (
                  <Button type="button" variant="outline" size="sm" className="bg-white border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => document.getElementById("decision-pdf-upload")?.click()}>
                    <UploadCloud className="h-4 w-4 mr-2" /> Chọn File PDF
                  </Button>
                )}
              </div>

              {decisionPdf && (
                <div className="bg-white border border-rose-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-rose-100 text-rose-700 rounded"><FileText className="h-5 w-5" /></div>
                    <div>
                      <p className="font-semibold text-sm text-foreground truncate max-w-[400px]">{decisionPdf.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{(decisionPdf.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50" onClick={() => setDecisionPdf(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </section>

            {/* 3. BIỂU MẪU SỐ LIỆU (EXCEL) */}
            <section className="space-y-4 bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[13px] font-bold text-emerald-800 flex items-center gap-2">
                    <FileArchive className="h-4 w-4" /> 3. Các Phụ lục / Biểu mẫu đính kèm (File Excel) <span className="text-destructive">*</span>
                  </h3>
                  <p className="text-[11px] text-emerald-600/80 mt-1">File số liệu gốc (.xlsx) để người dân/thanh tra có thể tra cứu và trích xuất dữ liệu.</p>
                </div>

                <input id="excel-upload" type="file" className="hidden" multiple accept=".xlsx,.xls" onChange={handleExcelChange} />
                <Button type="button" variant="outline" size="sm" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => document.getElementById("excel-upload")?.click()}>
                  <FilePlus className="h-4 w-4 mr-2" /> Thêm Biểu mẫu
                </Button>
              </div>

              {attachmentExcels.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {attachmentExcels.map((file, index) => (
                    <div key={index} className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded"><FileSpreadsheet className="h-4 w-4" /></div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate max-w-[400px]">{file.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeExcel(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-emerald-200/60 bg-white/50 rounded-lg p-6 text-center">
                  <p className="text-sm font-medium text-emerald-700">Chưa có biểu mẫu phụ lục nào được chọn.</p>
                  <p className="text-xs text-muted-foreground mt-1">Ví dụ: Biểu số 01, Biểu số 02, Biểu số 03...</p>
                </div>
              )}
            </section>

          </form>
        </Form>

        <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
          <Button variant="outline" onClick={onClose} className="w-24 bg-background">Hủy bỏ</Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="w-48 shadow-md" disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Trình duyệt & Công khai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
