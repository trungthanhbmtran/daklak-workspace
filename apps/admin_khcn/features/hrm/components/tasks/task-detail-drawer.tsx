/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/components/ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HrmTask } from "../../types/task";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BellRing,
  MessageSquare,
  CheckCircle2,
  ArrowRightCircle,
  Calendar,
  Award,
  Edit3,
  AlertCircle,
  Clock,
  User,
  Users,
  FileText,
  ShieldCheck,
  TrendingUp,
  Inbox,
  ExternalLink,
  X,
} from "lucide-react";

import { useTaskDetail, useRespondTask, useUpdateTaskStatus } from "../../hooks/useTasks";
import { toast } from "sonner";
import { TaskProcessingTab } from "./task-detail-processing-tab";
import { TaskDiscussionTab } from "./task-detail-discussion-tab";
import { TaskHistoryTab } from "./task-detail-history-tab";
import { TaskKpiTab } from "./task-detail-kpi-tab";
import { TaskEvaluationApprovalSheet } from "./TaskEvaluationApprovalSheet";
import { EditTaskDialog } from "./edit-task-dialog";
import { useUser } from "@/hooks/useUser";
import { useHrmPermissions } from "../../hooks/useHrmPermissions";
import { TaskAssignDialog } from "./task-assign-dialog";
import { TaskRespondDialog } from "./task-respond-dialog";
import { TaskExtendDialog } from "./task-extend-dialog";
import {
  safeFormatDate,
  getDeadlineStatus,
  getPriorityBadgeComponent,
  getTaskTypeBadge,
  translateTaskStatus,
  getTaskStatusColor,
  unwrapTaskData,
} from "./task-ui-utils";

