import React from 'react';
import { WorkflowBuilderClient } from '@/features/system-admin/workflows/components/WorkflowBuilderClient';

export default function WorkflowBuilderPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Thiết kế Luồng Nghiệp vụ (Workflow Builder)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kéo thả các tác nhân và điều kiện để thiết kế luồng xử lý tự động</p>
        </div>
      </div>
      
      {/* The canvas takes the remaining height */}
      <div className="flex-1 overflow-hidden">
        <WorkflowBuilderClient />
      </div>
    </div>
  );
}
