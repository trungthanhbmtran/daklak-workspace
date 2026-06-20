"use client";

import React, { useState, useMemo } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO,
  isToday
} from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Users, 
  Briefcase, 
  Video,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Loader2 } from "lucide-react";

export function WorkCalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("all"); // 'all' (Xử lý CV), 'personal', 'unit', 'meeting'
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
      // Giả lập filter theo 1 User cố định (do chưa có auth state).
      // Ta lấy tạm các task mà owner/assignee có chứa tên "Nguyễn" hoặc 1 mã nhân viên cụ thể.
      // Để đơn giản và có data, ta lấy 30% số task ngẫu nhiên (hoặc dựa trên index).
      tasksToMap = allTasks.filter((_, i) => i % 3 === 0);
    } else if (activeTab === "unit") {
      // Giả lập filter theo Phòng Kỹ Thuật / Ban Giám Đốc
      tasksToMap = allTasks.filter((task: any) => {
        const assignee = task.participants?.find((p: any) => p.participantRole === 'ASSIGNEE');
        return assignee?.employee?.department?.name?.includes("Kỹ Thuật") || 
               assignee?.departmentName?.includes("Phòng");
      });
      // Nếu không có task nào khớp thì lấy tạm 1 nửa.
      if (tasksToMap.length === 0) tasksToMap = allTasks.slice(0, 50);
    }

    // Map tasks to Calendar Events
    const events = tasksToMap.map((t: any) => {
      const isCompleted = t.status === 'COMPLETED' || t.progress === 100;
      let colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";
      if (isCompleted) {
        colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800";
      } else if (t.dueDate && new Date(t.dueDate) < new Date()) {
        colorClass = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800";
      }

      return {
        id: `task-${t.id}`,
        title: t.title,
        date: t.dueDate ? parseISO(t.dueDate) : (t.createdAt ? parseISO(t.createdAt) : new Date()),
        type: "task",
        colorClass,
        isCompleted
      };
    });

    // Nếu là tab "Lịch họp", ta tạo mock data (Vì API task không chứa cuộc họp rõ ràng)
    if (activeTab === "meeting") {
      const meetingEvents = [];
      const baseDate = new Date();
      // Generate 5 mock meetings this month
      for (let i = 1; i <= 5; i++) {
        const mDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), i * 5);
        meetingEvents.push({
          id: `meet-${i}`,
          title: `Họp giao ban tuần ${i}`,
          date: mDate,
          type: "meeting",
          colorClass: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
          isCompleted: false
        });
      }
      return meetingEvents;
    }

    // Add some random meetings into 'all' tab as well just to show variation
    if (activeTab === "all") {
        const mDate = new Date(new Date().getFullYear(), new Date().getMonth(), 15);
        events.push({
            id: `meet-all`,
            title: `Họp phòng chuyên môn`,
            date: mDate,
            type: "meeting",
            colorClass: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
            isCompleted: false
        });
    }

    return events;
  }, [allTasks, activeTab]);

  // --- CALENDAR LOGIC ---
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Get events for this day
      const dayEvents = filteredEvents.filter(e => isSameDay(e.date, cloneDay));

      days.push(
        <div 
          key={day.toString()} 
          className={`flex flex-col p-2 border-r border-b border-slate-200 dark:border-slate-800 transition-colors
            ${!isSameMonth(day, monthStart) ? "bg-slate-50/50 dark:bg-slate-900/20 text-slate-400" : "bg-white dark:bg-slate-900"}
            ${isToday(day) ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}
          `}
        >
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
              ${isToday(day) ? "bg-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"}
            `}>
              {formattedDate}
            </span>
            {dayEvents.length > 0 && (
              <button 
                onClick={() => setSelectedDayEvents({ day: cloneDay, events: dayEvents })}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 transition-colors cursor-pointer"
              >
                Chi tiết ({dayEvents.length})
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden min-h-0 space-y-1.5 pr-1">
            {dayEvents.slice(0, 3).map((evt) => (
              <div 
                key={evt.id} 
                className={`text-xs p-1.5 rounded border ${evt.colorClass} truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1.5`}
                title={evt.title}
                onClick={() => setSelectedDayEvents({ day: cloneDay, events: dayEvents })}
              >
                {evt.type === 'meeting' ? <Video className="w-3 h-3 shrink-0" /> : 
                 evt.isCompleted ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Clock className="w-3 h-3 shrink-0" />}
                <span className="truncate">{evt.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div 
                className="text-[10px] text-slate-500 hover:text-slate-700 cursor-pointer pt-0.5 font-medium"
                onClick={() => setSelectedDayEvents({ day: cloneDay, events: dayEvents })}
              >
                + {dayEvents.length - 3} sự kiện nữa...
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 flex-1 min-h-0" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="p-6 md:p-8 h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            Lịch công tác
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Quản lý công việc và cuộc họp trực quan theo mốc thời gian.
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="flex flex-col flex-1 min-h-0 space-y-4" onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-sm rounded-lg flex-wrap h-auto shrink-0">
          <TabsTrigger value="all" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50">
            <Briefcase className="w-4 h-4 mr-2" />
            Lịch xử lý công việc
          </TabsTrigger>
          <TabsTrigger value="personal" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50">
            <User className="w-4 h-4 mr-2" />
            Lịch cá nhân
          </TabsTrigger>
          <TabsTrigger value="unit" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50">
            <Users className="w-4 h-4 mr-2" />
            Lịch đơn vị
          </TabsTrigger>
          <TabsTrigger value="meeting" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50">
            <Video className="w-4 h-4 mr-2" />
            Lịch họp
          </TabsTrigger>
        </TabsList>

        <Card className="flex flex-col flex-1 min-h-0 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="shrink-0 flex flex-col md:flex-row items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                {format(currentDate, "MMMM 'năm' yyyy", { locale: viLocale })}
              </CardTitle>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" onClick={goToToday} className="mr-2">
                Hôm nay
              </Button>
              <Button variant="outline" size="icon" onClick={prevMonth} className="w-8 h-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="w-8 h-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col flex-1 min-h-0 p-0">
            {/* Lưới Lịch */}
            <div className="flex flex-col w-full h-full bg-white dark:bg-slate-900">
              {/* Header các thứ trong tuần */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                {weekDays.map((wd) => (
                  <div key={wd} className="py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800 last:border-0">
                    {wd}
                  </div>
                ))}
              </div>
              
              {/* Nội dung ngày */}
              <div className="flex flex-col flex-1 min-h-0">
                {rows}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Chú thích màu sắc */}
        <div className="flex items-center gap-6 pt-2 pb-1 px-2 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span> Đang xử lý
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Hoàn thành
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-rose-400"></span> Trễ hạn
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-purple-400"></span> Cuộc họp
          </div>
        </div>
      </Tabs>

      {/* Modal chi tiết sự kiện của ngày */}
      <Dialog open={!!selectedDayEvents} onOpenChange={(open) => !open && setSelectedDayEvents(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              Sự kiện ngày {selectedDayEvents?.day && format(selectedDayEvents.day, "dd/MM/yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 mt-4">
            {selectedDayEvents?.events.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Không có sự kiện nào.</p>
            ) : (
              selectedDayEvents?.events.map((evt) => (
                <div 
                  key={evt.id} 
                  className={`p-3 rounded-lg border ${evt.colorClass} flex flex-col gap-1.5`}
                >
                  <div className="flex items-start gap-2">
                    {evt.type === 'meeting' ? <Video className="w-4 h-4 shrink-0 mt-0.5" /> : 
                    evt.isCompleted ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <Clock className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span className="font-semibold text-sm leading-tight">{evt.title}</span>
                  </div>
                  <span className="text-xs opacity-80 ml-6">
                    {evt.type === 'meeting' ? 'Lịch họp' : (evt.isCompleted ? 'Hoàn thành' : 'Đang xử lý / Trễ hạn')}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
