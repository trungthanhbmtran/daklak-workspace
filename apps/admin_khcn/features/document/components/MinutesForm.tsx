"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Users, Clock, MapPin, FileText, CheckCircle2, Save, X, Plus, Trash2, 
  UserPlus, UserMinus, MessageSquare, ClipboardCheck, Loader2
} from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const minutesSchema = z.object({
  title: z.string().min(5, "Tiêu đề biên bản phải có ít nhất 5 ký tự"),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().optional(),
  location: z.string().min(1, "Địa điểm không được để trống"),
  chairman: z.string().min(1, "Chủ trì không được để trống"),
  secretary: z.string().min(1, "Thư ký không được để trống"),
  content: z.string().min(20, "Nội dung biên bản phải chi tiết hơn"),
  conclusion: z.string().optional(),
  documentId: z.string().optional(),
});

type MinutesFormValues = z.infer<typeof minutesSchema>;

export function MinutesForm({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) {
  const { createMinutes, isLoading } = useDocuments();
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState("");

  const form = useForm<MinutesFormValues>({
    resolver: zodResolver(minutesSchema),
    defaultValues: {
      title: "",
      startTime: new Date().toISOString().slice(0, 16),
      location: "Phòng họp số 1 - Sở Khoa học và Công nghệ",
      chairman: "",
      secretary: "",
      content: "",
      conclusion: "",
    },
  });

  const addAttendee = () => {
    if (newAttendee.trim()) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee("");
    }
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: MinutesFormValues) => {
    try {
      await createMinutes({
        ...values,
        attendees: JSON.stringify(attendees),
      });
      onComplete();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <div className="flex items-center gap-3 mb-2 text-primary font-bold tracking-tighter">
          <ClipboardCheck className="h-6 w-6" />
          <span className="text-xl uppercase">Thiết lập Biên bản cuộc họp điện tử</span>
        </div>
        <CardDescription>
          Ghi nhận diễn biến, ý kiến và kết luận chính thức của cuộc họp theo quy chuẩn văn bản hành chính.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-12">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase text-muted-foreground">Tiêu đề biên bản</FormLabel>
                  <FormControl>
                    <Input placeholder="BIÊN BẢN HỌP HỘI ĐỒNG KHOA HỌC..." className="font-bold text-lg border-primary/20 bg-primary/5 focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="md:col-span-6">
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Thời gian bắt đầu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="datetime-local" {...field} className="pl-10" />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="md:col-span-6">
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Địa điểm</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="VD: Phòng họp A" {...field} className="pl-10" />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="md:col-span-6">
              <FormField control={form.control} name="chairman" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Chủ trì cuộc họp</FormLabel>
                  <FormControl><Input placeholder="Họ và tên..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="md:col-span-6">
              <FormField control={form.control} name="secretary" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Thư ký ghi chép</FormLabel>
                  <FormControl><Input placeholder="Họ và tên..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Thành phần tham dự */}
            <div className="md:col-span-12 space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Thành phần tham dự</FormLabel>
                <Badge variant="outline" className="font-mono">{attendees.length} thành viên</Badge>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Nhập tên thành viên..." 
                  value={newAttendee} 
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                  className="bg-muted/5 border-dashed"
                />
                <Button type="button" size="icon" onClick={addAttendee} variant="secondary">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-muted/5 min-h-[60px]">
                {attendees.map((name, i) => (
                  <Badge key={i} className="pl-3 pr-1 py-1.5 bg-background text-foreground border shadow-sm group">
                    {name}
                    <button type="button" onClick={() => removeAttendee(i)} className="ml-2 p-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {attendees.length === 0 && <span className="text-xs text-muted-foreground italic mt-2">Chưa có thành viên tham dự...</span>}
              </div>
            </div>

            <div className="md:col-span-12">
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Nội dung & Diễn biến cuộc họp
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ghi nhận chi tiết các ý kiến phát biểu và thảo luận..." className="min-h-[250px] leading-relaxed resize-none bg-muted/5 border-primary/10 focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="md:col-span-12">
              <FormField control={form.control} name="conclusion" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Kết luận & Nghị quyết
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Các quyết định cuối cùng được thống nhất..." className="min-h-[100px] border-emerald-100 bg-emerald-50/10 focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl px-8">Hủy bỏ</Button>
            <Button type="submit" className="rounded-xl px-10 shadow-lg shadow-primary/20 bg-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Lưu & Phát hành biên bản
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
