/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ArrowRightCircle, Repeat, Briefcase, Calendar, Award, Edit3
} from "lucide-react";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

import { useTaskDetail, useRespondTask } from "../../hooks/useTasks";
import { toast } from "sonner";
import { TaskProcessingTab } from "./task-detail-processing-tab";
import { TaskDiscussionTab } from "./task-detail-discussion-tab";
import { TaskHistoryTab } from "./task-detail-history-tab";
import { TaskEvaluationApprovalSheet } from "./TaskEvaluationApprovalSheet";
import { EditTaskDialog } from "./edit-task-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { TaskAssignDialog } from "./task-assign-dialog";
import { TaskRespondDialog } from "./task-respond-dialog";
import { TaskExtendDialog } from "./task-extend-dialog";
import { translateTaskStatus, getTaskStatusColor } from "./task-utils";

interface TaskDetailDrawerProps {
  taskId?: number | null;
  task?: HrmTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDrawer({ taskId, task, open, onOpenChange }: TaskDetailDrawerProps) {
  const activeTaskId = taskId ? Number(taskId) : (task ? Number(task.id) : null);
  const { user } = useUser();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("processing");
  const [respondAction, setRespondAction] = useState<"REJECT" | "REQUEST_COORDINATION" | null>(null);

  // ── Queries: Tách riêng endpoint chi tiết, chỉ load khi drawer mở ──
  const { data: detailData, isLoading: isLoadingDetail } = useTaskDetail(activeTaskId ? activeTaskId : undefined, {
    enabled: open && Boolean(activeTaskId),
  });
  const currentTask = (detailData as any)?.data ?? task;
  const isCompleted = currentTask?.status?.toUpperCase() === "COMPLETED" || currentTask?.status?.toUpperCase() === "DONE";
  const isAssigned = currentTask?.allowedActions?.includes('RECEIVE') || currentTask?.allowedActions?.includes('ACCEPT');
  const isAssigner = user?.employeeCode === currentTask?.creatorEmployeeCode || user?.employeeCode === currentTask?.assignerCode;
  const canReassign = currentTask?.allowedActions?.includes('ASSIGN') || currentTask?.allowedActions?.includes('REASSIGN');

  // ── Mutations ──
  const respondTask = useRespondTask(activeTaskId || undefined);

  const handleAcceptTask = async () => {
    try {
      await respondTask.mutateAsync({ action: "ACCEPT" });
      toast.success("Đã nhận việc thành công");
    } catch { /* handled */ }
  };

  const handleRejectTask = () => setRespondAction("REJECT");
  const handleRequestCoordination = () => setRespondAction("REQUEST_COORDINATION");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full bg-slate-50">
        {isLoadingDetail && !currentTask ? (
          <div className="p-6 space-y-6 bg-white h-full">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
            <div className="pt-6 space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : !currentTask ? (
          <div className="p-12 text-center text-slate-500">
            Không tìm thấy thông tin công việc
          </div>
        ) : (
          <>
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
                      {currentTask.statusLabel || translateTaskStatus(currentTask.status || "")}
                    </Badge>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {!isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditOpen(true)}
                          className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 font-medium shadow-2xs text-xs"
                          title="Chỉnh sửa nội dung chi tiết công việc"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                          Chỉnh sửa
                        </Button>
                      )}
                      {canReassign && !isCompleted && (
                        <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(true)} className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 text-xs">
                          <Briefcase className="w-3 h-3" />
                          Giao lại / Phối hợp
                        </Button>
                      )}
                      {isAssigner && !isCompleted && (
                        <Button variant="outline" size="sm" onClick={() => setIsExtendOpen(true)} className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 text-xs">
                          <Calendar className="w-3 h-3" />
                          Gia hạn
                        </Button>
                      )}
                      {!isCompleted && (
                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 text-xs" iconStart={<BellRing className="w-3 h-3" />}>Đôn đốc</Button>
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
              <div className="flex flex-col gap-1">
                {(() => {
                  const assignees = currentTask.participants?.filter((p: any) => p.role === 'ASSIGNEE') || [];
                  if (assignees.length > 0) {
                    return assignees.map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col">
                        <span className="font-medium">{p.fullName}</span>
                        <div className="text-[11px] mt-0.5 flex flex-wrap items-center gap-1">
                          {p.status === 'REJECTED' && <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Đã từ chối</span>}
                          {p.status === 'PENDING_COORDINATION' && <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Xin phối hợp</span>}
                          {p.status === 'PENDING_ACCEPTANCE' && <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Chờ tiếp nhận</span>}
                          {p.status === 'ACCEPTED' && <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Đã tiếp nhận</span>}
                          {p.reason && <span className="text-slate-500 mt-0.5 w-full block">Lý do: {p.reason}</span>}
                        </div>
                      </div>
                    ));
                  }
                  return <span className="font-medium">{currentTask.assigneeName || currentTask.assigneeDepartment?.name || currentTask.assignee?.fullName || "Chưa phân công"}</span>;
                })()}
              </div>
            </div>
            
