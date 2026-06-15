'use client';

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTasksList } from '@/features/hrm/hooks';
import { hrmTasksApi } from '@/features/hrm/api';
import { hrmKeys } from '@/features/hrm/keys';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';

import { TaskToolbar, TaskRoleFilter } from './components/TaskToolbar';
import { GlobalTaskTree } from './components/GlobalTaskTree';
import { TaskStatsBar } from './components/TaskStatsBar';
import { SmartAssignDrawer } from '../assign/SmartAssignDrawer';
import { CreateTaskModal } from './components/CreateTaskModal';

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

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const debouncedStatus = useDebounce(statusFilter, 300);
  const debouncedPriority = useDebounce(priorityFilter, 300);
  const debouncedSearch = useDebounce(searchQuery, 400);

  // ── Unified Data Fetching ──────────────────────────────────────────────────
  const { data: tasksResponse, isLoading, isFetching, refetch } = useTasksList({
    search: debouncedSearch,
    priority: debouncedPriority === 'ALL' ? undefined : debouncedPriority,
    status: debouncedStatus === 'ALL' ? undefined : debouncedStatus,
    role: (roleFilter !== 'ALL' && roleFilter !== 'UNASSIGNED') ? roleFilter : undefined,
    assigneeCode: roleFilter === 'UNASSIGNED' ? 'UNASSIGNED' : undefined,
  });

  // --- MOCK DATA FOR TESTING UI ---
  const MOCK_TASKS = useMemo(() => [
    {
      id: 'mock-1',
      title: 'Dự án Cải tiến Hệ thống Quản lý',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeCode: 'vonguyenhoangnam',
      assigneeName: 'Võ Nguyễn Hoàng Nam',
      assignerCode: 'admin',
      creatorEmployeeCode: 'admin',
      dueDate: '2026-06-30T00:00:00Z',
      parentId: null,
      allowedActions: ['EDIT', 'ASSIGN', 'ADD_SUBTASK', 'COMPLETE']
    },
    {
      id: 'mock-2',
      title: 'Thiết kế giao diện',
      status: 'DONE',
      priority: 'MEDIUM',
      assigneeCode: 'vonguyenhoangnam',
      assigneeName: 'Võ Nguyễn Hoàng Nam',
      assignerCode: 'admin',
      creatorEmployeeCode: 'admin',
      dueDate: '2026-06-20T00:00:00Z',
      parentId: 'mock-1',
      allowedActions: ['COMPLETE']
    },
    {
      id: 'mock-3',
      title: 'Tích hợp API backend',
      status: 'TODO',
      priority: 'HIGH',
      assigneeCode: 'UNASSIGNED',
      assigneeName: '',
      assignerCode: 'vonguyenhoangnam',
      creatorEmployeeCode: 'vonguyenhoangnam',
      dueDate: '2026-06-25T00:00:00Z',
      parentId: 'mock-1',
      allowedActions: ['ASSIGN', 'EDIT']
    },
    {
      id: 'mock-4',
      title: 'Kiểm thử ứng dụng (QA)',
      status: 'REVIEWING',
      priority: 'LOW',
      assigneeCode: 'tester01',
      assigneeName: 'Nhân viên Test',
      supervisorCode: 'vonguyenhoangnam', // Test Approver role
      dueDate: '2026-06-28T00:00:00Z',
      parentId: 'mock-1',
      allowedActions: ['RETURN', 'COMPLETE']
    },
    {
      id: 'mock-5',
      title: 'Chuẩn bị tài liệu hướng dẫn',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeCode: 'doc_writer',
      assigneeName: 'Người viết tài liệu',
      coassigneeCodes: ['vonguyenhoangnam'], // Test Coordinator role
      dueDate: '2026-07-05T00:00:00Z',
      parentId: null,
      allowedActions: ['CHAT']
    }
  ], []);

  // Merge mock tasks with real tasks, and fallback to testing user code
  const allTasks = [...MOCK_TASKS, ...(tasksResponse?.data || [])] as any[];
  const currentUserCode = tasksResponse?.meta?.currentUserCode || 'vonguyenhoangnam';

  // ── Categories ──────────────────────────────────────────────────────────────
  const { data: prioritiesRes }: any = useGetCategoryByGroup('TASK_PRIORITY');
  const priorities = prioritiesRes?.data || [];

  const { data: statusRes }: any = useGetCategoryByGroup('TASK_STATUS');
  const taskStatusCategories = statusRes?.data || [];

  const { data: roleRes }: any = useGetCategoryByGroup('TASK_ROLE');
  const taskRoleCategories = roleRes?.data || [];

  // ── StatsBar filter ────────────────────────────────────────────────────────
  const displayedTasks = useMemo(() => {
    if (!activeFilter) return allTasks;
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
  }, [allTasks, activeFilter]);

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
        tasks={allTasks}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Toolbar */}
      <TaskToolbar
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        onRoleChange={(v) => { setRoleFilter(v); setActiveFilter(null); setStatusFilter('ALL'); }}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onSearchChange={setSearchQuery}
        onCreateTask={handleCreateTask}
        taskStatusCategories={taskStatusCategories}
      />

      {/* Tree Content */}
      <GlobalTaskTree
        tasks={displayedTasks}
        isLoading={isLoading}
        currentUserCode={"currentUserCode"}
        onSelectTask={handleSelectTask}
        onSmartAssign={handleSmartAssign}
      />

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
