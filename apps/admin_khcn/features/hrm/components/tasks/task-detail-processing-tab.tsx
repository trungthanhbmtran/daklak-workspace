"use client";

import { useState } from "react";
import { useTaskSubtasks, useTaskSteps, useUpdateProgress, useUpdateStep, useUpdateStatus, useAddComment } from "../../hooks/useTasks";
import { HrmTask } from "../../types/task";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CreateTaskDialog } from "./create-task-dialog";
import { CreateStepDialog } from "./create-step-dialog";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

export function TaskProcessingTab({
  taskId,
  currentTask,
  isCompleted,
  isAssigned
}: {
  taskId: number;
  currentTask: any;
  isCompleted: boolean;
  isAssigned: boolean;
}) {
  const [isCreateSubTaskOpen, setIsCreateSubTaskOpen] = useState(false);
  const [isCreateStepOpen, setIsCreateStepOpen] = useState(false);
  const [reportText, setReportText] = useState("");

  const { data: subtasksData, isLoading: subtasksLoading } = useTaskSubtasks(taskId);
  const { data: stepsData, isLoading: stepsLoading } = useTaskSteps(taskId);

  const subTasks: HrmTask[] = (subtasksData as any)?.data ?? currentTask.subTasks ?? [];
  const steps: any[] = (stepsData as any)?.data ?? currentTask.steps ?? [];

  const updateProgress = useUpdateProgress(taskId);
  const updateStep = useUpdateStep(taskId);
  const addComment = useAddComment(taskId);
  const updateStatus = useUpdateStatus(taskId);

  const handleSaveReport = async () => {
    if (!reportText.trim()) {
      toast.info("Vui lòng nhập nội dung báo cáo");
      return;
    }
    try {
      if (reportText.trim()) {
        await addComment.mutateAsync(`📋 Báo cáo tiến độ: ${reportText.trim()}`);
        setReportText("");
      }
    } catch { /* handled in hooks */ }
  };

  const handleComplete = async () => {
    try {
      await updateStatus.mutateAsync({ status: "COMPLETED" } as any);
      toast.success("Đã hoàn thành công việc");
    } catch { /* handled */ }
  };

  const handleToggleStep = async (step: any) => {
    const newStatus = step.status === "COMPLETED" ? "TODO" : "COMPLETED";
    await updateStep.mutateAsync({ stepId: Number(step.id), payload: { status: newStatus } });
  };

  if (isAssigned) {
    return null; // Chỉ cho phép thực hiện các nghiệp vụ khi đã nhận việc (không còn là ASSIGNED)
  }

  return (
    <div className="space-y-6">
      {/* Nhiệm vụ con */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm">Nhiệm vụ con (Phân rã công việc)</h3>
          {currentTask.allowedActions?.includes('CREATE_SUBTASK') && !isCompleted && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsCreateSubTaskOpen(true)}>
              + Tạo nhiệm vụ con
            </Button>
          )}
        </div>

        {subtasksLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
          </div>
        ) : subTasks.length > 0 ? (
          <div className="border rounded-md divide-y bg-white">
            {subTasks.map((subTask: HrmTask) => (
              <div key={subTask.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {subTask.status?.toUpperCase() === "COMPLETED" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : subTask.status?.toUpperCase() === "IN_PROGRESS" ? (
                    <Clock className="w-5 h-5 text-blue-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                  <div>
                    <p className={`text-sm ${subTask.status?.toUpperCase() === "COMPLETED" ? "line-through text-slate-500" : "font-medium"}`}>
                      {subTask.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {subTask.dueDate && (
                        <p className="text-xs text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Hạn: {safeFormatDate(subTask.dueDate, "dd/MM/yyyy")}
                        </p>
                      )}
                      {(subTask.assignee || subTask.assigneeDepartment) && (
                        <p className="text-xs text-blue-600 flex items-center bg-blue-50 px-2 py-0.5 rounded-full">
                          {subTask.assigneeDepartment ? "🏢 " + subTask.assigneeDepartment.name : "👤 " + subTask.assignee?.fullName}
                        </p>
                      )}
                      {subTask.status?.toUpperCase() !== "COMPLETED" && subTask.progress !== undefined && (
                        <p className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                          Tiến độ: {subTask.progress}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-md text-center bg-slate-50">
            Chưa có nhiệm vụ con nào.
          </div>
        )}
      </div>

      {/* Bước thực hiện */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm">Các bước thực hiện (Checklist nội bộ)</h3>
          {currentTask.allowedActions?.includes('CREATE_STEP') && !isCompleted && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsCreateStepOpen(true)}>
              + Thêm bước
            </Button>
          )}
        </div>

        {stepsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
          </div>
        ) : steps.length > 0 ? (
          <div className="border rounded-md divide-y bg-white">
            {steps.map((step: any) => (
              <div key={step.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleStep(step)}
                    disabled={isCompleted || updateStep.isPending}
                    className="shrink-0 focus:outline-none"
                  >
                    {step.status?.toUpperCase() === "COMPLETED" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-400 transition-colors" />
                    )}
                  </button>
                  <div className="flex flex-col">
                    <p className={`text-sm ${step.status?.toUpperCase() === "COMPLETED" ? "line-through text-slate-500" : "font-medium"}`}>
                      {step.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {step.assigneeName && (
                        <span className="text-[11px] text-slate-500 flex items-center">
                          👤 {step.assigneeName}
                        </span>
                      )}
                      {step.baseScore > 0 && (
                        <span className="text-[11px] text-indigo-600 bg-indigo-50 w-fit px-1.5 py-0.5 rounded font-medium">
                          +{step.baseScore} điểm KPI
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-md text-center bg-slate-50">
            Chưa có kế hoạch chi tiết (Các bước thực hiện nội bộ).
          </div>
        )}
      </div>

      {/* Cập nhật tiến độ */}
      {!isCompleted && (
        <div className="space-y-4 bg-white p-4 rounded-lg border">
          <h3 className="font-medium text-sm">Báo cáo & Cập nhật</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tiến độ hiện tại (Tự động đánh giá)</span>
              <span className="font-semibold text-blue-600">{currentTask.progress ?? 0}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${currentTask.progress ?? 0}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Tiến độ được hệ thống tự động tính toán dựa trên mức độ hoàn thành của các Bước thực hiện và Nhiệm vụ con.
            </p>
          </div>

          <Textarea
            placeholder="Nhập nội dung báo cáo tiến độ / kết quả..."
            className="min-h-[100px]"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm">Đính kèm file</Button>
            <div className="space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveReport}
                disabled={updateProgress.isPending || addComment.isPending}
              >
                {(updateProgress.isPending || addComment.isPending) ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Lưu tiến độ
              </Button>
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Báo cáo hoàn thành
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tài liệu đính kèm */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-slate-500">Tài liệu đính kèm</h3>
        <div className="text-sm text-slate-500 italic">Chưa có tài liệu nào</div>
      </div>

      <CreateTaskDialog
        open={isCreateSubTaskOpen}
        onOpenChange={setIsCreateSubTaskOpen}
        parentId={String(taskId)}
      />
      <CreateStepDialog
        open={isCreateStepOpen}
        onOpenChange={setIsCreateStepOpen}
        task={currentTask}
      />
    </div>
  );
}
