"use client";

import { HrmTask } from "../../types/task";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
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
        <Text>Công việc chưa hoàn thành.</Text>
        <Text variant="small">Chỉ có thể đánh giá KPI sau khi chuyên viên báo cáo hoàn thành và được phê duyệt.</Text>
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
              <div className="p-4 bg-slate-50 rounded-lg text-center border">
                <Text variant="small" className="text-slate-500 mb-1 font-normal">Tổng điểm KPI</Text>
                <Heading level="h3" className="font-bold text-blue-600">{task.kpi!.totalScore}/100</Heading>
              </div>
            </CardHeader>
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
            <div className="flex justify-between items-center py-2 border-b">
              <Text as="span" className="text-slate-600">Tiến độ (Tối đa 40đ)</Text>
              <Text as="span" weight="bold">{task.kpi!.timelinessScore}đ</Text>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center border">
              <Text variant="small" className="text-slate-500 mb-1 font-normal">Xếp loại chất lượng</Text>
              <Heading level="h4" className="font-bold">{task.kpi!.qualityGrade}</Heading>
            </div>
            <div className="flex justify-between items-center py-2">
              <Text as="span" className="text-slate-600">Khối lượng (Tối đa 20đ)</Text>
              <Text as="span" weight="bold">{task.kpi!.volumeScore}đ</Text>
            </div>
            <div>
              <Text variant="small" weight="medium" className="mb-2">Nhận xét của lãnh đạo</Text>
              <Text variant="small" className="bg-slate-50 p-3 rounded-md border font-normal">{task.kpi!.note || "Không có nhận xét."}</Text>
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
            <div className="p-3 bg-slate-50 rounded-md border flex justify-between items-center">
              <div>
                <Text variant="small" weight="medium" className="mb-1">1. Điểm Tiến độ (Tối đa 40đ)</Text>
                <Text variant="small" className="text-slate-500 font-normal">Hạn: {format(new Date(task.dueDate), "dd/MM/yyyy")} - Hoàn thành: {format(new Date(task.updatedAt), "dd/MM/yyyy")}</Text>
              </div>
              <Heading level="h4" className="font-bold text-blue-600">{isOverdue ? "20/40" : "40/40"}</Heading>
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
            <Label className="text-base font-medium mb-3 block">3. Điểm Khối lượng/Độ phức tạp (Tối đa 20đ)</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Text variant="small" className="text-slate-500 font-normal mb-2">Căn cứ vào khối lượng công việc thực tế, lãnh đạo tự nhập điểm (0-20đ)</Text>
              </div>
              <div className="w-32 flex items-center gap-2">
                <input type="number" defaultValue="20" min="0" max="20" className="w-16 h-10 border rounded px-2 text-center font-bold" />
                <Text as="span" variant="small" className="text-slate-500 font-normal">/ 20 điểm</Text>
              </div>
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
