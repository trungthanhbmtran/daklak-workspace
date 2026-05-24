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
import { Users, AlertTriangle, PlayCircle, Loader2 } from "lucide-react";
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
    opacity: isDragging ? 0.7 : 1,
    scale: isDragging ? "1.02" : "1",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none h-full">
      {children}
    </div>
  );
}

// --- Main Dashboard Component ---
export function HrmDashboardClient() {
  // Lấy dữ liệu thực tế nếu có (ví dụ: Tổng nhân sự)
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-slate-900">{isLoading ? <Loader2 className="animate-spin h-6 w-6"/> : totalEmp}</h3>
              <p className="text-sm text-emerald-600 mt-1 font-medium">+2 nhân sự mới tuần này</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-[var(--gov-trust-blue)]" />
            </div>
          </div>
        );
      case 'ACTIVE_PLAN':
        return (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-slate-900">12</h3>
              <p className="text-sm text-slate-500 mt-1">3 kế hoạch sắp đến hạn</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <PlayCircle className="h-6 w-6 text-[var(--gov-warning-yellow)]" />
            </div>
          </div>
        );
      case 'OVERDUE_TASK':
        return (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-rose-600">5</h3>
              <p className="text-sm text-rose-500 mt-1 font-medium">Cần đôn đốc xử lý ngay</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-[var(--gov-alert-red)]" />
            </div>
          </div>
        );
      case 'SLA_CHART':
        return (
          <div className="h-48 flex items-end justify-between gap-3 pt-4">
            {/* Simple Mock Bar Chart */}
            {[65, 80, 45, 90, 75, 100, 55].map((val, i) => (
              <div key={i} className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md relative group h-full flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-[var(--gov-trust-blue)] to-blue-400 rounded-t-md transition-all group-hover:opacity-80" 
                  style={{ height: `${val}%` }}
                ></div>
              </div>
            ))}
          </div>
        );
      case 'KPI_RANKING':
        return (
          <div className="space-y-5 mt-2">
            {['Phòng Kế hoạch', 'Văn phòng Sở', 'Thanh tra'].map((dept, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-300' : 'bg-orange-300'}`}>{i+1}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{dept}</span>
                </div>
                <span className="text-sm text-[var(--gov-safe-green)] font-bold">{95 - i*5}đ</span>
              </div>
            ))}
          </div>
        );
      default:
        return <div>N/A</div>;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Bảng điều khiển (Executive)</h2>
        <p className="text-slate-500 mt-2 text-base">
          Hệ thống Widget-based Dashboard. Bạn có thể kéo thả để sắp xếp lại các biểu đồ phục vụ nhu cầu giám sát.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {widgets.map((widget) => (
              <div key={widget.id} className={widget.colSpan}>
                <SortableWidget id={widget.id}>
                  <Card className="h-full rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 bg-white dark:bg-slate-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{widget.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
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
