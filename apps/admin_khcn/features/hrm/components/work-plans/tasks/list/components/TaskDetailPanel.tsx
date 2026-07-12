'use client';

import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MessageSquare,
  AlertCircle,
  History,
  Target,
  X
} from 'lucide-react';
import { getDueDateDisplay } from '../utils';
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/shared/badges/TaskBadges';
import { WorkflowTimeline } from '@/features/workflow/components/WorkflowTimeline';
import { WorkflowStatusBadge } from '@/components/workflow/shared/WorkflowStatusBadge';
import { TaskChatContainer } from './TaskChatContainer';
import { TaskActionPanel } from './TaskActionPanel';
import { TaskHistoryList } from './TaskHistoryList';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';
import { useTaskChat } from '../hooks/useTaskChat';

// ─── Lazy modals ──────────────────────────────────────────────────────────────

const SubTaskModal = lazy(() =>
  import('../../subtask/SubTaskModal').then((m) => ({ default: m.SubTaskModal })),
);
const AiTaskBreakdownModal = lazy(() =>
  import('../../subtask/AiTaskBreakdownModal').then((m) => ({ default: m.AiTaskBreakdownModal })),
);
const CoordinationModal = lazy(() =>
  import('../../coordination/CoordinationModal').then((m) => ({ default: m.CoordinationModal })),
);
const AssignCoordinationModal = lazy(() =>
  import('../../assign/AssignCoordinationModal').then((m) => ({
    default: m.AssignCoordinationModal,
  })),
);

// ─── Chat badge (số tin nhắn) ─────────────────────────────────────────────────

