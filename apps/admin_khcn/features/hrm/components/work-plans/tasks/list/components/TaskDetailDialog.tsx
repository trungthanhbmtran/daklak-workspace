'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar,
  MessageSquare, Target, AlertCircle, History,
} from 'lucide-react';
import { getDueDateDisplay } from '../utils';
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/shared/badges/TaskBadges';
import { WorkflowTimeline } from '@/features/workflow/components/WorkflowTimeline';
import { TaskChatContainer } from './TaskChatContainer';
import { TaskActionPanel } from './TaskActionPanel';
import { TaskDelegationTree } from './TaskDelegationTree';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';
import { useTaskChat } from '../hooks/useTaskChat';

function TaskChatBadge({ activeTaskId }: { activeTaskId: number | undefined }) {
  const { taskComments } = useTaskChat(activeTaskId);
  return (
    <Badge variant="secondary" className="rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border border-indigo-100">
      {taskComments.length} tin
    </Badge>
  );
}

const SubTaskModal = lazy(() => import('../../subtask/SubTaskModal').then(m => ({ default: m.SubTaskModal })));
const AiTaskBreakdownModal = lazy(() => import('../../subtask/AiTaskBreakdownModal').then(m => ({ default: m.AiTaskBreakdownModal })));
const CoordinationModal = lazy(() => import('../../coordination/CoordinationModal').then(m => ({ default: m.CoordinationModal })));
const AssignCoordinationModal = lazy(() => import('../../assign/AssignCoordinationModal').then(m => ({ default: m.AssignCoordinationModal })));

interface TaskDetailDialogProps {
  task: any | null;
  onClose: () => void;
  onSmartAssign: (task: any) => void;
  onSelectTask?: (task: any) => void;
  initialTab?: 'CHAT' | 'HISTORY';
  context?: any;
}

