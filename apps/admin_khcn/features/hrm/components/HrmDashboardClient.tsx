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
import { Users, AlertTriangle, PlayCircle, Loader2, GripVertical, Info, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHrmEmployeesList } from "@/features/hrm/hooks/useHrmEmployees";

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

// --- Main Dashboard Component ---
export function HrmDashboardClient() {
  // Lấy dữ liệu thực tế (business logic gốc)
  const { data: listRes, isLoading } = useHrmEmployeesList({ page: 1, pageSize: 1 });
  const totalEmp = listRes?.meta?.pagination?.total ?? 0;

  // Initial Widgets State (Mock data cho các biểu đồ tĩnh)
  const [widgets, setWidgets] = useState([
    { id: 'widget-1', type: 'TOTAL_EMP', title: 'Tổng nhân sự', colSpan: 'col-span-1 md:col-span-1' },
    { id: 'widget-2', type: 'ACTIVE_PLAN', title: 'Kế hoạch đang chạy', colSpan: 'col-span-1 md:col-span-1' },
    { id: 'widget-3', type: 'OVERDUE_TASK', title: 'Công việc trễ hạn', colSpan: 'col-span-1 md:col-span-1' },
    { id: 'widget-4', type: 'SLA_CHART', title: 'Biểu đồ tuân thủ SLA (Tuần)', colSpan: 'col-span-1 md:col-span-2' },
    { id: 'widget-5', type: 'KPI_RANKING', title: 'Bảng xếp hạng KPI', colSpan: 'col-span-1 md:col-span-1' },
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

  const renderWidgetContent = (type: string) => {
    switch (type) {
      case 'TOTAL_EMP':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : totalEmp.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-[var(--gov-safe-green)] mt-1.5 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>+2 <span className="font-light text-slate-500">▲ 1.1%</span></span>
                  <span className="text-slate-400 font-light ml-1">nhân sự mới tuần này</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center border border-blue-100 dark:border-slate-700">
                <Users className="h-7 w-7 text-[var(--gov-trust-blue)]" />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light border-t pt-3 border-slate-100 dark:border-slate-800">
              Active: {isLoading ? '...' : (totalEmp * 0.95).toFixed(0)} | Terminated: {isLoading ? '...' : (totalEmp * 0.05).toFixed(0)}
            </div>
          </div>
        );
      case 'ACTIVE_PLAN':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-100">12</h3>
                <p className="text-sm text-[var(--gov-warning-yellow)] font-semibold mt-1.5 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  3 Approaching Deadline: 1 CRITICAL
                </p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center border border-amber-100 dark:border-slate-700">
                <PlayCircle className="h-7 w-7 text-[var(--gov-warning-yellow)]" />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light border-t pt-3 border-slate-100 dark:border-slate-800">
              Department with most: Phòng Kế hoạch (4)
            </div>
          </div>
        );
      case 'OVERDUE_TASK':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-4xl font-bold tracking-tight text-rose-600">5</h3>
                <p className="text-sm text-rose-600/90 mt-1.5 font-semibold uppercase tracking-wide">
                  Cần đôn đốc ngay
                </p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-rose-50 dark:bg-slate-800 flex items-center justify-center border border-rose-100 dark:border-slate-700 animate-pulse">
                <AlertTriangle className="h-7 w-7 text-[var(--gov-alert-red)]" />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light border-t pt-3 border-slate-100 dark:border-slate-800">
              Department with most: Thanh tra (2) | Oldest: 14 days
            </div>
          </div>
        );
      case 'SLA_CHART':
        return (
          <div className="flex flex-col h-full gap-3">
            <div className="text-sm font-light text-slate-500 dark:text-slate-400">Average Compliance: <span className="font-semibold text-slate-800 dark:text-slate-200">75%</span></div>
            <div className="h-44 flex items-end justify-between gap-2.5 pt-2 pb-6 relative">
              {/* Benchmark Line */}
              <div className="absolute left-0 bottom-6 right-0 border-t border-slate-200 dark:border-slate-800 border-dashed z-0">
                <span className="absolute -top-3 left-1 text-[10px] text-slate-400">Benchmark: 75%</span>
              </div>

              {[65, 80, 45, 90, 75, 100, 55].map((val, i) => {
                const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
                return (
                  <div key={i} className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-full flex flex-col items-center justify-end z-10">
                    <div
                      className={`w-full ${val < 75 ? 'bg-amber-400/80' : 'bg-gradient-to-t from-[var(--gov-trust-blue)] to-blue-400'} rounded-t-lg transition-all group-hover:opacity-80`}
                      style={{ height: `${val}%` }}
                    ></div>
                    <span className="absolute -bottom-5 text-xs text-slate-500 dark:text-slate-400 font-light">{dayLabel}</span>
                    <span className="absolute -top-6 text-sm text-slate-800 dark:text-slate-200 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{val}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'KPI_RANKING':
        const departments = [
          { name: 'Phòng Kế hoạch', score: 95, delta: 0 },
          { name: 'Văn phòng Sở', score: 90, delta: -1 },
          { name: 'Thanh tra', score: 85, delta: 0 },
        ];
        return (
          <div className="space-y-4.5 mt-2.5">
            {departments.map((dept, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-3.5">
                  <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-300' : 'bg-orange-300'}`}>{i + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dept.name}</span>
                    <span className={`text-[11px] font-light ${dept.delta < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {dept.delta < 0 ? `▼ 1` : (dept.delta > 0 ? `▲ ${dept.delta}` : `--`)} rank change
                    </span>
                  </div>
                </div>
                <span className="text-sm text-[var(--gov-safe-green)] font-extrabold tracking-tight">{dept.score}đ</span>
              </div>
            ))}
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Tổng quan Vận hành (Executive)</h2>
          <div className="flex items-center gap-2 mt-2.5 text-base text-slate-600 dark:text-slate-400 font-light">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 rounded-md font-medium text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Realtime Connect: Active
            </span>
            | Hệ thống Widget Dashboard. Kéo thả để sắp xếp lại phục vụ nhu cầu giám sát.
          </div>
        </div>
        <div className="text-sm text-slate-500 font-light flex items-center gap-2">Last Updated: <span className="font-semibold text-slate-800">1m ago</span> <Loader2 className="animate-spin h-3.5 w-3.5" /></div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
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