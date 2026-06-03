"use client";

import React, { useState } from 'react';
import { MasterPlanProvider } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanContext';
import { MasterPlanSidebar } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanSidebar';
import { MasterPlanDetail } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanDetail';
import { TaskListClient } from '@/features/hrm/components/work-plans/tasks/TaskListClient';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Layers } from 'lucide-react';

export default function UnifiedWorkspacePage() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50 font-sans antialiased min-w-0">
      
      {/* Top Navigation Tabs */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex justify-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[500px]">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/80 rounded-xl h-12">
            <TabsTrigger value="personal" className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all h-full gap-2">
              <Briefcase className="w-4 h-4" /> Bảng việc Cá nhân
            </TabsTrigger>
            <TabsTrigger value="plans" className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all h-full gap-2">
              <Layers className="w-4 h-4" /> Điều hành Kế hoạch
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "personal" ? (
          <div className="h-full overflow-y-auto p-6">
            <TaskListClient />
          </div>
        ) : (
          <MasterPlanProvider>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full p-6 overflow-hidden">
              <MasterPlanSidebar />
              <MasterPlanDetail />
            </div>
          </MasterPlanProvider>
        )}
      </div>
    </div>
  );
}
