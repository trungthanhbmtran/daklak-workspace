"use client";

import React from 'react';
import { KpiCriteriaClient } from '@/features/hrm/components/performance/criteria/KpiCriteriaClient';

export default function CriteriaPage() {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50 font-sans antialiased min-w-0">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 bg-white">
          <KpiCriteriaClient />
        </div>
      </div>
    </div>
  );
}
