"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  addMonths, 
  subMonths, 
  parseISO
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { Tabs } from "@/components/ui/tabs";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Calendar as CalendarIcon } from "lucide-react";

import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarTabs } from "./components/CalendarTabs";
import { CalendarGrid } from "./components/CalendarGrid";
import { CalendarEventModal } from "./components/CalendarEventModal";

export function WorkCalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("all"); 
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: Date, events: any[] } | null>(null);

  // --- GET REAL DATA ---
  const { data: tasksRes, isLoading } = useTasksList({ pageSize: 2000 });
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

  const nextMonth = useCallback(() => setCurrentDate(prev => addMonths(prev, 1)), []);
  const prevMonth = useCallback(() => setCurrentDate(prev => subMonths(prev, 1)), []);
  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  return (
    <div className="p-6 md:p-8 h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <Heading level="h1" className="text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            Lịch công tác
          </Heading>
          <Text variant="muted" className="mt-2">
            Quản lý công việc và cuộc họp trực quan theo mốc thời gian.
          </Text>
        </div>
      </div>

      <Tabs defaultValue="all" className="flex flex-col flex-1 min-h-0 space-y-4" onValueChange={setActiveTab}>
        <CalendarTabs />

        <Card className="flex flex-col flex-1 min-h-0 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CalendarHeader 
            currentDate={currentDate} 
            isLoading={isLoading} 
            onGoToToday={goToToday} 
            onPrevMonth={prevMonth} 
            onNextMonth={nextMonth} 
          />
          
          <CardContent className="flex flex-col flex-1 min-h-0 p-0 relative">
            <CalendarGrid 
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              isLoading={isLoading}
              onSelectDayEvents={setSelectedDayEvents}
            />
          </CardContent>
        </Card>
      </Tabs>

      <CalendarEventModal 
        selectedDayEvents={selectedDayEvents} 
        onClose={() => setSelectedDayEvents(null)} 
      />
    </div>
  );
}
