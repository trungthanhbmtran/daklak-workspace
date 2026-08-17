/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useTaskSubtasks, useTaskSteps, useUpdateStep, useUpdateStatus, useUpdateTaskStatus } from "../../hooks/useTasks";
import { HrmTask } from "../../types/task";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { CreateTaskDialog } from "./create-task-dialog";
import { CreateStepDialog } from "./create-step-dialog";
import { useUser } from "@/hooks/useUser";

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
  const { user } = useUser();
  const [isCreateSubTaskOpen, setIsCreateSubTaskOpen] = useState(false);
  const [isCreateStepOpen, setIsCreateStepOpen] = useState(false);

  const [completingItem, setCompletingItem] = useState<{ type: 'step' | 'subtask', data: any } | null>(null);
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string, url: string }[]>([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload();

  const { data: subtasksData, isLoading: subtasksLoading } = useTaskSubtasks(taskId);
  const { data: stepsData, isLoading: stepsLoading } = useTaskSteps(taskId);

  const subTasks: HrmTask[] = (subtasksData as any)?.data ?? currentTask.subTasks ?? [];
  const steps: any[] = (stepsData as any)?.data ?? currentTask.steps ?? [];

  const updateStep = useUpdateStep(taskId);
  const updateStatus = useUpdateStatus(taskId);
  const updateTaskStatus = useUpdateTaskStatus();

  const handleStartTask = async () => {
    try {
      await updateStatus.mutateAsync({ status: "IN_PROGRESS", actionName: "IN_PROGRESS" } as any);
      toast.success("Đã bắt đầu thực hiện công việc");
    } catch { /* handled */ }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileData = await uploadFile(file);
        if (fileData && fileData.url) {
          setEvidenceFiles(prev => [...prev, { name: file.name, url: fileData.url }]);
        }
      } catch (error) {
        // useFileUpload already handles toast
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };



  const handleSubmitEvidence = async () => {
    if (!completingItem) return;
    setIsSubmittingEvidence(true);
    try {
      let content = "";
      if (evidenceText.trim() || evidenceFiles.length > 0) {
        content = `📋 Báo cáo hoàn thành [${completingItem.type === 'step' ? 'Bước' : 'Nhiệm vụ con'}]: **${completingItem.data.title}**\n${evidenceText.trim()}`;
        if (evidenceFiles.length > 0) {
          content += "\n\n**Minh chứng đính kèm:**";
          evidenceFiles.forEach((file, index) => {
            content += `\n${index + 1}. [${file.name}](${file.url})`;
          });
        }
      }

      if (completingItem.type === 'step') {
        await updateStep.mutateAsync({ stepId: Number(completingItem.data.id), payload: { status: "COMPLETED", evidence: content || undefined } });
      } else {
        await updateTaskStatus.mutateAsync({ id: Number(completingItem.data.id), payload: { status: "COMPLETED", evidence: content || undefined } });
      }

      setCompletingItem(null);
      setEvidenceText("");
      setEvidenceFiles([]);
    } catch (e) {
      // hook handles toast
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleToggleStep = async (step: any) => {
    if (step.status !== "COMPLETED") {
      setCompletingItem({ type: 'step', data: step });
    }
  };

  const handleToggleSubTask = async (subTask: HrmTask) => {
    if (subTask.status !== "COMPLETED") {
      setCompletingItem({ type: 'subtask', data: subTask });
    }
  };

  if (isAssigned) {
    return null; // Chỉ cho phép thực hiện các nghiệp vụ khi đã nhận việc (không còn là ASSIGNED)
  }

  return (
    <div className="space-y-6">
      {/* Nhiệm vụ con */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Heading level="h4" className="font-medium">Nhiệm vụ con (Phân rã công việc)</Heading>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleSubTask(subTask)}
                    disabled={isCompleted || updateTaskStatus.isPending}
                    className="shrink-0 focus:outline-none w-6 h-6 p-0 hover:bg-transparent"
                  >
                    {subTask.status?.toUpperCase() === "COMPLETED" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : subTask.status?.toUpperCase() === "IN_PROGRESS" ? (
                      <Clock className="w-5 h-5 text-blue-500 hover:text-green-500 transition-colors" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-400 transition-colors" />
                    )}
                  </Button>
                  <div>
                    <p className={`text-sm ${subTask.status?.toUpperCase() === "COMPLETED" ? "line-through text-slate-500" : "font-medium"}`}>
                      {subTask.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {subTask.dueDate && (
                        <Text variant="small" className="text-slate-500 flex items-center font-normal">
                          <Clock className="w-3 h-3 mr-1" />
                          Hạn: {safeFormatDate(subTask.dueDate, "dd/MM/yyyy")}
                        </Text>
                      )}
                      {(subTask.assignee || subTask.assigneeDepartment) && (
                        <Text variant="small" className="text-blue-600 flex items-center bg-blue-50 px-2 py-0.5 rounded-full font-normal">
                          {subTask.assigneeDepartment ? "🏢 " + subTask.assigneeDepartment.name : "👤 " + subTask.assignee?.fullName}
                        </Text>
                      )}
                      {subTask.status?.toUpperCase() !== "COMPLETED" && subTask.progress !== undefined && (
                        <Text variant="small" weight="medium" className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          Tiến độ: {subTask.progress}%
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="small" className="text-slate-500 italic p-4 border border-dashed rounded-md text-center bg-slate-50 font-normal">
            Chưa có nhiệm vụ con nào.
          </Text>
        )}
      </div>

      {/* Bước thực hiện */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Heading level="h4" className="font-medium">Các bước thực hiện (Checklist nội bộ)</Heading>
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
            {steps.map((step: any, index: number) => (
              <div key={step.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStep(step)}
                    disabled={isCompleted || updateStep.isPending || (!!step.assigneeCode && step.assigneeCode !== user?.employeeCode)}
                    className="shrink-0 focus:outline-none w-6 h-6 p-0 hover:bg-transparent disabled:opacity-50"
                    title={!!step.assigneeCode && step.assigneeCode !== user?.employeeCode ? "Chỉ người phụ trách mới có quyền hoàn thành" : ""}
                  >
                    {step.status?.toUpperCase() === "COMPLETED" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-400 transition-colors" />
                    )}
                  </Button>
                  <div className="flex flex-col">
                    <p className={`text-sm ${step.status?.toUpperCase() === "COMPLETED" ? "line-through text-slate-500" : "font-medium"}`}>
                      <span className="font-bold mr-1">Bước {index + 1}:</span>
                      {step.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {step.assigneeName && (
                        <Text as="span" className="text-[11px] text-slate-500 flex items-center font-normal bg-slate-100 px-1.5 py-0.5 rounded">
                          Phụ trách: 👤 {step.assigneeName}
                        </Text>
                      )}
                      {step.baseScore > 0 && (
                        <Text as="span" weight="medium" className="text-[11px] text-indigo-600 bg-indigo-50 w-fit px-1.5 py-0.5 rounded">
                          +{step.baseScore} điểm KPI
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="small" className="text-slate-500 italic p-4 border border-dashed rounded-md text-center bg-slate-50 font-normal block">
            Chưa có kế hoạch chi tiết (Các bước thực hiện nội bộ).
          </Text>
        )}
      </div>

      {/* Cập nhật tiến độ */}
      {!isCompleted && (
        <div className="space-y-4 bg-white p-4 rounded-lg border">
          <Heading level="h4" className="font-medium">Báo cáo & Cập nhật</Heading>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tiến độ hiện tại (Tự động đánh giá)</span>
              <Text as="span" weight="bold" className="text-blue-600">{currentTask.progress ?? 0}%</Text>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${currentTask.progress ?? 0}%` }} />
            </div>
            <Text variant="small" className="text-[10px] text-slate-400 mt-1 font-normal">
              Tiến độ được hệ thống tự động tính toán dựa trên mức độ hoàn thành của các Bước thực hiện và Nhiệm vụ con.
            </Text>
          </div>

          {currentTask.allowedActions?.includes('IN_PROGRESS') && (
            <div className="flex justify-end items-center mt-4">
              <Button
                size="sm"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStartTask}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                Bắt đầu làm
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tài liệu đính kèm */}
      <div className="space-y-2">
        <Heading level="h4" className="font-medium text-slate-500">Tài liệu đính kèm</Heading>
        <Text variant="small" className="text-slate-500 italic font-normal">Chưa có tài liệu nào</Text>
      </div>

      {isCreateSubTaskOpen && (
          <CreateTaskDialog
                  open={isCreateSubTaskOpen}
                  onOpenChange={setIsCreateSubTaskOpen}
                  parentId={String(taskId)}
                />
          )}
      {isCreateStepOpen && (
          <CreateStepDialog
                  open={isCreateStepOpen}
                  onOpenChange={setIsCreateStepOpen}
                  task={currentTask}
                />
          )}

      <Dialog open={!!completingItem} onOpenChange={(open) => {
        if (!open) {
          setCompletingItem(null);
          setEvidenceText("");
          setEvidenceFiles([]);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn thành</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">Bạn đang đánh dấu hoàn thành: <span className="text-blue-600">{completingItem?.data?.title}</span></p>
            <Textarea
              placeholder="Nhập ghi chú / nội dung báo cáo (không bắt buộc)..."
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
            />
            {evidenceFiles.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <Text variant="small" className="font-medium text-slate-600">Minh chứng đính kèm:</Text>
                {evidenceFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border text-sm">
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                      {file.name}
                    </a>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => setEvidenceFiles(prev => prev.filter((_, idx) => idx !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Đính kèm file
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletingItem(null)}>Hủy</Button>
            <Button onClick={handleSubmitEvidence} disabled={isSubmittingEvidence || isUploading}>
              {isSubmittingEvidence && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu minh chứng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
