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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { LayoutList, LayoutGrid, RefreshCw } from 'lucide-react';

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

  const [roleFilter, setRoleFilter] = useState<TaskRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [initialDetailTab, setInitialDetailTab] = useState<'CHAT' | 'HISTORY'>('CHAT');
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'kanban'>('tree');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedStatus = useDebounce(statusFilter, 300);
  const debouncedPriority = useDebounce(priorityFilter, 300);
  const debouncedSearch = useDebounce(searchQuery, 400);

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

  useEffect(() => {
    if (urlTaskId && !selectedTask) {
      hrmTasksApi.list({ id: Number(urlTaskId) }).then(res => {
        if (res.data && res.data.length > 0) {
          setSelectedTask(res.data[0]);
          setInitialDetailTab('CHAT');
        }
      }).catch(console.error);
    }
  }, [urlTaskId, selectedTask]);

  // ── Auto-refresh every 30s ────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      setLastRefresh(new Date());
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, [qc]);

  // ── Keyboard shortcut: N = New task ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Use only real tasks
  const allTasks = tasksResponse?.data || [];
  const meta = tasksResponse?.meta || {};
  const totalPages = meta.pagination?.totalPages || 1;

  // ── StatsBar filter ────────────────────────────────────────────────────────
  // We use server-side statsFilter so no need to filter displayedTasks in JS anymore
  const displayedTasks = allTasks;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectTask = useCallback((task: any) => { setSelectedTask(task); setInitialDetailTab('CHAT'); }, []);
  const handleSelectTaskHistory = useCallback((task: any) => { setSelectedTask(task); setInitialDetailTab('HISTORY'); }, []);
  const handleSmartAssign = useCallback((task: any) => setTaskToAssign(task), []);
  const handleCloseDetail = useCallback(() => setSelectedTask(null), []);
  const handleFilterChange = useCallback((id: string | null) => setActiveFilter(id), []);

  const handleCreateTask = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback((created?: boolean) => {
    setIsCreateModalOpen(false);
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-sans">
      {/* Stale indicator */}
      {(isFetching && !isLoading || isRefreshing) && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-slate-800 shadow-md rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-100">
          <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
          Đang cập nhật...
        </div>
      )}

      {/* Stats bar */}
      <TaskStatsBar
        stats={statsResponse?.data || { overdue: 0, warning: 0, inTime: 0, doneInTime: 0, doneOverdue: 0 }}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Toolbar + view toggle */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
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
          />
        </div>
        {/* View toggle + refresh info */}
        <div className="flex items-center gap-2 shrink-0 pb-1">
          <span className="hidden xl:block text-[10px] text-slate-400 font-medium">
            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted p-0.5">
            <button
              onClick={() => setViewMode('tree')}
              title="Dạng cây"
              className={`p-2 rounded-md transition-all ${
                viewMode === 'tree' ? 'bg-background shadow-sm text-indigo-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              title="Dạng bảng Kanban (theo bước)"
              className={`p-2 rounded-md transition-all ${
                viewMode === 'kanban' ? 'bg-background shadow-sm text-indigo-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            { key: 'plan', label: 'Chờ phân công', action: 'PLAN_ASSIGNMENT', color: 'border-violet-200 bg-violet-50/50 dark:bg-violet-900/10 dark:border-violet-800/40' },
            { key: 'assign', label: 'Chờ giao việc', action: 'ASSIGN', color: 'border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/40' },
            { key: 'progress', label: 'Đang thực hiện', action: 'IN_PROGRESS', color: 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800/40' },
            { key: 'complete', label: 'Chờ nghiệm thu', action: 'APPROVE', color: 'border-fuchsia-200 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 dark:border-fuchsia-800/40' },
            { key: 'done', label: 'Đã hoàn thành', action: 'DONE', color: 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800/40' },
          ].map((col) => {
            const colTasks = displayedTasks.filter((t: any) => {
              if (col.key === 'done') return t.status === 'DONE';
              if (col.key === 'complete') return t.status === 'PENDING_APPROVAL';
              if (col.key === 'progress') return t.status === 'IN_PROGRESS';
              if (col.key === 'assign') return (t.allowedActions || []).includes('ASSIGN');
              if (col.key === 'plan') return (t.allowedActions || []).includes('PLAN_ASSIGNMENT');
              return false;
            });
            return (
              <div key={col.key} className={`rounded-xl border-2 p-3 ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{col.label}</p>
                  <span className="text-[11px] font-black bg-white dark:bg-slate-800 border border-border rounded-full w-6 h-6 flex items-center justify-center shadow-sm">{colTasks.length}</span>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {colTasks.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-4 italic">Không có</p>
                  )}
                  {colTasks.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTask(t)}
                      className="bg-white dark:bg-slate-800 rounded-lg border border-border p-2.5 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                      <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">{t.title}</p>
                      {t.assigneeName && (
                        <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">{t.assigneeName}</p>
                      )}
                      {t.dueDate && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          📅 {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tree Content */}
      {viewMode === 'tree' && (
        <GlobalTaskTree
          tasks={displayedTasks}
          isLoading={isLoading}
          onSelectTask={handleSelectTask}
          onSelectTaskHistory={handleSelectTaskHistory}
          onSmartAssign={handleSmartAssign}
        />
      )}

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
      {isCreateModalOpen && (
        <Suspense fallback={null}>
          <CreateTaskModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
          />
        </Suspense>
      )}

      {/* Detail Dialog */}
      {selectedTask && (
        <Suspense fallback={null}>
          <TaskDetailDialog
            task={selectedTask}
            initialTab={initialDetailTab}
            context={roleFilter === 'UNASSIGNED' ? 'PENDING_ASSIGN' : 'MY_EXECUTION'}
            onClose={handleCloseDetail}
            onSmartAssign={handleSmartAssign}
            onSelectTask={handleSelectTask}
          />
        </Suspense>
      )}

      {/* Smart Assign Drawer */}
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
