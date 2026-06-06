'use client';

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useTasksList } from '@/features/hrm/hooks';
import { hrmTasksApi } from '@/features/hrm/api';
import { hrmKeys } from '@/features/hrm/keys';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';

// Sub-components (eager: luôn cần ngay khi render)
import { TaskStatsBar }  from './components/TaskStatsBar';
import { TaskToolbar }   from './components/TaskToolbar';
import { TaskGrid }      from './components/TaskGrid';
import { TaskTable }     from './components/TaskTable';
import { SmartAssignDrawer } from '../assign/SmartAssignDrawer';

// Lazy load: chỉ download khi user mở detail dialog lần đầu
const TaskDetailDialog = lazy(() =>
  import('./components/TaskDetailDialog').then((m) => ({ default: m.TaskDetailDialog })),
);

import { useDebounce } from './hooks/useDebounce';

// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'ALL' | 'MY_TASKS' | 'ASSIGNED_BY_ME' | 'DEPT_TASKS';

/**
 * TaskListClient — slim coordinator với performance optimizations:
 *
 *  ✅ debounce status/priority filter (300ms) → giảm API calls
 *  ✅ placeholderData (keepPreviousData) → không flash loading khi đổi filter
 *  ✅ prefetchQuery on task hover → dialog mở tức thì
 *  ✅ lazy load TaskDetailDialog → không download JS cho dialog khi không cần
 *  ✅ useCallback cho tất cả handlers → không re-render memo children
 */
export const TaskListClient = () => {
  const searchParams = useSearchParams();
  const searchQuery  = searchParams.get('search') || '';
  const qc = useQueryClient();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid');
  const [activeFilter,   setActiveFilter]   = useState<string | null>(null);
  const [activeTab,      setActiveTab]      = useState<Tab>('ALL');
  const [statusFilter,   setStatusFilter]   = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTask,   setSelectedTask]   = useState<any>(null);
  const [taskToAssign,   setTaskToAssign]   = useState<any>(null);

  // Debounce: chỉ gọi API khi user dừng thay đổi filter > 300ms
  const debouncedStatus   = useDebounce(statusFilter,   300);
  const debouncedPriority = useDebounce(priorityFilter, 300);

  // ── Data fetch ─────────────────────────────────────────────────────────────
  // queryKey phụ thuộc vào debounced values → ít network request hơn
  const { data, isLoading, isFetching, refetch } = useTasksList({
    search:   searchQuery,
    tab:      activeTab,
    status:   debouncedStatus   === 'ALL' ? undefined : debouncedStatus,
    priority: debouncedPriority === 'ALL' ? undefined : debouncedPriority,
  });

  const tasks       = (data?.data || []) as any[];
  const currentUser = (data as any)?.meta?.currentUser;

  const { data: prioritiesRes }: any = useGetCategoryByGroup('TASK_PRIORITY');
  const priorities = prioritiesRes?.data || [];

  // ── Derived tasks (filter stats cards) ───────────────────────────────────
  const displayedTasks = useMemo(() => {
    if (!activeFilter) return tasks;
    return tasks.filter((task: any) => {
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
      if (activeFilter === 'overdue')  return diff < 0;
      if (activeFilter === 'warning')  return diff >= 0 && diff <= 3;
      if (activeFilter === 'inTime')   return diff > 3;
      return true;
    });
  }, [tasks, activeFilter]);

  // ── Prefetch: bắt đầu fetch comments khi hover task card ─────────────────
  const handlePrefetchTask = useCallback((task: any) => {
    if (!task?.id) return;
    // Prefetch comments
    qc.prefetchQuery({
      queryKey: hrmKeys.taskComments(task.id),
      queryFn:  () => hrmTasksApi.getComments(String(task.id)),
      staleTime: 20_000,
    });
    // Prefetch subtasks
    qc.prefetchQuery({
      queryKey: hrmKeys.taskSubtasks(task.id),
      queryFn:  () => hrmTasksApi.getSubTasks(String(task.id)),
      staleTime: 20_000,
    });
  }, [qc]);

  // ── Stable handlers ───────────────────────────────────────────────────────
  const handleSelectTask   = useCallback((task: any) => setSelectedTask(task), []);
  const handleSmartAssign  = useCallback((task: any) => setTaskToAssign(task),  []);
  const handleFilterChange = useCallback((id: string | null) => setActiveFilter(id), []);
  const handleCloseDetail  = useCallback(() => setSelectedTask(null), []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">

      {/* Stale indicator (nhẹ, không flash loading) */}
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-slate-800 shadow-md rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Đang cập nhật...
        </div>
      )}

      {/* Stats */}
      <TaskStatsBar
        tasks={tasks}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Toolbar */}
      <TaskToolbar
        activeTab={activeTab}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        viewMode={viewMode}
        onTabChange={setActiveTab}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onViewChange={setViewMode}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
            {activeFilter
              ? 'Không có công việc nào phù hợp với bộ lọc'
              : activeTab === 'ASSIGNED_BY_ME' ? 'Bạn chưa giao công việc nào'
              : activeTab === 'MY_TASKS'       ? 'Bạn chưa có công việc nào được giao'
              : 'Hoan hô! Không có công việc nào'}
          </h3>
          <p className="text-slate-500 mt-2">
            {activeFilter
              ? 'Thử chọn một bộ lọc khác hoặc bỏ chọn.'
              : activeTab === 'ASSIGNED_BY_ME'
                ? 'Hãy phân công công việc từ Kế hoạch & Giao việc.'
                : 'Bạn đã hoàn thành tất cả hoặc chưa có công việc được giao.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <TaskGrid
          tasks={displayedTasks}
          priorities={priorities}
          onSelectTask={handleSelectTask}
          onSmartAssign={handleSmartAssign}
          onHoverTask={handlePrefetchTask}
        />
      ) : (
        <TaskTable
          tasks={displayedTasks}
          priorities={priorities}
          onSelectTask={handleSelectTask}
          onSmartAssign={handleSmartAssign}
          onHoverTask={handlePrefetchTask}
        />
      )}

      {/* Lazy-loaded Detail Dialog — JS chỉ download khi cần */}
      {selectedTask && (
        <Suspense fallback={null}>
          <TaskDetailDialog
            task={selectedTask}
            currentUser={currentUser}
            priorities={priorities}
            onClose={handleCloseDetail}
            onRefetch={refetch}
            onSmartAssign={handleSmartAssign}
            onSelectTask={handleSelectTask}
          />
        </Suspense>
      )}

      {/* Smart Assign Drawer */}
      <SmartAssignDrawer
        task={taskToAssign}
        open={!!taskToAssign}
        onOpenChange={(open) => !open && setTaskToAssign(null)}
        onAssignSuccess={() => refetch()}
      />
    </div>
  );
};
