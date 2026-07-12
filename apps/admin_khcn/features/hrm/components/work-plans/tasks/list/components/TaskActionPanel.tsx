import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User, Split, CheckCircle2, Users, Reply,
  BarChart3, ArrowRight, Zap, Eye, Info,
  AlertTriangle, Calendar,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskDelegation } from '../hooks/useTaskDelegation';
import { cn } from '@/lib/utils';
import { useCategoryMap, TASK_WORKFLOW_ACTION_FALLBACK } from '@/features/hrm/hooks/useCategoryMaps';

interface TaskActionPanelProps {
  activeTask: any;
  context: any;
  allowedActions: string[];
  dueInfo: any;
  onSmartAssign: (task: any) => void;
  onOpenSubTaskModal: () => void;
  onOpenAiBreakdownModal: () => void;
  onOpenCoordinationModal: () => void;
  onCloseDialog: () => void;
}

const ACTION_UI_CONFIG: Record<
  string,
  { icon: React.ReactNode; variant: 'primary' | 'danger' | 'secondary'; desc?: string }
> = {
  PLAN_ASSIGNMENT: { icon: <Split className="w-4 h-4" />,        variant: 'primary',   desc: 'Xác định đơn vị chịu trách nhiệm' },
  ASSIGN:          { icon: <ArrowRight className="w-4 h-4" />,   variant: 'primary',   desc: 'Giao việc cho người thực hiện' },
  IN_PROGRESS:     { icon: <Zap className="w-4 h-4" />,          variant: 'primary',   desc: 'Xác nhận tiếp nhận và bắt đầu' },
  COMPLETE:        { icon: <CheckCircle2 className="w-4 h-4" />, variant: 'primary',   desc: 'Nộp kết quả và đề nghị nghiệm thu' },
  APPROVE:         { icon: <CheckCircle2 className="w-4 h-4" />, variant: 'primary',   desc: 'Xác nhận kết quả đạt yêu cầu' },
  MONITOR:         { icon: <Eye className="w-4 h-4" />,          variant: 'secondary', desc: 'Ghi nhận theo dõi tiến độ' },
  FORWARD:         { icon: <ArrowRight className="w-4 h-4" />,   variant: 'secondary', desc: 'Chuyển cho đơn vị khác' },
  COORDINATE:      { icon: <Users className="w-4 h-4" />,        variant: 'secondary', desc: 'Mời người tham gia phối hợp' },
  REJECT:          { icon: <Reply className="w-4 h-4" />,        variant: 'danger',    desc: 'Trả lại kết quả không đạt' },
  RETURN:          { icon: <Reply className="w-4 h-4" />,        variant: 'danger',    desc: 'Trả lại để thực hiện lại' },
  DONE:            { icon: <CheckCircle2 className="w-4 h-4" />, variant: 'primary' },
};

/** Avatar người dùng */
function PersonRow({ emoji, label, name, color }: { emoji: string; label: string; name: string; color: string }) {
  if (!name) return null;
  return (
    <div className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl border', color)}>
      <div className="w-8 h-8 rounded-full bg-current/10 flex items-center justify-center font-bold text-sm shrink-0">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{emoji} {label}</p>
        <p className="font-semibold text-[13px] truncate">{name}</p>
      </div>
    </div>
  );
}

