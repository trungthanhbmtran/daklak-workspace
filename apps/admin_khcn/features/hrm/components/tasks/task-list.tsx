"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_TASKS } from "./mock-data";
import { HrmTask } from "../../types/task";
import { format } from "date-fns";
import { Eye, Clock, ChevronRight, ChevronDown, CornerDownRight } from "lucide-react";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { CreateTaskDialog } from "./create-task-dialog";
import { Progress } from "@/components/ui/progress";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ASSIGNED": return <Badge variant="outline" className="bg-slate-100">Mới giao</Badge>;
    case "IN_PROGRESS": return <Badge variant="default" className="bg-blue-500">Đang xử lý</Badge>;
    case "PENDING_REVIEW": return <Badge variant="default" className="bg-orange-500">Chờ duyệt</Badge>;
    case "COMPLETED": return <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>;
    case "OVERDUE": return <Badge variant="destructive">Quá hạn</Badge>;
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

export function TaskList() {
  const [tasks, setTasks] = useState<HrmTask[]>(MOCK_TASKS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<HrmTask | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const filteredTasks = tasks.filter(task => {
    const matchStatus = statusFilter === "ALL" || task.status === statusFilter;
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const renderTaskRow = (task: HrmTask, depth: number) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
    const hasSubTasks = task.subTasks && task.subTasks.length > 0;
    const isExpanded = expandedTasks[task.id];

    return (
      <React.Fragment key={task.id}>
        <TableRow className="hover:bg-slate-50 transition-colors">
          <TableCell className="font-medium" style={{ paddingLeft: `${depth * 2 + 1}rem` }}>
            <div className="flex items-start gap-2">
              {hasSubTasks ? (
                <button onClick={() => toggleExpand(task.id)} className="mt-1 text-slate-500 hover:text-slate-800">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                depth > 0 ? <CornerDownRight className="w-4 h-4 mt-1 text-slate-300" /> : <div className="w-4 h-4 mt-1" />
              )}
              <div className="flex flex-col">
                <span className={`line-clamp-2 ${depth > 0 ? "text-slate-700" : ""}`}>{task.title}</span>
                {task.sourceDocumentRef && depth === 0 && (
                  <span className="text-xs text-blue-600 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    VB: {task.sourceDocumentRef}
                  </span>
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
              <span className="text-xs font-semibold text-slate-600">{task.progress}%</span>
              <Progress value={task.progress} className="h-2" />
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>
              <Eye className="w-4 h-4 mr-2" />
              Chi tiết
            </Button>
          </TableCell>
        </TableRow>
        
        {isExpanded && hasSubTasks && (
          task.subTasks!.map(subTask => renderTaskRow(subTask, depth + 1))
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex w-full sm:w-auto gap-4">
          <Input
            placeholder="Tìm kiếm công việc..."
            className="w-full sm:w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ASSIGNED">Mới giao</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="PENDING_REVIEW">Chờ duyệt</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateTaskOpen(true)}>+ Giao việc mới</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[300px]">Tên công việc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Mức độ</TableHead>
              <TableHead>Người xử lý</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  Không tìm thấy công việc nào
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => renderTaskRow(task, 0))
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
