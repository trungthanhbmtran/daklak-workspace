"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HrmTask } from "../../types/task";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TaskKpiEvaluation } from "./task-kpi-evaluation";
import { Textarea } from "@/components/ui/textarea";

interface TaskDetailDrawerProps {
  task: HrmTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  const isCompleted = task.status === "COMPLETED";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full bg-slate-50">
        <div className="p-6 bg-white border-b">
          <SheetHeader>
            <div className="flex justify-between items-start gap-4">
              <div>
                <SheetTitle className="text-xl font-bold">{task.title}</SheetTitle>
                <SheetDescription className="mt-2 text-slate-600">
                  {task.description}
                </SheetDescription>
              </div>
              <Badge variant={isCompleted ? "default" : "secondary"} className={isCompleted ? "bg-green-500" : ""}>
                {task.status}
              </Badge>
            </div>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Người giao</p>
              <p className="font-medium">{task.assigner?.fullName || "Chưa xác định"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Người xử lý</p>
              <p className="font-medium">{task.assignee?.fullName || "Chưa xác định"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Thời hạn</p>
              <p className={`font-medium ${new Date(task.dueDate) < new Date() && !isCompleted ? "text-red-500" : ""}`}>
                {format(new Date(task.dueDate), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            {task.sourceDocumentRef && (
              <div>
                <p className="text-slate-500 mb-1">Căn cứ văn bản</p>
                <p className="font-medium text-blue-600 cursor-pointer hover:underline">
                  {task.sourceDocumentRef}
                </p>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="processing" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 bg-white border-b">
            <TabsList className="w-full justify-start rounded-none border-b-0 h-auto p-0 bg-transparent gap-6">
              <TabsTrigger
                value="processing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
              >
                Xử lý & Cập nhật
              </TabsTrigger>
              <TabsTrigger
                value="kpi"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
              >
                Đánh giá KPI
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
              >
                Lịch sử
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="processing" className="mt-0 space-y-6">
              {/* Form xử lý công việc */}
              <div className="space-y-4 bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-sm">Cập nhật tiến độ</h3>
                <Textarea placeholder="Nhập nội dung báo cáo tiến độ / kết quả..." className="min-h-[120px]" />
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">Đính kèm file</Button>
                  <div className="space-x-2">
                    <Button variant="secondary" size="sm">Lưu nháp</Button>
                    <Button size="sm">Báo cáo hoàn thành</Button>
                  </div>
                </div>
              </div>

              {/* Danh sách đính kèm */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-500">Tài liệu đính kèm</h3>
                <div className="text-sm text-slate-500 italic">Chưa có tài liệu nào</div>
              </div>
            </TabsContent>

            <TabsContent value="kpi" className="mt-0 h-full">
              <TaskKpiEvaluation task={task} />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="space-y-4">
                <div className="border-l-2 border-blue-500 pl-4 pb-4">
                  <p className="text-sm font-medium">Lãnh đạo đã giao việc</p>
                  <p className="text-xs text-slate-500">{format(new Date(task.createdAt), "dd/MM/yyyy HH:mm")}</p>
                </div>
                {isCompleted && (
                  <div className="border-l-2 border-green-500 pl-4 pb-4">
                    <p className="text-sm font-medium">Chuyên viên đã báo cáo hoàn thành</p>
                    <p className="text-xs text-slate-500">{format(new Date(task.updatedAt), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
