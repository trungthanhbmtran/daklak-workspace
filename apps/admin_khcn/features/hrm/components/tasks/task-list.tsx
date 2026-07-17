"use client";
import React, { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HrmTask } from "../../types/task";
import { format } from "date-fns";
import { Eye, Clock, ChevronRight, ChevronDown, AlertCircle, Repeat, Briefcase, MoreHorizontal, CheckCircle2, Search, Filter, Plus } from "lucide-react";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { CreateTaskDialog } from "./create-task-dialog";
import { Progress } from "@/components/ui/progress";
import { useTasksList, useTaskDetail } from "../../hooks/useTasks";
import { useSearchParams, useRouter } from "next/navigation";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};


// ── Badge helpers ──────────────────────────────────────────────────────────────

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case "MỚI GIAO":
    case "ASSIGNED":
      return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Mới giao</Badge>;
    case "ĐANG XỬ LÝ":
    case "IN_PROGRESS":
      return <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border shadow-none">Đang xử lý</Badge>;
    case "CHỜ DUYỆT":
    case "PENDING_REVIEW":
      return <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 border shadow-none">Chờ duyệt</Badge>;
    case "HOÀN THÀNH":
    case "COMPLETED":
      return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border shadow-none">Hoàn thành</Badge>;
    case "QUÁ HẠN":
    case "OVERDUE":
      return <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 border shadow-none">Quá hạn</Badge>;
    case "BỊ TỪ CHỐI":
    case "REJECTED":
      return <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 border shadow-none">Bị từ chối</Badge>;
    case "NHÁP":
    case "DRAFT":
      return <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 border shadow-none">Nháp</Badge>;
    default:
      return <Badge variant="outline" className="text-slate-600 shadow-none">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case "CAO":
    case "HIGH":
      return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 shadow-none">Cao</Badge>;
    case "THƯỜNG":
    case "NORMAL":
      return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 shadow-none">Thường</Badge>;
    case "THẤP":
    case "LOW":
      return <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 shadow-none">Thấp</Badge>;
    case "KHẨN":
    case "URGENT":
      return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 border animate-pulse shadow-none">Khẩn cấp</Badge>;
    default:
      return <Badge variant="outline" className="text-slate-500 shadow-none">{priority}</Badge>;
  }
};


// ── Tree connector lines component ────────────────────────────────────────────

const TreeLines = ({
  depth,
  isLastChild,
  ancestorsLast,
  isExpanded,
  hasSubTasks
}: {
  depth: number,
  isLastChild: boolean,
  ancestorsLast: boolean[],
  isExpanded: boolean,
  hasSubTasks: boolean
}) => {
  return (
    <>
      {/* Ancestor continuing vertical lines */}
      {ancestorsLast.map((isAncestorLast, i) => {
        if (i === 0) return null;
        if (isAncestorLast) return null;
        return (
          <div
            key={`ancestor-line-${i}`}
            className="absolute w-px bg-slate-300 pointer-events-none"
            style={{ left: `${26 + i * 32}px`, top: '0', bottom: '0' }}
          />
        );
      })}

      {/* Current level L-shape lines */}
      {depth > 0 && (
        <>
          <div
            className="absolute w-px bg-slate-300 pointer-events-none"
            style={{
              left: `${26 + (depth - 1) * 32}px`,
              top: '0',
              bottom: isLastChild ? '50%' : '0'
            }}
          />
          <div
            className="absolute h-px bg-slate-300 pointer-events-none"
            style={{
              left: `${26 + (depth - 1) * 32}px`,
              top: '50%',
              width: '22px'
            }}
          />
        </>
      )}

      {/* Parent expanded line dropping down */}
      {isExpanded && hasSubTasks && (
        <div
          className="absolute w-px bg-slate-300 pointer-events-none"
          style={{
            left: `${26 + depth * 32}px`,
            top: 'calc(50% + 12px)',
            bottom: '0'
          }}
        />
      )}
    </>
  );
};

// ── Loading skeleton ───────────────────────────────────────────────────────────

const TaskListSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-[280px]" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-2 w-20" /></TableCell>
        <TableCell><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
      </TableRow>
    ))}
  </>
);

// ── Map tree from backend ──────────────────────────────────────────────────────────

