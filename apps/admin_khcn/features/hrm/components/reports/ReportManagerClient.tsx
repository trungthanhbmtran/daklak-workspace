/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Heading, Text } from "@/components/ui/typography";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Presentation } from "lucide-react";
import { isThisWeek, isThisMonth, isThisQuarter, isThisYear, parseISO } from "date-fns";

import { ReportTabs } from "./components/ReportTabs";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { ReportDataTable } from "./components/ReportDataTable";

export function ReportManagerClient() {
  const { data: tasksRes, isLoading } = useTasksList({ pageSize: 2000 });
  const allTasks = tasksRes?.data || [];

  const [activeTab, setActiveTab] = useState("progress");

  // --- Hàm Lọc Theo Mốc Thời Gian ---
  const filterTasksByTime = (timeMode: string) => {
    return allTasks.filter((task: any) => {
      if (!task.createdAt) return false;
      const date = parseISO(task.createdAt);
      switch (timeMode) {
        case "week": return isThisWeek(date);
        case "month": return isThisMonth(date);
        case "quarter": return isThisQuarter(date);
        case "year": return isThisYear(date);
        default: return true; // progress (Tất cả)
      }
    });
  };

  const tasks = filterTasksByTime(activeTab);

  const getTitlePrefix = (tab: string) => {
    switch (tab) {
      case "week": return "trong tuần";
      case "month": return "trong tháng";
      case "quarter": return "trong quý";
      case "year": return "trong năm";
      default: return "tổng";
    }
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Heading level="h1" className="text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Presentation className="h-8 w-8 text-indigo-600" />
            Quản lý báo cáo công việc
          </Heading>
          <Text variant="muted" className="mt-2">
            Tổng hợp và phân tích hiệu suất xử lý công việc theo các mốc thời gian.
          </Text>
        </div>
      </div>

      <Tabs defaultValue="progress" className="space-y-6" onValueChange={setActiveTab}>
        <ReportTabs />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ReportSummaryCards 
            isLoading={isLoading} 
            tasks={tasks} 
            titlePrefix={getTitlePrefix(activeTab)} 
          />
          <ReportDataTable 
            isLoading={isLoading} 
            tasks={tasks} 
          />
        </div>
      </Tabs>
    </div>
  );
}
