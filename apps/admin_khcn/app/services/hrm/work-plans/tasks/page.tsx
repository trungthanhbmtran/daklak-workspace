"use client";

import React from 'react';
import { TaskListClient } from '@/features/hrm/components/work-plans/tasks/list/TaskListClient';

export default function TasksPage() {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50 font-sans antialiased min-w-0">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          <TaskListClient />
        </div>
      </div>
    </div>
  );
}
