import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/typography';
import { Briefcase, User, Users, Video } from 'lucide-react';

export const CalendarTabs = React.memo(function CalendarTabs() {
  const triggerClass = "px-4 py-2 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-medium hover:text-primary";
  
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full bg-card p-2 sm:p-3 rounded-xl border border-border shadow-sm">
      <TabsList className="bg-muted/50 p-1.5 rounded-lg flex-wrap gap-1 h-auto shrink-0 self-start xl:self-auto">
        <TabsTrigger value="all" className={triggerClass}>
          <Briefcase className="w-4 h-4 mr-2" />
          Lịch xử lý công việc
        </TabsTrigger>
        <TabsTrigger value="personal" className={triggerClass}>
          <User className="w-4 h-4 mr-2" />
          Lịch cá nhân
        </TabsTrigger>
        <TabsTrigger value="unit" className={triggerClass}>
          <Users className="w-4 h-4 mr-2" />
          Lịch đơn vị
        </TabsTrigger>
        <TabsTrigger value="meeting" className={triggerClass}>
          <Video className="w-4 h-4 mr-2" />
          Lịch họp
        </TabsTrigger>
      </TabsList>
      
      {/* Chú thích màu sắc */}
      <div className="flex flex-wrap items-center gap-3 px-2 shrink-0">
        <Text variant="small" className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium bg-blue-100/50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/50">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> Đang xử lý
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-100/50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Hoàn thành
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-medium bg-rose-100/50 dark:bg-rose-900/30 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800/50">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span> Trễ hạn
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium bg-purple-100/50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/50">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span> Cuộc họp
        </Text>
      </div>
    </div>
  );
});
