/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Users,
  Award,
  ShieldCheck,
  TrendingUp,
  Share2,
  FileText,
  Building,
  Layers,
  Edit3,
  PlayCircle,
  Inbox,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/components/ui/typography";
import { toast } from "sonner";

import { useTaskDetail, useRespondTask, useUpdateTaskStatus } from "../../hooks/useTasks";
import { useUser } from "@/hooks/useUser";
import { useHrmPermissions } from "../../hooks/useHrmPermissions";
import dynamic from "next/dynamic";
import { TaskProcessingTab } from "./task-detail-processing-tab";
import { TaskDiscussionTab } from "./task-detail-discussion-tab";
import { TaskHistoryTab } from "./task-detail-history-tab";
import { TaskKpiTab } from "./task-detail-kpi-tab";

const TaskAssignDialog = dynamic(
  () => import("./task-assign-dialog").then((mod) => mod.TaskAssignDialog),
  { ssr: false }
);
const TaskRespondDialog = dynamic(
  () => import("./task-respond-dialog").then((mod) => mod.TaskRespondDialog),
  { ssr: false }
);
const TaskExtendDialog = dynamic(
  () => import("./task-extend-dialog").then((mod) => mod.TaskExtendDialog),
  { ssr: false }
);
import {
  safeFormatDate,
  getDeadlineStatus,
  getPriorityBadgeComponent,
  getTaskTypeBadge,
  translateTaskStatus,
  getTaskStatusColor,
} from "./task-ui-utils";

interface TaskDetailClientProps {
  id: string | number;
}

