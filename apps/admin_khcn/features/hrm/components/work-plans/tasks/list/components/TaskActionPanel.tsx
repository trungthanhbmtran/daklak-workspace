import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Split, CheckCircle2, Users, Reply, BarChart3, ChevronRight, ArrowRight, Zap, Eye, Info, AlertTriangle } from 'lucide-react';
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

/** UI-config: icon + variant + desc (không hardcode label vì đã lấy từ danh mục) */
const ACTION_UI_CONFIG: Record<string, { icon: React.ReactNode; variant: 'primary' | 'danger' | 'secondary'; desc?: string }> = {
  PLAN_ASSIGNMENT:  { icon: <Split className="w-4 h-4" />,        variant: 'primary',    desc: 'Xác định định biên và cơ cấu đơn vị chịu trách nhiệm' },
  ASSIGN:           { icon: <ArrowRight className="w-4 h-4" />,   variant: 'primary',    desc: 'Giao việc cho người thực hiện' },
  IN_PROGRESS:      { icon: <Zap className="w-4 h-4" />,          variant: 'primary',    desc: 'Xác nhận tiếp nhận và bắt đầu thực hiện' },
  COMPLETE:         { icon: <CheckCircle2 className="w-4 h-4" />, variant: 'primary',    desc: 'Nộp báo cáo kết quả và đề nghị nghiệm thu' },
  APPROVE:          { icon: <CheckCircle2 className="w-4 h-4" />, variant: 'primary',    desc: 'Xác nhận kết quả đạt yêu cầu' },
  MONITOR:          { icon: <Eye className="w-4 h-4" />,          variant: 'secondary',  desc: 'Ghi nhận theo dõi tiến độ' },
  FORWARD:          { icon: <ChevronRight className="w-4 h-4" />, variant: 'secondary',  desc: 'Chuyển công việc cho đơn vị khác' },
  COORDINATE:       { icon: <Users className="w-4 h-4" />,        variant: 'secondary',  desc: 'Mời thêm người tham gia phối hợp' },
  REJECT:           { icon: <Reply className="w-4 h-4" />,        variant: 'danger',     desc: 'Trả lại kết quả không đạt yêu cầu' },
  RETURN:           { icon: <Reply className="w-4 h-4" />,        variant: 'danger',     desc: 'Trả lại để thực hiện lại' },
  DONE:             { icon: <CheckCircle2 className="w-4 h-4" />, variant: 'primary' },
};

