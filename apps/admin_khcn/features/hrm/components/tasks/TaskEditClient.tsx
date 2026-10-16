/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Award,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/components/ui/typography";
import { toast } from "sonner";

import { useTaskDetail, useUpdateTask } from "../../hooks/useTasks";
import { safeFormatDate } from "./task-ui-utils";

interface TaskEditClientProps {
  id: string | number;
}

export function TaskEditClient({ id }: TaskEditClientProps) {
  const router = useRouter();
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;
  const isValidId = !Number.isNaN(numericId) && numericId > 0;

  const { data: detailData, isLoading, isError } = useTaskDetail(isValidId ? numericId : undefined, {
    enabled: isValidId,
  });

  const rawDetail = (detailData as any)?.data ?? detailData;
  const currentTask: any =
    rawDetail && typeof rawDetail === "object" && rawDetail.data && typeof rawDetail.data === "object" && !Array.isArray(rawDetail.data)
      ? rawDetail.data
      : rawDetail;

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"URGENT" | "HIGH" | "NORMAL" | "LOW">("NORMAL");
  const [baseScore, setBaseScore] = useState<number>(10);
  const [difficultyFactor, setDifficultyFactor] = useState<number>(1.0);
  const [sourceDocumentRef, setSourceDocumentRef] = useState("");

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title || "");
      setDescription(currentTask.description || "");
      if (currentTask.dueDate) {
        const d = new Date(currentTask.dueDate);
        if (!isNaN(d.getTime())) {
          setDueDate(d.toISOString().slice(0, 16));
        }
      }
      if (currentTask.priority) {
        setPriority(currentTask.priority);
      }
      setBaseScore(currentTask.baseScore || currentTask.kpiScore || 10);
      setDifficultyFactor(currentTask.difficultyFactor || currentTask.kpiWeight || 1.0);
      setSourceDocumentRef(currentTask.metadata?.sourceDocumentRef || "");
    }
  }, [currentTask]);

  const updateTask = useUpdateTask();

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên công việc");
      return;
    }

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      baseScore,
      difficultyFactor,
      metadata: {
        ...(currentTask?.metadata || {}),
        sourceDocumentRef: sourceDocumentRef.trim() || undefined,
        difficultyFactor,
        baseScore,
      },
    };

    try {
      await updateTask.mutateAsync({ id: numericId, payload });
      toast.success("Đã cập nhật thông tin nhiệm vụ thành công!");
      router.push(`/services/hrm/work-plans/tasks/${numericId}`);
    } catch {
      toast.error("Không thể cập nhật nhiệm vụ. Vui lòng thử lại.");
    }
  };

  if (!isValidId) {
    return (
      <div className="flex flex-col min-h-[60vh] bg-background p-6 md:p-10 items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <Heading level="h4" className="text-slate-800 mb-2">Mã công việc không hợp lệ</Heading>
        <Link href="/services/hrm/work-plans/tasks">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto w-full p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-md" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (isError || !currentTask) {
    return (
      <div className="flex flex-col min-h-[60vh] bg-background p-6 md:p-10 items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <Heading level="h4" className="text-slate-800 mb-2">Không tìm thấy công việc #{numericId}</Heading>
        <Link href="/services/hrm/work-plans/tasks">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-[1100px] mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/services/hrm/work-plans/tasks" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Quản lý công việc
              </Link>
              <span>/</span>
              <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}`} className="hover:text-primary transition-colors">
                Nhiệm vụ #{currentTask.id}
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-700">Chỉnh sửa</span>
            </div>
            <Heading level="h2" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Chỉnh sửa Nội dung Nhiệm vụ Công vụ
            </Heading>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}`}>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-slate-600">
                Hủy bỏ
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateTask.isPending}
              className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Lưu thay đổi
            </Button>
          </div>
        </div>

        {/* Edit Form Card */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Thông tin công việc #{currentTask.id}</h3>
          </div>

          {/* Tiêu đề */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-800">
              Tên nhiệm vụ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm font-medium"
            />
          </div>

          {/* Mức ưu tiên & Hạn hoàn thành */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Mức độ ưu tiên</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                  <SelectItem value="HIGH">Ưu tiên cao</SelectItem>
                  <SelectItem value="NORMAL">Bình thường</SelectItem>
                  <SelectItem value="LOW">Ưu tiên thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-semibold text-slate-700">
                Hạn hoàn thành (Deadline)
              </Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Căn cứ văn bản */}
          <div className="space-y-1.5">
            <Label htmlFor="sourceRef" className="text-xs font-semibold text-slate-700">
              Căn cứ pháp lý / Số văn bản chỉ đạo
            </Label>
            <Input
              id="sourceRef"
              value={sourceDocumentRef}
              onChange={(e) => setSourceDocumentRef(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs font-semibold text-slate-700">
              Nội dung mô tả chi tiết
            </Label>
            <Textarea
              id="desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Điểm số & Trọng số */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Cơ số điểm KPI</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={baseScore}
                onChange={(e) => setBaseScore(Number(e.target.value) || 10)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Hệ số độ khó (K)</Label>
              <Select value={String(difficultyFactor)} onValueChange={(v) => setDifficultyFactor(Number(v))}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">K = 1.0 (Tiêu chuẩn)</SelectItem>
                  <SelectItem value="1.2">K = 1.2 (Khó / Phức tạp)</SelectItem>
                  <SelectItem value="1.5">K = 1.5 (Đặc biệt quan trọng)</SelectItem>
                  <SelectItem value="0.8">K = 0.8 (Đơn giản)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}`}>
              <Button variant="outline" className="h-10 text-xs">
                Hủy bỏ
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={updateTask.isPending}
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 gap-2"
            >
              {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Lưu thay đổi
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
