"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDocuments } from "../hooks/useDocuments";
import { Loader2, Save, MessageSquareShare, Calendar, ShieldAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const consultationSchema = z.object({
  title: z.string().min(5, "Tiêu đề đợt lấy ý kiến phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả nội dung cần lấy ý kiến"),
  documentId: z.string().optional(),
  deadline: z.string().min(1, "Vui lòng chọn thời hạn góp ý"),
  isUrgent: z.boolean().default(false),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

interface ConsultationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
}

export function ConsultationCreateModal({ isOpen, onClose, documentId }: ConsultationCreateModalProps) {
  const { createConsultation, isLoading } = useDocuments();

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      title: "",
      description: "",
      documentId: documentId,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isUrgent: false,
    },
  });

  const onSubmit = async (values: ConsultationFormValues) => {
    try {
      await createConsultation({
        ...values,
        targetUnitIds: [], // Future: add unit selection
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-6 border-b">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Tiêu đề đợt lấy ý kiến</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Lấy ý kiến dự thảo Kế hoạch KHCN 2026..." className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Nội dung / Yêu cầu góp ý</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả chi tiết các nội dung cần các đơn vị tập trung góp ý..." className="rounded-xl min-h-[120px] resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-primary" /> Thời hạn góp ý
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 bg-muted/5 mt-5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-bold flex items-center gap-2 text-rose-600">
                        <ShieldAlert className="h-4 w-4" /> Yêu cầu khẩn
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-11 px-8 font-bold">Hủy bỏ</Button>
              <Button type="submit" className="rounded-xl h-11 px-10 shadow-xl shadow-primary/20 bg-primary font-bold transition-all active:scale-95" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Phát hành yêu cầu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
