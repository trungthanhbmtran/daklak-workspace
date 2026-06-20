"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Briefcase,
  GripVertical,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Import hook lấy dữ liệu thật
import { useTasksList } from "@/features/hrm/hooks/useTasks";

// --- Sortable Item Component ---
function SortableWidget({ id, children }: { id: string, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full relative group">
      {/* Explicit Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 z-10"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>
      {children}
    </div>
  );
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'];

// --- Main Dashboard Component ---
export function HrmDashboardClient() {
  const [widgets, setWidgets] = useState([
    { id: 'widget-1', type: 'TOTAL_TASKS', title: 'Tổng số công việc', colSpan: 'col-span-1 md:col-span-1' },
    { id: 'widget-2', type: 'COMPLETED_TASKS', title: 'Công việc hoàn thành', colSpan: 'col-span-1 md:col-span-1' },
    { id: 'widget-3', type: 'APPROACHING_TASKS', title: 'Sắp đến hạn', colSpan: 'col-span-1 md:col-span-1' },
    { id: 'widget-4', type: 'OVERDUE_TASKS', title: 'Công việc quá hạn', colSpan: 'col-span-1 md:col-span-1' },
    { id: 'widget-5', type: 'PROGRESS_BY_UNIT', title: 'Tiến độ theo đơn vị', colSpan: 'col-span-1 md:col-span-2' },
    { id: 'widget-6', type: 'STATS_BY_LEADER', title: 'Phân bổ theo Lãnh đạo / Phòng ban', colSpan: 'col-span-1 md:col-span-2' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- GET REAL DATA ---
  const { data: tasksRes, isLoading } = useTasksList({ pageSize: 1000 });
  const tasks = tasksRes?.data || [];

  // --- Tính toán thống kê từ data thật ---
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED' || t.progress === 100).length;
  const pendingTasks = totalTasks - completedTasks;

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const overdueTasks = tasks.filter((t: any) => {
    if (t.status === 'COMPLETED' || t.progress === 100) return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < now;
  }).length;

  const approachingTasks = tasks.filter((t: any) => {
    if (t.status === 'COMPLETED' || t.progress === 100) return false;
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= now && dueDate <= threeDaysFromNow;
  }).length;

  // --- Data cho biểu đồ BarChart (Theo Đơn vị) ---
  const progressByUnitData = useMemo(() => {
    if (!tasks.length) return [];
    const map: Record<string, { completed: number, pending: number }> = {};

    tasks.forEach((t: any) => {
      let unit = "Chưa phân bổ";
      const assignee = t.participants?.find((p: any) => p.participantRole === 'ASSIGNEE');

      // Fallback tìm tên phòng ban, giả định API trả về ở assignee.employee.department.name
      if (assignee?.employee?.department?.name) {
        unit = assignee.employee.department.name;
      } else if (assignee?.departmentName) {
        unit = assignee.departmentName;
      } else if (assignee?.employee?.jobTitle?.name) {
        unit = assignee.employee.jobTitle.name;
      }

      if (!map[unit]) map[unit] = { completed: 0, pending: 0 };

      if (t.status === 'COMPLETED' || t.progress === 100) {
        map[unit].completed++;
      } else {
        map[unit].pending++;
      }
    });

    return Object.entries(map).map(([unit, counts]) => ({
      unit: unit.length > 15 ? unit.substring(0, 15) + '...' : unit,
      fullUnit: unit,
      completed: counts.completed,
      pending: counts.pending,
    })).sort((a, b) => (b.completed + b.pending) - (a.completed + a.pending)).slice(0, 7);
  }, [tasks]);

  // --- Data cho biểu đồ PieChart (Theo Lãnh đạo / Ban giám đốc / Chủ trì) ---
  const statsByLeaderData = useMemo(() => {
    if (!tasks.length) return [];
    const map: Record<string, number> = {};

    tasks.forEach((t: any) => {
      let leader = "Chưa phân bổ";
      const owner = t.participants?.find((p: any) => p.participantRole === 'OWNER');

      if (owner?.employee?.fullName) {
        leader = owner.employee.fullName;
      } else if (owner?.employeeCode) {
        leader = owner.employeeCode;
      } else {
        const assignee = t.participants?.find((p: any) => p.participantRole === 'ASSIGNEE');
        if (assignee?.employee?.department?.name) {
          leader = assignee.employee.department.name;
        }
      }

      map[leader] = (map[leader] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      fullName: name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [tasks]);

  const renderWidgetContent = (type: string) => {
    switch (type) {
      case 'TOTAL_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-slate-400" /> : totalTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-[var(--gov-safe-green)] mt-1.5 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>Realtime</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center border border-blue-100 dark:border-slate-700">
                <Briefcase className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light border-t pt-3 border-slate-100 dark:border-slate-800">
              Tổng số lượng công việc được quản lý
            </div>
          </div>
        );
      case 'COMPLETED_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-slate-400" /> : completedTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-emerald-600 mt-1.5 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% <span className="font-light text-slate-500">tổng số</span></span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center border border-emerald-100 dark:border-slate-700">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light border-t pt-3 border-slate-100 dark:border-slate-800">
              Đang xử lý: {pendingTasks} công việc
            </div>
          </div>
        );
      case 'APPROACHING_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-4xl font-bold tracking-tight text-amber-500">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-slate-400" /> : approachingTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-amber-600 mt-1.5 font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Trong 3 ngày tới</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center border border-amber-100 dark:border-slate-700">
                <Clock className="h-7 w-7 text-amber-500" />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light border-t pt-3 border-slate-100 dark:border-slate-800">
              Công việc có nguy cơ bị trễ hạn
            </div>
          </div>
        );
      case 'OVERDUE_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-4xl font-bold tracking-tight text-rose-600">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-slate-400" /> : overdueTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-rose-600 mt-1.5 font-medium">
                  <TrendingDown className="h-4 w-4" />
                  <span>Chưa hoàn thành</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-rose-50 dark:bg-slate-800 flex items-center justify-center border border-rose-100 dark:border-slate-700 animate-pulse">
                <AlertTriangle className="h-7 w-7 text-rose-600" />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light border-t pt-3 border-slate-100 dark:border-slate-800 text-rose-600/80">
              Cần đôn đốc xử lý ngay
            </div>
          </div>
        );
      case 'PROGRESS_BY_UNIT':
        return (
          <div className="h-[300px] w-full pt-4">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : progressByUnitData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressByUnitData}
                  margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="unit" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="completed" name="Hoàn thành" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="pending" name="Chưa hoàn thành" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        );
      case 'STATS_BY_LEADER':
        return (
          <div className="h-[300px] w-full flex items-center justify-center pt-4">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : statsByLeaderData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsByLeaderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statsByLeaderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        );
      default:
        return <div>N/A</div>;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen p-6 md:p-8 space-y-8 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950">
      {/* Executive Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Tổng quan Công việc (Task Dashboard)</h2>
          <div className="flex items-center gap-2 mt-2.5 text-base text-slate-600 dark:text-slate-400 font-light">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 rounded-md font-medium text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Tracking
            </span>
            | Thống kê tiến độ công việc toàn cơ quan. Có thể kéo thả widget để cá nhân hóa giao diện.
          </div>
        </div>
        <div className="text-sm text-slate-500 font-light flex items-center gap-2">Trạng thái: <span className="font-semibold text-slate-800 dark:text-slate-200">Đã kết nối API thực tế</span></div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            {widgets.map((widget) => (
              <div key={widget.id} className={`${widget.colSpan}`}>
                <SortableWidget id={widget.id}>
                  <Card className="h-full rounded-lg border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
                    <CardHeader className="pb-2 pt-5 px-6">
                      <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                        {widget.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-2 flex-1">
                      {renderWidgetContent(widget.type)}
                    </CardContent>
                  </Card>
                </SortableWidget>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}