/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HrmTask } from "../../types/task";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, Clock, ChevronRight, ChevronDown, Repeat, Briefcase, AlertTriangle, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTasksList } from "../../hooks/useTasks";
import { useHrmPermissions } from "../../hooks/useHrmPermissions";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};


import { translateTaskStatus, getTaskStatusColor } from "./task-utils";

// ── Badge helpers ──────────────────────────────────────────────────────────────

const getStatusBadge = (status: string, label?: string) => {
  return (
    <Badge variant="outline" className={getTaskStatusColor(status)}>
      {label || translateTaskStatus(status)}
    </Badge>
  );
};

const getPriorityBadge = (priority: string, label?: string) => {
  const displayLabel = label || priority;
  const p = priority?.toUpperCase();
  switch (p) {
    case "CAO":
    case "HIGH":
      return <Badge variant="destructive">{displayLabel || "Cao"}</Badge>;
    case "THƯỜNG":
    case "NORMAL":
    case "MEDIUM":
      return <Badge variant="outline" className="text-blue-600">{displayLabel || "Thường"}</Badge>;
    case "THẤP":
    case "LOW":
      return <Badge variant="outline" className="text-slate-500">{displayLabel || "Thấp"}</Badge>;
    case "KHẨN":
    case "URGENT":
      return <Badge variant="destructive" className="bg-red-700 animate-pulse">{displayLabel || "Khẩn"}</Badge>;
    default:
      return <Badge variant="outline" className="text-slate-500">{displayLabel}</Badge>;
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
  const { canCreateTask, canEvaluateTask } = useHrmPermissions();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  
  // Use debounced search to avoid spamming the API
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // ── API: danh sách task tóm tắt ──
  const { data, isLoading, isError } = useTasksList({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
  });

  const flatTasks: HrmTask[] = (data as HrmTask[]) ?? [];
  const tasks = React.useMemo(() => buildTaskTree(flatTasks), [flatTasks]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const taskIdParam = searchParams?.get("taskId");

  React.useEffect(() => {
    if (taskIdParam) {
      router.push(`/services/hrm/work-plans/tasks/${taskIdParam}`);
    }
  }, [taskIdParam, router]);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const visibleTasks = React.useMemo(() => {
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
            <SelectTrigger className="w-[160px] min-w-0 [&>span]:truncate" title="Lọc theo trạng thái công việc">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ASSIGNED">Mới giao</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="REVIEWING">Chờ đánh giá</SelectItem>
              <SelectItem value="PENDING_REVIEW">Chờ duyệt</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canCreateTask && (
          <Link href="/services/hrm/work-plans/tasks/create" scroll={false}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm shrink-0">+ Giao việc mới</Button>
          </Link>
        )}
      </div>

      <div className="flex-1 min-h-0 relative bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full min-w-0">
        <ResponsiveTable
          loading={isLoading}
          data={visibleTasks}
          keyExtractor={(task) => task.id}
          emptyMessage={isError ? "Không thể tải danh sách công việc." : "Không tìm thấy công việc nào"}
          tableClassName="w-full table-fixed"
          columns={[
            {
              header: "Tên công việc",
              className: "w-auto min-w-[280px] whitespace-normal align-top",
              cell: (task: any) => {
                const { depth, isLastChild, ancestorsLast, isExpanded, hasSubTasks } = task._treeInfo;
                return (
                  <div className="flex relative w-full min-w-0" style={{ paddingLeft: `${Math.min(depth, 3) * 1.25}rem` }}>
                    <TreeLines
                      depth={depth}
                      isLastChild={isLastChild}
                      ancestorsLast={ancestorsLast}
                      isExpanded={isExpanded}
                      hasSubTasks={hasSubTasks}
                    />
                    <div className="flex items-start gap-1.5 relative z-10 w-full min-w-0 pl-6">
                      {hasSubTasks && (
                        <div className="flex items-center justify-center w-5 h-5 shrink-0 bg-white absolute -left-[2px] top-1">
                          <Button
                            variant="ghost"
                            onClick={() => toggleExpand(task.id)}
                            className="w-5 h-5 p-0 flex items-center justify-center rounded-sm hover:bg-slate-200 transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-col py-0.5 min-w-0 w-full">
                        <Link
                          href={`/services/hrm/work-plans/tasks/${task.id}`}
                          scroll={false}
                          title={task.title}
                          className={`whitespace-normal break-words wrap-break-word line-clamp-2 sm:line-clamp-3 text-sm leading-snug hover:text-blue-600 transition-colors ${
                            depth > 0 ? "text-slate-700 font-medium" : "font-semibold text-slate-900"
                          }`}
                        >
                          {task.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 min-w-0">
                          {task.metadata?.taskType === "REGULAR" && (
                            <Badge variant="outline" className="flex items-center px-1.5 py-0 bg-amber-50 text-amber-700 font-normal text-[10px] border-amber-200 shrink-0">
                              <Briefcase className="w-3 h-3 mr-1" /> Thường xuyên
                            </Badge>
                          )}
                          {task.metadata?.taskType === "PERIODIC" && (
                            <Badge variant="outline" className="flex items-center px-1.5 py-0 bg-emerald-50 text-emerald-700 font-normal text-[10px] border-emerald-200 shrink-0">
                              <Repeat className="w-3 h-3 mr-1" /> Định kỳ
                            </Badge>
                          )}
                          {task.sourceDocumentRef && depth === 0 && (
                            <Badge variant="secondary" className="flex items-center px-1.5 py-0 bg-blue-50 hover:bg-blue-100 text-blue-600 font-normal text-[11px] border border-blue-100 shrink-0 max-w-[200px] truncate" title={`Văn bản: ${task.sourceDocumentRef}`}>
                              <Clock className="w-3 h-3 mr-1 shrink-0" />
                              <span className="truncate">VB: {task.sourceDocumentRef}</span>
                            </Badge>
                          )}
                          {task.isOverdueWarned && (
                            <Badge variant="outline" className="flex items-center px-1.5 py-0 bg-red-100 text-red-800 font-bold text-[10px] border-red-300 shrink-0">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Đã trễ hạn
                            </Badge>
                          )}
                          {task.isDeadlineWarned && !task.isOverdueWarned && (
                            <Badge variant="outline" className="flex items-center px-1.5 py-0 bg-red-50 text-red-700 font-normal text-[10px] border-red-200 shrink-0">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Sắp tới hạn
                            </Badge>
                          )}
                          {task.isRiskWarned && (
                            <Badge variant="outline" className="flex items-center px-1.5 py-0 bg-orange-50 text-orange-700 font-normal text-[10px] border-orange-200 shrink-0">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Chậm tiến độ
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
              className: "w-[125px] whitespace-nowrap text-center align-top",
              cell: (task: any) => (
                <div className="flex justify-center">
                  {getStatusBadge(task.status, task.statusLabel)}
                </div>
              )
            },
            {
              header: "Mức độ",
              className: "w-[85px] whitespace-nowrap text-center align-top",
              cell: (task: any) => (
                <div className="flex justify-center">
                  {getPriorityBadge(task.priority, task.priorityLabel)}
                </div>
              )
            },
            {
              header: "Người xử lý",
              className: "w-[150px] whitespace-normal align-top",
              cell: (task: any) => (
                <div className="flex flex-col min-w-0">
                  <Text as="span" variant="small" weight="medium" className="whitespace-normal break-words wrap-break-word text-slate-800 text-xs leading-tight">
                    {task.assigneeName || task.assigneeDepartment?.name || task.assignee?.fullName || "Chưa phân công"}
                  </Text>
                  {task.coassigneeNames && task.coassigneeNames.length > 0 && (
                    <Text as="span" className="text-slate-500 mt-1 text-[11px] whitespace-normal break-words wrap-break-word leading-tight">
                      Phối hợp: {task.coassigneeNames.join(", ")}
                    </Text>
                  )}
                </div>
              )
            },
            {
              header: "Thời hạn",
              className: "w-[95px] whitespace-nowrap text-center align-top",
              cell: (task: any) => {
                const isCompleted = task.isCompleted || task.status?.toUpperCase() === "COMPLETED" || task.status?.toUpperCase() === "DONE";
                const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div className={`text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                    {safeFormatDate(task.dueDate, "dd/MM/yyyy")}
                  </div>
                );
              }
            },
            {
              header: "Tiến độ",
              className: "w-[110px] whitespace-nowrap align-top pr-4",
              cell: (task: any) => (
                <div className="flex flex-col gap-1 w-full max-w-[80px]">
                  <Text as="span" className="text-[11px] font-semibold text-slate-700 leading-none">{task.progress}%</Text>
                  <Progress value={task.progress} className="h-1.5" />
                </div>
              )
            },
            {
              header: "Thao tác",
              className: "w-[210px] whitespace-nowrap text-right align-top pl-4 pr-3",
              cell: (task: any) => {
                const isReviewableStatus =
                  task.status === "REVIEWING" ||
                  task.status === "PENDING_REVIEW" ||
                  task.status === "COMPLETED" ||
                  task.status === "DONE";
                const showEvaluateBtn = isReviewableStatus && canEvaluateTask(task);

                return (
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    {showEvaluateBtn && (
                      <Link href={`/services/hrm/work-plans/tasks/${task.id}/evaluate`} scroll={false}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-indigo-600 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 font-medium shadow-2xs shrink-0"
                          title="Mở màn hình Thẩm định & Đánh giá công việc"
                        >
                          <Award className="w-3.5 h-3.5 mr-1 text-indigo-600 shrink-0" />
                          Đánh giá
                        </Button>
                      </Link>
                    )}
                    <Link href={`/services/hrm/work-plans/tasks/${task.id}`} scroll={false}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-slate-700 hover:text-slate-900 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 shrink-0" />
                        Chi tiết
                      </Button>
                    </Link>
                  </div>
                );
              }
            }
          ]}
        />
        <div className="bg-slate-50 text-slate-600 p-4 border-t border-slate-200 flex justify-end">
          <div className="font-medium pr-6">
            Tổng số: {tasks.length} công việc
          </div>
        </div>
      </div>
    </div>
  );
}
