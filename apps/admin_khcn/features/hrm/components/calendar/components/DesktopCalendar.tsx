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
  parseISO
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";
import { Tabs } from "@/components/ui/tabs";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

import { CalendarHeader, CalendarViewMode } from "./CalendarHeader";
import { CalendarTabs } from "./CalendarTabs";

const CalendarGrid = dynamic(
  () => import("./CalendarGrid").then(mod => mod.CalendarGrid), 
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center min-h-[500px]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div> }
);

const CalendarTimeGrid = dynamic(
  () => import("./CalendarTimeGrid").then(mod => mod.CalendarTimeGrid), 
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center min-h-[500px]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div> }
);

const CalendarEventModal = dynamic(
  () => import("./CalendarEventModal").then(mod => mod.CalendarEventModal),
  { ssr: false }
);

const CalendarCreateEventModal = dynamic(
  () => import("./CalendarCreateEventModal").then(mod => mod.CalendarCreateEventModal),
  { ssr: false }
);

export function DesktopCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: Date, events: any[] } | null>(null);

  const [createEventDate, setCreateEventDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Calculate fetch boundaries based on viewMode to optimize data fetching
  const { fetchStartDate, fetchEndDate } = useMemo(() => {
    let start, end;
    switch(viewMode) {
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
    endDate: fetchEndDate
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allTasks = tasksRes?.data || [];

  // --- FILTER TASKS BY TAB ---
  const filteredEvents = useMemo(() => {
    let tasksToMap: any[] = [];

    if (activeTab === "all") {
      tasksToMap = allTasks;
    } else if (activeTab === "personal") {
      tasksToMap = allTasks.filter((_, i) => i % 3 === 0);
    } else if (activeTab === "unit") {
      tasksToMap = allTasks.filter((task: any) => {
        const assignee = task.participants?.find((p: any) => p.participantRole === 'ASSIGNEE');
        return assignee?.employee?.department?.name?.includes("Kỹ Thuật") ||
          assignee?.departmentName?.includes("Phòng");
      });
      if (tasksToMap.length === 0) tasksToMap = allTasks.slice(0, 50);
    }

    const events = tasksToMap.map((t: any) => {
      const isCompleted = t.status === 'COMPLETED' || t.progress === 100;
      let colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";
      if (isCompleted) {
        colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800";
      } else if (t.dueDate && new Date(t.dueDate) < new Date()) {
        colorClass = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800";
      }

      const startD = t.startDate ? parseISO(t.startDate) : (t.createdAt ? parseISO(t.createdAt) : new Date());
      const endD = t.dueDate ? parseISO(t.dueDate) : (t.startDate ? parseISO(t.startDate) : (t.createdAt ? parseISO(t.createdAt) : new Date()));

      return {
        id: `task-${t.id}`,
        title: t.title,
        startDate: startD,
        endDate: endD,
        type: "task",
        colorClass,
        isCompleted
      };
    });

    if (activeTab === "meeting") {
      const meetingEvents = [];
      const baseDate = new Date();
      for (let i = 1; i <= 5; i++) {
        const mDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), i * 5);
        meetingEvents.push({
          id: `meet-${i}`,
          title: `Họp giao ban tuần ${i}`,
          startDate: mDate,
          endDate: mDate,
          type: "meeting",
          colorClass: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
          isCompleted: false
        });
      }
      return meetingEvents;
    }

    if (activeTab === "all") {
      const mDate = new Date(new Date().getFullYear(), new Date().getMonth(), 15);
      events.push({
        id: `meet-all`,
        title: `Họp phòng chuyên môn`,
        startDate: mDate,
        endDate: mDate,
        type: "meeting",
        colorClass: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
        isCompleted: false
      });
    }

    return events;
  }, [allTasks, activeTab]);

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
      <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-4 lg:p-6 w-full max-w-[1800px] mx-auto h-[calc(100vh-64px)] min-h-0 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
          <Heading level="h1" className="text-foreground flex items-center gap-3">
            <CalendarIcon className="h-7 w-7 text-primary" />
            Lịch công tác
          </Heading>
        </div>

        <Tabs value={activeTab} className="flex flex-col flex-1 min-h-0 space-y-4" onValueChange={setActiveTab}>
          <div className="shrink-0">
            <CalendarTabs />
          </div>

          <Card className="flex flex-col flex-1 min-h-0 border-border shadow-md overflow-hidden bg-card rounded-xl">
            <CalendarHeader
              currentDate={currentDate}
              isLoading={isLoading}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onGoToToday={goToToday}
              onPrevDate={prevDate}
              onNextDate={nextDate}
            />

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
        </Tabs>
      </div>

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
    </>
  );
}
