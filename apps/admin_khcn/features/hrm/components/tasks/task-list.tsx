"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HrmTask } from "../../types/task";
import { format } from "date-fns";
import { Eye, Clock, ChevronRight, ChevronDown, AlertCircle } from "lucide-react";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { CreateTaskDialog } from "./create-task-dialog";
import { Progress } from "@/components/ui/progress";
import { useTasksList } from "../../hooks/useTasks";

// ── Badge helpers ──────────────────────────────────────────────────────────────

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ASSIGNED": return <Badge variant="outline" className="bg-slate-100">Mới giao</Badge>;
    case "IN_PROGRESS": return <Badge variant="default" className="bg-blue-500">Đang xử lý</Badge>;
    case "PENDING_REVIEW": return <Badge variant="default" className="bg-orange-500">Chờ duyệt</Badge>;
    case "COMPLETED": return <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>;
    case "OVERDUE": return <Badge variant="destructive">Quá hạn</Badge>;
    case "REJECTED": return <Badge variant="destructive" className="bg-red-700">Bị từ chối</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "HIGH": return <Badge variant="destructive">Cao</Badge>;
    case "NORMAL": return <Badge variant="outline" className="text-blue-600">Thường</Badge>;
    case "LOW": return <Badge variant="outline" className="text-slate-500">Thấp</Badge>;
    case "URGENT": return <Badge variant="destructive" className="bg-red-700 animate-pulse">Khẩn</Badge>;
    default: return null;
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

// ── Build tree from flat list ──────────────────────────────────────────────────

function buildTaskTree(flatTasks: HrmTask[]): HrmTask[] {
  const map = new Map<string, HrmTask>();
  const roots: HrmTask[] = [];

  // Khởi tạo map với subTasks rỗng
  for (const task of flatTasks) {
    map.set(task.id, { ...task, subTasks: [] });
  }

  // Gắn con vào cha
  for (const task of flatTasks) {
    const node = map.get(task.id)!;
    if (task.parentId && map.has(task.parentId)) {
      map.get(task.parentId)!.subTasks!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
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

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const renderTaskRow = (task: HrmTask, depth: number, isLastChild: boolean = false, ancestorsLast: boolean[] = []) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
    const hasSubTasks = task.subTasks && task.subTasks.length > 0;
    const isExpanded = expandedTasks[task.id];

    return (
      <React.Fragment key={task.id}>
        <TableRow className={`hover:bg-slate-50/80 transition-colors ${depth > 0 ? "bg-slate-50/40" : ""}`}>
          <TableCell className="font-medium relative" style={{ paddingLeft: `${depth * 2 + 1}rem` }}>
            
            <TreeLines 
              depth={depth}
              isLastChild={isLastChild}
              ancestorsLast={ancestorsLast}
              isExpanded={!!isExpanded}
              hasSubTasks={!!hasSubTasks}
            />

            <div className="flex items-center gap-1.5 relative z-10">
              {hasSubTasks && (
                <div className="flex items-center justify-center w-5 h-5 shrink-0 bg-white">
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
                <span className={`line-clamp-2 ${depth > 0 ? "text-slate-700" : "font-semibold"}`}>{task.title}</span>
                {task.sourceDocumentRef && depth === 0 && (
                  <Badge variant="secondary" className="mt-0.5 flex items-center w-fit px-1.5 py-0 bg-blue-50 hover:bg-blue-100 text-blue-600 font-normal text-[11px] border border-blue-100">
                    <Clock className="w-3 h-3 mr-1" />
                    VB: {task.sourceDocumentRef}
                  </Badge>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>{getStatusBadge(task.status)}</TableCell>
          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
          <TableCell>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {task.assigneeDepartment ? `🏢 ${task.assigneeDepartment.name}` : task.assignee?.fullName || "Chưa xác định"}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div className={`text-sm ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
              {format(new Date(task.dueDate), "dd/MM/yyyy")}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1 w-24">
              <span className="text-[10px] font-semibold text-slate-600 leading-none">{task.progress}%</span>
              <Progress value={task.progress} className="h-1.5" />
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)} className="h-8 px-2 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Chi tiết
            </Button>
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

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-[400px] pl-6 font-semibold">Tên công việc</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Mức độ</TableHead>
              <TableHead className="font-semibold">Người xử lý</TableHead>
              <TableHead className="font-semibold">Thời hạn</TableHead>
              <TableHead className="font-semibold">Tiến độ</TableHead>
              <TableHead className="text-right font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TaskListSkeleton />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <span>Không thể tải danh sách công việc.</span>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Thử lại</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  Không tìm thấy công việc nào
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => renderTaskRow(task, 0))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
      
      <CreateTaskDialog 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen} 
      />
    </div>
  );
}