/** Avatar chip */
function PersonChip({ label, name, color }: { label: string; name: string; color: string }) {
  if (!name) return null;
  return (
    <div className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl border', color)}>
      <div className="w-8 h-8 rounded-full bg-current/10 flex items-center justify-center font-black text-sm shrink-0">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <p className="font-bold text-[13px] truncate">{name}</p>
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
  onCloseDialog
}: TaskActionPanelProps) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const { handleProcessTask } = useTaskActions(activeTask?.id);
  const { delegationChain } = useTaskDelegation(activeTask?.rootTaskId || activeTask?.id);
  const hasSubtasks = delegationChain.some((t: any) => t.parentId === activeTask?.id);

  // Lấy label từ danh mục, fallback về TASK_WORKFLOW_ACTION_FALLBACK
  const categoryLabels = useCategoryMap('TASK_WORKFLOW_ACTION');
  const getActionConfig = (name: string) => {
    const ui = ACTION_UI_CONFIG[name] ?? { icon: <BarChart3 className="w-4 h-4" />, variant: 'secondary' as const };
    const label = categoryLabels[name] || TASK_WORKFLOW_ACTION_FALLBACK[name] || name;
    return { ...ui, label };
  };

  const systemActions = ['ADD_SUBTASK', 'COORDINATE', 'EDIT', 'DELETE', 'CHAT'];
  const workflowActions = allowedActions.filter((a: string) => !systemActions.includes(a));
  const primaryActions = workflowActions.filter(a => ['primary'].includes(getActionConfig(a).variant));
  const secondaryActions = workflowActions.filter(a => !['primary'].includes(getActionConfig(a).variant));

  const handleActionClick = (actionName: string) => {
    const cfg = getActionConfig(actionName);
    if (cfg.variant === 'danger' || actionName === 'RETURN' || actionName.includes('REJECT')) {
      setPendingAction(actionName);
      setIsRejectOpen(true);
    } else if (actionName === 'COORDINATE') {
      onOpenCoordinationModal();
    } else {
      handleProcessTask(actionName, undefined, onCloseDialog);
    }
  };

  const handleConfirmReject = () => {
    if (pendingAction) {
      handleProcessTask(pendingAction, rejectReason, () => {
        setIsRejectOpen(false);
        setRejectReason('');
        setPendingAction(null);
        onCloseDialog();
      });
    }
  };

  const isUnassigned = !activeTask.assigneeCode || activeTask.assigneeCode === 'UNASSIGNED';

  return (
    <div className="flex flex-col min-h-0 gap-0 bg-white dark:bg-slate-900 overflow-y-auto">

      {/* ── WORKFLOW STEP BANNER ── */}
      {activeTask.workflowInstId && workflowActions.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/20 border-b border-indigo-100 dark:border-indigo-800/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Bước hiện tại trong quy trình</p>
          </div>
          <p className="font-black text-[15px] text-indigo-900 dark:text-indigo-100 leading-tight">
            {getActionConfig(workflowActions[0]).label}
          </p>
          {getActionConfig(workflowActions[0]).desc && (
            <p className="text-[12px] text-indigo-700/70 dark:text-indigo-300/70 mt-1 leading-relaxed">
              {getActionConfig(workflowActions[0]).desc}
            </p>
          )}
        </div>
      )}

      {/* ── NHÂN SỰ ── */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <div className="w-4 h-[2px] bg-slate-300 rounded" /> Nhân sự
        </p>

        {/* Chủ trì */}
        <div className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-xl border',
          isUnassigned
            ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-200'
            : 'bg-violet-50 border-violet-100 text-violet-900 dark:bg-violet-900/20 dark:border-violet-800/40 dark:text-violet-100'
        )}>
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0',
            isUnassigned ? 'bg-amber-200 dark:bg-amber-900/40 text-amber-700' : 'bg-violet-500 text-white'
          )}>
            {isUnassigned ? '?' : (activeTask.assigneeName || activeTask.assigneeCode)?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">👑 Chủ trì</p>
            <p className="font-bold text-[13px] truncate">
              {isUnassigned ? 'Chưa phân công' : (activeTask.assigneeName || activeTask.assigneeCode)}
            </p>
          </div>
          {isUnassigned && allowedActions.includes('ASSIGN') && (
            <Button size="sm" className="h-7 px-3 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shrink-0" onClick={() => onSmartAssign(activeTask)}>
              Giao
            </Button>
          )}
        </div>

        {activeTask.assignerCode && (
          <PersonChip label="📋 Người giao" name={activeTask.assignerName || activeTask.assignerCode} color="bg-indigo-50/60 border-indigo-100/60 text-indigo-900 dark:bg-indigo-900/10 dark:border-indigo-800/30 dark:text-indigo-100" />
        )}
        {activeTask.supervisorCode && (
          <PersonChip label="⚡ Lãnh đạo chỉ đạo" name={activeTask.supervisorName || activeTask.supervisorCode} color="bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700/60 dark:text-slate-200" />
        )}
        {activeTask.approverCode && (
          <PersonChip label="👀 Lãnh đạo theo dõi" name={activeTask.approverName || activeTask.approverCode} color="bg-teal-50 border-teal-100 text-teal-800 dark:bg-teal-900/10 dark:border-teal-800/30 dark:text-teal-100" />
        )}

        {/* Co-assignees */}
        {(activeTask.coassigneeNames || []).length > 0 && (
          <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">
              🤝 Phối hợp ({(activeTask.coassigneeNames || []).length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(activeTask.coassigneeNames || []).map((name: string, idx: number) => (
                <span key={idx} className="text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/50">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── THAO TÁC WORKFLOW ── */}
      {activeTask.status !== 'DONE' && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-4 h-[2px] bg-slate-300 rounded" /> Thao tác
          </p>

          <div className="flex flex-col gap-2">
            {/* Context pending assign */}
            {context === 'PENDING_ASSIGN' && (
              <>
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0" /> Chế độ Giao việc — chọn người nhận đầu việc này
                </div>
                <Button className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm gap-2" onClick={() => onSmartAssign(activeTask)}>
                  <User className="w-4 h-4" /> Phân công người thực hiện
                </Button>
              </>
            )}

            {/* Sub-task split */}
            {allowedActions.includes('ADD_SUBTASK') && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 rounded-xl font-medium text-sm" onClick={onOpenSubTaskModal}>
                  <Split className="w-4 h-4 mr-2" /> Tạo việc con
                </Button>
                <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800" onClick={onOpenAiBreakdownModal}>
                  ✨ AI Phân rã
                </Button>
              </div>
            )}

            {/* Primary workflow actions */}
            {context === 'MY_EXECUTION' && (
              <>
                {primaryActions.map((actionName) => {
                  const cfg = getActionConfig(actionName);
                  if (actionName === 'COMPLETE' && hasSubtasks) return null;
                  return (
                    <button
                      key={actionName}
                      onClick={() => handleActionClick(actionName)}
                      className="w-full rounded-xl font-bold text-sm transition-all duration-200 shadow-sm group"
                    >
                      <div className="flex flex-col items-start px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl gap-1">
                        <div className="flex items-center gap-2">
                          {cfg.icon}
                          <span>{cfg.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        {cfg.desc && (
                          <p className="text-[11px] opacity-70 font-normal text-left pl-6">{cfg.desc}</p>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Secondary workflow actions */}
                {secondaryActions.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thao tác khác</p>
                    {secondaryActions.map((actionName) => {
                      const cfg = getActionConfig(actionName);
                      const isDanger = cfg.variant === 'danger';

                      if (actionName === 'COORDINATE') {
                        return (
                          <Button key={actionName} variant="outline" className="w-full h-9 rounded-lg font-medium text-sm justify-start gap-2" onClick={onOpenCoordinationModal}>
                            <Users className="w-3.5 h-3.5" /> Xin phối hợp
                          </Button>
                        );
                      }

                      return (
                        <Button
                          key={actionName}
                          variant="outline"
                          className={cn(
                            'w-full h-9 rounded-lg font-medium text-sm justify-start gap-2',
                            isDanger ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/20' : ''
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

                {/* Không có action nào */}
                {workflowActions.length === 0 && context === 'MY_EXECUTION' && (
                  <div className="px-3 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Không có thao tác khả dụng ở bước này
                  </div>
                )}
              </>
            )}

            {/* Monitor context */}
            {context === 'I_ASSIGNED' && (
              <div className="px-3 py-3 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Chế độ Theo dõi — không có hành động trực tiếp
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── THỜI HẠN ── */}
      <div className="p-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <div className="w-4 h-[2px] bg-slate-300 rounded" /> Thời hạn
        </p>
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${dueInfo.bg} ${dueInfo.border}`}>
          <div className={dueInfo.color}>{dueInfo.icon}</div>
          <div>
            {dueInfo.text && <p className={`text-[10px] font-black uppercase tracking-wider ${dueInfo.color}`}>{dueInfo.text}</p>}
            <p className={`font-bold text-[14px] ${dueInfo.color}`}>{dueInfo.label}</p>
          </div>
        </div>
      </div>

      {/* ── Reject Dialog ── */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md font-sans p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Reply className="w-5 h-5 text-rose-500" /> Trả lại công việc
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">Vui lòng nhập lý do trả lại để người thực hiện nắm rõ yêu cầu chỉnh sửa.</p>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none bg-slate-50 dark:bg-slate-800"
              rows={4}
              placeholder="Nhập lý do chi tiết..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="rounded-full">Hủy</Button>
            <Button className="rounded-full bg-rose-500 hover:bg-rose-600 text-white" onClick={handleConfirmReject}>
              Xác nhận trả lại
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
