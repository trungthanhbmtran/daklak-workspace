"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
  parseISO,
  isValid,
} from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  CheckCircle2,
  BarChart,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

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
const WEEK_STARTS_ON = 1; // Thứ 2
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

export function MobileCalendar({ activeTab }: { activeTab: TabType }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    day: Date;
    events: CalendarEventItem[];
  } | null>(null);

  const [createEventDate, setCreateEventDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Cập nhật tham số truyền lên Backend
  // Mobile chỉ dùng viewMode week
  const { data: tasksRes, isLoading } = useTasksList({
    limit: FETCH_LIMIT,
    viewMode: "week",
    referenceDate: currentDate.toISOString(),
    role: activeTab === "personal" ? "ASSIGNEE" : undefined,
  });

  const allTasks: TaskDto[] = Array.isArray(tasksRes?.data) ? tasksRes.data : [];

  // Map task -> event, bỏ qua task thiếu ngày hợp lệ
  const filteredEvents = useMemo<CalendarEventItem[]>(() => {
    const events: CalendarEventItem[] = [];

    for (const t of allTasks) {
      const startD = safeParseDate(t.startDate);
      const endD = safeParseDate(t.dueDate);
      if (!startD || !endD) continue; // dữ liệu thiếu ngày -> không hiển thị lên lịch

      const isCompleted = t.status === "COMPLETED" || t.progress === 100;
      const eventType = resolveEventType(t.type);

      // Tab "meeting" chỉ hiển thị các sự kiện loại họp
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

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const todaysEvents = useMemo(() => {
    const todayStart = startOfDay(currentDate);
    const todayEnd = endOfDay(currentDate);
    return filteredEvents.filter((evt) => {
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
            <Button
              variant="ghost"
              size="icon"
              onClick={prevDate}
              iconStart={<ChevronLeft className="w-5 h-5" />}
            />
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
              Hôm nay
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextDate}
              iconStart={<ChevronRight className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Week strip */}
        <div className="bg-card border-b border-border shrink-0 p-2">
          <div className="flex justify-between items-center max-w-full overflow-x-auto gap-2 px-2 pb-2 scrollbar-none">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, currentDate);
              const isToday = isSameDay(day, new Date());
              return (
                <Button
                  key={day.toISOString()}
                  onClick={() => setCurrentDate(day)}
                  className={`flex flex-col items-center justify-center min-w-[44px] h-[52px] rounded-lg transition-colors ${isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isToday
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <span className="text-[10px] uppercase font-medium">
                    {format(day, "E", { locale: viLocale })}
                  </span>
                  <span className="text-base font-bold">{format(day, "d")}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-muted/10 border-b border-border shrink-0 p-2">
          <div className="flex justify-start items-center max-w-full overflow-x-auto gap-3 px-2 pb-1 scrollbar-none text-xs">
            <StatItem icon={<BarChart className="w-3.5 h-3.5 text-primary" />} label="Tổng:" value={stats.total} />
            <StatItem
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              label="Hoàn thành:"
              value={stats.completed}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
            <StatItem
              icon={<Clock className="w-3.5 h-3.5 text-amber-500" />}
              label="Đang xử lý:"
              value={stats.total - stats.completed}
              valueClassName="text-amber-600 dark:text-amber-400"
            />
            <StatItem
              icon={<Video className="w-3.5 h-3.5 text-blue-500" />}
              label="Họp:"
              value={stats.meetings}
              valueClassName="text-blue-600 dark:text-blue-400"
            />
            <StatItem
              icon={<CalendarIcon className="w-3.5 h-3.5 text-purple-500" />}
              label="Học:"
              value={stats.studies}
              valueClassName="text-purple-600 dark:text-purple-400"
            />
          </div>
        </div>

        {/* Agenda / Event List */}
        <ScrollArea className="flex-1 bg-muted/30 p-4">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
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
              {todaysEvents.map((evt) => (
                <Card
                  key={evt.id}
                  className={`overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${evt.colorClass}`}
                  onClick={() => setSelectedDayEvents({ day: currentDate, events: [evt] })}
                >
                  <CardContent className="p-4 flex gap-3">
                    <div className="shrink-0 mt-1">
                      {evt.type === "meeting" ? (
                        <Video className="w-5 h-5 opacity-80" />
                      ) : evt.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 opacity-80" />
                      ) : (
                        <Clock className="w-5 h-5 opacity-80" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text weight="semibold" className="truncate text-base mb-1">
                        {evt.title}
                      </Text>
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
    <div className="flex items-center gap-1 shrink-0">
      {icon}
      <span className="font-medium text-foreground/80">{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}