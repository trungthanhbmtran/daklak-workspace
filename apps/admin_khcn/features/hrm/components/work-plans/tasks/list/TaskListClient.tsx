'use client';

import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTasksList, useTaskStats } from '@/features/hrm/hooks';
import { hrmTasksApi } from '@/features/hrm/api';
import { hrmKeys } from '@/features/hrm/keys';

import { TaskToolbar } from './components/TaskToolbar';
import { TaskRoleFilter } from '@/components/shared/badges/TaskBadges';
import { GlobalTaskTree } from './components/GlobalTaskTree';
import { TaskStatsBar } from './components/TaskStatsBar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { RefreshCw } from 'lucide-react';
import { useDebounce } from './hooks/useDebounce';

const TaskDetailDialog = lazy(() =>
  import('./components/TaskDetailDialog').then((m) => ({ default: m.TaskDetailDialog })),
);
const SmartAssignDrawer = lazy(() =>
  import('../assign/SmartAssignDrawer').then((m) => ({ default: m.SmartAssignDrawer })),
);
const CreateTaskModal = lazy(() =>
  import('./components/CreateTaskModal').then((m) => ({ default: m.CreateTaskModal })),
);

export const TaskListClient = () => {
  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get('search') || '';
  const urlTaskId = searchParams.get('taskId');
  const qc = useQueryClient();

  // ── Filters ──────────────────────────────────────────────────────────────
  const [roleFilter, setRoleFilter] = useState<TaskRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [initialDetailTab, setInitialDetailTab] = useState<'CHAT' | 'HISTORY'>('CHAT');
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedStatus = useDebounce(statusFilter, 300);
  const debouncedPriority = useDebounce(priorityFilter, 300);
  const debouncedSearch = useDebounce(searchQuery, 400);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: tasksResponse, isLoading, isFetching } = useTasksList({
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

  // ── URL task deep-link ────────────────────────────────────────────────────
  useEffect(() => {
    if (!urlTaskId) return;
    hrmTasksApi.list({ id: Number(urlTaskId) }).then(res => {
      if (res.data?.length > 0) {
        setSelectedTask(res.data[0]);
        setInitialDetailTab('CHAT');
      }
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTaskId]);

  // ── Auto-refresh 30s (bỏ qua khi đang mở dialog) ────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTask) return;
      setIsRefreshing(true);
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      setLastRefresh(new Date());
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, [qc, selectedTask]);

  // ── Keyboard: N = New task ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'n' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const allTasks = tasksResponse?.data || [];
  const meta = tasksResponse?.meta || {};
  const totalPages = meta.pagination?.totalPages || 1;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectTask = useCallback((task: any) => {
    setSelectedTask(task);
    setInitialDetailTab('CHAT');
  }, []);

  const handleSelectTaskHistory = useCallback((task: any) => {
    setSelectedTask(task);
    setInitialDetailTab('HISTORY');
  }, []);

  const handleSmartAssign = useCallback((task: any) => setTaskToAssign(task), []);
  const handleCloseDetail = useCallback(() => setSelectedTask(null), []);
  const handleFilterChange = useCallback((id: string | null) => setActiveFilter(id), []);

  const handleRoleChange = useCallback((v: TaskRoleFilter) => {
    setRoleFilter(v);
    setActiveFilter(null);
    setStatusFilter('ALL');
    setPage(1);
  }, []);

  // Xác định context theo role
  const dialogContext =
    roleFilter === 'UNASSIGNED' ? 'PENDING_ASSIGN'
      : (roleFilter === 'OWNER' || roleFilter === 'APPROVER' || roleFilter === 'COORDINATOR')
        ? 'I_ASSIGNED'
        : 'MY_EXECUTION';

  return (
    <div className="space-y-3 animate-in fade-in duration-300 font-sans">

      {/* ── Fetching indicator ── */}
      {(isFetching && !isLoading || isRefreshing) && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-background shadow-md rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border">
          <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
          Đang cập nhật...
        </div>
      )}

      {/* ── Toolbar ── */}
      <TaskToolbar
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        onRoleChange={handleRoleChange}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        onPriorityChange={(v) => { setPriorityFilter(v); setPage(1); }}
        onSearchChange={(v) => { setSearchQuery(v); setPage(1); }}
        onCreateTask={() => setIsCreateModalOpen(true)}
      />

      {/* ── Stats strip ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TaskStatsBar
          stats={statsResponse?.data || { overdue: 0, warning: 0, inTime: 0, doneInTime: 0, doneOverdue: 0 }}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        <span className="text-[10px] text-muted-foreground shrink-0">
          Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* ── Task tree ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <GlobalTaskTree
          tasks={allTasks}
          isLoading={isLoading}
          onSelectTask={handleSelectTask}
          onSelectTaskHistory={handleSelectTaskHistory}
          onSmartAssign={handleSmartAssign}
        />
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="py-2 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ── Modals ── */}
      {isCreateModalOpen && (
        <Suspense fallback={null}>
          <CreateTaskModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </Suspense>
      )}

      {selectedTask && (
        <Suspense fallback={null}>
          <TaskDetailDialog
            task={selectedTask}
            initialTab={initialDetailTab}
            context={dialogContext}
            onClose={handleCloseDetail}
            onSmartAssign={handleSmartAssign}
            onSelectTask={handleSelectTask}
          />
        </Suspense>
      )}

      {!!taskToAssign && (
        <Suspense fallback={null}>
          <SmartAssignDrawer
            task={taskToAssign}
            open={!!taskToAssign}
            onOpenChange={(open) => !open && setTaskToAssign(null)}
          />
        </Suspense>
      )}
    </div>
  );
};
