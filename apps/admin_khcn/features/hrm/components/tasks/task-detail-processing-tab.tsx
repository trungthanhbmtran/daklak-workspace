/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import {
  useTaskSubtasks,
  useTaskSteps,
  useUpdateStep,
  useUpdateStatus,
  useUpdateTaskStatus,
  useUpdateTask,
} from "../../hooks/useTasks";
import { HrmTask } from "../../types/task";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Award,
  Plus,
  FileText,
  User,
  ListChecks,
  Layers,
  Paperclip,
  UploadCloud,
  CheckCircle,
  PlayCircle,
  Copy,
  Check,
  TrendingUp,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CreateTaskDialog } from "./create-task-dialog";
import { CreateStepDialog } from "./create-step-dialog";
import { useUser } from "@/hooks/useUser";
import { useHrmPermissions } from "../../hooks/useHrmPermissions";
import { getTaskStatusColor, translateTaskStatus, safeFormatDate, getDeadlineStatus } from "./task-ui-utils";

export function TaskProcessingTab({
  taskId,
  currentTask,
  isCompleted,
  isAssigned,
  onOpenEvaluation,
}: {
  taskId: number;
  currentTask: any;
  isCompleted: boolean;
  isAssigned: boolean;
  onOpenEvaluation?: () => void;
}) {
  const { user } = useUser();
  const { canCreateSubtask, canCreateStep } = useHrmPermissions();
  const [isCreateSubTaskOpen, setIsCreateSubTaskOpen] = useState(false);
  const [isCreateStepOpen, setIsCreateStepOpen] = useState(false);

  // Quick progress update state
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState<number>(currentTask?.progress ?? 0);
  const [progressNote, setProgressNote] = useState("");
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Evidence modal for completing items
  const [completingItem, setCompletingItem] = useState<{ type: "step" | "subtask"; data: any } | null>(null);
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; url: string }[]>([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload();

  // Document attachments state
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [taskAttachments, setTaskAttachments] = useState<{ name: string; url: string }[]>(
    currentTask?.metadata?.attachments || []
  );

  useEffect(() => {
    if (currentTask?.progress !== undefined) {
      setProgressInput(currentTask.progress);
    }
    if (currentTask?.metadata?.attachments) {
      setTaskAttachments(currentTask.metadata.attachments);
    }
  }, [currentTask?.progress, currentTask?.metadata?.attachments]);

  const isValidTaskId = Boolean(taskId && Number(taskId) > 0);
  const { data: subtasksData, isLoading: subtasksLoading } = useTaskSubtasks(isValidTaskId ? Number(taskId) : undefined, {
    enabled: isValidTaskId,
  });
  const { data: stepsData, isLoading: stepsLoading } = useTaskSteps(isValidTaskId ? Number(taskId) : undefined, {
    enabled: isValidTaskId,
  });

  const rawSubtasks = (subtasksData as any)?.data ?? subtasksData;
  const subTasks: HrmTask[] = Array.isArray(rawSubtasks)
    ? rawSubtasks
    : Array.isArray(rawSubtasks?.data)
    ? rawSubtasks.data
    : [];

  const rawSteps = (stepsData as any)?.data ?? stepsData;
  const steps: any[] = Array.isArray(rawSteps)
    ? rawSteps
    : Array.isArray(rawSteps?.data)
    ? rawSteps.data
    : [];

  const updateStep = useUpdateStep(taskId);
  const updateStatus = useUpdateStatus(taskId);
  const updateTaskStatus = useUpdateTaskStatus();
  const updateTask = useUpdateTask();

  const completedStepsCount = steps.filter((s: any) => s.status?.toUpperCase() === "COMPLETED").length;
  const totalStepsCount = steps.length;
  const stepsProgressPct = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  const completedSubtasksCount = subTasks.filter((s: any) => s.status?.toUpperCase() === "COMPLETED" || s.status?.toUpperCase() === "DONE").length;
  const totalSubtasksCount = subTasks.length;

  const currentProgress = currentTask?.progress ?? 0;
  const deadlineInfo = getDeadlineStatus(currentTask?.dueDate, isCompleted, currentTask?.completedAt);

  const handleStartTask = async () => {
    try {
      await updateStatus.mutateAsync({ status: "IN_PROGRESS", actionName: "IN_PROGRESS" } as any);
      toast.success("Đã chuyển trạng thái sang Đang thực hiện");
    } catch {
      // handled
    }
  };

  const handleSaveProgress = async (newProgress?: number) => {
    const targetProgress = newProgress !== undefined ? newProgress : progressInput;
    setIsSavingProgress(true);
    try {
      await updateTask.mutateAsync({
        id: Number(taskId),
        payload: { progress: targetProgress },
      });

      if (progressNote.trim()) {
        await updateStatus.mutateAsync({
          status: targetProgress >= 100 ? "REVIEWING" : (currentTask.status === "ASSIGNED" ? "IN_PROGRESS" : currentTask.status),
          evidence: progressNote.trim(),
          evidenceData: {
            itemType: "progress_update",
            itemTitle: `Cập nhật tiến độ: ${targetProgress}%`,
            text: progressNote.trim(),
            progress: targetProgress,
          },
        });
      }

      toast.success(`Đã cập nhật tiến độ công việc lên ${targetProgress}%`);
      setIsEditingProgress(false);
      setProgressNote("");
    } catch {
      // handled in hook
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleCopyDocRef = (ref: string) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedDoc(true);
    toast.success("Đã sao chép mã số văn bản");
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleGeneralFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileData = await uploadFile(file);
        if (fileData && fileData.url) {
          const newDocs = [...taskAttachments, { name: file.name, url: fileData.url }];
          setTaskAttachments(newDocs);
          await updateTask.mutateAsync({
            id: Number(taskId),
            payload: {
              metadata: {
                ...(currentTask?.metadata || {}),
                attachments: newDocs,
              },
            },
          });
          toast.success("Đã tải lên và lưu tài liệu minh chứng thành công");
        }
      } catch {
        // handled
      }
      if (generalFileInputRef.current) generalFileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileData = await uploadFile(file);
        if (fileData && fileData.url) {
          setEvidenceFiles((prev) => [...prev, { name: file.name, url: fileData.url }]);
        }
      } catch {
        // useFileUpload already handles toast
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmitEvidence = async () => {
    if (!completingItem) return;
    setIsSubmittingEvidence(true);
    try {
      const evidencePayload =
        evidenceText.trim() || evidenceFiles.length > 0
          ? {
              text: evidenceText.trim(),
              files: evidenceFiles,
              itemType: completingItem.type,
              itemTitle: completingItem.data.title,
            }
          : undefined;

      if (completingItem.type === "step") {
        await updateStep.mutateAsync({
          stepId: Number(completingItem.data.id),
          payload: { status: "COMPLETED", evidenceData: evidencePayload },
        });
      } else {
        await updateTaskStatus.mutateAsync({
          id: Number(completingItem.data.id),
          payload: { status: "COMPLETED", evidenceData: evidencePayload },
        });
      }

      setCompletingItem(null);
      setEvidenceText("");
      setEvidenceFiles([]);
    } catch {
      // hook handles toast
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleToggleStep = async (step: any) => {
    if (step.status !== "COMPLETED") {
      setCompletingItem({ type: "step", data: step });
    }
  };

  const handleToggleSubTask = async (subTask: HrmTask) => {
    if (subTask.status !== "COMPLETED") {
      setCompletingItem({ type: "subtask", data: subTask });
    }
  };

  // Nếu công việc mới giao và chưa nhận việc: Hiển thị callout rõ ràng
  if (isAssigned) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-4 max-w-2xl mx-auto my-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <Heading level="h4" className="font-bold text-slate-800 text-base">
            Công việc đang chờ tiếp nhận
          </Heading>
          <Text variant="small" className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
            Nhiệm vụ này vừa được phân công cho bạn. Vui lòng bấm nút <strong>&ldquo;Nhận việc&rdquo;</strong> ở thanh thông báo phía trên để bắt đầu lập kế hoạch các bước thực hiện và phân rã nhiệm vụ con.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── 1. Executive Progress & Status Card ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shrink-0 shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Heading level="h4" className="font-bold text-slate-900 text-sm">
                  Tiến độ xử lý & Thực hiện
                </Heading>
                <Badge
                  variant={isCompleted ? "default" : "outline"}
                  className={`text-[11px] font-semibold px-2 py-0.5 ${
                    isCompleted ? "bg-emerald-600 text-white" : getTaskStatusColor(currentTask.status || "")
                  }`}
                >
                  {currentTask.statusLabel || translateTaskStatus(currentTask.status || "")}
                </Badge>
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${deadlineInfo.badgeClass}`}>
                  {deadlineInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {totalStepsCount > 0
                  ? `Đã hoàn thành ${completedStepsCount}/${totalStepsCount} bước checklist (${stepsProgressPct}%) • ${totalSubtasksCount} việc con`
                  : totalSubtasksCount > 0
                  ? `Đã hoàn thành ${completedSubtasksCount}/${totalSubtasksCount} nhiệm vụ con`
                  : "Cập nhật tiến độ xử lý và nộp kết quả công việc để ghi nhận điểm KPI"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentTask.allowedActions?.includes("IN_PROGRESS") && (
              <Button
                size="sm"
                onClick={handleStartTask}
                disabled={updateStatus.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3.5 shadow-xs"
              >
                {updateStatus.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
                Bắt đầu thực hiện
              </Button>
            )}

            {!isCompleted && (
              <Button
                variant={isEditingProgress ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsEditingProgress((prev) => !prev)}
                className="text-xs h-8 px-3 gap-1.5 border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>{isEditingProgress ? "Thu gọn cập nhật" : "Cập nhật tiến độ"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Linear Progress Bar with Milestones */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Tỷ lệ hoàn thành công việc</span>
            <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              {currentProgress}%
            </span>
          </div>

          <div className="relative pt-1 pb-1">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentProgress >= 100
                    ? "bg-emerald-600"
                    : currentProgress >= 50
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, currentProgress))}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium px-0.5">
            <span className={currentProgress >= 0 ? "text-blue-700 font-semibold" : ""}>0% Khởi tạo</span>
            <span className={currentProgress >= 50 ? "text-indigo-700 font-semibold" : ""}>50% Đang xử lý</span>
            <span className={currentProgress >= 100 ? "text-emerald-700 font-semibold" : ""}>100% Hoàn thành</span>
          </div>
        </div>

        {/* ── Expandable Quick Progress Updater ── */}
        {isEditingProgress && !isCompleted && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                Chọn nhanh mức tiến độ:
              </span>
              <span className="text-xs text-slate-500">Mức chọn: <strong className="text-blue-700 font-bold">{progressInput}%</strong></span>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setProgressInput(pct)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    progressInput === pct
                      ? pct === 100
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {pct === 100 ? "🎉 100% (Hoàn thành)" : `${pct}%`}
                </button>
              ))}
            </div>

            {/* Progress Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 block">
                Nội dung cập nhật / Báo cáo tóm tắt:
              </label>
              <Textarea
                placeholder="Ví dụ: Đã hoàn thành thẩm định bước 1, dự thảo báo cáo đã gửi các đơn vị liên quan..."
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                rows={2}
                className="text-xs bg-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProgress(false)}
                className="h-8 text-xs text-slate-600 bg-white"
              >
                Đóng
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveProgress()}
                disabled={isSavingProgress}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 shadow-xs"
              >
                {isSavingProgress && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Lưu cập nhật tiến độ
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Các bước thực hiện (Internal Checklist) ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-2xs">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h4" className="font-bold text-slate-900 text-sm">
                  Kế hoạch các bước thực hiện (Checklist quy trình)
                </Heading>
                {totalStepsCount > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold px-1.5 py-0">
                    {completedStepsCount}/{totalStepsCount} bước
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Phân chia từng khâu chuyên môn, ghi nhận minh chứng và tính điểm KPI
              </span>
            </div>
          </div>

          {canCreateStep(currentTask) && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateStepOpen(true)}
              className="h-8 px-3 text-xs text-indigo-700 border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 font-medium shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Thêm bước mới
            </Button>
          )}
        </div>

        {stepsLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : steps.length > 0 ? (
          <div className="space-y-2.5">
            {steps.map((step: any, index: number) => {
              const isStepDone = step.status?.toUpperCase() === "COMPLETED";
              const canCheck = !isCompleted && !updateStep.isPending && (!step.assigneeCode || step.assigneeCode === user?.employeeCode);

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isStepDone
                      ? "bg-emerald-50/30 border-emerald-200/70 text-slate-600"
                      : "bg-white hover:bg-slate-50/70 border-slate-200/80 shadow-2xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStep(step)}
                      disabled={!canCheck || isStepDone}
                      className="mt-0.5 shrink-0 focus:outline-none transition-transform active:scale-95 disabled:cursor-not-allowed"
                      title={
                        isStepDone
                          ? "Bước này đã hoàn thành"
                          : !canCheck
                          ? "Chỉ người được giao bước mới có quyền xác nhận"
                          : "Đánh dấu hoàn thành bước này"
                      }
                    >
                      {isStepDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-500 bg-white transition-colors" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-200/60">
                          Bước {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className={`text-sm font-semibold leading-tight wrap-break-word ${isStepDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {step.title}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                        {step.assigneeName && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md font-medium border border-slate-200/60">
                            <User className="w-3 h-3 text-slate-500" />
                            {step.assigneeName}
                          </span>
                        )}

                        {step.baseScore > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md font-semibold">
                            +{step.baseScore}đ KPI
                          </span>
                        )}

                        {isStepDone && (
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã hoàn thành
                          </span>
                        )}
                      </div>

                      {/* Minh chứng nộp của bước nếu có */}
                      {step.evidence && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Minh chứng báo cáo:</span> {step.evidence}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40 space-y-2.5">
            <ListChecks className="w-7 h-7 text-slate-300 mx-auto" />
            <div className="space-y-0.5">
              <p className="text-xs text-slate-600 font-medium">Chưa có kế hoạch chi tiết (Checklist quy trình)</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Lập checklist các bước thực hiện để phân định trách nhiệm từng khâu và tự động tích lũy điểm KPI.
              </p>
            </div>
            {canCreateStep(currentTask) && !isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateStepOpen(true)}
                className="h-7 text-xs border-dashed text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50"
              >
                <Plus className="w-3 h-3 mr-1" /> Thêm bước đầu tiên
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Nhiệm vụ con (Phân rã công việc) ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h4" className="font-bold text-slate-900 text-sm">
                  Nhiệm vụ con (Phân rã công việc)
                </Heading>
                {totalSubtasksCount > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold px-1.5 py-0">
                    {totalSubtasksCount} việc con
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Các gói công việc giao cụ thể cho từng chuyên viên hoặc đơn vị phối hợp
              </span>
            </div>
          </div>

          {canCreateSubtask(currentTask) && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateSubTaskOpen(true)}
              className="h-8 px-3 text-xs text-blue-700 border-blue-200 bg-blue-50/70 hover:bg-blue-100 font-medium shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" /> Tạo nhiệm vụ con
            </Button>
          )}
        </div>

        {subtasksLoading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : subTasks.length > 0 ? (
          <div className="space-y-2.5">
            {subTasks.map((subTask: HrmTask) => {
              const isSubTaskDone = subTask.status?.toUpperCase() === "COMPLETED" || subTask.status?.toUpperCase() === "DONE";

              return (
                <div
                  key={subTask.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/70 shadow-2xs hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleSubTask(subTask)}
                      disabled={isCompleted || isSubTaskDone || updateTaskStatus.isPending}
                      className="mt-0.5 shrink-0 focus:outline-none transition-transform active:scale-95 disabled:cursor-not-allowed"
                      title={isSubTaskDone ? "Nhiệm vụ con đã hoàn thành" : "Xác nhận hoàn thành nhiệm vụ con"}
                    >
                      {isSubTaskDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-500 bg-white transition-colors" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <p className={`text-sm font-semibold leading-tight wrap-break-word ${isSubTaskDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {subTask.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        {subTask.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Hạn: {safeFormatDate(subTask.dueDate, "dd/MM/yyyy")}
                          </span>
                        )}

                        {(subTask.assignee || subTask.assigneeDepartment) && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium border border-blue-100">
                            {subTask.assigneeDepartment ? "🏢 " + subTask.assigneeDepartment.name : "👤 " + subTask.assignee?.fullName}
                          </span>
                        )}

                        {!isSubTaskDone && subTask.progress !== undefined && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60">
                            Tiến độ: {subTask.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40 space-y-2.5">
            <Layers className="w-7 h-7 text-slate-300 mx-auto" />
            <div className="space-y-0.5">
              <p className="text-xs text-slate-600 font-medium">Chưa có nhiệm vụ con nào</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Bạn có thể phân rã công việc thành các nhiệm vụ con giao cho từng cán bộ phụ trách độc lập.
              </p>
            </div>
            {canCreateSubtask(currentTask) && !isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateSubTaskOpen(true)}
                className="h-7 text-xs border-dashed text-blue-700 border-blue-200 bg-white hover:bg-blue-50"
              >
                <Plus className="w-3 h-3 mr-1" /> Tạo việc con đầu tiên
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── 4. Hồ sơ tài liệu & Minh chứng sản phẩm ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shadow-2xs">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <Heading level="h4" className="font-bold text-slate-900 text-sm">
                Hồ sơ tài liệu & Minh chứng sản phẩm
              </Heading>
              <span className="text-[11px] text-slate-500">
                Văn bản căn cứ, dự thảo báo cáo và tệp đính kèm kết quả công việc
              </span>
            </div>
          </div>

          <div>
            <input type="file" ref={generalFileInputRef} onChange={handleGeneralFileUpload} className="hidden" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => generalFileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 px-3 text-xs text-purple-700 border-purple-200 bg-purple-50/70 hover:bg-purple-100 font-medium shadow-2xs"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-1 text-purple-600" />}
              Tải file lên
            </Button>
          </div>
        </div>

        {/* Căn cứ văn bản nếu có */}
        {currentTask.sourceDocumentRef && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-500 text-[11px] block">Văn bản căn cứ / Chỉ đạo:</span>
                <span className="font-semibold text-blue-900 truncate block">{currentTask.sourceDocumentRef}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyDocRef(currentTask.sourceDocumentRef)}
              className="h-7 px-2 text-slate-500 hover:text-slate-800 shrink-0 text-xs gap-1"
              title="Sao chép mã văn bản"
            >
              {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDoc ? "Đã chép" : "Sao chép"}</span>
            </Button>
          </div>
        )}

        {/* Danh sách tệp đính kèm */}
        {taskAttachments.length > 0 ? (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-700 block">Tài liệu đã đính kèm:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {taskAttachments.map((att, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate font-medium text-slate-700">{att.name}</span>
                  </div>
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold shrink-0 hover:underline inline-flex items-center gap-0.5"
                    >
                      Xem <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : !currentTask.sourceDocumentRef ? (
          <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40 text-slate-400 text-xs">
            Chưa có tài liệu minh chứng nào được đính kèm vào nhiệm vụ này.
          </div>
        ) : null}
      </div>

      {/* ── 5. Banner Thẩm định & Đánh giá KPI cuối quy trình ── */}
      {onOpenEvaluation &&
        (currentTask.status === "REVIEWING" ||
          currentTask.status === "PENDING_REVIEW" ||
          isCompleted ||
          (currentTask.progress ?? 0) >= 100) && (
          <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 dark:from-indigo-950/30 dark:to-blue-950/30 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100 truncate">
                  {isCompleted ? "Nhiệm vụ đã hoàn thành & Đánh giá KPI" : "Sẵn sàng Thẩm định chất lượng & Đánh giá KPI"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {isCompleted
                    ? "Bấm để xem lại hoặc điều chỉnh điểm số 4 thành tố công vụ"
                    : "Lãnh đạo phụ trách đối chiếu sản phẩm hoàn thành và chốt điểm KPI"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onOpenEvaluation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 px-4 shrink-0 shadow-xs"
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              {isCompleted ? "Xem / Đánh giá lại" : "Thẩm định ngay"}
            </Button>
          </div>
        )}

      {/* ── Sub Dialogs ── */}
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

      {/* Modal xác nhận hoàn thành & Nộp minh chứng */}
      <Dialog
        open={Boolean(completingItem)}
        onOpenChange={(open) => {
          if (!open) {
            setCompletingItem(null);
            setEvidenceText("");
            setEvidenceFiles([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Xác nhận hoàn thành & Nộp minh chứng
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ghi nhận nội dung kết quả thực hiện và đính kèm sản phẩm hoàn thành (báo cáo, văn bản, biên bản).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Hạng mục hoàn thành:</span>
              <p className="text-sm font-semibold text-slate-900">{completingItem?.data?.title}</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Ghi chú kết quả / Báo cáo thực hiện:</label>
              <Textarea
                placeholder="Nhập nội dung báo cáo tóm tắt hoặc ghi chú bàn giao..."
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            {evidenceFiles.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700">Tài liệu minh chứng đã đính kèm:</span>
                <div className="space-y-1.5">
                  {evidenceFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-200 text-xs">
                      <span className="text-blue-700 font-medium truncate max-w-[320px]">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => setEvidenceFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-8 text-xs text-slate-700 border-dashed"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-blue-600" />}
                Tải lên file minh chứng
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompletingItem(null)}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitEvidence}
              disabled={isSubmittingEvidence || isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-4"
            >
              {isSubmittingEvidence && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Xác nhận hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
