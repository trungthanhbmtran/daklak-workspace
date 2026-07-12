"use client";

import React, { useState } from "react";
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

// Import hook lấy dữ liệu thống kê từ server
import { useTaskStats } from "@/features/hrm/hooks/useTasks";

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

  // --- GET SERVER SIDE STATS ---
  const { data: statsRes, isLoading } = useTaskStats({});
  const serverStats = statsRes?.data || {
    overdue: 0, warning: 0, inTime: 0, doneInTime: 0, doneOverdue: 0, statsByUnit: []
  };

  const completedTasks = serverStats.doneInTime + serverStats.doneOverdue;
  const pendingTasks = serverStats.overdue + serverStats.warning + serverStats.inTime;
  const totalTasks = completedTasks + pendingTasks;
  const overdueTasks = serverStats.overdue;
  const approachingTasks = serverStats.warning;

  // --- Data cho biểu đồ BarChart (Theo Đơn vị) ---
  const progressByUnitData = serverStats.statsByUnit || [];

  // --- Data cho biểu đồ PieChart (Theo Lãnh đạo / Ban giám đốc / Chủ trì) ---
  const statsByLeaderData = serverStats.statsByLeader || [];

  const renderWidgetContent = (type: string) => {
    switch (type) {
      case 'TOTAL_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-[40px] font-black tracking-tighter text-foreground">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /> : totalTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-indigo-500 font-bold mt-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Realtime</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shadow-sm">
                <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold border-t pt-3 border-border">
              Tổng số lượng công việc được quản lý
            </div>
          </div>
        );
      case 'COMPLETED_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-[40px] font-black tracking-tighter text-emerald-600 dark:text-emerald-500">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-emerald-400" /> : completedTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-emerald-600 mt-1 font-bold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% <span className="opacity-60">tổng số</span></span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold border-t pt-3 border-border">
              Đang xử lý: {pendingTasks} công việc
            </div>
          </div>
        );
      case 'APPROACHING_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-[40px] font-black tracking-tighter text-amber-500">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-amber-400" /> : approachingTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-amber-600 mt-1 font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Trong 3 ngày tới</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border border-amber-100 dark:border-amber-800/50 shadow-sm">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold border-t pt-3 border-border">
              Công việc có nguy cơ bị trễ hạn
            </div>
          </div>
        );
      case 'OVERDUE_TASKS':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-[40px] font-black tracking-tighter text-rose-600">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-rose-400" /> : overdueTasks}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-rose-600 mt-1 font-bold">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Chưa hoàn thành</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center border border-rose-100 dark:border-rose-800/50 shadow-sm">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
            <div className="text-[11px] text-rose-600/80 font-semibold border-t pt-3 border-rose-100 dark:border-rose-900/50">
              Cần đôn đốc xử lý ngay
            </div>
          </div>
        );
      case 'PROGRESS_BY_UNIT':
        return (
          <div className="h-[300px] w-full pt-4">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : progressByUnitData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressByUnitData}
                  margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="unitName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
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
              <div className="h-full flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : statsByLeaderData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">Chưa có dữ liệu</div>
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
                    nameKey="leaderName"
                    stroke="none"
                  >
                    {statsByLeaderData.map((entry: any, index: number) => (
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
    <div className="flex flex-col h-full min-h-screen p-6 md:p-8 space-y-8 animate-in fade-in duration-500 bg-background font-sans">
      {/* Executive Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Tổng quan Công việc
          </h2>
          <div className="flex items-center gap-2 mt-2 text-[13px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Tracking
            </span>
            <span className="opacity-50">|</span>
            Thống kê tiến độ toàn cơ quan. Kéo thả widget để tùy chỉnh.
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-widest bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Đã kết nối API
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            {widgets.map((widget) => (
              <div key={widget.id} className={`${widget.colSpan}`}>
                <SortableWidget id={widget.id}>
                  <Card className="h-full rounded-2xl border-border shadow-sm hover:shadow-lg hover:border-indigo-500/20 transition-all duration-300 bg-card overflow-hidden flex flex-col group/card">
                    <CardHeader className="pb-2 pt-5 px-6 border-b border-border/50 bg-muted/20">
                      <CardTitle className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-between group-hover/card:text-foreground transition-colors">
                        {widget.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-4 flex-1">
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