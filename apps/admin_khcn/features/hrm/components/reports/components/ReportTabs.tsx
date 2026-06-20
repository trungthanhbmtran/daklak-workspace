import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, CalendarDays, BarChart3, Presentation } from "lucide-react";

export const ReportTabs = React.memo(function ReportTabs() {
  return (
    <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-sm rounded-lg flex-wrap h-auto">
      <TabsTrigger value="progress" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
        <Activity className="w-4 h-4 mr-2" />
        Báo cáo tiến độ
      </TabsTrigger>
      <TabsTrigger value="week" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
        <CalendarDays className="w-4 h-4 mr-2" />
        Báo cáo tuần
      </TabsTrigger>
      <TabsTrigger value="month" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
        <BarChart3 className="w-4 h-4 mr-2" />
        Báo cáo tháng
      </TabsTrigger>
      <TabsTrigger value="quarter" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
        <BarChart3 className="w-4 h-4 mr-2" />
        Báo cáo quý
      </TabsTrigger>
      <TabsTrigger value="year" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
        <Presentation className="w-4 h-4 mr-2" />
        Báo cáo năm
      </TabsTrigger>
    </TabsList>
  );
});