export function TaskDetailDialog({
  task,
  onClose,
  onSmartAssign,
  initialTab = 'CHAT',
  context = 'MY_EXECUTION',
}: TaskDetailDialogProps) {
  const [activeTask, setActiveTask] = React.useState(task);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'HISTORY'>(initialTab);

  React.useEffect(() => {
    setActiveTask(task);
  }, [task]);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
  const [isAiBreakdownModalOpen, setIsAiBreakdownModalOpen] = useState(false);
  const [isCoordinationModalOpen, setIsCoordinationModalOpen] = useState(false);
  const [isAssignCoordinationModalOpen, setIsAssignCoordinationModalOpen] = useState(false);
  
  const qc = useQueryClient();
  const fetchComments = () => {
    if (activeTask?.id) {
      qc.invalidateQueries({ queryKey: hrmKeys.taskComments(activeTask.id) });
    }
  };

  if (!activeTask) return null;

  const dueInfo = getDueDateDisplay(activeTask.dueDate, activeTask.status);
  const allowedActions = activeTask.allowedActions || [];

  return (
    <>
      <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-screen sm:w-[98vw] xl:w-[95vw] max-w-[1600px] h-dvh sm:h-[97vh] font-sans p-0 overflow-hidden rounded-none sm:rounded-[2rem] border-0 sm:border border-slate-200/50 dark:border-slate-700/50 shadow-2xl bg-slate-50 dark:bg-slate-900 flex flex-col">
          <div className="flex flex-col flex-1 min-h-0">

            {/* ── TOP HEADER ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="scale-90 origin-left shrink-0">
                  <TaskStatusBadge code={activeTask.status || 'TODO'} showIcon />
                </div>
                <div className="hidden sm:block">
                  <TaskPriorityBadge code={activeTask.priority || 'NORMAL'} className="px-3 py-1 text-[11px]" />
                </div>
                {activeTask.plan && (
                  <Badge variant="outline" className="hidden md:flex bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-1 rounded-lg font-bold items-center gap-1.5 shrink-0">
                    <Target className="w-3.5 h-3.5" /> {activeTask.plan.title}
                  </Badge>
                )}
                <h2 className="font-black text-slate-700 dark:text-slate-200 text-[15px] truncate">{activeTask.title}</h2>
              </div>
              {activeTask.dueDate && (
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold shrink-0 ${dueInfo.color} ${dueInfo.bg} border ${dueInfo.border}`}>
                  <Calendar className="w-4 h-4" />
                  {new Date(activeTask.dueDate).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>

            {/* ── 3 COLUMNS ── */}
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_320px_320px] 2xl:grid-cols-[1fr_340px_340px] divide-y xl:divide-y-0 xl:divide-x divide-slate-200 dark:divide-slate-800">

                {/* ── COL 1: Mô tả + Chat ── */}
                <div className="flex flex-col gap-0 overflow-y-auto">
                  {activeTask.status === 'PENDING_APPROVAL' && (
                    <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 p-3 px-6 flex items-center gap-2 text-[13px] font-bold border-b border-fuchsia-100 dark:border-fuchsia-800">
                      <AlertCircle className="w-4 h-4" /> ⏳ Đang chờ lãnh đạo nghiệm thu... (Tạm khóa)
                    </div>
                  )}
                  {/* Description */}
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-4 h-[2px] bg-slate-300 rounded" /> Mô tả công việc
                    </h3>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5  bg-linear-to-br from-indigo-400 to-indigo-200 rounded-full" />
                      <div className="pl-5 text-slate-600 dark:text-slate-300 leading-relaxed text-[14.5px] whitespace-pre-wrap">
                        {activeTask.description || <span className="italic opacity-50">Chưa có mô tả chi tiết...</span>}
                      </div>
                    </div>
                  </div>

                  {/* Chat & History */}
                  <div className="flex flex-col flex-1 min-h-[360px]">
                    <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setActiveTab('CHAT')}
                          className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                            activeTab === 'CHAT' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Trao đổi
                        </button>
                        <button
                          onClick={() => setActiveTab('HISTORY')}
                          className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                            activeTab === 'HISTORY' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <History className="w-3.5 h-3.5" /> Lịch sử
                        </button>
                      </div>
                      
                      {activeTab === 'CHAT' && (
                        <TaskChatBadge activeTaskId={activeTask?.id} />
                      )}
                    </div>

                    {/* Content Area */}
                    {activeTab === 'HISTORY' ? (
                      <div className="flex-1 overflow-y-auto px-6 bg-slate-50/20 dark:bg-slate-900/10 max-h-[465px]">
                        <WorkflowTimeline instanceId={activeTask.workflowInstId} />
                      </div>
                    ) : (
                      <TaskChatContainer
                        activeTask={activeTask}
                        allowedActions={allowedActions}
                      />
                    )}
                  </div>
                </div>

                {/* ── COL 2: Nhân sự + Thao tác + Thời hạn ── */}
                <TaskActionPanel
                  activeTask={activeTask}
                  context={context}
                  allowedActions={allowedActions}
                  dueInfo={dueInfo}
                  onSmartAssign={onSmartAssign}
                  onOpenSubTaskModal={() => setIsSubTaskModalOpen(true)}
                  onOpenAiBreakdownModal={() => setIsAiBreakdownModalOpen(true)}
                  onOpenCoordinationModal={() => setIsCoordinationModalOpen(true)}
                  onCloseDialog={() => onClose()}
                />

                {/* ── COL 3: Cây công việc ── */}
              <TaskDelegationTree
                rootTaskId={task?.rootTaskId || task?.id}
                activeTaskId={activeTask?.id}
                onSelectTask={setActiveTask}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modals ── */}
      {isSubTaskModalOpen && (
        <Suspense fallback={null}>
          <SubTaskModal
            isOpen={isSubTaskModalOpen}
            onClose={(created) => {
              setIsSubTaskModalOpen(false);
              if (created) {
                qc.invalidateQueries({ queryKey: hrmKeys.taskSubtasks(task?.rootTaskId || task?.id) });
              }
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
              if (created) {
                qc.invalidateQueries({ queryKey: hrmKeys.taskSubtasks(task?.rootTaskId || task?.id) });
              }
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
            onSuccess={() => {
              fetchComments();
            }}
          />
        </Suspense>
      )}
    </>
  );
}
