"use client";

import React from 'react';
import { MasterPlanProvider } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanContext';
import { MasterPlanSidebar } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanSidebar';
import { MasterPlanDetail } from '@/features/hrm/components/work-plans/master-plans/master-plans-layout/MasterPlanDetail';

export default function MasterPlansPage() {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50 font-sans antialiased min-w-0">
      <div className="flex-1 overflow-hidden">
        <MasterPlanProvider>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full p-6 overflow-hidden">
            <MasterPlanSidebar />
            <MasterPlanDetail />
          </div>
        </MasterPlanProvider>
      </div>
    </div>
  );
}