interface TaskDetailDrawerProps {
  taskId?: number | null;
  task?: HrmTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDrawer({ taskId, task, open, onOpenChange }: TaskDetailDrawerProps) {
  const activeTaskId = taskId ? Number(taskId) : task ? Number(task.id) : null;
  const { user } = useUser();
  const { canEvaluateTask, canEditTask, canApproveIncidental: checkApproveIncidental, canAssignTask } = useHrmPermissions();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("processing");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["processing"]));
  const [respondAction, setRespondAction] = useState<"REJECT" | "REQUEST_COORDINATION" | "REJECT_INCIDENTAL" | null>(null);
  const [isApprovingIncidental, setIsApprovingIncidental] = useState(false);

  // Reset về tab đầu tiên và reset visitedTabs khi mở drawer hoặc đổi task
  useEffect(() => {
    if (open) {
      setActiveTab("processing");
      setVisitedTabs(new Set(["processing"]));
    }
  }, [open, activeTaskId]);

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    setVisitedTabs((prev) => {
      if (prev.has(nextTab)) return prev;
      const next = new Set(prev);
      next.add(nextTab);
      return next;
    });
  };

  // Queries: Chỉ nạp duy nhất chi tiết của task này khi Drawer mở
  const { data: detailData, isLoading: isLoadingDetail } = useTaskDetail(activeTaskId ? activeTaskId : undefined, {
    enabled: open && Boolean(activeTaskId),
  });

  const currentTask: any = useMemo(() => {
    return unwrapTaskData(detailData) || unwrapTaskData(task) || null;
  }, [detailData, task]);

  const isCompleted = currentTask?.status?.toUpperCase() === "COMPLETED" || currentTask?.status?.toUpperCase() === "DONE";
  const isAssigned = currentTask?.allowedActions?.includes("RECEIVE") || currentTask?.allowedActions?.includes("ACCEPT");
  const isAssigner = user?.employeeCode === currentTask?.creatorEmployeeCode || user?.employeeCode === currentTask?.assignerCode;
  const canReassign = canAssignTask(currentTask);

  const isPendingIncidentalApproval =
    currentTask?.status === "PENDING_APPROVAL" &&
    (currentTask?.metadata?.isIncidental === true ||
      currentTask?.metadata?.taskType === "UNPLANNED" ||
      currentTask?.metadata?.incidentalStatus === "PENDING_APPROVAL");

  const canApproveIncidental =
    currentTask?.allowedActions?.includes("APPROVE_INCIDENTAL") ||
    (isPendingIncidentalApproval && checkApproveIncidental(currentTask));

  const isPendingReview =
    currentTask?.status === "REVIEWING" ||
    currentTask?.status === "PENDING_REVIEW" ||
    ((currentTask?.progress ?? 0) >= 100 && !isCompleted);

  const hasEvaluation = Boolean(currentTask?.kpi || currentTask?.metadata?.evaluation);
  const isReviewable = isPendingReview || isCompleted;
  const canEvaluate = isReviewable && canEvaluateTask(currentTask);
  const canEdit = !isCompleted && canEditTask(currentTask);

  // Mutations
  const respondTask = useRespondTask(activeTaskId || undefined);
  const updateTaskStatus = useUpdateTaskStatus();

  const handleApproveIncidental = async () => {
    setIsApprovingIncidental(true);
    try {
      await updateTaskStatus.mutateAsync({
        id: Number(activeTaskId || currentTask.id),
        payload: { status: "IN_PROGRESS", actionName: "APPROVE_INCIDENTAL" },
      });
      toast.success("Đã phê duyệt việc phát sinh. Nhiệm vụ chính thức được đưa vào danh mục và tính điểm KPI.");
    } catch {
      // handled
    } finally {
      setIsApprovingIncidental(false);
    }
  };

  const handleRejectIncidental = () => setRespondAction("REJECT_INCIDENTAL");

  const handleAcceptTask = async () => {
    try {
      await respondTask.mutateAsync({ action: "ACCEPT" });
      toast.success("Đã tiếp nhận công việc thành công");
    } catch {
      // handled
    }
  };

  const handleRejectTask = () => setRespondAction("REJECT");
  const handleRequestCoordination = () => setRespondAction("REQUEST_COORDINATION");

  const deadlineInfo = getDeadlineStatus(currentTask?.dueDate, isCompleted, currentTask?.completedAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-[850px] md:max-w-[950px] lg:max-w-[1050px] xl:max-w-[1150px] p-0 flex flex-col h-full bg-slate-50 shadow-2xl border-l border-slate-200"
      >
        {isLoadingDetail && !currentTask ? (
          <div className="p-8 space-y-6 bg-white h-full relative">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 px-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold gap-1 border border-slate-200 bg-white"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4 text-slate-600" />
                <span>Đóng</span>
              </Button>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <div className="pt-6 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        ) : !currentTask ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center h-full relative">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 px-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold gap-1 border border-slate-200 bg-white"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4 text-slate-600" />
                <span>Đóng</span>
              </Button>
            </div>
            <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-base font-semibold text-slate-700">Không tìm thấy thông tin công việc</p>
            <p className="text-xs text-slate-400 mt-1">Dữ liệu có thể đã bị thay đổi hoặc bạn không có thẩm quyền truy cập.</p>
          </div>
        ) : (
          <>
            {/* ── Enterprise Header ── */}
            <div className="p-6 bg-white border-b border-slate-200 shrink-0">
              <SheetHeader className="space-y-3">
                {/* Parent Task link (Safe check, avoids floating 0 bug) */}
                {Boolean(currentTask.parentId) && (
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 shadow-2xs">
                      <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
                      Thuộc nhiệm vụ cha: #{currentTask.parentId}
                    </span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        #{currentTask.id}
                      </span>
                      {getPriorityBadgeComponent(currentTask.priority)}
                      <Badge
                        variant={isCompleted ? "default" : "outline"}
                        className={isCompleted ? "bg-emerald-600 text-white font-medium" : getTaskStatusColor(currentTask.status || "")}
                      >
                        {currentTask.statusLabel || translateTaskStatus(currentTask.status || "")}
                      </Badge>
                      {getTaskTypeBadge(currentTask)}
                    </div>

                    <SheetTitle className="text-xl font-bold text-slate-900 leading-snug wrap-break-word">
                      {currentTask.title}
                    </SheetTitle>

                    {currentTask.description && (
                      <SheetDescription className="text-slate-600 text-sm leading-relaxed whitespace-pre-line line-clamp-3 hover:line-clamp-none transition-all">
                        {currentTask.description}
                      </SheetDescription>
                    )}
                  </div>

                  {/* Header Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 justify-start lg:justify-end">
                    {canEvaluate && (
                      <Button
                        size="sm"
                        onClick={() => setIsEvaluationOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs text-xs h-8 px-3.5"
                        title="Mở màn hình Thẩm định & Đánh giá của Lãnh đạo"
                      >
                        <Award className="w-3.5 h-3.5 mr-1.5" />
                        {hasEvaluation ? "Cập nhật đánh giá" : "Thẩm định & Đánh giá KPI"}
                      </Button>
                    )}

                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                        className="text-blue-700 border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:text-blue-800 font-medium text-xs h-8 px-3"
                        title="Chỉnh sửa nội dung chi tiết công việc"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Chỉnh sửa
                      </Button>
                    )}

                    {canReassign && !isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAssignOpen(true)}
                        className="text-slate-700 border-slate-200 bg-white hover:bg-slate-100 text-xs h-8 px-3"
                      >
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        Giao lại / Phối hợp
                      </Button>
                    )}

                    {isAssigner && !isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExtendOpen(true)}
                        className="text-purple-700 border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-xs h-8 px-3"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1 text-purple-600" />
                        Gia hạn
                      </Button>
                    )}

                    {!isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-700 border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-xs h-8 px-3"
                      >
                        <BellRing className="w-3.5 h-3.5 mr-1 text-orange-600" />
                        Đôn đốc
                      </Button>
                    )}

                    <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-700 border-slate-200 bg-white hover:bg-slate-100 text-xs h-8 px-2.5 gap-1 shadow-2xs"
                        title="Mở toàn màn hình trang chi tiết độc lập"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Trang đầy đủ</span>
                      </Button>
                    </Link>

                    {/* Prominent Header Close Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenChange(false)}
                      className="h-8 px-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold gap-1 shrink-0 ml-1 border border-slate-200 bg-white shadow-2xs transition-colors"
                      title="Đóng chi tiết công việc (Esc)"
                      aria-label="Đóng"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                      <span className="hidden sm:inline">Đóng</span>
                    </Button>
                  </div>
                </div>
              </SheetHeader>


              {/* ── Enterprise Structured Info Cards Grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
                {/* Người chủ trì xử lý */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium">Chủ trì xử lý</span>
                    {currentTask.assigneePercentage !== undefined && (
                      <Badge variant="outline" className="ml-auto text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold px-1 py-0">
                        {currentTask.assigneePercentage}%
                      </Badge>
                    )}
                  </div>
                  <div className="font-semibold text-slate-900 text-sm truncate">
                    {currentTask.assigneeName || currentTask.assigneeDepartment?.name || currentTask.assignee?.fullName || "Chưa phân công"}
                  </div>
                  <span className="text-[11px] text-slate-500 truncate mt-0.5">
                    {currentTask.assigneeDepartment?.name || "Đơn vị chủ quản"}
                  </span>
                </div>

                {/* Người phối hợp */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-medium">Phối hợp thực hiện</span>
                  </div>
                  <div className="min-h-[22px] flex items-center">
                    {(() => {
                      const coordinators = currentTask.participants?.filter((p: any) => p.role === "COORDINATOR") || [];
                      if (coordinators.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                            {coordinators.map((c: any, idx: number) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded text-[11px] font-medium truncate max-w-full">
                                {c.fullName || c.employeeName} {c.percentage ? `(${c.percentage}%)` : ""}
                              </span>
                            ))}
                          </div>
                        );
                      }
                      if (currentTask.coassigneeNames && currentTask.coassigneeNames.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                            {currentTask.coassigneeNames.map((name: string, idx: number) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] font-medium truncate">
                                {name}
                              </span>
                            ))}
                          </div>
                        );
                      }
                      return <span className="text-slate-400 italic">Không có phối hợp</span>;
                    })()}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {currentTask.coassigneeNames?.length ? `${currentTask.coassigneeNames.length} nhân sự tham gia` : "Thực hiện độc lập"}
                  </span>
                </div>

                {/* Thời hạn hoàn thành */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-medium">Hạn hoàn thành</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] ${deadlineInfo.badgeClass}`}>
                      {deadlineInfo.label}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {safeFormatDate(currentTask.dueDate, "dd/MM/yyyy HH:mm")}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Bắt đầu: {safeFormatDate(currentTask.startDate || currentTask.createdAt, "dd/MM/yyyy")}
                  </span>
                </div>

                {/* Người giám sát & Định biên KPI */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium">Thẩm định & Giám sát</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm truncate">
                    {currentTask.supervisorName || currentTask.supervisorCode || "Lãnh đạo phụ trách"}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    <span>Hệ số K: <strong>{currentTask.metadata?.difficultyK || 1.0}</strong></span>
                    <span>Cơ số: <strong>{currentTask.metadata?.baseScore || 100}đ</strong></span>
                  </div>
                </div>
              </div>

              {/* Source Document Reference if available */}
              {currentTask.sourceDocumentRef && (
                <div className="mt-3 p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-slate-600 font-medium shrink-0">Căn cứ văn bản:</span>
                  <span className="text-blue-700 font-semibold truncate hover:underline cursor-pointer">
                    {currentTask.sourceDocumentRef}
                  </span>
                </div>
              )}
            </div>

            {/* ── Banner phê duyệt nhiệm vụ phát sinh của Lãnh đạo thẩm định ── */}
            {isPendingIncidentalApproval && (
              <div className="bg-amber-50/90 dark:bg-amber-950/40 p-4 border-b border-amber-300 dark:border-amber-800 shrink-0 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Heading level="h4" className="font-bold text-amber-900 dark:text-amber-100 text-sm">
                      Yêu cầu phê duyệt nhiệm vụ phát sinh ngoài kế hoạch
                    </Heading>
                    <Text variant="small" className="text-amber-800 dark:text-amber-300 font-normal leading-relaxed text-xs">
                      Theo quy định, công việc phát sinh bắt buộc phải có sự đồng ý của <strong>Lãnh đạo phụ trách thẩm định</strong> ({currentTask.supervisorCode || "Lãnh đạo"}) phê duyệt thì mới được đưa vào danh mục chính thức và kích hoạt tính điểm KPI.
                    </Text>

                    {canApproveIncidental ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          onClick={handleApproveIncidental}
                          size="sm"
                          disabled={isApprovingIncidental}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium text-xs h-8"
                          iconStart={isApprovingIncidental ? undefined : <CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          {isApprovingIncidental ? "Đang phê duyệt..." : "Phê duyệt đồng ý (Kích hoạt KPI)"}
                        </Button>
                        <Button
                          onClick={handleRejectIncidental}
                          size="sm"
                          variant="outline"
                          disabled={isApprovingIncidental}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-white font-medium text-xs h-8"
                        >
                          Từ chối việc phát sinh
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-1 text-xs text-amber-700 dark:text-amber-400 font-medium italic">
                        ⏳ Đang chờ Lãnh đạo thẩm định phụ trách ({currentTask.supervisorCode}) xem xét phê duyệt.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Box tiếp nhận công việc ── */}
            {isAssigned && (
              <div className="bg-blue-50/90 p-4 border-b border-blue-200 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Heading level="h4" className="font-semibold text-blue-900 flex items-center gap-1.5 text-sm">
                      <Inbox className="w-4 h-4 text-blue-600" />
                      Xác nhận tiếp nhận công việc
                    </Heading>
                    <Text variant="small" className="text-blue-700 mt-1 font-normal text-xs leading-relaxed">
                      Công việc này vừa được giao cho bạn. Vui lòng xác nhận tiếp nhận để bắt đầu xử lý (phân rã nhiệm vụ con, lập checklist các bước, cập nhật tiến độ), hoặc từ chối nếu không đúng thẩm quyền.
                    </Text>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button onClick={handleAcceptTask} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs h-8 px-3.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Nhận việc
                    </Button>
                    <Button onClick={handleRejectTask} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-white text-xs h-8 px-3">
                      Từ chối
                    </Button>
                    <Button onClick={handleRequestCoordination} size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50 bg-white text-xs h-8 px-3">
                      Xin phối hợp
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Top Action Banner: Thẩm định & Đánh giá KPI khi công việc chờ duyệt ── */}
            {isPendingReview && !isPendingIncidentalApproval && (
              <div className="bg-gradient-to-r from-indigo-50/90 to-blue-50/90 dark:from-indigo-950/40 dark:to-blue-950/40 p-4 border-b border-indigo-200 dark:border-indigo-800 shrink-0 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-2xs">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <Heading level="h4" className="font-semibold text-indigo-950 dark:text-indigo-100 text-sm flex items-center gap-2">
                        <span>Yêu cầu Thẩm định chất lượng & Đánh giá KPI</span>
                        <Badge className="bg-indigo-600 text-white text-[10px] h-4 font-normal">Cần thẩm định</Badge>
                      </Heading>
                      <Text variant="small" className="text-indigo-900/80 dark:text-indigo-300 font-normal leading-relaxed text-xs">
                        Sản phẩm công việc đã được nộp. Lãnh đạo phụ trách ({currentTask.supervisorCode || "chưa phân công"}) tiến hành đối chiếu, thẩm định 4 thành tố để chốt điểm KPI công vụ.
                      </Text>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEvaluationOpen(true)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 px-3.5 shrink-0 shadow-sm"
                  >
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    Thẩm định ngay
                  </Button>
                </div>
              </div>
            )}

            {/* ── Tabs Navigation ── */}
            {/* ── Tabs Navigation: Lazy mount & query on tab click ── */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="px-6 py-2.5 bg-white border-b border-slate-200 shrink-0">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100/90 p-1 rounded-xl">
                  <TabsTrigger value="processing" className="gap-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    Xử lý & Cập nhật
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="gap-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Trao đổi & Ý kiến
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    Lịch sử & Vết kiểm toán
                  </TabsTrigger>
                  <TabsTrigger value="kpi" className="gap-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Đánh giá & KPI
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden relative bg-slate-50">
                {/* ── Tab Xử lý & Cập nhật: Mount khi user đã truy cập ── */}
                <TabsContent value="processing" className={`m-0 h-full outline-none ${activeTab === "processing" ? "block" : "hidden"}`}>
                  {visitedTabs.has("processing") && (
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-6 max-w-5xl mx-auto">
                        <TaskProcessingTab
                          taskId={Number(activeTaskId || currentTask.id)}
                          currentTask={currentTask}
                          isCompleted={isCompleted}
                          isAssigned={isAssigned}
                          onOpenEvaluation={() => setIsEvaluationOpen(true)}
                        />
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                {/* ── Tab Trao đổi: Chỉ mount & fetch comment + socket khi user click vào tab ── */}
                <TabsContent value="discussion" className={`m-0 h-full outline-none ${activeTab === "discussion" ? "block" : "hidden"}`}>
                  {visitedTabs.has("discussion") && (
                    <div className="p-6 h-full flex flex-col min-h-0 overflow-hidden max-w-5xl mx-auto">
                      <TaskDiscussionTab
                        taskId={Number(activeTaskId || currentTask.id)}
                        conversationId={currentTask.conversationId}
                        allowedActions={currentTask.allowedActions}
                        participants={currentTask.participants}
                        task={currentTask}
                      />
                    </div>
                  )}
                </TabsContent>

                {/* ── Tab Lịch sử: Chỉ mount & fetch audit trail khi user click vào tab ── */}
                <TabsContent value="history" className={`m-0 h-full outline-none ${activeTab === "history" ? "block" : "hidden"}`}>
                  {visitedTabs.has("history") && (
                    <ScrollArea className="h-full">
                      <div className="p-6 max-w-5xl mx-auto">
                        <TaskHistoryTab
                          taskId={Number(activeTaskId || currentTask.id)}
                          currentTask={currentTask}
                        />
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                {/* ── Tab Đánh giá & KPI: Chỉ mount khi user click vào tab ── */}
                <TabsContent value="kpi" className={`m-0 h-full outline-none ${activeTab === "kpi" ? "block" : "hidden"}`}>
                  {visitedTabs.has("kpi") && (
                    <ScrollArea className="h-full">
                      <div className="p-6 h-full space-y-6 max-w-5xl mx-auto">
                        <TaskKpiTab
                          taskId={Number(activeTaskId || currentTask.id)}
                          currentTask={currentTask}
                          canEvaluate={canEvaluate}
                          onOpenEvaluation={() => setIsEvaluationOpen(true)}
                        />
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}

        {/* ── Sub Dialogs & Sheets ── */}
        {isAssignOpen && activeTaskId && currentTask && (
          <TaskAssignDialog
            open={isAssignOpen}
            onOpenChange={setIsAssignOpen}
            taskId={activeTaskId}
            currentAssigneeCode={currentTask.assigneeCode}
            currentCoordinators={(currentTask.participants?.filter((p: any) => p.role === "COORDINATOR") || []).map((p: any) => ({
              id: p.employeeCode,
              name: p.fullName || p.employeeName || p.employeeCode,
            }))}
          />
        )}

        {respondAction !== null && activeTaskId && (
          <TaskRespondDialog
            open={respondAction !== null}
            onOpenChange={(open) => !open && setRespondAction(null)}
            taskId={activeTaskId}
            action={respondAction}
            onConfirm={
              respondAction === "REJECT_INCIDENTAL"
                ? async (rejectReason) => {
                    await updateTaskStatus.mutateAsync({
                      id: activeTaskId,
                      payload: { status: "REJECTED", actionName: "REJECT_INCIDENTAL", rejectReason },
                    });
                    toast.success("Đã từ chối duyệt việc phát sinh.");
                  }
                : undefined
            }
          />
        )}

        {isExtendOpen && activeTaskId && currentTask && (
          <TaskExtendDialog
            open={isExtendOpen}
            onOpenChange={setIsExtendOpen}
            taskId={activeTaskId}
            currentDueDate={currentTask.dueDate}
          />
        )}

        {isEditOpen && currentTask && (
          <EditTaskDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            task={currentTask}
          />
        )}

        {isEvaluationOpen && currentTask && (
          <TaskEvaluationApprovalSheet
            task={currentTask}
            taskId={Number(activeTaskId || currentTask.id)}
            open={isEvaluationOpen}
            onOpenChange={setIsEvaluationOpen}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
