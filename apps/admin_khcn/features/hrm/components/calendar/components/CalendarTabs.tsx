import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/typography';
import { Briefcase, User, Users, Video } from 'lucide-react';

export const CalendarTabs = React.memo(function CalendarTabs() {
  return (
    <>
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
      
      {/* Chú thích màu sắc */}
      <div className="flex items-center gap-6 pt-2 pb-1 px-2 shrink-0">
        <Text variant="small" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-normal">
          <span className="w-3 h-3 rounded-full bg-blue-400"></span> Đang xử lý
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-normal">
          <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Hoàn thành
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-normal">
          <span className="w-3 h-3 rounded-full bg-rose-400"></span> Trễ hạn
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-normal">
          <span className="w-3 h-3 rounded-full bg-purple-400"></span> Cuộc họp
        </Text>
      </div>
    </>
  );
});