function ChatCountBadge({ taskId }: { taskId: number | undefined }) {
  const { taskComments } = useTaskChat(taskId);
  if (taskComments.length === 0) return null;
  return (
    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
      {taskComments.length > 99 ? '99+' : taskComments.length}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskDetailPanelProps {
  task: any | null;
  onClose: () => void;
  onSmartAssign: (task: any) => void;
  onSelectTask?: (task: any) => void;
  initialTab?: 'CHAT' | 'HISTORY';
  context?: any;
}

// ─── TaskDetailPanel ─────────────────────────────────────────────────────────

export function TaskDetailPanel({
  task,
  onClose,
  onSmartAssign,
  initialTab = 'CHAT',
  context = 'MY_EXECUTION',
}: TaskDetailPanelProps) {
  const [activeTask, setActiveTask] = React.useState(task);
  const [leftTab, setLeftTab] = useState<'CHAT' | 'HISTORY'>(initialTab);

  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
  const [isAiBreakdownModalOpen, setIsAiBreakdownModalOpen] = useState(false);
  const [isCoordinationModalOpen, setIsCoordinationModalOpen] = useState(false);
  const [isAssignCoordinationModalOpen, setIsAssignCoordinationModalOpen] = useState(false);

  const qc = useQueryClient();

  React.useEffect(() => {
    setActiveTask(task);
    setLeftTab(initialTab);
  }, [task, initialTab]);

  const handleSelectSubTask = useCallback((node: any) => {
    setActiveTask(node);
    setLeftTab('CHAT');
  }, []);

  const fetchComments = useCallback(() => {
    if (activeTask?.id) {
      qc.invalidateQueries({ queryKey: hrmKeys.taskComments(activeTask.id) });
    }
  }, [activeTask?.id, qc]);

  if (!activeTask) return null;

  const dueInfo = getDueDateDisplay(activeTask.dueDate, activeTask.status);
  const allowedActions = activeTask.allowedActions || [];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden font-sans border border-border shadow-sm rounded-xl">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between px-5 py-3.5 border-b border-border bg-card sticky top-0 z-20 gap-3 shrink-0">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="shrink-0 mt-0.5">
            {activeTask.workflowInstId ? (
              <WorkflowStatusBadge status={activeTask.status || 'TODO'} showIcon />
            ) : (
              <TaskStatusBadge code={activeTask.status || 'TODO'} showIcon />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[15px] text-foreground leading-tight line-clamp-2">
              {activeTask.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <TaskPriorityBadge code={activeTask.priority || 'NORMAL'} className="text-[10px] px-2 py-0.5" />
              {activeTask.plan && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300">
                  <Target className="w-2.5 h-2.5" />
                  {activeTask.plan.title}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTask.dueDate && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold ${dueInfo.color} ${dueInfo.bg} border ${dueInfo.border}`}>
              <Calendar className="w-3.5 h-3.5" />
              {new Date(activeTask.dueDate).toLocaleDateString('vi-VN')}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors xl:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── WORKFLOW STEPS ── */}
      {activeTask.workflowInstId && (
        <div className="px-5 py-2 border-b border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-900/10 flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {[
            { key: 'plan',       label: 'Phân công', active: (activeTask.allowedActions || []).includes('PLAN_ASSIGNMENT') },
            { key: 'assign',     label: 'Giao việc',  active: (activeTask.allowedActions || []).includes('ASSIGN') },
            { key: 'inprogress', label: 'Thực hiện',  active: ['IN_PROGRESS', 'MONITOR'].some((a) => (activeTask.allowedActions || []).includes(a)) || activeTask.status === 'IN_PROGRESS' },
            { key: 'complete',   label: 'Báo cáo',   active: (activeTask.allowedActions || []).includes('COMPLETE') },
            { key: 'approve',    label: 'Nghiệm thu', active: (activeTask.allowedActions || []).includes('APPROVE') || activeTask.status === 'PENDING_APPROVAL' },
            { key: 'done',       label: 'Hoàn thành', active: activeTask.status === 'DONE' },
          ].map((step, idx, arr) => {
            const order = ['plan', 'assign', 'inprogress', 'complete', 'approve', 'done'];
            const currentIdx = order.indexOf(arr.find((s) => s.active)?.key || 'plan');
            const isDone = idx < currentIdx;
            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    step.active
                      ? 'bg-indigo-600 text-white'
                      : isDone
                      ? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/40 dark:text-indigo-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone && <span className="text-[9px]">✓</span>}
                  {step.label}
                </div>
                {idx < arr.length - 1 && (
                  <span className="text-muted-foreground text-[10px] shrink-0">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── BODY: 2 cột ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_260px] 2xl:grid-cols-[1fr_300px] divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">

        {/* ══ COL TRÁI: Mô tả + Tabs (Trao đổi | Lịch sử | Cây CV) ══ */}
        <div className="flex flex-col min-h-0 overflow-hidden">

          {activeTask.status === 'PENDING_APPROVAL' && (
            <div className="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-5 py-2.5 flex items-center gap-2 text-[12px] font-semibold border-b border-violet-100 dark:border-violet-800 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              ⏳ Đang chờ lãnh đạo nghiệm thu...
            </div>
          )}

          <div className="px-5 pt-4 pb-3 border-b border-border shrink-0">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Mô tả công việc
            </p>
            <div className="text-[14px] text-foreground/80 leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto pr-1">
              {activeTask.description || (
                <span className="italic text-muted-foreground">Chưa có mô tả...</span>
              )}
            </div>
          </div>

          <Tabs
            value={leftTab}
            onValueChange={(v) => setLeftTab(v as typeof leftTab)}
            className="flex-1 min-h-0 flex flex-col"
          >
            <TabsList className="shrink-0 rounded-none border-b border-border bg-transparent h-auto px-5 py-0 gap-0 justify-start overflow-x-auto hide-scrollbar">
              <TabsTrigger value="CHAT" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-4 py-2.5 text-[12px] font-bold gap-1.5 shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
                Trao đổi
                <ChatCountBadge taskId={activeTask?.id} />
              </TabsTrigger>
              <TabsTrigger value="HISTORY" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-4 py-2.5 text-[12px] font-bold gap-1.5 shrink-0">
                <History className="w-3.5 h-3.5" />
                Lịch sử
              </TabsTrigger>
            </TabsList>

            <TabsContent value="CHAT" className="flex-1 min-h-0 mt-0 flex flex-col data-[state=inactive]:hidden">
              <TaskChatContainer activeTask={activeTask} allowedActions={allowedActions} />
            </TabsContent>

            <TabsContent value="HISTORY" className="flex-1 min-h-0 mt-0 overflow-y-auto px-5 py-3 data-[state=inactive]:hidden">
              <WorkflowTimeline instanceId={activeTask.workflowInstId} />
              <TaskHistoryList taskId={activeTask.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* ══ COL PHẢI: Nhân sự + Thao tác + Thời hạn ══ */}
        <TaskActionPanel
          activeTask={activeTask}
          context={context}
          allowedActions={allowedActions}
          dueInfo={dueInfo}
          onSmartAssign={onSmartAssign}
          onOpenSubTaskModal={() => setIsSubTaskModalOpen(true)}
          onOpenAiBreakdownModal={() => setIsAiBreakdownModalOpen(true)}
          onOpenCoordinationModal={() => setIsCoordinationModalOpen(true)}
          onCloseDialog={onClose}
        />
      </div>

      {/* ── Nested Modals ── */}
      {isSubTaskModalOpen && (
        <Suspense fallback={null}>
          <SubTaskModal
            isOpen={isSubTaskModalOpen}
            onClose={(created) => {
              setIsSubTaskModalOpen(false);
              if (created) qc.invalidateQueries({ queryKey: hrmKeys.taskSubtasks(task?.rootTaskId || task?.id) });
            }}
            parentTask={activeTask}
            planId={activeTask?.planId}
          />
        </Suspense>
      )}

      {isAiBreakdownModalOpen && (
        <Suspense fallback={null}>
          <AiTaskBreakdownModal
            isOpen={isAiBreakdownModalOpen}
            onClose={(created) => {
              setIsAiBreakdownModalOpen(false);
              if (created) qc.invalidateQueries({ queryKey: hrmKeys.taskSubtasks(task?.rootTaskId || task?.id) });
            }}
            parentTask={activeTask}
            planId={activeTask?.planId}
          />
        </Suspense>
      )}

      {isCoordinationModalOpen && (
        <Suspense fallback={null}>
          <CoordinationModal
            task={activeTask}
            open={isCoordinationModalOpen}
            onOpenChange={setIsCoordinationModalOpen}
            onSuccess={() => fetchComments()}
          />
        </Suspense>
      )}

      {isAssignCoordinationModalOpen && (
        <Suspense fallback={null}>
          <AssignCoordinationModal
            task={activeTask}
            open={isAssignCoordinationModalOpen}
            onOpenChange={setIsAssignCoordinationModalOpen}
            onSuccess={() => fetchComments()}
          />
        </Suspense>
      )}
    </div>
  );
}
