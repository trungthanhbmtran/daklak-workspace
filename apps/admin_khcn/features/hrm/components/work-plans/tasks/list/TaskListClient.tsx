'use client';

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTasksList } from '@/features/hrm/hooks';
import { hrmTasksApi } from '@/features/hrm/api';
import { hrmKeys } from '@/features/hrm/keys';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';

import { TaskStatsBar } from './components/TaskStatsBar';
import { TaskToolbar, TAB_META } from './components/TaskToolbar';
import type { TaskTab } from './components/TaskToolbar';
import { TaskGrid } from './components/TaskGrid';
import { TaskTable } from './components/TaskTable';
import { SmartAssignDrawer } from '../assign/SmartAssignDrawer';

import { useDebounce } from './hooks/useDebounce';

const TaskDetailDialog = lazy(() =>
  import('./components/TaskDetailDialog').then((m) => ({ default: m.TaskDetailDialog })),
);

// ──────────────────────────────────────────────────────────────────────────────

/**
 * TaskListClient — 3 tab phân tách rõ:
 *
 *  ① PENDING_ASSIGN  : Chờ giao — chỉ phân công, không thực thi
 *  ② MY_EXECUTION    : Việc của tôi — chỉ thực thi, không phân công
 *  ③ I_ASSIGNED      : Tôi đã giao — chỉ theo dõi tiến độ
 *
 *  Mỗi tab truyền `context` xuống TaskGrid/TaskTable/TaskDetailDialog
 *  để chỉ render đúng action button — không lẫn lộn chức năng.
 */
