"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Heading, Text } from "@/components/ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HrmTask } from "../../types/task";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  BellRing, MessageSquare, CheckCircle2,
  ArrowRightCircle, Repeat, Briefcase
} from "lucide-react";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

import { useUpdateStatus, useTaskDetail, useRequestCoordination, useTaskComments } from "../../hooks/useTasks";
import { toast } from "sonner";
import { TaskProcessingTab } from "./task-detail-processing-tab";
import { TaskDiscussionTab } from "./task-detail-discussion-tab";
import { TaskHistoryTab } from "./task-detail-history-tab";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { TaskAssignDialog } from "./task-assign-dialog";
import { translateTaskStatus, getTaskStatusColor } from "./task-utils";

interface TaskDetailDrawerProps {
  task: HrmTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  const taskId = Number(task.id);
  const { user } = useUser();
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // ── Queries ──
  const { data: detailData } = useTaskDetail(taskId);
  const { data: commentsData } = useTaskComments(taskId);
  const currentTask = (detailData as any)?.data ?? task;
  const isCompleted = currentTask.status?.toUpperCase() === "COMPLETED" || currentTask.status?.toUpperCase() === "DONE";
  const isAssigned = (currentTask.status?.toUpperCase() === "ASSIGNED" || currentTask.status?.toUpperCase() === "TODO") && (currentTask.allowedActions?.includes('RECEIVE') || currentTask.allowedActions?.includes('IN_PROGRESS'));
  const comments: any[] = (commentsData as any)?.data ?? [];
  const isAssigner = user?.employeeCode === currentTask.creatorEmployeeCode || user?.employeeCode === currentTask.assignerCode;

  // ── Mutations ──
  const updateStatus = useUpdateStatus(taskId);
  const requestCoordination = useRequestCoordination(taskId);

  const handleAcceptTask = async () => {
    try {
      const actionName = currentTask.allowedActions?.includes('RECEIVE') ? 'RECEIVE' : 'IN_PROGRESS';
      await updateStatus.mutateAsync({ status: "IN_PROGRESS", actionName } as any);
      toast.success("Đã nhận việc thành công");
    } catch { /* handled */ }
  };

  const handleRejectTask = async () => {
    const reason = window.prompt("Nhập lý do từ chối nhận việc:");
    if (!reason) return;
    try {
      await updateStatus.mutateAsync({ status: "REJECTED", actionName: "REJECT", rejectReason: reason } as any);
      toast.success("Đã từ chối công việc");
    } catch { /* handled */ }
  };

