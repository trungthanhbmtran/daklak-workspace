/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HrmTask } from "../../types/task";
import { format } from "date-fns";
import { Eye, Clock, ChevronRight, ChevronDown, AlertCircle, Repeat, Briefcase } from "lucide-react";
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


import { translateTaskStatus, getTaskStatusColor } from "./task-utils";

// ── Badge helpers ──────────────────────────────────────────────────────────────

const getStatusBadge = (status: string) => {
  return (
    <Badge variant="outline" className={getTaskStatusColor(status)}>
      {translateTaskStatus(status)}
    </Badge>
  );
};

const getPriorityBadge = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case "CAO":
      return <Badge variant="destructive">Cao</Badge>;
    case "THƯỜNG":
      return <Badge variant="outline" className="text-blue-600">Thường</Badge>;
    case "THẤP":
      return <Badge variant="outline" className="text-slate-500">Thấp</Badge>;
    case "KHẨN":
      return <Badge variant="destructive" className="bg-red-700 animate-pulse">Khẩn</Badge>;
    default:
      return <Badge variant="outline" className="text-slate-500">{priority}</Badge>;
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

  const getVisibleTasks = React.useCallback(() => {
    const flatten = (items: HrmTask[], depth = 0, ancestorsLast: boolean[] = []): any[] => {
      let result: any[] = [];
      items.forEach((task, index) => {
        const isLastChild = index === items.length - 1;
        const hasSubTasks = task.subTasks && task.subTasks.length > 0;
        const isExpanded = !!expandedTasks[task.id];

        result.push({
          ...task,
          _treeInfo: { depth, isLastChild, ancestorsLast, hasSubTasks, isExpanded }
        });

        if (isExpanded && hasSubTasks) {
          result = result.concat(flatten(task.subTasks!, depth + 1, [...ancestorsLast, isLastChild]));
        }
      });
      return result;
    };
    return flatten(tasks);
  }, [tasks, expandedTasks]);

  const visibleTasks = getVisibleTasks();

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex w-full sm:w-auto gap-3">
          <Input
            placeholder="Tìm kiếm công việc..."
            className="w-full sm:w-[280px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
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
        <Button onClick={() => setIsCreateTaskOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">+ Giao việc mới</Button>
      </div>

      <div className="flex-1 min-h-0 relative bg-white rounded-lg shadow-sm border border-slate-200">
        <ResponsiveTable
          loading={isLoading}
          data={visibleTasks}
          keyExtractor={(task) => task.id}
          emptyMessage={isError ? "Không thể tải danh sách công việc." : "Không tìm thấy công việc nào"}
          columns={[
            {
              header: "Tên công việc",
              className: "w-[400px]",
              cell: (task: any) => {
                const { depth, isLastChild, ancestorsLast, isExpanded, hasSubTasks } = task._treeInfo;
                return (
                  <div className="flex relative" style={{ paddingLeft: `${depth * 2}rem` }}>
                    <TreeLines
                      depth={depth}
                      isLastChild={isLastChild}
                      ancestorsLast={ancestorsLast}
                      isExpanded={isExpanded}
                      hasSubTasks={hasSubTasks}
                    />
                    <div className="flex items-center gap-1.5 relative z-10 w-full pl-6">
                      {hasSubTasks && (
                        <div className="flex items-center justify-center w-5 h-5 shrink-0 bg-white absolute -left-[2px]">
                          <Button
                            variant="ghost"
                            onClick={() => toggleExpand(task.id)}
                            className="w-5 h-5 p-0 flex items-center justify-center rounded-sm hover:bg-slate-200 transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-col py-1">
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
                  </div>
                );
              }
            },
            {
              header: "Trạng thái",
              cell: (task: any) => getStatusBadge(task.status)
            },
            {
              header: "Mức độ",
              cell: (task: any) => getPriorityBadge(task.priority)
            },
            {
              header: "Người xử lý",
              cell: (task: any) => (
                <div className="flex flex-col">
                  <Text as="span" variant="small" weight="medium">
                    {task.assigneeName || task.assigneeDepartment?.name || task.assignee?.fullName || "Chưa phân công"}
                  </Text>
                  {task.coassigneeNames && task.coassigneeNames.length > 0 && (
                    <Text as="span" className="text-slate-500 mt-0.5">
                      Phối hợp: {task.coassigneeNames.join(", ")}
                    </Text>
                  )}
                </div>
              )
            },
            {
              header: "Thời hạn",
              cell: (task: any) => {
                const isOverdue = new Date(task.dueDate) < new Date() && task.status?.toUpperCase() !== "HOÀN THÀNH";
                return (
                  <div className={`text-sm ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                    {safeFormatDate(task.dueDate, "dd/MM/yyyy")}
                  </div>
                );
              }
            },
            {
              header: "Tiến độ",
              cell: (task: any) => (
                <div className="flex flex-col gap-1 w-24">
                  <Text as="span" className="text-[10px] font-semibold text-slate-600 leading-none">{task.progress}%</Text>
                  <Progress value={task.progress} className="h-1.5" />
                </div>
              )
            },
            {
              header: "Thao tác",
              className: "text-right",
              cell: (task: any) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)} className="h-8 px-2 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Chi tiết
                </Button>
              )
            }
          ]}
        />
        <div className="bg-slate-50 text-slate-600 p-4 border-t border-slate-200 flex justify-end">
          <div className="font-medium pr-6">
            Tổng số: {tasks.length} công việc
          </div>
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