export const TaskListClient = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const qc = useQueryClient();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<TaskTab>('PENDING_ASSIGN');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const debouncedStatus = useDebounce(statusFilter, 300);
  const debouncedPriority = useDebounce(priorityFilter, 300);

  // ── Query theo tab — mỗi tab có bộ filter riêng biệt ──────────────────────

  // Tab ①: Chờ giao — nhiệm vụ UNASSIGNED từ kế hoạch (người quản lý tạo)
  const { data: pendingAssignData, isLoading: isLoadingPending, isFetching: isFetchingPending, refetch: refetchPending } = useTasksList({
    search: searchQuery,
    assigneeCode: 'UNASSIGNED',
    priority: debouncedPriority === 'ALL' ? undefined : debouncedPriority,
    status: debouncedStatus === 'ALL' ? 'TODO' : debouncedStatus,
  });

  // Tab ②: Việc của tôi — nhiệm vụ đã được giao cho tôi
  const { data: myExecutionData, isLoading: isLoadingMine, isFetching: isFetchingMine, refetch: refetchMine } = useTasksList({
    search: searchQuery,
    role: 'ASSIGNEE',  // server filter theo participant role
    status: debouncedStatus === 'ALL' ? undefined : debouncedStatus,
    priority: debouncedPriority === 'ALL' ? undefined : debouncedPriority,
  });

  // Tab ③: Tôi đã giao — nhiệm vụ tôi giao (OWNER role)
  const { data: iAssignedData, isLoading: isLoadingIAssigned, isFetching: isFetchingIAssigned, refetch: refetchIAssigned } = useTasksList({
    search: searchQuery,
    role: 'OWNER',
    priority: debouncedPriority === 'ALL' ? undefined : debouncedPriority,
  });

  // ── Data theo tab đang active ──────────────────────────────────────────────
  const activeData = activeTab === 'PENDING_ASSIGN' ? pendingAssignData
    : activeTab === 'MY_EXECUTION' ? myExecutionData
    : iAssignedData;

  const isLoading = activeTab === 'PENDING_ASSIGN' ? isLoadingPending
    : activeTab === 'MY_EXECUTION' ? isLoadingMine
    : isLoadingIAssigned;

  const isFetching = activeTab === 'PENDING_ASSIGN' ? isFetchingPending
    : activeTab === 'MY_EXECUTION' ? isFetchingMine
    : isFetchingIAssigned;

  const refetch = activeTab === 'PENDING_ASSIGN' ? refetchPending
    : activeTab === 'MY_EXECUTION' ? refetchMine
    : refetchIAssigned;

  const allTasks = (activeData?.data || []) as any[];

  // Counts cho badges
  const pendingCount = (pendingAssignData?.data || []).length;
  const mineCount = (myExecutionData?.data || []).length;
  const assignedCount = (iAssignedData?.data || []).length;

  // ── Categories ──────────────────────────────────────────────────────────────
  const { data: prioritiesRes }: any = useGetCategoryByGroup('TASK_PRIORITY');
  const priorities = prioritiesRes?.data || [];

  const { data: statusRes }: any = useGetCategoryByGroup('TASK_STATUS');
  const taskStatusCategories = statusRes?.data || [];

  const { data: roleRes }: any = useGetCategoryByGroup('TASK_ROLE');
  const taskRoleCategories = roleRes?.data || [];

  // ── StatsBar filter (chỉ áp dụng với tab PENDING và MY_EXECUTION) ──────────
  const displayedTasks = useMemo(() => {
    if (!activeFilter || activeTab === 'I_ASSIGNED') return allTasks;
    return allTasks.filter((task: any) => {
      const due = task.dueDate ? new Date(task.dueDate) : null;
      const now = new Date();
      if (due) due.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (activeFilter === 'doneInTime' || activeFilter === 'doneOverdue') {
        if (task.status !== 'DONE') return false;
        const completed = new Date(task.completedAt || task.updatedAt || Date.now());
        completed.setHours(0, 0, 0, 0);
        const late = due ? completed > due : false;
        return activeFilter === 'doneOverdue' ? late : !late;
      }

      if (task.status === 'DONE') return false;
      if (!due) return activeFilter === 'inTime';
      const diff = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
      if (activeFilter === 'overdue') return diff < 0;
      if (activeFilter === 'warning') return diff >= 0 && diff <= 3;
      if (activeFilter === 'inTime') return diff > 3;
      return true;
    });
  }, [allTasks, activeFilter, activeTab]);

  // ── Prefetch ─────────────────────────────────────────────────────────────────
  const handlePrefetchTask = useCallback((task: any) => {
    if (!task?.id) return;
    qc.prefetchQuery({
      queryKey: hrmKeys.taskComments(task.id),
      queryFn: () => hrmTasksApi.getComments(String(task.id)),
      staleTime: 20_000,
    });
    qc.prefetchQuery({
      queryKey: hrmKeys.taskSubtasks(task.id),
      queryFn: () => hrmTasksApi.getSubTasks(String(task.id)),
      staleTime: 20_000,
    });
  }, [qc]);

  const handleSelectTask = useCallback((task: any) => setSelectedTask(task), []);
  const handleSmartAssign = useCallback((task: any) => setTaskToAssign(task), []);
  const handleFilterChange = useCallback((id: string | null) => setActiveFilter(id), []);
  const handleCloseDetail = useCallback(() => setSelectedTask(null), []);

  // Khi đổi tab: reset filter
  const handleTabChange = useCallback((tab: TaskTab) => {
    setActiveTab(tab);
    setActiveFilter(null);
    setStatusFilter('ALL');
  }, []);

  const currentMeta = TAB_META[activeTab];

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">

      {/* Stale indicator */}
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-slate-800 shadow-md rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Đang cập nhật...
        </div>
      )}

      {/* Stats bar — chỉ hiện cho 2 tab đầu */}
      {activeTab !== 'I_ASSIGNED' && (
        <TaskStatsBar
          tasks={allTasks}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Toolbar */}
      <TaskToolbar
        activeTab={activeTab}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        viewMode={viewMode}
        onTabChange={handleTabChange}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onViewChange={setViewMode}
        taskStatusCategories={taskStatusCategories}
        counts={{
          pendingAssign: pendingCount,
          myExecution: mineCount,
          iAssigned: assignedCount,
        }}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">
            {activeTab === 'PENDING_ASSIGN' ? '🗂️' : activeTab === 'MY_EXECUTION' ? '✅' : '📊'}
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
            {currentMeta.emptyMessage}
          </h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            {currentMeta.emptyHint}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <TaskGrid
          tasks={displayedTasks}
          priorities={priorities}
          taskStatusCategories={taskStatusCategories}
          context={activeTab}
          onSelectTask={handleSelectTask}
          onSmartAssign={handleSmartAssign}
          onHoverTask={handlePrefetchTask}
        />
      ) : (
        <TaskTable
          tasks={displayedTasks}
          priorities={priorities}
          taskStatusCategories={taskStatusCategories}
          context={activeTab}
          onSelectTask={handleSelectTask}
          onSmartAssign={handleSmartAssign}
          onHoverTask={handlePrefetchTask}
        />
      )}

      {/* Detail Dialog — context phân tách actions */}
      {selectedTask && (
        <Suspense fallback={null}>
          <TaskDetailDialog
            task={selectedTask}
            priorities={priorities}
            taskStatusCategories={taskStatusCategories}
            taskRoleCategories={taskRoleCategories}
            context={activeTab}
            onClose={handleCloseDetail}
            onRefetch={refetch}
            onSmartAssign={handleSmartAssign}
            onSelectTask={handleSelectTask}
          />
        </Suspense>
      )}

      {/* Smart Assign Drawer — chỉ mở từ tab PENDING_ASSIGN */}
      <SmartAssignDrawer
        task={taskToAssign}
        open={!!taskToAssign}
        onOpenChange={(open) => !open && setTaskToAssign(null)}
        onAssignSuccess={() => { refetch(); refetchPending(); }}
      />
    </div>
  );
};
