"use client";

import React from "react";
import { MasterPlanProvider } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanContext';
import { MasterPlanSidebar } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanSidebar';

export default function MasterPlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <MasterPlanProvider>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-120px)] p-6 bg-slate-50 overflow-hidden font-sans antialiased min-w-0">
        <MasterPlanSidebar />
        {children}
      </div>
    </MasterPlanProvider>
  );
}
