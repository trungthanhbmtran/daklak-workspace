import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/typography';
import { Briefcase, User, Users, Video } from 'lucide-react';

export const CalendarTabs = React.memo(function CalendarTabs() {
  return (
    <>
      <TabsList className="bg-muted border border-border p-1 shadow-sm rounded-lg flex-wrap h-auto shrink-0 self-start">
        <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <Briefcase className="w-4 h-4 mr-2" />
          Lịch xử lý công việc
        </TabsTrigger>
        <TabsTrigger value="personal" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <User className="w-4 h-4 mr-2" />
          Lịch cá nhân
        </TabsTrigger>
        <TabsTrigger value="unit" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <Users className="w-4 h-4 mr-2" />
          Lịch đơn vị
        </TabsTrigger>
        <TabsTrigger value="meeting" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <Video className="w-4 h-4 mr-2" />
          Lịch họp
        </TabsTrigger>
      </TabsList>
      
      {/* Chú thích màu sắc */}
      <div className="flex items-center gap-6 pt-1 pb-1 px-1 shrink-0">
        <Text variant="small" className="flex items-center gap-2 text-muted-foreground font-normal">
          <span className="w-3 h-3 rounded-full bg-blue-400"></span> Đang xử lý
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-muted-foreground font-normal">
          <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Hoàn thành
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-muted-foreground font-normal">
          <span className="w-3 h-3 rounded-full bg-rose-400"></span> Trễ hạn
        </Text>
        <Text variant="small" className="flex items-center gap-2 text-muted-foreground font-normal">
          <span className="w-3 h-3 rounded-full bg-purple-400"></span> Cuộc họp
        </Text>
      </div>
    </>
  );
});
