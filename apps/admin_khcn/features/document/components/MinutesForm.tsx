"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, ClipboardCheck, Loader2 } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { BasicInfoFields } from "./minutes-form/BasicInfoFields";
import { AttendeesField } from "./minutes-form/AttendeesField";
import { ContentFields } from "./minutes-form/ContentFields";

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
            <BasicInfoFields />
            <AttendeesField attendees={attendees} setAttendees={setAttendees} />
            <ContentFields />
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