export function TaskActionPanel({
  activeTask,
  context,
  allowedActions,
  dueInfo,
  onSmartAssign,
  onOpenSubTaskModal,
  onOpenAiBreakdownModal,
  onOpenCoordinationModal,
  onCloseDialog,
}: TaskActionPanelProps) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const { handleProcessTask } = useTaskActions(activeTask?.id);
  const { delegationChain } = useTaskDelegation(activeTask?.rootTaskId || activeTask?.id);
  const hasSubtasks = delegationChain.some((t: any) => t.parentId === activeTask?.id);

  const categoryLabels = useCategoryMap('TASK_WORKFLOW_ACTION');
  const getActionConfig = useCallback((name: string) => {
    const ui = ACTION_UI_CONFIG[name] ?? { icon: <BarChart3 className="w-4 h-4" />, variant: 'secondary' as const };
    const label = categoryLabels[name] || TASK_WORKFLOW_ACTION_FALLBACK[name] || name;
    return { ...ui, label };
  }, [categoryLabels]);

  const systemActions = ['ADD_SUBTASK', 'COORDINATE', 'EDIT', 'DELETE', 'CHAT'];
  const workflowActions = allowedActions.filter((a) => !systemActions.includes(a));
  const primaryActions = workflowActions.filter((a) => getActionConfig(a).variant === 'primary');
  const secondaryActions = workflowActions.filter((a) => getActionConfig(a).variant !== 'primary');

  const handleActionClick = useCallback((actionName: string) => {
    const cfg = getActionConfig(actionName);
    if (cfg.variant === 'danger' || actionName === 'RETURN' || actionName.includes('REJECT')) {
      setPendingAction(actionName);
      setIsRejectOpen(true);
    } else if (actionName === 'COORDINATE') {
      onOpenCoordinationModal();
    } else {
      handleProcessTask(actionName, undefined, onCloseDialog);
    }
  }, [getActionConfig, handleProcessTask, onOpenCoordinationModal, onCloseDialog]);

  const handleConfirmReject = useCallback(() => {
    if (pendingAction) {
      handleProcessTask(pendingAction, rejectReason, () => {
        setIsRejectOpen(false);
        setRejectReason('');
        setPendingAction(null);
        onCloseDialog();
      });
    }
  }, [pendingAction, rejectReason, handleProcessTask, onCloseDialog]);

  const isUnassigned = !activeTask.assigneeCode || activeTask.assigneeCode === 'UNASSIGNED';

  return (
    <div className="flex flex-col min-h-0 bg-card overflow-y-auto">

      {/* ── NHÂN SỰ ── */}
      <div className="p-4 space-y-2">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2.5">Nhân sự</p>

        {/* Chủ trì */}
        <div className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-xl border',
          isUnassigned
            ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-200'
            : 'bg-violet-50 border-violet-100 text-violet-900 dark:bg-violet-900/20 dark:border-violet-800/40 dark:text-violet-100',
        )}>
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
            isUnassigned ? 'bg-amber-200 dark:bg-amber-900/40 text-amber-700' : 'bg-violet-500 text-white',
          )}>
            {isUnassigned ? '?' : (activeTask.assigneeName || activeTask.assigneeCode)?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">👑 Chủ trì</p>
            <p className="font-semibold text-[13px] truncate">
              {isUnassigned ? 'Chưa phân công' : (activeTask.assigneeName || activeTask.assigneeCode)}
            </p>
          </div>
          {isUnassigned && allowedActions.includes('ASSIGN') && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shrink-0"
              onClick={() => onSmartAssign(activeTask)}
            >
              Giao
            </Button>
          )}
        </div>

        {activeTask.assignerCode && (
          <PersonRow emoji="📋" label="Người giao" name={activeTask.assignerName || activeTask.assignerCode} color="bg-indigo-50/80 border-indigo-100 text-indigo-900 dark:bg-indigo-900/10 dark:border-indigo-800/30 dark:text-indigo-100" />
        )}
        {activeTask.supervisorCode && (
          <PersonRow emoji="⚡" label="Lãnh đạo chỉ đạo" name={activeTask.supervisorName || activeTask.supervisorCode} color="bg-muted border-border text-foreground" />
        )}
        {activeTask.approverCode && (
          <PersonRow emoji="👀" label="Lãnh đạo theo dõi" name={activeTask.approverName || activeTask.approverCode} color="bg-teal-50 border-teal-100 text-teal-800 dark:bg-teal-900/10 dark:border-teal-800/30 dark:text-teal-100" />
        )}

        {/* Co-assignees */}
        {(activeTask.coassigneeNames || []).length > 0 && (
          <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">
              🤝 Phối hợp ({activeTask.coassigneeNames.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {(activeTask.coassigneeNames as string[]).map((name, idx) => (
                <span key={idx} className="text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/50">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* ── THAO TÁC ── */}
      {activeTask.status !== 'DONE' && (
        <div className="p-4 space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2.5">Thao tác</p>

          {/* PENDING_ASSIGN context */}
          {context === 'PENDING_ASSIGN' && (
            <>
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-2">
                <Info className="w-3.5 h-3.5 shrink-0" /> Chọn người nhận đầu việc này
              </div>
              <Button
                className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2"
                onClick={() => onSmartAssign(activeTask)}
              >
                <User className="w-4 h-4" /> Phân công người thực hiện
              </Button>
            </>
          )}

          {/* Subtask actions */}
          {allowedActions.includes('ADD_SUBTASK') && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 rounded-xl text-sm" onClick={onOpenSubTaskModal}>
                <Split className="w-4 h-4 mr-1.5" /> Tạo việc con
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-9 rounded-xl text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
                onClick={onOpenAiBreakdownModal}
              >
                ✨ AI Phân rã
              </Button>
            </div>
          )}

          {/* MY_EXECUTION: Primary workflow actions */}
          {context === 'MY_EXECUTION' && (
            <>
              {primaryActions.map((actionName) => {
                const cfg = getActionConfig(actionName);
                if (actionName === 'COMPLETE' && hasSubtasks) return null;
                return (
                  <button
                    key={actionName}
                    onClick={() => handleActionClick(actionName)}
                    className="w-full text-left rounded-xl overflow-hidden group"
                  >
                    <div className="flex flex-col items-start px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white gap-0.5 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {cfg.icon}
                        <span>{cfg.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      {cfg.desc && (
                        <p className="text-[11px] opacity-70 font-normal pl-6">{cfg.desc}</p>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Secondary workflow actions */}
              {secondaryActions.length > 0 && (
                <div className="pt-1 space-y-1">
                  {secondaryActions.map((actionName) => {
                    const cfg = getActionConfig(actionName);
                    const isDanger = cfg.variant === 'danger';

                    if (actionName === 'COORDINATE') {
                      return (
                        <Button key={actionName} variant="outline" className="w-full h-9 rounded-lg text-sm justify-start gap-2" onClick={onOpenCoordinationModal}>
                          <Users className="w-3.5 h-3.5" /> Xin phối hợp
                        </Button>
                      );
                    }

                    return (
                      <Button
                        key={actionName}
                        variant="outline"
                        className={cn(
                          'w-full h-9 rounded-lg text-sm justify-start gap-2',
                          isDanger ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/20' : '',
                        )}
                        onClick={() => handleActionClick(actionName)}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Không có action */}
              {workflowActions.length === 0 && (
                <div className="px-3 py-2.5 bg-muted border border-border rounded-xl text-[11px] text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Không có thao tác khả dụng ở bước này
                </div>
              )}
            </>
          )}

          {/* I_ASSIGNED: Theo dõi */}
          {context === 'I_ASSIGNED' && (
            <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Chế độ Theo dõi — không có hành động trực tiếp
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* ── THỜI HẠN ── */}
      <div className="p-4">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Thời hạn
        </p>
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${dueInfo.bg} ${dueInfo.border}`}>
          <div className={dueInfo.color}>{dueInfo.icon}</div>
          <div>
            {dueInfo.text && <p className={`text-[10px] font-bold uppercase tracking-wider ${dueInfo.color}`}>{dueInfo.text}</p>}
            <p className={`font-bold text-[14px] ${dueInfo.color}`}>{dueInfo.label}</p>
          </div>
        </div>
      </div>

      {/* ── Reject Dialog ── */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md font-sans p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Reply className="w-5 h-5 text-rose-500" /> Trả lại công việc
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">Nhập lý do trả lại để người thực hiện nắm rõ yêu cầu chỉnh sửa.</p>
            <textarea
              className="w-full border border-input rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none bg-background"
              rows={4}
              placeholder="Nhập lý do chi tiết..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="rounded-xl">Hủy</Button>
            <Button className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white" onClick={handleConfirmReject}>
              Xác nhận trả lại
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