            {(() => {
              const coordinators = currentTask.participants?.filter((p: any) => p.role === 'COORDINATOR') || [];
              const hasCoordinators = coordinators.length > 0 || (currentTask.coassigneeNames && currentTask.coassigneeNames.length > 0);
              
              if (!hasCoordinators) return null;
              
              return (
                <div className="col-span-2 mt-2">
                  <Text variant="small" className="text-slate-500 mb-1 font-normal">Người phối hợp xử lý</Text>
                  <div className="flex flex-col gap-2 mt-1">
                    {coordinators.length > 0 ? (
                      coordinators.map((p: any, idx: number) => (
                        <div key={idx} className="flex flex-col bg-slate-50 p-2 rounded-md border border-slate-100">
                          <span className="font-medium text-slate-700">{p.fullName}</span>
                          <div className="text-[11px] mt-1 flex flex-wrap items-center gap-1">
                            {p.status === 'REJECTED' && <span className="text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Đã từ chối</span>}
                            {p.status === 'PENDING_COORDINATION' && <span className="text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Xin phối hợp</span>}
                            {p.status === 'PENDING_ACCEPTANCE' && <span className="text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Chờ tiếp nhận</span>}
                            {p.status === 'ACCEPTED' && <span className="text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Đã tiếp nhận</span>}
                            {p.reason && <span className="text-slate-500 mt-0.5 w-full block">Lý do: {p.reason}</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {currentTask.coassigneeNames.map((name: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
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
              <Button onClick={handleAcceptTask} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm" iconStart={<CheckCircle2 className="w-4 h-4" />}>Nhận việc</Button>
              <Button onClick={handleRejectTask} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-white">
                Từ chối
              </Button>
              <Button onClick={handleRequestCoordination} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 bg-white">
                Xin phối hợp
              </Button>
            </div>
          </div>
        )}

        {/* Tabs - Controlled ActiveTab để Lazy Mount nội dung */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="px-6 py-4 bg-white border-b shrink-0">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="processing">Xử lý & Cập nhật</TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="w-3 h-3" />
                Trao đổi
              </TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              <TabsTrigger value="kpi" className="gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Đánh giá & KPI
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden relative">
            {/* ── Tab Xử lý & Cập nhật (Lazy Mount) ── */}
            <TabsContent value="processing" className="m-0 h-full outline-none data-[state=inactive]:hidden">
              {activeTab === "processing" && (
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <TaskProcessingTab
                      taskId={Number(activeTaskId || currentTask.id)}
                      currentTask={currentTask}
                      isCompleted={isCompleted}
                      isAssigned={isAssigned}
                    />
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* ── Tab Trao đổi (Lazy Mount) ── */}
            <TabsContent value="discussion" className="m-0 h-full outline-none data-[state=inactive]:hidden">
              {activeTab === "discussion" && (
                <div className="p-6 h-full flex flex-col min-h-0 overflow-hidden">
                  <TaskDiscussionTab
                    conversationId={currentTask.conversationId}
                    allowedActions={currentTask.allowedActions}
                    participants={currentTask.participants}
                  />
                </div>
              )}
            </TabsContent>

            {/* ── Tab Lịch sử (Lazy Mount) ── */}
            <TabsContent value="history" className="m-0 h-full outline-none data-[state=inactive]:hidden">
              {activeTab === "history" && (
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <TaskHistoryTab
                      taskId={Number(activeTaskId || currentTask.id)}
                      currentTask={currentTask}
                    />
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* ── Tab Đánh giá & KPI (Lazy Mount) ── */}
            <TabsContent value="kpi" className="m-0 h-full outline-none data-[state=inactive]:hidden">
              {activeTab === "kpi" && (
                <ScrollArea className="h-full">
                  <div className="p-6 h-full space-y-4">
                    {currentTask.kpi || currentTask.metadata?.evaluation ? (
                      (() => {
                        const evalData = currentTask.metadata?.evaluation || {};
                        const kpiData = currentTask.kpi || {};
                        const total = evalData.totalScore ?? kpiData.totalScore ?? 0;
                        const rank = evalData.rankGrade ?? kpiData.qualityGrade ?? "HOÀN THÀNH";

                        return (
                          <div className="space-y-4 bg-white p-5 rounded-xl border shadow-xs min-w-0">
                            <div className="flex items-center justify-between border-b pb-3">
                              <Heading level="h4" className="font-bold flex items-center gap-1.5 text-indigo-700">
                                <Award className="w-4 h-4 text-indigo-600" />
                                Kết quả Thẩm định & Đánh giá của Lãnh đạo
                              </Heading>
                              <Badge className="bg-emerald-600 text-white font-bold">
                                {rank}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="p-3 bg-slate-50 rounded-lg border">
                                <Text variant="small" className="text-slate-500 mb-1 font-normal">Tổng điểm nhiệm vụ</Text>
                                <Text variant="large" weight="bold" className="text-2xl text-foreground font-mono">
                                  {total} <span className="text-xs font-normal text-slate-500">/ 100đ</span>
                                </Text>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg border">
                                <Text variant="small" className="text-slate-500 mb-1 font-normal">Thời điểm phê duyệt</Text>
                                <p className="font-semibold text-slate-800">
                                  {safeFormatDate(evalData.evaluatedAt || kpiData.evaluatedAt || currentTask.updatedAt, "dd/MM/yyyy HH:mm")}
                                </p>
                                <span className="text-[11px] text-slate-500">Bởi Lãnh đạo phụ trách</span>
                              </div>

                              <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                                <span className="text-slate-500 block">Khối lượng (A):</span>
                                <strong className="text-blue-700">{evalData.volumePct ?? 100}% (K={evalData.difficultyK ?? 1.0})</strong>
                              </div>
                              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                <span className="text-slate-500 block">Chất lượng (B):</span>
                                <strong className="text-emerald-700">{evalData.qualityScore ?? kpiData.qualityScore ?? 100}đ</strong>
                              </div>
                              <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100">
                                <span className="text-slate-500 block">Tiến độ (C):</span>
                                <strong className="text-purple-700">{evalData.timelinessScore ?? kpiData.timelinessScore ?? 100}đ</strong>
                              </div>
                              <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100">
                                <span className="text-slate-500 block">Trách nhiệm (D):</span>
                                <strong className="text-amber-700">{evalData.attitudeScore ?? 10}/10đ</strong>
                              </div>

                              {(evalData.feedback || kpiData.note) && (
                                <div className="col-span-2 p-3 bg-indigo-50/30 rounded-lg border border-indigo-100">
                                  <Text variant="small" className="text-indigo-900 font-semibold mb-1">
                                    Ý kiến chỉ đạo & Nhận xét của Lãnh đạo:
                                  </Text>
                                  <p className="text-slate-700 italic wrap-break-word leading-relaxed text-xs">
                                    "{evalData.feedback || kpiData.note}"
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEvaluationOpen(true)}
                                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold"
                              >
                                <Award className="w-3.5 h-3.5 mr-1.5" />
                                Cập nhật / Đánh giá lại
                              </Button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-6 bg-white rounded-xl border text-center space-y-4 shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                          <Award className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <Heading level="h4" className="font-bold text-foreground">
                            Công việc chưa được thẩm định & đánh giá
                          </Heading>
                          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                            Luồng sau khi hoàn thành công việc yêu cầu Lãnh đạo / Người phụ trách đối chiếu nguồn dữ liệu hệ thống với báo cáo của chuyên viên để chốt điểm KPI.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setIsEvaluationOpen(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
                        >
                          <Award className="w-4 h-4 mr-1.5" />
                          Mở màn hình Thẩm định & Đánh giá của Lãnh đạo
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </div>
        </Tabs>
        </>
        )}

        {isAssignOpen && activeTaskId && currentTask && (
          <TaskAssignDialog
            open={isAssignOpen}
            onOpenChange={setIsAssignOpen}
            taskId={activeTaskId}
            currentAssigneeCode={currentTask.assigneeCode}
            currentCoordinators={(currentTask.participants?.filter((p: any) => p.role === 'COORDINATOR') || []).map((p: any) => ({
              id: p.employeeCode,
              name: p.fullName || p.employeeName || p.employeeCode
            }))}
          />
        )}
        {respondAction !== null && activeTaskId && (
          <TaskRespondDialog
            open={respondAction !== null}
            onOpenChange={(open) => !open && setRespondAction(null)}
            taskId={activeTaskId}
            action={respondAction}
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
            open={isEvaluationOpen}
            onOpenChange={setIsEvaluationOpen}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
