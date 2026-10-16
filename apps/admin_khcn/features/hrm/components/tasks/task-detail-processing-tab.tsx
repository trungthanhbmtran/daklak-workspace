/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import {
  useTaskSubtasks,
  useTaskSteps,
  useUpdateStep,
  useUpdateStatus,
  useUpdateTaskStatus,
} from "../../hooks/useTasks";
import { HrmTask } from "../../types/task";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { CreateTaskDialog } from "./create-task-dialog";
import { CreateStepDialog } from "./create-step-dialog";
import { useUser } from "@/hooks/useUser";
import { useHrmPermissions } from "../../hooks/useHrmPermissions";

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

  const [completingItem, setCompletingItem] = useState<{ type: "step" | "subtask"; data: any } | null>(null);
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; url: string }[]>([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload();

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

  const completedStepsCount = steps.filter((s: any) => s.status?.toUpperCase() === "COMPLETED").length;
  const totalStepsCount = steps.length;
  const stepsProgressPct = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  const handleStartTask = async () => {
    try {
      await updateStatus.mutateAsync({ status: "IN_PROGRESS", actionName: "IN_PROGRESS" } as any);
      toast.success("Đã chuyển trạng thái sang Đang thực hiện");
    } catch {
      // handled
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

  // Nếu công việc mới giao và chưa nhận việc: Hiển thị callout rõ ràng, KHÔNG return null gây trắng màn hình
  if (isAssigned) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
          <Clock className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <Heading level="h4" className="font-bold text-slate-800 text-base">
            Công việc đang chờ tiếp nhận
          </Heading>
          <Text variant="small" className="text-slate-500 text-xs leading-relaxed">
            Nhiệm vụ này vừa được phân công cho bạn. Vui lòng bấm nút <strong>&ldquo;Nhận việc&rdquo;</strong> ở thanh thông báo phía trên để bắt đầu lập kế hoạch các bước thực hiện và phân rã nhiệm vụ con.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Tiến độ tổng thể & Thanh hành động nhanh ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heading level="h4" className="font-bold text-slate-900 text-sm">
                Tiến độ thực hiện nhiệm vụ
              </Heading>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold px-2 py-0.5">
                {currentTask.progress ?? 0}%
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {totalStepsCount > 0
                ? `Đã hoàn thành ${completedStepsCount}/${totalStepsCount} bước checklist (${stepsProgressPct}%)`
                : "Hệ thống tự động đồng bộ tiến độ dựa trên kết quả hoàn thành checklist và nhiệm vụ con."}
            </p>
          </div>

          {currentTask.allowedActions?.includes("IN_PROGRESS") && (
            <Button
              size="sm"
              onClick={handleStartTask}
              disabled={updateStatus.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3.5 shadow-xs shrink-0"
            >
              {updateStatus.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
              Bắt đầu thực hiện
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Progress value={currentTask.progress ?? 0} className="h-2.5 bg-slate-100" />
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Khởi tạo</span>
            <span>Đang triển khai</span>
            <span>Hoàn thành & Báo cáo</span>
          </div>
        </div>
      </div>

      {/* ── Các bước thực hiện nội bộ (Checklist) ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <Heading level="h4" className="font-bold text-slate-900 text-sm">
                Các bước thực hiện (Checklist nội bộ)
              </Heading>
              <span className="text-[11px] text-slate-400">
                Phân chia từng khâu nghiệp vụ và ghi nhận điểm KPI
              </span>
            </div>
          </div>
          {canCreateStep(currentTask) && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateStepOpen(true)}
              className="h-8 px-3 text-xs text-blue-700 border-blue-200 bg-blue-50/60 hover:bg-blue-100 font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm bước
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
                      ? "bg-emerald-50/40 border-emerald-200/70 text-slate-600"
                      : "bg-white hover:bg-slate-50/60 border-slate-200/80 shadow-2xs"
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
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-500 bg-white" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                          Bước {index + 1}
                        </span>
                        <p className={`text-sm font-semibold leading-tight ${isStepDone ? "line-through text-slate-500" : "text-slate-800"}`}>
                          {step.title}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                        {step.assigneeName && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                            <User className="w-3 h-3 text-slate-500" />
                            {step.assigneeName}
                          </span>
                        )}

                        {step.baseScore > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                            +{step.baseScore}đ KPI
                          </span>
                        )}

                        {isStepDone && (
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Đã hoàn thành
                          </span>
                        )}
                      </div>

                      {/* Minh chứng nộp của bước nếu có */}
                      {step.evidence && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                          <span className="font-medium text-slate-700">Minh chứng:</span> {step.evidence}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <ListChecks className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Chưa có kế hoạch chi tiết (Checklist các bước)</p>
            <p className="text-[11px] text-slate-400">
              Hãy thêm các bước thực hiện để phân chia trách nhiệm và tự động tích lũy điểm KPI.
            </p>
          </div>
        )}
      </div>

      {/* ── Nhiệm vụ con (Phân rã công việc) ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <Heading level="h4" className="font-bold text-slate-900 text-sm">
                Nhiệm vụ con (Phân rã công việc)
              </Heading>
              <span className="text-[11px] text-slate-400">
                Các gói công việc trực thuộc giao cho phòng ban hoặc chuyên viên
              </span>
            </div>
          </div>
          {canCreateSubtask(currentTask) && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateSubTaskOpen(true)}
              className="h-8 px-3 text-xs text-blue-700 border-blue-200 bg-blue-50/60 hover:bg-blue-100 font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Tạo nhiệm vụ con
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
              const isSubTaskDone = subTask.status?.toUpperCase() === "COMPLETED";

              return (
                <div
                  key={subTask.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/60 shadow-2xs transition-all flex items-start justify-between gap-3"
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
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-500 bg-white" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <p className={`text-sm font-semibold leading-tight ${isSubTaskDone ? "line-through text-slate-500" : "text-slate-800"}`}>
                        {subTask.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {subTask.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Hạn: {safeFormatDate(subTask.dueDate, "dd/MM/yyyy")}
                          </span>
                        )}

                        {(subTask.assignee || subTask.assigneeDepartment) && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                            {subTask.assigneeDepartment ? "🏢 " + subTask.assigneeDepartment.name : "👤 " + subTask.assignee?.fullName}
                          </span>
                        )}

                        {!isSubTaskDone && subTask.progress !== undefined && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
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
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Chưa có nhiệm vụ con nào</p>
            <p className="text-[11px] text-slate-400">
              Bạn có thể phân rã công việc thành các nhiệm vụ con giao cho từng cán bộ phụ trách độc lập.
            </p>
          </div>
        )}
      </div>

      {/* ── Hồ sơ tài liệu & Minh chứng sản phẩm ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <Heading level="h4" className="font-bold text-slate-900 text-sm">
              Tài liệu & Minh chứng nộp sản phẩm
            </Heading>
            <span className="text-[11px] text-slate-400">
              Văn bản chỉ đạo, dự thảo báo cáo, tài liệu đính kèm công việc
            </span>
          </div>
        </div>

        {currentTask.sourceDocumentRef ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium text-slate-700 truncate">{currentTask.sourceDocumentRef}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono px-1.5 py-0.5 bg-white rounded border">
              Văn bản căn cứ
            </span>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs italic">
            Chưa có tài liệu đính kèm nào được tải lên nhiệm vụ này.
          </div>
        )}
      </div>

      {/* ── Banner Thẩm định & Đánh giá thuận tiện ngay cuối quy trình ── */}
      {onOpenEvaluation &&
        (currentTask.status === "REVIEWING" ||
          currentTask.status === "PENDING_REVIEW" ||
          isCompleted ||
          (currentTask.progress ?? 0) >= 100) && (
          <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 dark:from-indigo-950/30 dark:to-blue-950/30 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-2xs">
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
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
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
                className="text-xs"
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
