"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HrmTask } from "../../types/task";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  BellRing, MessageSquare, Send, CheckCircle2, Clock, History,
  ArrowRightCircle, FileText, AlertCircle, Loader2
} from "lucide-react";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

import { CreateTaskDialog } from "./create-task-dialog";
import { CreateStepDialog } from "./create-step-dialog";
import { useState } from "react";
import {
  useTaskComments, useAddComment,
  useTaskSubtasks, useTaskSteps,
  useTaskHistory, useUpdateStatus,
  useUpdateProgress, useUpdateStep
} from "../../hooks/useTasks";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

interface TaskDetailDrawerProps {
  task: HrmTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  const [isCreateSubTaskOpen, setIsCreateSubTaskOpen] = useState(false);
  const [isCreateStepOpen, setIsCreateStepOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [progressValue, setProgressValue] = useState(task.progress ?? 0);
  const [reportText, setReportText] = useState("");

  const taskId = Number(task.id);
  const isCompleted = task.status?.toUpperCase() === "HOÀN THÀNH" || task.status?.toUpperCase() === "COMPLETED";
  const isAssigned = task.status?.toUpperCase() === "MỚI GIAO" || task.status?.toUpperCase() === "ASSIGNED" || task.status?.toUpperCase() === "TODO";

  // ── Queries ──
  const { user } = useUser();
  const { data: commentsData, isLoading: commentsLoading } = useTaskComments(taskId);
  const { data: subtasksData, isLoading: subtasksLoading } = useTaskSubtasks(taskId);
  const { data: stepsData, isLoading: stepsLoading } = useTaskSteps(taskId);
  const { data: historyData, isLoading: historyLoading } = useTaskHistory(taskId);

  const comments: any[] = (commentsData as any)?.data ?? [];
  const subTasks: HrmTask[] = (subtasksData as any)?.data ?? task.subTasks ?? [];
  const steps: any[] = (stepsData as any)?.data ?? task.steps ?? [];
  const history: any[] = (historyData as any)?.data ?? [];

  // ── Mutations ──
  const addComment = useAddComment(taskId);
  const updateStatus = useUpdateStatus(taskId);
  const updateProgress = useUpdateProgress(taskId);
  const updateStep = useUpdateStep(taskId);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync(commentText.trim());
      setCommentText("");
    } catch { /* handled in hook */ }
  };

  const handleSaveReport = async () => {
    if (!reportText.trim() && progressValue === task.progress) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }
    try {
      if (progressValue !== task.progress) {
        await updateProgress.mutateAsync(progressValue);
      }
      if (reportText.trim()) {
        await addComment.mutateAsync(`📋 Báo cáo tiến độ: ${reportText.trim()}`);
        setReportText("");
      }
    } catch { /* handled in hooks */ }
  };

  const handleComplete = async () => {
    try {
      await updateStatus.mutateAsync({ status: "COMPLETED" });
      toast.success("Đã hoàn thành công việc");
      onOpenChange(false);
    } catch { /* handled */ }
  };

  const handleAcceptTask = async () => {
    try {
      await updateStatus.mutateAsync({ status: "IN_PROGRESS" });
      toast.success("Đã nhận việc thành công");
      await addComment.mutateAsync(`Đã tiếp nhận công việc và bắt đầu xử lý.`);
    } catch { /* handled */ }
  };

  const handleRejectTask = async () => {
    const reason = window.prompt("Nhập lý do từ chối nhận việc:");
    if (!reason) return;
    try {
      await updateStatus.mutateAsync({ status: "REJECTED" });
      await addComment.mutateAsync(`Từ chối nhận việc. Lý do: ${reason}`);
      toast.success("Đã từ chối công việc");
      onOpenChange(false);
    } catch { /* handled */ }
  };

  const handleRequestCoordination = async () => {
    const reason = window.prompt("Nhập lý do / nội dung xin phối hợp:");
    if (!reason) return;
    try {
      await addComment.mutateAsync(`Yêu cầu bổ sung người phối hợp: ${reason}`);
      toast.success("Đã gửi yêu cầu phối hợp");
    } catch { /* handled */ }
  };

  const handleToggleStep = async (step: any) => {
    const newStatus = step.status === "COMPLETED" ? "TODO" : "COMPLETED";
    await updateStep.mutateAsync({ stepId: Number(step.id), payload: { status: newStatus } });
  };

  // ── Timeline Builder ──
  const buildTimeline = () => {
    if (history.length > 0) {
      return history.map((h: any) => ({
        id: h.id,
        title: h.action || h.description || "Thao tác",
        time: h.createdAt,
        icon: History,
        iconColor: "text-slate-500",
        content: h.note || h.detail || "",
      }));
    }
    // Fallback timeline từ status task
    const timeline: any[] = [];
    timeline.push({ id: "t1", title: `Giao việc cho ${task.assignee?.fullName ?? "người xử lý"}`, time: task.createdAt, icon: Clock, iconColor: "text-blue-500", content: `Nội dung: ${task.description}` });
    if (task.status?.toUpperCase() !== "NHÁP" && task.status?.toUpperCase() !== "MỚI GIAO") {
      timeline.push({ id: "t2", title: "Bắt đầu xử lý", time: task.startDate, icon: ArrowRightCircle, iconColor: "text-orange-500", content: "Đã tiếp nhận và đang xử lý." });
    }
    if (task.status?.toUpperCase() === "CHỜ DUYỆT" || task.status?.toUpperCase() === "HOÀN THÀNH") {
      timeline.push({ id: "t3", title: "Báo cáo kết quả", time: task.updatedAt, icon: FileText, iconColor: "text-slate-600", content: "Đã báo cáo tiến độ và gửi yêu cầu phê duyệt." });
    }
    const isOverdue = new Date(task.dueDate) < (task.completedAt ? new Date(task.completedAt) : new Date());
    if (isOverdue && task.status?.toUpperCase() !== "HOÀN THÀNH") {
      timeline.push({ id: "t4", title: "Quá hạn", time: task.dueDate, icon: AlertCircle, iconColor: "text-red-500", content: "Công việc đã vượt quá thời hạn quy định." });
    }
    if (task.status?.toUpperCase() === "HOÀN THÀNH") {
      timeline.push({ id: "t5", title: "Hoàn thành", time: task.completedAt || task.updatedAt, icon: CheckCircle2, iconColor: "text-green-500", content: "Đã hoàn thành toàn bộ công việc." });
    }
    return timeline.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const timelineEvents = buildTimeline();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="p-6 bg-white border-b">
          <SheetHeader>
            <div className="flex justify-between items-start gap-4">
              <div>
                {task.parentId && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center w-fit cursor-pointer hover:bg-blue-100 transition-colors">
                      <ArrowRightCircle className="w-3 h-3 mr-1 inline" />
                      Thuộc nhiệm vụ: {task.parentId}
                    </span>
                  </div>
                )}
                <SheetTitle className="text-xl font-bold">{task.title}</SheetTitle>
                <SheetDescription className="mt-2 text-slate-600">
                  {task.description}
                </SheetDescription>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge variant={isCompleted ? "default" : "secondary"} className={isCompleted ? "bg-green-500" : ""}>
                  {task.status}
                </Badge>
                {!isCompleted && (
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-700">
                    <BellRing className="w-3 h-3 mr-1" />
                    Đôn đốc
                  </Button>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Người giao</p>
              <p className="font-medium">{task.assignerName || task.assigner?.fullName || "Chưa xác định"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Đơn vị / Người xử lý</p>
              <p className="font-medium">
                {task.assigneeName || task.assigneeDepartment?.name || task.assignee?.fullName || "Chưa phân công"}
              </p>
            </div>
            {task.coassigneeNames && task.coassigneeNames.length > 0 && (
              <div className="col-span-2">
                <p className="text-slate-500 mb-1">Người phối hợp xử lý</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {task.coassigneeNames.map((name, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-slate-500 mb-1">Thời hạn</p>
              <p className={`font-medium ${new Date(task.dueDate) < new Date() && !isCompleted ? "text-red-500" : ""}`}>
                {safeFormatDate(task.dueDate, "dd/MM/yyyy HH:mm")}
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

              {/* Box tiếp nhận công việc */}
              {isAssigned && (
                <div className="space-y-4 bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="font-medium text-amber-900 flex items-center">
                    <BellRing className="w-4 h-4 mr-2" />
                    Xác nhận tiếp nhận công việc
                  </h3>
                  <p className="text-sm text-amber-700">
                    Công việc này vừa được giao. Vui lòng xác nhận tiếp nhận để có thể bắt đầu xử lý (phân rã công việc, cập nhật tiến độ, v.v.), hoặc từ chối nếu không đúng thẩm quyền.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={handleAcceptTask} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Nhận việc
                    </Button>
                    <Button onClick={handleRejectTask} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      Từ chối
                    </Button>
                    <Button onClick={handleRequestCoordination} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                      Xin phối hợp
                    </Button>
                  </div>
                </div>
              )}

              {/* Chỉ cho phép thực hiện các nghiệp vụ khi đã nhận việc (không còn là ASSIGNED) */}
              {!isAssigned && (
                <>
                  {/* Nhiệm vụ con */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sm">Nhiệm vụ con (Phân rã công việc)</h3>
                  {task.allowedActions?.includes('CREATE_SUBTASK') && !isCompleted && (
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
                          {subTask.status?.toUpperCase() === "HOÀN THÀNH" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : subTask.status?.toUpperCase() === "ĐANG XỬ LÝ" ? (
                            <Clock className="w-5 h-5 text-blue-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                          <div>
                            <p className={`text-sm ${subTask.status?.toUpperCase() === "HOÀN THÀNH" ? "line-through text-slate-500" : "font-medium"}`}>
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
                              {subTask.status?.toUpperCase() !== "HOÀN THÀNH" && subTask.progress !== undefined && (
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
                  {task.allowedActions?.includes('CREATE_STEP') && !isCompleted && (
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
                            {step.status?.toUpperCase() === "HOÀN THÀNH" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-400 transition-colors" />
                            )}
                          </button>
                          <div className="flex flex-col">
                            <p className={`text-sm ${step.status?.toUpperCase() === "HOÀN THÀNH" || step.status?.toUpperCase() === "COMPLETED" ? "line-through text-slate-500" : "font-medium"}`}>
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
                  <h3 className="font-medium text-sm">Cập nhật tiến độ</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tiến độ hiện tại</span>
                      <span className="font-semibold text-blue-600">{progressValue}%</span>
                    </div>
                    <Slider
                      value={[progressValue]}
                      onValueChange={([v]) => setProgressValue(v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
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
                </>
              )}
            </TabsContent>

            {/* ── Tab Trao đổi ── */}
            <TabsContent value="discussion" className="mt-0 h-full flex flex-col">
              <div className="flex-1 space-y-4 mb-4">
                {commentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-slate-500 italic py-8">
                    Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                  </div>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id || comment.createdAt} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                        {(comment.authorName || comment.user?.fullName || "U")?.[0]?.toUpperCase()}
                      </div>
                      <div className={`flex-1 p-3 rounded-lg rounded-tl-none ${comment.isOptimistic ? "opacity-60 bg-slate-100" : "bg-slate-100"}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{comment.authorName || comment.user?.fullName || "Người dùng"}</span>
                          <span className="text-xs text-slate-500">
                            {safeFormatDate(comment.createdAt, "dd/MM HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto flex gap-2">
                {task.allowedActions?.includes('CHAT') ? (
                  <>
                    <Textarea 
                      placeholder="Nhập nội dung trao đổi..." 
                      className="min-h-[40px] h-[40px] resize-none"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                    />
                    <Button 
                      size="icon" 
                      className="shrink-0"
                      onClick={handleSendComment}
                      disabled={addComment.isPending || !commentText.trim()}
                    >
                      {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </>
                ) : (
                  <div className="w-full text-center text-slate-400 text-sm py-2 italic border border-dashed rounded-md bg-slate-50">
                    Bạn không có quyền tham gia thảo luận ở bước này.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Tab Lịch sử ── */}
            <TabsContent value="history" className="mt-0">
              {historyLoading ? (
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 pb-4 ml-2 mt-4">
                  {timelineEvents.map((event, index) => {
                    const Icon = event.icon;
                    return (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-[33px] bg-white p-1">
                          <Icon className={`w-4 h-4 ${event.iconColor}`} />
                        </div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{safeFormatDate(event.time, "dd/MM/yyyy HH:mm")}</p>
                        {event.content && (
                          <p className={`text-sm mt-2 p-3 rounded-md border ${index === 0 ? 'bg-slate-50 text-slate-600' : 'bg-white'}`}>
                            {event.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Tab KPI ── */}
            <TabsContent value="kpi" className="mt-0 h-full">
              {task.kpi ? (
                <div className="space-y-4 mt-4 bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-sm">Kết quả đánh giá KPI</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Xếp loại chất lượng</p>
                      <Badge variant="default" className="bg-green-500">{task.kpi.qualityGrade}</Badge>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Tổng điểm</p>
                      <p className="font-bold text-lg">{task.kpi.totalScore} / 100</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Điểm tiến độ</p>
                      <p className="font-medium">{task.kpi.timelinessScore}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Điểm chất lượng</p>
                      <p className="font-medium">{task.kpi.qualityScore}</p>
                    </div>
                    {task.kpi.note && (
                      <div className="col-span-2">
                        <p className="text-slate-500 mb-1">Ghi chú</p>
                        <p className="text-sm italic bg-slate-50 p-2 rounded">{task.kpi.note}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Đánh giá lúc: {safeFormatDate(task.kpi.evaluatedAt, "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-8 text-center">
                  Công việc chưa được đánh giá KPI.
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>

      {/* Dialogs */}
      <CreateTaskDialog 
        open={isCreateSubTaskOpen} 
        onOpenChange={setIsCreateSubTaskOpen} 
        parentId={task.id}
      />
      <CreateStepDialog 
        open={isCreateStepOpen} 
        onOpenChange={setIsCreateStepOpen} 
        task={task}
      />
    </Sheet>
  );
}
