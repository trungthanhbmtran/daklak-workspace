import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Split, CheckCircle2, Users, Reply, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskDelegation } from '../hooks/useTaskDelegation';

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

  const { handleCompleteTask, handleApproveTask, handleRejectTask } = useTaskActions(activeTask?.id);
  const { delegationChain } = useTaskDelegation(activeTask?.rootTaskId || activeTask?.id);
  const hasSubtasks = delegationChain.some((t: any) => t.parentId === activeTask?.id);

  const handleComplete = () => handleCompleteTask(onCloseDialog);
  const handleApprove = () => handleApproveTask(onCloseDialog);
  const handleReject = () => {
    handleRejectTask(rejectReason, () => {
      setIsRejectOpen(false);
      setRejectReason('');
      onCloseDialog();
    });
  };

  return (
    <div className="flex flex-col gap-0 bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Roles */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-4 h-[2px] bg-slate-300 rounded" /> Phân công nhân sự
        </h3>
        <div className="space-y-3">
          {/* Chủ trì */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40">
            <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-black text-base shrink-0">
              {activeTask.assigneeCode === 'UNASSIGNED' ? '?' : ((activeTask.assigneeName || activeTask.assigneeCode)?.charAt(0) || '?')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">👑 Chủ trì</p>
              <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 truncate">
                {activeTask.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (activeTask.assigneeName || activeTask.assigneeCode || 'Chưa phân công')}
              </p>
            </div>
            {(!activeTask.assigneeCode || activeTask.assigneeCode === 'UNASSIGNED') && allowedActions.includes('ASSIGN') && (
              <Button size="sm" variant="outline" className="rounded-lg text-xs font-medium h-8" onClick={() => onSmartAssign(activeTask)}>
                Giao
              </Button>
            )}
          </div>

          {/* Co-assignees */}
          {(activeTask.coassigneeNames || []).length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">🤝 Phối hợp ({(activeTask.coassigneeNames || []).length})</p>
              <div className="flex flex-wrap gap-1.5">
                {(activeTask.coassigneeNames || []).map((name: string, idx: number) => (
                  <span key={idx} className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 px-2 py-1 rounded-full border border-amber-200">{name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Supervisor */}
          {activeTask.supervisorCode && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-black text-sm shrink-0">
                {(activeTask.supervisorName || activeTask.supervisorCode)?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⚡ Lãnh đạo chỉ đạo</p>
                <p className="font-bold text-[13px] text-slate-700 dark:text-slate-300 truncate">{activeTask.supervisorName || activeTask.supervisorCode}</p>
              </div>
            </div>
          )}

          {/* Approver / Monitor */}
          {activeTask.approverCode && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">
                {(activeTask.approverName || activeTask.approverCode)?.charAt(0) || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">👀 Lãnh đạo theo dõi</p>
                  {(activeTask.domainName || activeTask.domain?.name) && (
                    <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200/50 text-[9px] font-bold tracking-wider">
                      {activeTask.domainName || activeTask.domain?.name}
                    </span>
                  )}
                </div>
                <p className="font-bold text-[13px] text-slate-700 dark:text-slate-300 truncate">{activeTask.approverName || activeTask.approverCode}</p>
              </div>
            </div>
          )}

          {/* Assigner */}
          {activeTask.assignerCode && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/60 dark:border-indigo-800/30">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-500 font-black text-sm shrink-0">
                {(activeTask.assignerName || activeTask.assignerCode)?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">📋 Người giao</p>
                <p className="font-bold text-[13px] text-slate-700 dark:text-slate-300 truncate">{activeTask.assignerName || activeTask.assignerCode}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ACTIONS ─ Phân tách rõ theo context ── */}
      {activeTask.status !== 'DONE' && (
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-4 h-[2px] bg-slate-300 rounded" /> Thao tác
          </h3>
          <div className="flex flex-col gap-2.5">
            {/* ── CONTEXT: PENDING_ASSIGN — Chỉ phân công, KHÔNG phân rã ── */}
            {context === 'PENDING_ASSIGN' && (
              <>
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700 font-semibold flex items-center gap-2">
                  <span>🗂️</span> Chế độ Giao việc — chọn người nhận đầu việc này
                </div>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                  Sau khi giao, người nhận sẽ tự xây dựng kế hoạch thực hiện chi tiết trong &quot;Việc của tôi&quot; — bạn không cần phân rã tại đây.
                </div>
                <Button className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm" onClick={() => onSmartAssign(activeTask)}>
                  <User className="w-4 h-4 mr-2" /> Phân công người thực hiện
                </Button>
              </>
            )}

            {/* ── CONTEXT: MY_EXECUTION — Thực thi + Xây dựng kế hoạch ── */}
            {context === 'MY_EXECUTION' && (
              <>
                <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-700 font-semibold flex items-center gap-2">
                  <span>✅</span> Chế độ Thực thi — cập nhật tiến độ hoặc xây dựng kế hoạch
                </div>
                {/* Xây dựng kế hoạch thực hiện — phân rã mục tiêu cá nhân/đơn vị */}
                {allowedActions.includes('ADD_SUBTASK') && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-10 rounded-lg font-medium text-sm"
                      onClick={onOpenSubTaskModal}
                    >
                      <Split className="w-4 h-4 mr-2" />
                      Thủ công
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-10 rounded-lg font-bold text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
                      onClick={onOpenAiBreakdownModal}
                    >
                      ✨ AI Phân rã
                    </Button>
                  </div>
                )}
                {activeTask.plan && (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                    ℹ️ Tạo các mục tiêu cụ thể để thực hiện: <b className="text-slate-700">{activeTask.title}</b>
                  </div>
                )}
                {allowedActions.includes('COMPLETE') && !hasSubtasks && (
                  <Button className="w-full h-10 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm" onClick={handleComplete}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Báo cáo hoàn thành
                  </Button>
                )}
                {allowedActions.includes('APPROVE') && (
                  <Button className="w-full h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm" onClick={handleApprove}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Nghiệm thu (Duyệt)
                  </Button>
                )}
                {allowedActions.includes('COORDINATE') && (
                  <Button variant="outline" className="w-full h-10 rounded-lg font-medium text-sm" onClick={onOpenCoordinationModal}>
                    <Users className="w-4 h-4 mr-2" /> Xin phối hợp
                  </Button>
                )}
                {allowedActions.includes('RETURN') && (
                  <Button variant="outline" className="w-full h-10 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 font-medium text-sm" onClick={() => setIsRejectOpen(true)}>
                    <Reply className="w-4 h-4 mr-2" /> Trả lại công việc
                  </Button>
                )}
              </>
            )}

            {/* ── CONTEXT: I_ASSIGNED — Chỉ xem tiến độ ── */}
            {context === 'I_ASSIGNED' && (
              <div className="px-3 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700 font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Chế độ Theo dõi — không có hành động
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due date */}
      <div className="p-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <div className="w-4 h-[2px] bg-slate-300 rounded" /> Thời hạn
        </h3>
        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${dueInfo.bg} ${dueInfo.border}`}>
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
            <DialogTitle className="text-xl font-bold">Trả lại công việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">Vui lòng nhập lý do trả lại công việc (sai chức năng, không đủ thẩm quyền...)</p>
            <textarea
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none"
              rows={4}
              placeholder="Nhập lý do chi tiết..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="rounded-full">Hủy</Button>
            <Button onClick={handleReject} disabled={!rejectReason.trim()} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white">
              Xác nhận trả lại
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
