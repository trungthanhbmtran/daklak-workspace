"use client";

import { HrmTask } from "../../types/task";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export function TaskKpiEvaluation({ task }: { task: HrmTask }) {
  const isCompleted = task.status === "COMPLETED";
  const hasKpi = !!task.kpi;
  const isOverdue = new Date(task.dueDate) < (task.completedAt ? new Date(task.completedAt) : new Date());

  if (!isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 text-slate-500">
        <Info className="w-12 h-12 text-slate-300" />
        <p>Công việc chưa hoàn thành.</p>
        <p className="text-sm">Chỉ có thể đánh giá KPI sau khi chuyên viên báo cáo hoàn thành và được phê duyệt.</p>
      </div>
    );
  }

  if (hasKpi) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Đã đánh giá KPI</AlertTitle>
          <AlertDescription className="text-green-700">
            Công việc này đã được đánh giá vào lúc {format(new Date(task.kpi!.evaluatedAt), "dd/MM/yyyy HH:mm")}.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Tổng điểm KPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{task.kpi!.totalScore}/100</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Xếp loại chất lượng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{task.kpi!.qualityGrade}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi tiết điểm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-600">Tiến độ (Tối đa 40đ)</span>
              <span className="font-medium">{task.kpi!.timelinessScore}đ</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-600">Chất lượng (Tối đa 40đ)</span>
              <span className="font-medium">{task.kpi!.qualityScore}đ</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-600">Khối lượng (Tối đa 20đ)</span>
              <span className="font-medium">{task.kpi!.volumeScore}đ</span>
            </div>
            <div>
              <Label className="text-slate-600 mb-1 block">Nhận xét của Quản lý</Label>
              <p className="text-sm bg-slate-50 p-3 rounded-md border">{task.kpi!.note || "Không có nhận xét."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chế độ chấm điểm
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá KPI Công việc</CardTitle>
          <CardDescription>
            Đánh giá chất lượng và tiến độ hoàn thành công việc của chuyên viên.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">1. Điểm Tiến độ (Tự động tính)</Label>
            <div className="p-3 bg-slate-50 rounded-md border flex justify-between items-center">
              <div>
                <p className="font-medium">{isOverdue ? "Trễ hạn" : "Đúng hạn / Sớm hạn"}</p>
                <p className="text-sm text-slate-500">Hạn: {format(new Date(task.dueDate), "dd/MM/yyyy")} - Hoàn thành: {format(new Date(task.updatedAt), "dd/MM/yyyy")}</p>
              </div>
              <div className="text-xl font-bold text-blue-600">{isOverdue ? "20/40" : "40/40"}</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">2. Xếp loại Chất lượng (Tối đa 40đ)</Label>
            <RadioGroup defaultValue="GOOD" className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="EXCELLENT" id="r1" />
                <Label htmlFor="r1" className="flex-1 cursor-pointer">Xuất sắc (40đ)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="GOOD" id="r2" />
                <Label htmlFor="r2" className="flex-1 cursor-pointer">Tốt (30đ)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="AVERAGE" id="r3" />
                <Label htmlFor="r3" className="flex-1 cursor-pointer">Đạt (20đ)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="POOR" id="r4" />
                <Label htmlFor="r4" className="flex-1 cursor-pointer">Không đạt (0đ)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">3. Khối lượng / Độ phức tạp (Tối đa 20đ)</Label>
            <div className="flex items-center space-x-4">
              <input type="number" defaultValue={20} max={20} min={0} className="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" />
              <span className="text-sm text-slate-500">/ 20 điểm</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Nhận xét (Tùy chọn)</Label>
            <Textarea placeholder="Nhập nhận xét về kết quả công việc..." />
          </div>

          <div className="pt-4 flex justify-end">
            <Button>Lưu Đánh Giá KPI</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