  const handleRequestCoordination = async () => {
    const reason = window.prompt("Nhập lý do / nội dung xin phối hợp:");
    if (!reason) return;
    try {
      await requestCoordination.mutateAsync({ message: reason });
    } catch { /* handled */ }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="p-6 bg-white border-b">
          <SheetHeader>
            <div className="flex justify-between items-start gap-4">
              <div>
                {currentTask.parentId && (
                  <div className="mb-2">
                    <Text as="span" className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center w-fit cursor-pointer hover:bg-blue-100 transition-colors">
                      <ArrowRightCircle className="w-3 h-3 mr-1 inline" />
                      Thuộc nhiệm vụ: {currentTask.parentId}
                    </Text>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <SheetTitle className="text-xl font-bold">{currentTask.title}</SheetTitle>
                  {currentTask.metadata?.taskType === "REGULAR" && (
                    <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                      <Briefcase className="w-3 h-3 mr-1" /> Thường xuyên
                    </Badge>
                  )}
                  {currentTask.metadata?.taskType === "PERIODIC" && (
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                      <Repeat className="w-3 h-3 mr-1" /> Định kỳ
                      {currentTask.metadata?.recurrence === "DAILY" && " (Hàng ngày)"}
                      {currentTask.metadata?.recurrence === "WEEKLY" && " (Hàng tuần)"}
                      {currentTask.metadata?.recurrence === "MONTHLY" && " (Hàng tháng)"}
                      {currentTask.metadata?.recurrence === "QUARTERLY" && " (Hàng quý)"}
                      {currentTask.metadata?.recurrence === "YEARLY" && " (Hàng năm)"}
                    </Badge>
                  )}
                </div>
                <SheetDescription className="mt-2 text-slate-600">
                  {currentTask.description}
                </SheetDescription>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? "bg-green-500 text-white" : getTaskStatusColor(currentTask.status || "")}>
                  {translateTaskStatus(currentTask.status || "")}
                </Badge>
                <div className="flex gap-2">
                  {isAssigner && !isCompleted && (
                    <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(true)} className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Giao lại / Phối hợp
                    </Button>
                  )}
                  {!isCompleted && (
                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-700">
                      <BellRing className="w-3 h-3 mr-1" />
                      Đôn đốc
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <Text variant="small" className="text-slate-500 mb-1 font-normal">Người giao</Text>
              <p className="font-medium">{currentTask.assignerName || currentTask.assigner?.fullName || "Chưa xác định"}</p>
            </div>
            <div>
              <Text variant="small" className="text-slate-500 mb-1 font-normal">Đơn vị / Người xử lý</Text>
              <p className="font-medium">
                {currentTask.assigneeName || currentTask.assigneeDepartment?.name || currentTask.assignee?.fullName || "Chưa phân công"}
              </p>
            </div>
            {currentTask.coassigneeNames && currentTask.coassigneeNames.length > 0 && (
              <div className="col-span-2">
                <Text variant="small" className="text-slate-500 mb-1 font-normal">Người phối hợp xử lý</Text>
                <div className="flex flex-wrap gap-2 mt-1">
                  {currentTask.coassigneeNames.map((name: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Text variant="small" className="text-slate-500 mb-1 font-normal">Thời hạn</Text>
              <p className={`font-medium ${new Date(currentTask.dueDate) < new Date() && !isCompleted ? "text-red-500" : ""}`}>
                {safeFormatDate(currentTask.dueDate, "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            {currentTask.sourceDocumentRef && (
              <div>
                <Text variant="small" className="text-slate-500 mb-1 font-normal">Căn cứ văn bản</Text>
                <Text variant="small" weight="medium" className="text-blue-600 cursor-pointer hover:underline">
                  {currentTask.sourceDocumentRef}
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* Box tiếp nhận công việc - Đưa lên trên cùng */}
        {isAssigned && (
          <div className="bg-amber-50 p-4 border-b border-amber-200 flex-shrink-0">
            <Heading level="h4" className="font-medium text-amber-900 flex items-center">
              <BellRing className="w-4 h-4 mr-2" />
              Xác nhận tiếp nhận công việc
            </Heading>
            <Text variant="small" className="text-amber-700 mt-1 mb-3 font-normal">
              Công việc này vừa được giao. Vui lòng xác nhận tiếp nhận để có thể bắt đầu xử lý (phân rã công việc, cập nhật tiến độ, v.v.), hoặc từ chối nếu không đúng thẩm quyền.
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAcceptTask} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Nhận việc
              </Button>
              <Button onClick={handleRejectTask} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-white">
                Từ chối
              </Button>
              <Button onClick={handleRequestCoordination} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 bg-white">
                Xin phối hợp
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="processing" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 bg-white border-b">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="processing">Xử lý & Cập nhật</TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="w-3 h-3 mr-1" />
                Trao đổi {comments.length > 0 && `(${comments.length})`}
              </TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              <TabsTrigger value="kpi">KPI</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">

            {/* ── Tab Xử lý & Cập nhật ── */}
            <TabsContent value="processing" className="mt-0 space-y-6">
              <TaskProcessingTab
                taskId={taskId}
                currentTask={currentTask}
                isCompleted={isCompleted}
                isAssigned={isAssigned}
              />
            </TabsContent>

            {/* ── Tab Trao đổi ── */}
            <TabsContent value="discussion" className="mt-0 h-full flex flex-col">
              <TaskDiscussionTab
                taskId={taskId}
                allowedActions={currentTask.allowedActions}
              />
            </TabsContent>

            {/* ── Tab Lịch sử ── */}
            <TabsContent value="history" className="mt-0">
              <TaskHistoryTab
                taskId={taskId}
                currentTask={currentTask}
              />
            </TabsContent>

            {/* ── Tab KPI ── */}
            <TabsContent value="kpi" className="mt-0 h-full">
              {currentTask.kpi ? (
                <div className="space-y-4 mt-4 bg-white p-4 rounded-lg border">
                  <Heading level="h4" className="font-semibold">Kết quả đánh giá KPI</Heading>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Text variant="small" className="text-slate-500 mb-1 font-normal">Xếp loại chất lượng</Text>
                      <Badge variant="default" className="bg-green-500">{currentTask.kpi.qualityGrade}</Badge>
                    </div>
                    <div>
                      <Text variant="small" className="text-slate-500 mb-1 font-normal">Tổng điểm</Text>
                      <Text variant="large" weight="bold">{currentTask.kpi.totalScore} / 100</Text>
                    </div>
                    <div>
                      <Text variant="small" className="text-slate-500 mb-1 font-normal">Điểm tiến độ</Text>
                      <p className="font-medium">{currentTask.kpi.timelinessScore}</p>
                    </div>
                    <div>
                      <Text variant="small" className="text-slate-500 mb-1 font-normal">Điểm chất lượng</Text>
                      <p className="font-medium">{currentTask.kpi.qualityScore}</p>
                    </div>
                    {currentTask.kpi.note && (
                      <div className="col-span-2">
                        <Text variant="small" className="text-slate-500 mb-1 font-normal">Ghi chú</Text>
                        <Text variant="small" className="italic bg-slate-50 p-2 rounded font-normal">{currentTask.kpi.note}</Text>
                      </div>
                    )}
                  </div>
                  <Text variant="small" className="text-slate-400 font-normal">
                    Đánh giá lúc {safeFormatDate(currentTask.kpi.evaluatedAt, "dd/MM/yyyy HH:mm")} bởi {currentTask.kpi.evaluator?.fullName || "Quản lý"}
                  </Text>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-8 text-center">
                  Công việc chưa được đánh giá KPI.
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <TaskAssignDialog
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
          taskId={taskId}
          currentAssigneeCode={currentTask.assigneeCode}
          currentCoordinatorsCodes={currentTask.coassigneeCodes || []}
        />
      </SheetContent>
    </Sheet>
  );
}
