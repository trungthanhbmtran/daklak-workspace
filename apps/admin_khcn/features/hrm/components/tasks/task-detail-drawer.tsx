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
import { BellRing, MessageSquare, Send, CheckCircle2, Clock, History, ArrowRightCircle, FileText, AlertCircle } from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import { CreateStepDialog } from "./create-step-dialog";
import { useState } from "react";

interface TaskDetailDrawerProps {
  task: HrmTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  const [isCreateSubTaskOpen, setIsCreateSubTaskOpen] = useState(false);
  const [isCreateStepOpen, setIsCreateStepOpen] = useState(false);

  const isCompleted = task.status === "COMPLETED";
  const hasKpi = !!task.kpi;

  // Render động timeline dựa vào dữ liệu Task
  const renderTimeline = () => {
    const timeline = [];
    
    // 1. Giao việc
    timeline.push({
      id: "t1",
      title: `Giao việc cho ${task.assignee?.fullName}`,
      time: task.createdAt,
      icon: Clock,
      iconColor: "text-blue-500",
      content: `Nội dung: ${task.description}`,
    });

    // 2. Tiếp nhận xử lý (Nếu status không phải DRAFT/ASSIGNED)
    if (task.status !== "DRAFT" && task.status !== "ASSIGNED") {
      timeline.push({
        id: "t2",
        title: "Bắt đầu xử lý",
        time: task.startDate,
        icon: ArrowRightCircle,
        iconColor: "text-orange-500",
        content: "Chuyên viên đã tiếp nhận và đang xử lý công việc.",
      });
    }

    // 3. Chờ duyệt
    if (task.status === "PENDING_REVIEW" || task.status === "COMPLETED") {
      timeline.push({
        id: "t3",
        title: "Báo cáo kết quả",
        time: task.updatedAt,
        icon: FileText,
        iconColor: "text-slate-600",
        content: "Đã báo cáo tiến độ và gửi yêu cầu phê duyệt.",
      });
    }

    // 4. Trễ hạn
    const isOverdue = new Date(task.dueDate) < (task.completedAt ? new Date(task.completedAt) : new Date());
    if (isOverdue && task.status !== "COMPLETED") {
        timeline.push({
            id: "t_overdue",
            title: "Cảnh báo quá hạn",
            time: task.dueDate,
            icon: AlertCircle,
            iconColor: "text-red-500",
            content: "Công việc đã vượt quá thời hạn quy định.",
        });
    }

    // 5. Hoàn thành
    if (task.status === "COMPLETED") {
      timeline.push({
        id: "t4",
        title: "Hoàn thành công việc",
        time: task.completedAt || task.updatedAt,
        icon: CheckCircle2,
        iconColor: "text-green-500",
        content: "Trưởng phòng/Lãnh đạo đã duyệt hoàn thành.",
      });
    }

    // 6. Đánh giá KPI
    if (task.kpi) {
      timeline.push({
        id: "t5",
        title: "Đã đánh giá KPI",
        time: task.kpi.evaluatedAt,
        icon: History,
        iconColor: "text-purple-500",
        content: `Xếp loại: ${task.kpi.qualityGrade} (${task.kpi.totalScore} điểm)`,
      });
    }

    // Sắp xếp theo thời gian (cũ nhất ở trên)
    return timeline.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const timelineEvents = renderTimeline();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full bg-slate-50">
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
              <p className="font-medium">{task.assigner?.fullName || "Chưa xác định"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Đơn vị / Người xử lý</p>
              <p className="font-medium">
                {task.assigneeDepartment ? `🏢 ${task.assigneeDepartment.name}` : task.assignee?.fullName || "Chưa xác định"}
              </p>
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
          <div className="px-6 py-4 bg-white border-b">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="processing">Xử lý & Cập nhật</TabsTrigger>
              <TabsTrigger value="kpi">Đánh giá KPI</TabsTrigger>
              <TabsTrigger value="discussion">Trao đổi</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="processing" className="mt-0 space-y-6">
              
              {/* Danh sách các giai đoạn / bước thực hiện (Phân rã công việc) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">
                    Nhiệm vụ con (Phân rã công việc)
                  </h3>
                  {!isCompleted && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsCreateSubTaskOpen(true)}>
                      + Tạo nhiệm vụ con
                    </Button>
                  )}
                </div>
                
                {task.subTasks && task.subTasks.length > 0 ? (
                  <div className="border rounded-md divide-y bg-white">
                    {task.subTasks.map(subTask => (
                      <div key={subTask.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          {subTask.status === "COMPLETED" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : subTask.status === "IN_PROGRESS" ? (
                            <Clock className="w-5 h-5 text-blue-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                          <div>
                            <p className={`text-sm ${subTask.status === "COMPLETED" ? "line-through text-slate-500" : "font-medium"}`}>
                              {subTask.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {subTask.dueDate && (
                                <p className="text-xs text-slate-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Hạn: {format(new Date(subTask.dueDate), "dd/MM/yyyy")}
                                </p>
                              )}
                              {(subTask.assignee || subTask.assigneeDepartment) && (
                                <p className="text-xs text-blue-600 flex items-center bg-blue-50 px-2 py-0.5 rounded-full">
                                  {subTask.assigneeDepartment ? "🏢 " + subTask.assigneeDepartment.name : "👤 " + subTask.assignee?.fullName}
                                </p>
                              )}
                              {subTask.status !== "COMPLETED" && subTask.progress !== undefined && (
                                <p className="text-xs text-orange-600 flex items-center bg-orange-50 px-2 py-0.5 rounded-full">
                                  Tiến độ: {subTask.progress}%
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {subTask.status !== "COMPLETED" && !isCompleted && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs">Cập nhật</Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-md text-center bg-slate-50">
                    Chuyên viên chưa xây dựng kế hoạch thực hiện chi tiết.
                  </div>
                )}
              </div>

              {/* Danh sách các bước thực hiện nội bộ (Checklist) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">
                    Các bước thực hiện (Checklist nội bộ)
                  </h3>
                  {!isCompleted && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsCreateStepOpen(true)}>
                      + Thêm bước
                    </Button>
                  )}
                </div>
                
                {task.steps && task.steps.length > 0 ? (
                  <div className="border rounded-md divide-y bg-white">
                    {task.steps.map(step => (
                      <div key={step.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          {step.status === "COMPLETED" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                          <p className={`text-sm ${step.status === "COMPLETED" ? "line-through text-slate-500" : "font-medium"}`}>
                            {step.title}
                          </p>
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

            <TabsContent value="discussion" className="mt-0 h-full flex flex-col">
              <div className="flex-1 space-y-4 mb-4">
                {/* Mock comments */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                    {task.assigner?.firstname?.[0] || 'A'}
                  </div>
                  <div className="flex-1 bg-slate-100 p-3 rounded-lg rounded-tl-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{task.assigner?.fullName}</span>
                      <span className="text-xs text-slate-500">{format(new Date(task.createdAt), "dd/MM HH:mm")}</span>
                    </div>
                    <p className="text-sm">Vui lòng rà soát kỹ các phụ lục đính kèm của hồ sơ này nhé.</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                    {task.assignee?.firstname?.[0] || 'B'}
                  </div>
                  <div className="flex-1 bg-blue-50 p-3 rounded-lg rounded-tr-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{task.assignee?.fullName}</span>
                      <span className="text-xs text-slate-500">Hôm qua, 14:30</span>
                    </div>
                    <p className="text-sm">Vâng, em đã kiểm tra xong phần phụ lục. Đang làm báo cáo thẩm định ạ.</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <Textarea placeholder="Nhập nội dung trao đổi..." className="min-h-[40px] h-[40px] resize-none" />
                <Button size="icon" className="shrink-0"><Send className="w-4 h-4" /></Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 pb-4 ml-2 mt-4">
                {timelineEvents.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[33px] bg-white p-1">
                        <Icon className={`w-4 h-4 ${event.iconColor}`} />
                      </div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{format(new Date(event.time), "dd/MM/yyyy HH:mm")}</p>
                      {event.content && (
                        <p className={`text-sm mt-2 p-3 rounded-md border ${index === 0 ? 'bg-slate-50 text-slate-600' : 'bg-white'}`}>
                          {event.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
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
        taskId={task.id}
      />
    </Sheet>
  );
}
