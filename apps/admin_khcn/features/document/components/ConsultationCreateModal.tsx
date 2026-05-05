"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDocuments } from "../hooks/useDocuments";
import { organizationApi } from "@/features/system-admin/organization/api";
import { 
  Loader2, Save, MessageSquareShare, Calendar, 
  ShieldAlert, Building2, Search, Check, X
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileUp, FileCheck } from "lucide-react";

const consultationSchema = z.object({
  title: z.string().min(5, "Tiêu đề đợt lấy ý kiến phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả nội dung cần lấy ý kiến"),
  documentId: z.string().optional(),
  deadline: z.string().min(1, "Vui lòng chọn thời hạn góp ý"),
  isUrgent: z.boolean().default(false),
  targetUnitIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một đơn vị phối hợp"),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

interface ConsultationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
}

function flattenUnits(nodes: any[], acc: any[] = [], parentPath: string = ""): any[] {
  for (const node of nodes || []) {
    const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
    if (node.id != null) {
      acc.push({ id: node.id.toString(), name: node.name, fullPath: currentPath });
    }
    flattenUnits(node.children ?? [], acc, currentPath);
  }
  return acc;
}

export function ConsultationCreateModal({ isOpen, onClose, documentId }: ConsultationCreateModalProps) {
  const { createConsultation, isLoading } = useDocuments();
  const [unitSearch, setUnitSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useFileUpload();

  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
    enabled: isOpen,
  });

  const units = useMemo(() => flattenUnits(Array.isArray(treeNodes) ? treeNodes : []), [treeNodes]);

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      documentId: documentId,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isUrgent: false,
      targetUnitIds: [],
    },
  });

  const onSubmit = async (values: ConsultationFormValues) => {
    try {
      let finalDocumentId = values.documentId;

      // 1. Upload file if selected
      if (selectedFile) {
        const media = await uploadFile(selectedFile);
        if (media?.id) {
          finalDocumentId = media.id;
        }
      }

      // 2. Create consultation
      await createConsultation({
        ...values,
        documentId: finalDocumentId
      });
      
      onClose();
      form.reset();
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const selectedUnitIds = form.watch("targetUnitIds") || [];

  const toggleUnit = (id: string) => {
    const current = [...selectedUnitIds];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    form.setValue("targetUnitIds", current, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
        <div className="bg-primary/5 p-6 border-b shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <MessageSquareShare className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                Tạo đợt lấy ý kiến mới
              </DialogTitle>
            </div>
            <DialogDescription className="font-medium text-muted-foreground">
              Thiết lập luồng lấy ý kiến dự thảo văn bản từ các đơn vị chuyên môn.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(((v: any) => onSubmit(v)) as any)} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase text-muted-foreground tracking-widest">Tiêu đề đợt lấy ý kiến</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Lấy ý kiến dự thảo Kế hoạch KHCN 2026..." className="rounded-xl h-11 bg-muted/20 border-none font-bold" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase text-muted-foreground tracking-widest">Nội dung / Yêu cầu góp ý</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả chi tiết các nội dung cần các đơn vị tập trung góp ý..." className="rounded-xl min-h-[120px] resize-none bg-muted/20 border-none font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload Section */}
                <div className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <FileUp className="h-3.5 w-3.5 text-primary" /> Tệp dự thảo lấy ý kiến
                  </FormLabel>
                  
                  {!selectedFile ? (
                    <div 
                      onClick={() => document.getElementById("consult-file-upload")?.click()}
                      className="border-2 border-dashed border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                    >
                      <div className="p-3 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
                        <FileUp className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-primary">Nhấn để chọn tệp PDF/Docx</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Tối đa 25MB</p>
                      <input id="consult-file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300">
                      <div className="p-3 bg-emerald-500 rounded-xl text-white">
                        <FileCheck className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-900 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] font-mono text-emerald-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedFile(null)}
                        className="rounded-full text-emerald-600 hover:bg-emerald-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-primary" /> Thời hạn góp ý
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" className="rounded-xl h-11 bg-muted/20 border-none font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="isUrgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border p-4 bg-rose-50/50 border-rose-100 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-0.5 leading-none">
                          <FormLabel className="text-sm font-black flex items-center gap-2 text-rose-600 uppercase tracking-tighter">
                            <ShieldAlert className="h-4 w-4" /> Yêu cầu hỏa tốc
                          </FormLabel>
                          <p className="text-[10px] text-rose-500/70 font-bold uppercase">Ưu tiên xử lý ngay lập tức</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 flex flex-col h-full min-h-[400px]">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Đơn vị phối hợp ({selectedUnitIds.length})
                  </FormLabel>
                  {selectedUnitIds.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue("targetUnitIds", [])} className="h-6 text-[10px] font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                      XÓA TẤT CẢ
                    </Button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm đơn vị..."
                    className="pl-9 h-10 bg-muted/20 border-none rounded-xl text-sm"
                    value={unitSearch}
                    onChange={(e) => setUnitSearch(e.target.value)}
                  />
                </div>

                <div className="flex-1 border rounded-2xl bg-muted/10 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {units.filter(u => u.fullPath.toLowerCase().includes(unitSearch.toLowerCase())).map((u) => {
                      const isSelected = selectedUnitIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleUnit(u.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl mb-1 cursor-pointer transition-all border",
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary shadow-md" 
                              : "bg-background border-transparent hover:border-primary/20 hover:bg-primary/5"
                          )}
                        >
                          <div className={cn(
                            "h-4 w-4 rounded-md border flex items-center justify-center shrink-0",
                            isSelected ? "bg-white border-white text-primary" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <Check className="h-3 w-3 font-black" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold truncate leading-none mb-1">{u.name}</p>
                            <p className={cn("text-[9px] truncate opacity-70 font-medium", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                              {u.fullPath}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <FormMessage />
              </div>
            </div>

            <DialogFooter className="pt-6 gap-2 border-t mt-4 shrink-0">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-12 px-8 font-bold">Hủy bỏ</Button>
              <Button type="submit" className="rounded-xl h-12 px-12 shadow-xl shadow-primary/20 bg-primary font-black text-lg transition-all active:scale-95 group" disabled={isLoading || isUploading}>
                {isLoading || isUploading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />}
                PHÁT HÀNH
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
