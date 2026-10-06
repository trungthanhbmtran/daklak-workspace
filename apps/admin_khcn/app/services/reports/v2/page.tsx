'use client';
import React from 'react';
import { ReportWorkspace } from '../../../../features/reports/components/reports/v2/ReportWorkspace';

export default function ReportDesignerV2Page() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      <ReportWorkspace />
    </div>
  );
}