function buildTaskTree(tasks: HrmTask[]): HrmTask[] {
  if (!tasks || !Array.isArray(tasks)) return [];

  return tasks.map(task => {
    const children = (task as any).children || [];
    return {
      ...task,
      subTasks: children.length > 0 ? buildTaskTree(children) : []
    };
  });
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function TaskList() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<HrmTask | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // ── API: danh sách task ──
  const { data, isLoading, isError, refetch } = useTasksList({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search || undefined,
  });

  const flatTasks: HrmTask[] = (data as any)?.data ?? [];
  const tasks = buildTaskTree(flatTasks);

  const searchParams = useSearchParams();
  const router = useRouter();
  const taskIdParam = searchParams?.get("taskId");
  const { data: detailData } = useTaskDetail(taskIdParam ? Number(taskIdParam) : undefined);

  React.useEffect(() => {
    if (taskIdParam && detailData?.data && !selectedTask) {
      setSelectedTask(detailData.data);
    }
  }, [taskIdParam, detailData, selectedTask]);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const renderTaskRow = (task: HrmTask, depth: number, isLastChild: boolean = false, ancestorsLast: boolean[] = []) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status?.toUpperCase() !== "HOÀN THÀNH" && task.status?.toUpperCase() !== "COMPLETED";
    const hasSubTasks = task.subTasks && task.subTasks.length > 0;
    const isExpanded = expandedTasks[task.id];

    return (
      <React.Fragment key={task.id}>
        <TableRow className={`hover:bg-slate-50/80 transition-colors group ${depth > 0 ? "bg-slate-50/60" : ""}`}>
          <TableCell className="font-medium relative" style={{ paddingLeft: `${depth * 2 + 1}rem` }}>
            <TreeLines
              depth={depth}
              isLastChild={isLastChild}
              ancestorsLast={ancestorsLast}
              isExpanded={!!isExpanded}
              hasSubTasks={!!hasSubTasks}
            />

            <div className="flex items-center gap-2 relative z-10">
              {hasSubTasks ? (
                <div className="flex items-center justify-center w-5 h-5 shrink-0 bg-white">
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpand(task.id)}
                    className="w-5 h-5 p-0 flex items-center justify-center rounded-sm hover:bg-slate-200 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  </Button>
                </div>
              ) : (
                <div className="w-5 h-5 shrink-0" />
              )}

              <div className="flex flex-col py-1.5">
                <span className={`line-clamp-2 ${depth > 0 ? "text-slate-700" : "font-semibold"}`}>
                  {task.title}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {task.metadata?.taskType === "REGULAR" && (
                    <Badge variant="outline" className="flex items-center px-1.5 py-0 bg-amber-50 text-amber-700 font-normal text-[10px] border-amber-200">
                      <Briefcase className="w-3 h-3 mr-1" /> Thường xuyên
                    </Badge>
                  )}
                  {task.metadata?.taskType === "PERIODIC" && (
                    <Badge variant="outline" className="flex items-center px-1.5 py-0 bg-emerald-50 text-emerald-700 font-normal text-[10px] border-emerald-200">
                      <Repeat className="w-3 h-3 mr-1" /> Định kỳ
                    </Badge>
                  )}
                  {task.sourceDocumentRef && depth === 0 && (
                    <Badge variant="secondary" className="flex items-center px-1.5 py-0 bg-blue-50 hover:bg-blue-100 text-blue-600 font-normal text-[11px] border border-blue-100">
                      <Clock className="w-3 h-3 mr-1" />
                      VB: {task.sourceDocumentRef}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>{getStatusBadge(task.status)}</TableCell>
          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
          <TableCell>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {task.assigneeName || task.assigneeDepartment?.name || task.assignee?.fullName || "Chưa phân công"}
              </span>
              {task.coassigneeNames && task.coassigneeNames.length > 0 && (
                <span className="text-xs text-slate-500 mt-0.5">
                  Phối hợp: {task.coassigneeNames.join(", ")}
                </span>
              )}
            </div>
          </TableCell>
          <TableCell>
            <div className={`text-sm ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
              {safeFormatDate(task.dueDate, "dd/MM/yyyy")}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2 w-28">
              <Progress value={task.progress} className={`h-2 flex-1 ${task.progress === 100 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-blue-500'}`} />
              <span className="text-[11px] font-semibold text-slate-600 min-w-[2rem] text-right">{task.progress ?? 0}%</span>
            </div>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setSelectedTask(task)} className="cursor-pointer">
                  <Eye className="w-4 h-4 mr-2 text-blue-600" />
                  Xem chi tiết
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>

        {isExpanded && hasSubTasks && (
          task.subTasks!.map((subTask, index) =>
            renderTaskRow(
              subTask,
              depth + 1,
              index === task.subTasks!.length - 1,
              [...ancestorsLast, isLastChild]
            )
          )
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200/60">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm công việc..."
              className="w-full pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 transition-shadow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50/50 border-slate-200 transition-shadow">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ASSIGNED">Mới giao</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="PENDING_REVIEW">Chờ duyệt</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateTaskOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-sm transition-all text-white">
          <Plus className="w-4 h-4 mr-1.5" /> Giao việc mới
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        <div className="h-[calc(100vh-280px)] w-full overflow-auto [&_[data-slot=table-container]]:overflow-visible custom-scrollbar">
          <Table className="min-w-[1100px]">
            <TableHeader className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm shadow-[0_1px_0_0_#e2e8f0]">
              <TableRow className="bg-transparent hover:bg-transparent">
                <TableHead className="w-[400px] pl-6 font-semibold text-slate-700 h-11">Tên công việc</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11">Trạng thái</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11">Mức độ</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11">Người xử lý</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11">Thời hạn</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11">Tiến độ</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 pr-6 h-11">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (isLoading) return <TaskListSkeleton />;

                if (isError) return (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <span>Không thể tải danh sách công việc.</span>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>Thử lại</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );

                if (tasks.length === 0) return (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                      Không tìm thấy công việc nào
                    </TableCell>
                  </TableRow>
                );

                return tasks.map((task) => renderTaskRow(task, 0));
              })()}
            </TableBody>
            <TableFooter className="sticky bottom-0 z-20 bg-slate-50 text-slate-600 shadow-[0_-1px_0_0_#e2e8f0]">
              <TableRow className="hover:bg-slate-50">
                <TableCell colSpan={7} className="font-medium text-right pr-6">
                  Tổng số: {tasks.length} công việc
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {
        selectedTask && (
          <TaskDetailDrawer
            open={!!selectedTask}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedTask(null);
                if (taskIdParam) {
                  router.replace("/services/hrm/work-plans/tasks");
                }
              }
            }}
            task={selectedTask as HrmTask}
          />
        )
      }

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />
    </div >
  );
}
