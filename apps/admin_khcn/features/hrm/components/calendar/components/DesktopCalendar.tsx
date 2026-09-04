"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useCallback } from "react";
import {
  addMonths, subMonths,
  addDays, subDays,
  addWeeks, subWeeks,
  addQuarters, subQuarters,
  addYears, subYears,
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  parseISO
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Calendar as CalendarIcon, Loader2, Video, CheckCircle2, BarChart, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { safeParseDate } from "@/lib/utils";

import { CalendarHeader, CalendarViewMode } from "./CalendarHeader";

import { Skeleton } from "@/components/ui/skeleton";

const CalendarGrid = dynamic(
  () => import("./CalendarGrid").then(mod => mod.CalendarGrid),
  { ssr: false, loading: () => <Skeleton className="w-full min-h-[500px] rounded-xl" /> }
);

const CalendarTimeGrid = dynamic(
  () => import("./CalendarTimeGrid").then(mod => mod.CalendarTimeGrid),
  { ssr: false, loading: () => <Skeleton className="w-full min-h-[500px] rounded-xl" /> }
);

const CalendarEventModal = dynamic(
  () => import("./CalendarEventModal").then(mod => mod.CalendarEventModal),
  { ssr: false }
);

const CalendarCreateEventModal = dynamic(
  () => import("./CalendarCreateEventModal").then(mod => mod.CalendarCreateEventModal),
  { ssr: false }
);

const CalendarAiModal = dynamic(
  () => import("./CalendarAiModal").then(mod => mod.CalendarAiModal),
  { ssr: false }
);

export function DesktopCalendar({ activeTab }: { activeTab: 'all' | 'personal' | 'unit' | 'meeting' }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: Date, events: any[] } | null>(null);

  const [createEventDate, setCreateEventDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Calculate fetch boundaries based on viewMode to optimize data fetching
  const { fetchStartDate, fetchEndDate } = useMemo(() => {
    let start, end;
    switch (viewMode) {
      case 'day':
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        break;
      case 'week':
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        break;
      case 'quarter':
        start = startOfWeek(startOfQuarter(currentDate), { weekStartsOn: 1 });
        end = endOfWeek(endOfQuarter(currentDate), { weekStartsOn: 1 });
        break;
      case 'year':
        start = startOfWeek(startOfYear(currentDate), { weekStartsOn: 1 });
        end = endOfWeek(endOfYear(currentDate), { weekStartsOn: 1 });
        break;
      default:
        start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        break;
    }
    return {
      fetchStartDate: start.toISOString(),
      fetchEndDate: end.toISOString()
    };
  }, [currentDate, viewMode]);

  // --- GET REAL DATA ---
  const { data: tasksRes, isLoading } = useTasksList({
    limit: 500,
    startDate: fetchStartDate,
    endDate: fetchEndDate,
    role: activeTab === 'personal' ? 'ASSIGNEE' : undefined
  });
  
  const allTasks = tasksRes?.data || [];

  // --- FILTER TASKS BY TAB ---
  const filteredEvents = useMemo(() => {
    let tasksToMap: any[] = [];

    if (activeTab === "all" || activeTab === "unit") {
      tasksToMap = allTasks;
    } else if (activeTab === "personal") {
      // Tạm thời nếu dùng API thì backend có thể lọc, ở đây tạm map bằng allTasks nếu không có param
      tasksToMap = allTasks;
    }

    if (!Array.isArray(tasksToMap)) tasksToMap = [];

    const events = tasksToMap.map((t: any) => {
      const isCompleted = t.status === 'COMPLETED' || t.progress === 100;
      let colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";
      if (isCompleted) {
        colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800";
      } else if (t.dueDate && new Date(t.dueDate) < new Date()) {
        colorClass = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800";
      }

      const startD = safeParseDate(t.startDate || t.createdAt);
      const endD = safeParseDate(t.dueDate || t.startDate || t.createdAt);

      let eventType = "task";
      if (t.type === 'MEETING') eventType = 'meeting';
      else if (t.type === 'STUDY') eventType = 'study';

      return {
        id: `task-${t.id}`,
        rawId: t.id,
        title: t.title,
        startDate: startD,
        endDate: endD,
        type: eventType,
        meetingLink: t.meetingLink,
        colorClass,
        isCompleted
      };
    });

    return events;
  }, [allTasks, activeTab]);

  const stats = useMemo(() => {
    let total = 0;
    let meetings = 0;
    let studies = 0;
    let completed = 0;
    
    filteredEvents.forEach(evt => {
      total++;
      if (evt.type === 'meeting') meetings++;
      else if (evt.type === 'study') studies++;
      
      if (evt.isCompleted) completed++;
    });

    return { total, meetings, studies, completed };
  }, [filteredEvents]);

  const nextDate = useCallback(() => {
    setCurrentDate((prev) => {
      switch (viewMode) {
        case 'day': return addDays(prev, 1);
        case 'week': return addWeeks(prev, 1);
        case 'month': return addMonths(prev, 1);
        case 'quarter': return addQuarters(prev, 1);
        case 'year': return addYears(prev, 1);
        default: return addMonths(prev, 1);
      }
    });
  }, [viewMode]);

  const prevDate = useCallback(() => {
    setCurrentDate((prev) => {
      switch (viewMode) {
        case 'day': return subDays(prev, 1);
        case 'week': return subWeeks(prev, 1);
        case 'month': return subMonths(prev, 1);
        case 'quarter': return subQuarters(prev, 1);
        case 'year': return subYears(prev, 1);
        default: return subMonths(prev, 1);
      }
    });
  }, [viewMode]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleDateClick = useCallback((date: Date) => {
    setCreateEventDate(date);
    setIsCreateModalOpen(true);
  }, []);

  return (
    <>
      <Card className="flex flex-col flex-1 min-h-0 border-border shadow-md overflow-hidden bg-card rounded-xl h-full">
        <CalendarHeader
          currentDate={currentDate}
          isLoading={isLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onGoToToday={goToToday}
          onPrevDate={prevDate}
          onNextDate={nextDate}
          onOpenAiModal={() => setIsAiModalOpen(true)}
        />

        <div className="px-6 py-3 border-b border-border bg-muted/10 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground/80">Tổng sự kiện:</span>
            <span className="font-semibold text-foreground">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-foreground/80">Hoàn thành:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-foreground/80">Đang xử lý:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.total - stats.completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-foreground/80">Lịch họp:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.meetings}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-foreground/80">Lịch học:</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.studies}</span>
          </div>
        </div>

        <CardContent className="flex flex-col flex-1 min-h-0 p-0 relative">
          {viewMode === "month" || viewMode === "quarter" || viewMode === "year" ? (
            <CalendarGrid
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              isLoading={isLoading}
              viewMode={viewMode}
              onSelectDayEvents={setSelectedDayEvents}
              onDateClick={handleDateClick}
            />
          ) : (
            <CalendarTimeGrid
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              isLoading={isLoading}
              viewMode={viewMode}
              onSelectDayEvents={setSelectedDayEvents}
              onTimeSlotClick={handleDateClick}
            />
          )}
        </CardContent>
      </Card>

      {selectedDayEvents && (
        <CalendarEventModal
          selectedDayEvents={selectedDayEvents}
          onClose={() => setSelectedDayEvents(null)}
        />
      )}

      {isCreateModalOpen && (
        <CalendarCreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialDate={createEventDate}
        />
      )}

      {isAiModalOpen && (
        <CalendarAiModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </>
  );
}
