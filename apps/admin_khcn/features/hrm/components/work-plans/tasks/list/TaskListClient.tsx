'use client';

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTasksList, useTaskStats } from '@/features/hrm/hooks';
import { hrmTasksApi } from '@/features/hrm/api';
import { hrmKeys } from '@/features/hrm/keys';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';

import { TaskToolbar, TaskRoleFilter } from './components/TaskToolbar';
import { GlobalTaskTree } from './components/GlobalTaskTree';
import { TaskStatsBar } from './components/TaskStatsBar';
import { SmartAssignDrawer } from '../assign/SmartAssignDrawer';
import { CreateTaskModal } from './components/CreateTaskModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';

import { useDebounce } from './hooks/useDebounce';

const TaskDetailDialog = lazy(() =>
  import('./components/TaskDetailDialog').then((m) => ({ default: m.TaskDetailDialog })),
);

export const TaskListClient = () => {
  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get('search') || '';
  const qc = useQueryClient();

  const [roleFilter, setRoleFilter] = useState<TaskRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const debouncedStatus = useDebounce(statusFilter, 300);
  const debouncedPriority = useDebounce(priorityFilter, 300);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data: tasksResponse, isLoading, isFetching, refetch } = useTasksList({
    search: debouncedSearch,
    priority: debouncedPriority === 'ALL' ? undefined : debouncedPriority,
    status: debouncedStatus === 'ALL' ? undefined : debouncedStatus,
    role: (roleFilter !== 'ALL' && roleFilter !== 'UNASSIGNED') ? roleFilter : undefined,
    assigneeCode: roleFilter === 'UNASSIGNED' ? 'UNASSIGNED' : undefined,
    statsFilter: activeFilter || undefined,
    page,
    limit: pageSize,
  });

  const { data: statsResponse } = useTaskStats({
    search: debouncedSearch,
    priority: debouncedPriority === 'ALL' ? undefined : debouncedPriority,
    role: (roleFilter !== 'ALL' && roleFilter !== 'UNASSIGNED') ? roleFilter : undefined,
    assigneeCode: roleFilter === 'UNASSIGNED' ? 'UNASSIGNED' : undefined,
  });

  // --- NO MOCK DATA ---
  // Using real data from backend API


  // Use only real tasks
  const allTasks = tasksResponse?.data || [];
  const meta = tasksResponse?.meta || {};
  const totalPages = meta.pagination?.totalPages || 1;

  // ── Categories ──────────────────────────────────────────────────────────────
  const { data: prioritiesRes }: any = useGetCategoryByGroup('TASK_PRIORITY');
  const priorities = prioritiesRes?.data || [];

  const { data: statusRes }: any = useGetCategoryByGroup('TASK_STATUS');
  const taskStatusCategories = statusRes?.data || [];

  const { data: roleRes }: any = useGetCategoryByGroup('TASK_ROLE');
  const taskRoleCategories = roleRes?.data || [];

  // ── StatsBar filter ────────────────────────────────────────────────────────
  // We use server-side statsFilter so no need to filter displayedTasks in JS anymore
  const displayedTasks = allTasks;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectTask = useCallback((task: any) => setSelectedTask(task), []);
  const handleSmartAssign = useCallback((task: any) => setTaskToAssign(task), []);
  const handleCloseDetail = useCallback(() => setSelectedTask(null), []);
  const handleFilterChange = useCallback((id: string | null) => setActiveFilter(id), []);

  const handleCreateTask = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback((created?: boolean) => {
    setIsCreateModalOpen(false);
    if (created) {
      refetch();
    }
  }, [refetch]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-sans">
      {/* Stale indicator */}
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-slate-800 shadow-md rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Đang cập nhật...
        </div>
      )}

      {/* Stats bar */}
      <TaskStatsBar
        stats={statsResponse?.data || { overdue: 0, warning: 0, inTime: 0, doneInTime: 0, doneOverdue: 0 }}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Toolbar */}
      <TaskToolbar
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        onRoleChange={(v) => { setRoleFilter(v); setActiveFilter(null); setStatusFilter('ALL'); setPage(1); }}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        onPriorityChange={(v) => { setPriorityFilter(v); setPage(1); }}
        onSearchChange={(v) => { setSearchQuery(v); setPage(1); }}
        onCreateTask={handleCreateTask}
        taskStatusCategories={taskStatusCategories}
      />

      {/* Tree Content */}
      <GlobalTaskTree
        tasks={displayedTasks}
        isLoading={isLoading}
        onSelectTask={handleSelectTask}
        onSmartAssign={handleSmartAssign}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="py-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (
                  p === 1 || 
                  p === totalPages || 
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink 
                        isActive={page === p} 
                        onClick={() => setPage(p)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />

      {/* Detail Dialog */}
      {selectedTask && (
        <Suspense fallback={null}>
          <TaskDetailDialog
            task={selectedTask}
            priorities={priorities}
            taskStatusCategories={taskStatusCategories}
            taskRoleCategories={taskRoleCategories}
            context={roleFilter === 'UNASSIGNED' ? 'PENDING_ASSIGN' : 'MY_EXECUTION'}
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
        onAssignSuccess={refetch}
      />
    </div>
  );
};
