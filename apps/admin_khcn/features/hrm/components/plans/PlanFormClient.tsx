"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { hrmPlansApi } from "@/features/hrm/api";
import { ArrowLeft, Save } from "lucide-react";

export const PlanFormClient = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Vui lòng nhập Tiêu đề kế hoạch");
      return;
    }
    setSubmitting(true);
    
    try {
      await hrmPlansApi.create(formData);
      toast.success("Đã tạo Kế hoạch thành công!");
      router.push("/services/hrm/plans");
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi tạo kế hoạch");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thêm Kế hoạch tổng</h1>
          <p className="text-muted-foreground">Tạo mới một kế hoạch để làm cơ sở phân bổ công việc</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Tiêu đề kế hoạch <span className="text-red-500">*</span></Label>
              <Input
                placeholder="VD: Kế hoạch triển khai chính phủ điện tử 2026"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Mô tả chi tiết</Label>
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none resize-y text-sm"
                placeholder="Mô tả mục tiêu, yêu cầu..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Ngày bắt đầu</Label>
                <Input type="date" className="h-11" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Ngày kết thúc (Dự kiến)</Label>
                <Input type="date" className="h-11" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Trạng thái ban đầu</Label>
              <select
                className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="DRAFT">Bản nháp (DRAFT)</option>
                <option value="ACTIVE">Đang thực hiện (ACTIVE)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
              <Button type="submit" disabled={submitting} className="bg-slate-900 text-white">
                <Save className="mr-2 h-4 w-4" /> Lưu Kế hoạch
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
