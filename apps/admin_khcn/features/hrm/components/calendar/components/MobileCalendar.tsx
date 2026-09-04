"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfDay, endOfDay, parseISO, addWeeks, subWeeks } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Video, CheckCircle2, BarChart, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const CalendarEventModal = dynamic(
  () => import("./CalendarEventModal").then(mod => mod.CalendarEventModal),
  { ssr: false }
);

const CalendarCreateEventModal = dynamic(
  () => import("./CalendarCreateEventModal").then(mod => mod.CalendarCreateEventModal),
  { ssr: false }
);

export function MobileCalendar({ activeTab }: { activeTab: 'all' | 'personal' | 'unit' | 'meeting' }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: Date, events: any[] } | null>(null);

  const [createEventDate, setCreateEventDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Chỉ lấy API cho 1 tuần để tiết kiệm băng thông Mobile
  const { fetchStartDate, fetchEndDate } = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return {
      fetchStartDate: start.toISOString(),
      fetchEndDate: end.toISOString()
    };
  }, [currentDate]);

  const { data: tasksRes, isLoading } = useTasksList({ 
    limit: 500,
    startDate: fetchStartDate,
    endDate: fetchEndDate,
    role: activeTab === 'personal' ? 'ASSIGNEE' : undefined
  });
  
  const allTasks = tasksRes?.data || [];

  // Lọc theo Tab giống Desktop nhưng ít logic thừa hơn
  const filteredEvents = useMemo(() => {
    let tasksToMap: any[] = [];

    if (activeTab === "all" || activeTab === "unit") {
      tasksToMap = allTasks;
    } else if (activeTab === "personal") {
      tasksToMap = allTasks;
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

  const nextDate = useCallback(() => setCurrentDate(prev => addWeeks(prev, 1)), []);
  const prevDate = useCallback(() => setCurrentDate(prev => subWeeks(prev, 1)), []);
  const goToToday = useCallback(() => setCurrentDate(new Date()), []);
  const handleDateClick = useCallback((date: Date) => {
    setCreateEventDate(date);
    setIsCreateModalOpen(true);
  }, []);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate]);

  const todaysEvents = useMemo(() => {
    const todayStart = startOfDay(currentDate);
    const todayEnd = endOfDay(currentDate);
    return filteredEvents.filter(evt => {
      const evtStart = startOfDay(evt.startDate);
      const evtEnd = endOfDay(evt.endDate);
      return todayEnd >= evtStart && todayStart <= evtEnd;
    });
  }, [currentDate, filteredEvents]);

  return (
    <>
      <div className="flex flex-col h-full w-full max-w-md mx-auto bg-background relative animate-in slide-in-from-bottom-2 duration-300 rounded-xl overflow-hidden shadow-sm border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <Heading level="h3" className="text-foreground">
              {format(currentDate, "MMMM, yyyy", { locale: viLocale })}
            </Heading>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevDate} iconStart={<ChevronLeft className="w-5 h-5" />}></Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
              Hôm nay
            </Button>
            <Button variant="ghost" size="icon" onClick={nextDate} iconStart={<ChevronRight className="w-5 h-5" />}></Button>
          </div>
        </div>

        {/* Week strip */}
        <div className="bg-card border-b border-border shrink-0 p-2">
          <div className="flex justify-between items-center max-w-full overflow-x-auto gap-2 px-2 pb-2 scrollbar-none">
            {weekDays.map(day => {
              const isSelected = isSameDay(day, currentDate);
              const isToday = isSameDay(day, new Date());
              return (
                <Button
                  key={day.toISOString()}
                  onClick={() => setCurrentDate(day)}
                  className={`flex flex-col items-center justify-center min-w-[44px] h-[52px] rounded-lg transition-colors ${
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : isToday 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-[10px] uppercase font-medium">
                    {format(day, "E", { locale: viLocale })}
                  </span>
                  <span className="text-base font-bold">
                    {format(day, "d")}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-muted/10 border-b border-border shrink-0 p-2">
          <div className="flex justify-start items-center max-w-full overflow-x-auto gap-3 px-2 pb-1 scrollbar-none text-xs">
            <div className="flex items-center gap-1 shrink-0">
              <BarChart className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-foreground/80">Tổng:</span>
              <span className="font-semibold text-foreground">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium text-foreground/80">Hoàn thành:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.completed}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium text-foreground/80">Đang xử lý:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.total - stats.completed}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium text-foreground/80">Họp:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.meetings}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium text-foreground/80">Học:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.studies}</span>
            </div>
          </div>
        </div>

        {/* Agenda / Event List */}
        <ScrollArea className="flex-1 bg-muted/30 p-4">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : todaysEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mb-2 opacity-20" />
              <Text>Không có lịch trình nào</Text>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-20">
              {todaysEvents.map(evt => (
                <Card 
                  key={evt.id} 
                  className={`overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${evt.colorClass} bg-opacity-10 dark:bg-opacity-20 border-opacity-50`}
                  onClick={() => setSelectedDayEvents({ day: currentDate, events: [evt] })}
                >
                  <CardContent className="p-4 flex gap-3">
                    <div className="shrink-0 mt-1">
                      {evt.type === 'meeting' ? <Video className="w-5 h-5 opacity-80" /> : 
                       evt.isCompleted ? <CheckCircle2 className="w-5 h-5 opacity-80" /> : <Clock className="w-5 h-5 opacity-80" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text weight="semibold" className="truncate text-base mb-1">{evt.title}</Text>
                      <Text variant="small" className="opacity-80">
                        {isSameDay(evt.startDate, evt.endDate) 
                          ? "Cả ngày" 
                          : `${format(evt.startDate, "dd/MM")} - ${format(evt.endDate, "dd/MM")}`}
                      </Text>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Floating Action Button */}
        <div className="absolute bottom-6 right-6">
          <Button 
            size="icon" 
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={() => handleDateClick(currentDate)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

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
