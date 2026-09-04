"use client";

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
  parseISO,
  isValid,
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Calendar as CalendarIcon, Video, CheckCircle2, BarChart, Clock } from "lucide-react";
import dynamic from "next/dynamic";

import { CalendarHeader, CalendarViewMode } from "./CalendarHeader";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarGrid = dynamic(
  () => import("./CalendarGrid").then((mod) => mod.CalendarGrid),
  { ssr: false, loading: () => <Skeleton className="w-full min-h-[500px] rounded-xl" /> }
);

const CalendarTimeGrid = dynamic(
  () => import("./CalendarTimeGrid").then((mod) => mod.CalendarTimeGrid),
  { ssr: false, loading: () => <Skeleton className="w-full min-h-[500px] rounded-xl" /> }
);

const CalendarEventModal = dynamic(
  () => import("./CalendarEventModal").then((mod) => mod.CalendarEventModal),
  { ssr: false }
);

const CalendarCreateEventModal = dynamic(
  () =>
    import("./CalendarCreateEventModal").then(
      (mod) => mod.CalendarCreateEventModal
    ),
  { ssr: false }
);

const CalendarAiModal = dynamic(
  () => import("./CalendarAiModal").then((mod) => mod.CalendarAiModal),
  { ssr: false }
);

// ---- Types ----
type TabType = "all" | "personal" | "unit" | "meeting";
type EventType = "task" | "meeting" | "study";

interface TaskDto {
  id: string;
  title: string;
  status?: string;
  progress?: number;
  startDate?: string;
  dueDate?: string;
  type?: "MEETING" | "STUDY" | string;
  meetingLink?: string;
}

interface CalendarEventItem {
  id: string;
  rawId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: EventType;
  meetingLink?: string;
  colorClass: string;
  isCompleted: boolean;
}

// ---- Constants ----
const WEEK_STARTS_ON = 1;
const FETCH_LIMIT = 500;

const COLOR_CLASS = {
  completed:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  overdue:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
  default:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
};

// ---- Helpers ----
function safeParseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function resolveEventType(rawType?: string): EventType {
  if (rawType === "MEETING") return "meeting";
  if (rawType === "STUDY") return "study";
  return "task";
}

function resolveColorClass(isCompleted: boolean, dueDate: Date | null): string {
  if (isCompleted) return COLOR_CLASS.completed;
  if (dueDate && dueDate < new Date()) return COLOR_CLASS.overdue;
  return COLOR_CLASS.default;
}

export function DesktopCalendar({ activeTab }: { activeTab: TabType }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    day: Date;
    events: CalendarEventItem[];
  } | null>(null);

  const [createEventDate, setCreateEventDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Cập nhật tham số truyền lên Backend
  // Backend sẽ tự tính fetchStartDate, fetchEndDate, nextDate, prevDate thông qua viewMode và referenceDate
  const { data: tasksRes, isLoading } = useTasksList({
    limit: FETCH_LIMIT,
    viewMode: viewMode,
    referenceDate: currentDate.toISOString(),
    role: activeTab === "personal" ? "ASSIGNEE" : undefined,
  });

  const allTasks: TaskDto[] = Array.isArray(tasksRes?.data) ? tasksRes.data : [];

  // Map task -> event, lọc theo tab, bỏ qua task thiếu ngày hợp lệ
  const filteredEvents = useMemo<CalendarEventItem[]>(() => {
    const events: CalendarEventItem[] = [];

    for (const t of allTasks) {
      const startD = safeParseDate(t.startDate);
      const endD = safeParseDate(t.dueDate);
      if (!startD || !endD) continue;

      const isCompleted = t.status === "COMPLETED" || t.progress === 100;
      const eventType = resolveEventType(t.type);

      // Tab "meeting" chỉ hiển thị sự kiện loại họp
      if (activeTab === "meeting" && eventType !== "meeting") continue;

      events.push({
        id: `task-${t.id}`,
        rawId: t.id,
        title: t.title,
        startDate: startD,
        endDate: endD,
        type: eventType,
        meetingLink: t.meetingLink,
        colorClass: resolveColorClass(isCompleted, endD),
        isCompleted,
      });
    }

    return events;
  }, [allTasks, activeTab]);

  const stats = useMemo(() => {
    return filteredEvents.reduce(
      (acc, evt) => {
        acc.total++;
        if (evt.type === "meeting") acc.meetings++;
        else if (evt.type === "study") acc.studies++;
        if (evt.isCompleted) acc.completed++;
        return acc;
      },
      { total: 0, meetings: 0, studies: 0, completed: 0 }
    );
  }, [filteredEvents]);

  const nextDate = useCallback(() => {
    if (tasksRes?.meta?.calendar?.nextDate) {
      setCurrentDate(new Date(tasksRes.meta.calendar.nextDate));
    }
  }, [tasksRes]);

  const prevDate = useCallback(() => {
    if (tasksRes?.meta?.calendar?.prevDate) {
      setCurrentDate(new Date(tasksRes.meta.calendar.prevDate));
    }
  }, [tasksRes]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleDateClick = useCallback((date: Date) => {
    setCreateEventDate(date);
    setIsCreateModalOpen(true);
  }, []);

  const isGridView = viewMode === "month" || viewMode === "quarter" || viewMode === "year";

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
          <StatItem icon={<BarChart className="w-4 h-4 text-primary" />} label="Tổng sự kiện:" value={stats.total} />
          <StatItem
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            label="Hoàn thành:"
            value={stats.completed}
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
          <StatItem
            icon={<Clock className="w-4 h-4 text-amber-500" />}
            label="Đang xử lý:"
            value={stats.total - stats.completed}
            valueClassName="text-amber-600 dark:text-amber-400"
          />
          <StatItem
            icon={<Video className="w-4 h-4 text-blue-500" />}
            label="Lịch họp:"
            value={stats.meetings}
            valueClassName="text-blue-600 dark:text-blue-400"
          />
          <StatItem
            icon={<CalendarIcon className="w-4 h-4 text-purple-500" />}
            label="Lịch học:"
            value={stats.studies}
            valueClassName="text-purple-600 dark:text-purple-400"
          />
        </div>

        <CardContent className="flex flex-col flex-1 min-h-0 p-0 relative">
          {isGridView ? (
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
        <CalendarAiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      )}
    </>
  );
}

function StatItem({
  icon,
  label,
  value,
  valueClassName = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium text-foreground/80">{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}