export function TaskDetailClient({ id }: TaskDetailClientProps) {
  const router = useRouter();
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;
  const isValidId = !Number.isNaN(numericId) && numericId > 0;

  const { user } = useUser();
  const { canEvaluateTask, canEditTask, canApproveIncidental: checkApproveIncidental, canAssignTask } = useHrmPermissions();

  const [activeTab, setActiveTab] = useState<string>("processing");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["processing"]));
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [respondAction, setRespondAction] = useState<"REJECT" | "REQUEST_COORDINATION" | "REJECT_INCIDENTAL" | null>(null);
  const [isApprovingIncidental, setIsApprovingIncidental] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    setVisitedTabs((prev) => {
      if (prev.has(nextTab)) return prev;
      const next = new Set(prev);
      next.add(nextTab);
      return next;
    });
  };

  // Queries: Chỉ nạp duy nhất chi tiết của 1 nhiệm vụ này khi trang mở
  const { data: detailData, isLoading, isError, refetch } = useTaskDetail(isValidId ? numericId : undefined, {
    enabled: isValidId,
  });

  const currentTask: any = detailData || null;

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

  const isReviewable = isPendingReview || isCompleted;
  const canEvaluate = isReviewable && canEvaluateTask(currentTask);
  const canEdit = !isCompleted && canEditTask(currentTask);

  // Mutations
  const respondTask = useRespondTask(isValidId ? numericId : undefined);
  const updateTaskStatus = useUpdateTaskStatus();

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Đã sao chép liên kết công việc vào bộ nhớ tạm");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleApproveIncidental = async () => {
    try {
      setIsApprovingIncidental(true);
      await updateTaskStatus.mutateAsync({
        id: numericId,
        payload: { status: "IN_PROGRESS", actionName: "APPROVE_INCIDENTAL" },
      });
      toast.success("Đã phê duyệt công việc phát sinh thành công");
      refetch();
    } catch {
      toast.error("Không thể phê duyệt công việc phát sinh");
    } finally {
      setIsApprovingIncidental(false);
    }
  };

  const handleAcceptTask = async () => {
    try {
      await respondTask.mutateAsync({ action: "ACCEPT" });
      toast.success("Đã tiếp nhận công việc thành công. Bắt đầu xử lý!");
      refetch();
    } catch {
      toast.error("Không thể tiếp nhận công việc");
    }
  };

  // Trạng thái ID không hợp lệ
  if (!isValidId) {
    return (
      <div className="flex flex-col min-h-[60vh] bg-background p-6 md:p-10 items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <Heading level="h4" className="text-slate-800 mb-2">
          Mã công việc không hợp lệ
        </Heading>
        <Text variant="muted" className="mb-6 max-w-md">
          Đường dẫn không chứa định danh công việc hợp lệ. Vui lòng kiểm tra lại liên kết hoặc quay về danh sách.
        </Text>
        <Link href="/services/hrm/work-plans/tasks">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách công việc
          </Button>
        </Link>
      </div>
    );
  }

  // Trạng thái đang tải dữ liệu (Enterprise Skeleton)
  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <Skeleton className="h-9 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái lỗi không tìm thấy
  if (isError || !currentTask) {
    return (
      <div className="flex flex-col min-h-[60vh] bg-background p-6 md:p-10 items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <Heading level="h4" className="text-slate-800 mb-2">
          Không tìm thấy công việc #{numericId}
        </Heading>
        <Text variant="muted" className="mb-6 max-w-md">
          Công việc này không tồn tại hoặc bạn không có thẩm quyền truy cập theo chính sách phân quyền hiện tại.
        </Text>
        <Link href="/services/hrm/work-plans/tasks">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách công việc
          </Button>
        </Link>
      </div>
    );
  }

  const deadline = getDeadlineStatus(currentTask.dueDate, isCompleted, currentTask.completedAt);
  const priorityBadge = getPriorityBadgeComponent(currentTask.priority);
  const taskTypeBadge = getTaskTypeBadge(currentTask);
  const statusLabel = translateTaskStatus(currentTask.status, currentTask.statusLabel);
  const statusClass = getTaskStatusColor(currentTask.status);

  // Phân bổ nhân sự
  const assignees: any[] = Array.isArray(currentTask.assignees) ? currentTask.assignees : [];
  const primaryAssignee =
    assignees.find((a) => a.role === "PRIMARY" || a.isPrimary) ||
    assignees[0] ||
    (currentTask.assigneeCode ? { employeeCode: currentTask.assigneeCode, employeeName: currentTask.assigneeName } : null);

  const coordinatingAssignees = assignees.filter(
    (a) => a !== primaryAssignee && a.employeeCode !== primaryAssignee?.employeeCode
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-[1400px] mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Navigation Bar: Breadcrumb + Quay lại + Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/services/hrm/work-plans/tasks" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Quản lý công việc
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-700 truncate">Nhiệm vụ #{currentTask.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/services/hrm/work-plans/tasks">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-slate-600 hover:text-slate-900">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Quay lại danh sách</span>
                </Button>
              </Link>
              <div className="h-4 w-[1px] bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Cập nhật: {safeFormatDate(currentTask.updatedAt || currentTask.createdAt, "dd/MM/yyyy HH:mm")}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar Toolbar */}
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 gap-1.5 text-slate-600 hover:text-slate-900"
              title="Sao chép liên kết"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden md:inline">{copiedLink ? "Đã sao chép" : "Chia sẻ"}</span>
            </Button>

            {isAssigned && (
              <Button
                size="sm"
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium shadow-xs"
                onClick={handleAcceptTask}
                disabled={respondTask.isPending}
              >
                {respondTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Tiếp nhận nhiệm vụ
              </Button>
            )}

            {canApproveIncidental && (
              <>
                <Button
                  size="sm"
                  className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium shadow-xs"
                  onClick={handleApproveIncidental}
                  disabled={isApprovingIncidental}
                >
                  {isApprovingIncidental ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Phê duyệt phát sinh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
                  onClick={() => setRespondAction("REJECT_INCIDENTAL")}
                >
                  Từ chối
                </Button>
              </>
            )}

            {canEvaluate && (
              <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}/evaluate`}>
                <Button
                  size="sm"
                  className="h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-medium shadow-xs"
                >
                  <Award className="w-4 h-4" />
                  Đánh giá KPI
                </Button>
              </Link>
            )}

            {canReassign && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 text-slate-700 hover:bg-slate-100"
                onClick={() => setIsAssignOpen(true)}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Phân công lại</span>
              </Button>
            )}

            {canEdit && (
              <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 text-slate-700 hover:bg-slate-100"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Chỉnh sửa</span>
                </Button>
              </Link>
            )}

            {!isCompleted && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                onClick={() => setIsExtendOpen(true)}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Xin gia hạn</span>
              </Button>
            )}
          </div>
        </div>

        {/* Enterprise Hero Card: Tiêu đề + Huy hiệu + Tiến độ */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />
          <CardContent className="p-6 md:p-8 space-y-5">
            {/* Badges Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`font-semibold px-2.5 py-0.5 ${statusClass}`}>
                {statusLabel}
              </Badge>
              {priorityBadge}
              {taskTypeBadge}

              {Boolean(currentTask?.parentId) && (
                <Link
                  href={`/services/hrm/work-plans/tasks/${currentTask.parentId}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full transition-colors"
                >
                  <Layers className="w-3 h-3" />
                  Nhiệm vụ cha: #{currentTask.parentId}
                </Link>
              )}
            </div>

            {/* Task Title */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-snug wrap-break-word">
                {currentTask.title}
              </h1>
              {currentTask.description && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-4xl whitespace-pre-line">
                  {currentTask.description}
                </p>
              )}
            </div>

            {/* Progress Bar Container */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Tiến độ hoàn thành nhiệm vụ
                </span>
                <span className="text-blue-700 font-bold text-sm">{currentTask.progress ?? 0}%</span>
              </div>
              <Progress value={currentTask.progress ?? 0} className="h-2.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Lưới 4 Thẻ Chỉ Huy (Command Cards Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Chủ trì thực hiện */}
          <Card className="rounded-xl border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chủ trì thực hiện</span>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-2xs font-bold">
                {primaryAssignee?.percentage || primaryAssignee?.weight ? `${primaryAssignee.percentage || primaryAssignee.weight}%` : "100%"}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-blue-200 bg-blue-50 text-blue-700 font-bold shrink-0">
                <AvatarFallback>{primaryAssignee?.employeeName?.slice(-2) || "CT"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate" title={primaryAssignee?.employeeName || "Chưa phân công"}>
                  {primaryAssignee?.employeeName || "Chưa phân công"}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {primaryAssignee?.employeeCode ? `Mã: ${primaryAssignee.employeeCode}` : currentTask?.departmentName || "Cán bộ chủ trì"}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Phối hợp thực hiện */}
          <Card className="rounded-xl border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phối hợp thực hiện</span>
              <Badge variant="outline" className="text-slate-600 bg-slate-50 text-2xs font-bold">
                {coordinatingAssignees.length} cán bộ
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                {coordinatingAssignees.length > 0 ? (
                  <div>
                    <div className="text-sm font-semibold text-slate-900 truncate" title={coordinatingAssignees.map((c) => c.employeeName).join(", ")}>
                      {coordinatingAssignees.map((c) => c.employeeName).join(", ")}
                    </div>
                    <div className="text-xs text-slate-500">Đã phân bổ tỷ lệ phối hợp</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-medium text-slate-500 italic">Không có phối hợp</div>
                    <div className="text-xs text-slate-400">Chủ trì phụ trách toàn bộ</div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Card 3: Hạn xử lý & Cảnh báo hạn */}
          <Card className="rounded-xl border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hạn hoàn thành</span>
              <span className={`text-2xs px-2 py-0.5 rounded-full border ${deadline.badgeClass}`}>
                {deadline.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 ${deadline.isOverdue ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-100 border-slate-200 text-slate-700"}`}>
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900">
                  {safeFormatDate(currentTask.dueDate, "dd/MM/yyyy HH:mm")}
                </div>
                <div className="text-xs text-slate-500">
                  Bắt đầu: {safeFormatDate(currentTask.startDate || currentTask.createdAt, "dd/MM/yyyy")}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 4: Thẩm định & Giám sát */}
          <Card className="rounded-xl border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thẩm định & Giám sát</span>
              <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200 text-2xs font-bold">
                K = {currentTask.kpiWeight || currentTask.difficultyFactor || 1.0}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {currentTask.supervisorName || currentTask.evaluatorName || currentTask.creatorName || "Lãnh đạo đơn vị"}
                </div>
                <div className="text-xs text-slate-500">
                  Điểm cơ số: <span className="font-semibold text-slate-700">{currentTask.baseScore || currentTask.kpiScore || 10}đ</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 12-Column Layout: 8 Cột Nội dung chính + 4 Cột Sidebar Cố định */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="border-b border-slate-200 px-4 md:px-6 bg-slate-50/50">
                  <TabsList className="bg-transparent h-12 p-0 gap-6">
                    <TabsTrigger
                      value="processing"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-1 text-sm font-medium data-[state=active]:text-blue-700 data-[state=active]:font-bold"
                    >
                      Xử lý công việc & Checklist
                    </TabsTrigger>
                    <TabsTrigger
                      value="discussion"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-1 text-sm font-medium data-[state=active]:text-blue-700 data-[state=active]:font-bold"
                    >
                      Trao đổi & Thảo luận
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-1 text-sm font-medium data-[state=active]:text-blue-700 data-[state=active]:font-bold"
                    >
                      Lịch sử & Vết xử lý
                    </TabsTrigger>
                    <TabsTrigger
                      value="kpi"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-1 text-sm font-medium data-[state=active]:text-blue-700 data-[state=active]:font-bold"
                    >
                      Đánh giá & KPI
                    </TabsTrigger>
                    <TabsTrigger
                      value="metadata"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-1 text-sm font-medium data-[state=active]:text-blue-700 data-[state=active]:font-bold"
                    >
                      Thông tin chi tiết
                    </TabsTrigger>
                  </TabsList>
                </div>

                <CardContent className="p-4 md:p-6">
                  {/* Tab Xử lý: Mount khi user đã truy cập */}
                  <TabsContent value="processing" className={`mt-0 focus-visible:outline-hidden ${activeTab === "processing" ? "block" : "hidden"}`}>
                    {visitedTabs.has("processing") && (
                      <TaskProcessingTab
                        taskId={numericId}
                        currentTask={currentTask}
                        isCompleted={isCompleted}
                        isAssigned={isAssigned}
                        onOpenEvaluation={() => router.push(`/services/hrm/work-plans/tasks/${numericId}/evaluate`)}
                      />
                    )}
                  </TabsContent>

                  {/* Tab Trao đổi: Chỉ mount & fetch comment + socket khi user click vào tab */}
                  <TabsContent value="discussion" className={`mt-0 focus-visible:outline-hidden ${activeTab === "discussion" ? "block" : "hidden"}`}>
                    {visitedTabs.has("discussion") && (
                      <TaskDiscussionTab
                        taskId={numericId}
                        conversationId={currentTask?.conversationId}
                        allowedActions={currentTask?.allowedActions}
                        participants={currentTask?.participants}
                        task={currentTask}
                      />
                    )}
                  </TabsContent>

                  {/* Tab Lịch sử: Chỉ mount & fetch history khi user click vào tab */}
                  <TabsContent value="history" className={`mt-0 focus-visible:outline-hidden ${activeTab === "history" ? "block" : "hidden"}`}>
                    {visitedTabs.has("history") && (
                      <TaskHistoryTab taskId={numericId} currentTask={currentTask} />
                    )}
                  </TabsContent>

                  {/* Tab Đánh giá & KPI: Chỉ mount khi user click vào tab */}
                  <TabsContent value="kpi" className={`mt-0 focus-visible:outline-hidden ${activeTab === "kpi" ? "block" : "hidden"}`}>
                    {visitedTabs.has("kpi") && (
                      <TaskKpiTab
                        taskId={numericId}
                        currentTask={currentTask}
                        canEvaluate={canEvaluate}
                        onOpenEvaluation={() => router.push(`/services/hrm/work-plans/tasks/${numericId}/evaluate`)}
                      />
                    )}
                  </TabsContent>

                  {/* Tab Thông tin chi tiết */}
                  <TabsContent value="metadata" className={`mt-0 space-y-6 focus-visible:outline-hidden ${activeTab === "metadata" ? "block" : "hidden"}`}>
                    {visitedTabs.has("metadata") && (
                      <>
                        <div className="space-y-4">
                          <Heading level="h4" className="text-slate-800 text-base font-semibold border-b pb-2">
                            Mô tả chi tiết và yêu cầu kết quả
                          </Heading>
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {currentTask.description || "Chưa có mô tả chi tiết cho công việc này."}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Heading level="h4" className="text-slate-800 text-base font-semibold border-b pb-2">
                            Thông tin kỹ thuật & Tích hợp
                          </Heading>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                              <span className="text-slate-400 font-medium">Định danh (Task ID):</span>
                              <div className="font-mono font-bold text-slate-800">#{currentTask.id}</div>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                              <span className="text-slate-400 font-medium">Phòng ban chủ quản:</span>
                              <div className="font-semibold text-slate-800">{currentTask.departmentName || "—"}</div>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                              <span className="text-slate-400 font-medium">Người khởi tạo:</span>
                              <div className="font-semibold text-slate-800">{currentTask.creatorName || currentTask.creatorEmployeeCode || "—"}</div>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                              <span className="text-slate-400 font-medium">Thời gian tạo:</span>
                              <div className="font-semibold text-slate-800">{safeFormatDate(currentTask.createdAt, "dd/MM/yyyy HH:mm:ss")}</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sticky Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Tổng quan KPI & Điểm số */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Chỉ số KPI & Đánh giá</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cơ số điểm:</span>
                  <span className="font-bold text-slate-900">{currentTask.baseScore || currentTask.kpiScore || 10} điểm</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Hệ số độ khó (K):</span>
                  <span className="font-bold text-indigo-700">K = {currentTask.kpiWeight || currentTask.difficultyFactor || 1.0}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tỷ lệ đóng góp chủ trì:</span>
                  <span className="font-bold text-blue-700">{primaryAssignee?.percentage || primaryAssignee?.weight || 100}%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Điểm KPI dự kiến:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {Math.round((currentTask.baseScore || currentTask.kpiScore || 10) * (currentTask.kpiWeight || currentTask.difficultyFactor || 1.0) * ((primaryAssignee?.percentage || primaryAssignee?.weight || 100) / 100))} điểm
                  </span>
                </div>
                {currentTask.kpiScoreFinal !== undefined && (
                  <div className="flex justify-between items-center py-1.5 bg-emerald-50 px-2 rounded-lg text-emerald-800 font-bold">
                    <span>Điểm chốt chính thức:</span>
                    <span className="text-base">{currentTask.kpiScoreFinal} điểm</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Card 2: Danh sách Đội ngũ */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Đội ngũ thực hiện</h3>
              </div>
              <div className="space-y-3">
                {/* Chủ trì */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                  <Avatar className="h-9 w-9 border border-blue-200 bg-blue-100 text-blue-700 font-bold shrink-0">
                    <AvatarFallback>{primaryAssignee?.employeeName?.slice(-2) || "CT"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{primaryAssignee?.employeeName || "Chưa phân công"}</div>
                    <div className="text-2xs text-blue-700 font-medium">Chủ trì ({primaryAssignee?.percentage || primaryAssignee?.weight || 100}%)</div>
                  </div>
                </div>

                {/* Phối hợp */}
                {coordinatingAssignees.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Cán bộ phối hợp</span>
                    {coordinatingAssignees.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                        <Avatar className="h-7 w-7 border border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold shrink-0">
                          <AvatarFallback>{c.employeeName?.slice(-2) || "PH"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 truncate">{c.employeeName}</div>
                          <div className="text-2xs text-slate-500">Phối hợp: {c.percentage || c.weight || 0}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Card 3: Thao tác nhanh */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Thao tác nhanh</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="justify-start gap-2 h-9 text-xs text-slate-700">
                  <Copy className="w-4 h-4 text-slate-500" />
                  Sao chép liên kết công việc
                </Button>
                <Link href="/services/hrm/work-plans/tasks">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-xs text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                    Quay về danh sách bảng nhiệm vụ
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Các Dialog Nghiệp vụ Điều khiển tập trung */}
      {isAssignOpen && isValidId && currentTask && (
        <TaskAssignDialog
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
          taskId={numericId}
          currentAssigneeCode={currentTask.assigneeCode}
          currentCoordinators={(currentTask.participants?.filter((p: any) => p.role === "COORDINATOR") || []).map((p: any) => ({
            id: p.employeeCode,
            name: p.fullName || p.employeeName || p.employeeCode,
          }))}
        />
      )}

      {isExtendOpen && isValidId && currentTask && (
        <TaskExtendDialog
          taskId={numericId}
          open={isExtendOpen}
          onOpenChange={setIsExtendOpen}
          currentDueDate={currentTask.dueDate}
        />
      )}



      {respondAction && isValidId && (
        <TaskRespondDialog
          taskId={numericId}
          open={Boolean(respondAction)}
          onOpenChange={(open) => !open && setRespondAction(null)}
          action={respondAction}
          onConfirm={
            respondAction === "REJECT_INCIDENTAL"
              ? async (rejectReason) => {
                  await updateTaskStatus.mutateAsync({
                    id: numericId,
                    payload: { status: "REJECTED", actionName: "REJECT_INCIDENTAL", rejectReason },
                  });
                  toast.success("Đã từ chối duyệt việc phát sinh.");
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
