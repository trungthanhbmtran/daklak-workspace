"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  MessageSquareShare, CalendarIcon, Building2, UploadCloud, 
  CheckCircle2, FileText, X
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const consultationSchema = z.object({
  title: z.string().min(10, "Tên dự thảo phải có ít nhất 10 ký tự"),
  content: z.string().min(20, "Vui lòng nhập tóm tắt nội dung xin ý kiến"),
  deadline: z.string().min(1, "Vui lòng chọn hạn chót nhận phản hồi"),
  departmentIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 cơ quan để lấy ý kiến"),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

// Mock data cơ quan (Tích hợp với ORGANIZATION_API của bạn)
const MOCK_DEPARTMENTS = [
  { id: "1", name: "Sở Kế hoạch và Đầu tư" },
  { id: "2", name: "Sở Tài chính" },
  { id: "3", name: "Sở Thông tin và Truyền thông" },
  { id: "4", name: "Sở Tư pháp" },
  { id: "5", name: "UBND TP. Buôn Ma Thuột" },
  { id: "6", name: "UBND Huyện Krông Pắc" },
];

export function ConsultationCreateModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [draftFile, setDraftFile] = useState<File | null>(null);

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      title: "",
      content: "",
      deadline: "",
      departmentIds: [],
    },
  });

  const onSubmit = (values: ConsultationFormValues) => {
    if (!draftFile) return alert("Vui lòng đính kèm file Dự thảo gốc (Word/PDF)!");
    console.log("Tạo luồng ý kiến:", values, "File:", draftFile.name);
    onClose();
    form.reset();
    setDraftFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 shadow-2xl">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquareShare className="h-5 w-5 text-primary" /> Khởi tạo luồng Lấy ý kiến Dự thảo
          </DialogTitle>
          <DialogDescription>Gửi tệp dự thảo đến các Sở/Ngành/Địa phương và thiết lập thời hạn phản hồi.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin">
            
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên văn bản dự thảo <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="VD: Dự thảo Kế hoạch ứng dụng CNTT năm 2026..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormField control={form.control} name="deadline" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hạn chót nhận ý kiến <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="date" {...field} className="pl-9" />
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <div className="space-y-2">
                <FormLabel>File dự thảo đính kèm <span className="text-destructive">*</span></FormLabel>
                {!draftFile ? (
                   <div className="border border-dashed rounded-md p-2 flex items-center justify-center bg-muted/20 hover:bg-muted/50 cursor-pointer" onClick={() => document.getElementById("draft-file")?.click()}>
                     <UploadCloud className="h-4 w-4 text-muted-foreground mr-2" />
                     <span className="text-sm text-muted-foreground">Click chọn file (Docx/PDF)</span>
                     <input id="draft-file" type="file" className="hidden" accept=".doc,.docx,.pdf" onChange={(e) => {
                       if (e.target.files?.[0]) setDraftFile(e.target.files[0]);
                     }}/>
                   </div>
                ) : (
                  <div className="border border-primary/30 bg-primary/5 rounded-md p-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary truncate max-w-[200px] flex items-center"><FileText className="h-4 w-4 mr-1.5 shrink-0" /> {draftFile.name}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDraftFile(null)}><X className="h-3 w-3" /></Button>
                  </div>
                )}
              </div>
            </div>

            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung yêu cầu / Tóm tắt <span className="text-destructive">*</span></FormLabel>
                <FormControl><Textarea placeholder="Ghi chú thêm cho các đơn vị nhận..." className="resize-none h-20" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="departmentIds" render={() => (
              <FormItem>
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <FormLabel className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Cơ quan nhận ý kiến <span className="text-destructive">*</span></FormLabel>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{form.watch("departmentIds").length} đã chọn</span>
                </div>
                <ScrollArea className="h-[180px] w-full border rounded-md p-3 bg-muted/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MOCK_DEPARTMENTS.map((dept) => (
                      <FormField key={dept.id} control={form.control} name="departmentIds" render={({ field }) => {
                        const isChecked = field.value?.includes(dept.id);
                        return (
                          <FormItem className={`flex flex-row items-start space-x-3 space-y-0 p-2 rounded-md border transition-colors cursor-pointer ${isChecked ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"}`}>
                            <FormControl>
                              <Checkbox checked={isChecked} onCheckedChange={(checked) => {
                                return checked ? field.onChange([...field.value, dept.id]) : field.onChange(field.value?.filter((value) => value !== dept.id));
                              }}/>
                            </FormControl>
                            <FormLabel className="text-sm font-medium cursor-pointer leading-tight">{dept.name}</FormLabel>
                          </FormItem>
                        );
                      }}/>
                    ))}
                  </div>
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}/>

          </form>
        </Form>

        <DialogFooter className="p-4 border-t bg-muted/10">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="shadow-md"><CheckCircle2 className="h-4 w-4 mr-2" /> Phát hành lấy ý kiến</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
