'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Calendar, Split, ArrowLeftCircle,
  MessageSquare, Send, Reply, User, Users, Target, BarChart3, AlertCircle,
} from 'lucide-react';
import { useTaskDetail } from '../hooks/useTaskDetail';
import { SubTaskModal } from '../../subtask/SubTaskModal';
import { AiTaskBreakdownModal } from '../../subtask/AiTaskBreakdownModal';
import { CoordinationModal } from '../../coordination/CoordinationModal';
import { AssignCoordinationModal } from '../../assign/AssignCoordinationModal';
import { getStatusBadge, getPriorityColor, getPriorityName, getDueDateDisplay } from '../utils';
import { MentionInput } from '../../../../MentionInput';
import { WorkflowTimeline } from '@/features/workflow/components/WorkflowTimeline';
import { History } from 'lucide-react';

interface TaskDetailDialogProps {
  task: any | null;
  priorities: any[];
  onClose: () => void;
  onRefetch: () => void;
  onSmartAssign: (task: any) => void;
  onSelectTask?: (task: any) => void;
  taskStatusCategories?: any[];
  taskRoleCategories?: any[];
  /** Context xác định actions nào hiển thị — tránh trùng chức năng giữa các tab */
  context?: any;
}

/**
 * Dialog chi tiết công việc 3 cột: Mô tả+Chat | Nhân sự+Thao tác | Cây việc.
 *
 * TỰ quản lý:
 *  - useTaskDetail → fetch comments + delegation chain (không gây re-render cha)
 *  - chatMessage, isRejectOpen, rejectReason
 *  - isCoordinationModalOpen, isAssignCoordinationOpen, isSubTaskModalOpen
 */
export function TaskDetailDialog({
  task,
  priorities,
  onClose,
  onRefetch,
  onSmartAssign,
  taskStatusCategories = [],
  context = 'MY_EXECUTION',
}: TaskDetailDialogProps) {
  const [activeTask, setActiveTask] = React.useState(task);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'HISTORY'>('CHAT');

  // Sync activeTask when root task changes
  React.useEffect(() => {
    setActiveTask(task);
  }, [task]);

  const [chatMessage, setChatMessage] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isCoordinationModalOpen, setIsCoordinationModalOpen] = useState(false);
  const [isAssignCoordinationOpen, setIsAssignCoordinationOpen] = useState(false);
  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
  const [isAiBreakdownModalOpen, setIsAiBreakdownModalOpen] = useState(false);

  const {
    taskComments, isLoadingComments, isSendingMessage,
    delegationChain, isLoadingChain,
    fetchComments, fetchDelegationChain,
    handleSendMessage, handleCompleteTask, handleRejectTask, handleApproveTask,
  } = useTaskDetail(activeTask?.id, task?.rootTaskId || task?.id, onRefetch);

  const handleSend = useCallback(() => {
    handleSendMessage(chatMessage, () => setChatMessage(''));
  }, [chatMessage, handleSendMessage]);

  const hasSubtasks = (delegationChain || []).some(
    (n: any) => n.parentId === activeTask?.id
  );

  const handleComplete = useCallback(() => {
    handleCompleteTask(onClose);
  }, [handleCompleteTask, onClose]);

  const handleApprove = useCallback(() => {
    handleApproveTask(onClose);
  }, [handleApproveTask, onClose]);

  const handleReject = useCallback(() => {
    handleRejectTask(rejectReason, () => {
      setIsRejectOpen(false);
      setRejectReason('');
      onClose();
    });
  }, [handleRejectTask, rejectReason, onClose]);

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
                <div className="scale-90 origin-left shrink-0">{getStatusBadge(activeTask.status || 'TODO', taskStatusCategories)}</div>
                <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border border-current ${getPriorityColor(activeTask.priority)} bg-white dark:bg-slate-800`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {getPriorityName(activeTask.priority, priorities)}
                </span>
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
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px_400px] gap-0 h-full divide-x divide-slate-200/60 dark:divide-slate-800">

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
                        <Badge variant="secondary" className="rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border border-indigo-100">
                          {taskComments.length} tin
                        </Badge>
                      )}
                    </div>

                    {/* Content Area */}
                    {activeTab === 'HISTORY' ? (
                      <div className="flex-1 overflow-y-auto px-6 bg-slate-50/20 dark:bg-slate-900/10 max-h-[465px]">
                        <WorkflowTimeline instanceId={activeTask.workflowInstId} />
                      </div>
                    ) : (
                      <>
                        {/* Messages */}
                        {allowedActions.includes('CHAT') ? (
                          <>
                            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20 dark:bg-slate-900/10 max-h-[400px]">
                          {isLoadingComments ? (
                            <div className="flex justify-center items-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                            </div>
                          ) : taskComments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                <MessageSquare className="w-7 h-7 text-slate-300" />
                              </div>
                              <p className="text-sm font-medium text-slate-400">Chưa có trao đổi nào</p>
                            </div>
                          ) : (
                            taskComments.map((msg: any, idx: number) => {
                              const isMine = msg.isMine;
                              return (
                                <div key={idx} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-800/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-black shrink-0 ring-2 ring-white dark:ring-slate-800">
                                    {msg.authorName?.charAt(0) || msg.authorCode?.charAt(0) || '🔔'}
                                  </div>
                                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] shadow-sm ${msg.isSystemMessage ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 border border-amber-100' : isMine ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 rounded-tl-sm'}`}>
                                    {!msg.isSystemMessage && !isMine && (
                                      <p className="text-[10px] font-black mb-1 opacity-50">{msg.authorName || msg.authorCode}</p>
                                    )}
                                    <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                                      {msg.content.split(/(@\[.*?\]\([^)]+\))/g).map((part: string, i: number) => {
                                        const match = part.match(/@\[(.*?)\]\(([^)]+)\)/);
                                        if (match) {
                                          return (
                                            <span key={i} className="font-bold text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 px-1 py-0.5 rounded">
                                              @{match[1]}
                                            </span>
                                          );
                                        }
                                        return <span key={i}>{part}</span>;
                                      })}
                                    </p>
                                    <p className={`text-[10px] mt-1.5 text-right ${isMine ? 'text-indigo-200' : 'opacity-30'}`}>
                                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-400/50 transition-all">
                            <MentionInput
                              disabled={['DONE', 'PENDING_APPROVAL'].includes(activeTask.status) || isSendingMessage}
                              value={chatMessage}
                              onChange={(e: any) => setChatMessage(e.target.value)}
                              onSend={handleSend}
                              placeholder={['DONE', 'PENDING_APPROVAL'].includes(activeTask.status) ? 'Công việc đã đóng/chờ duyệt' : 'Nhập nội dung trao đổi...'}
                            />
                            <Button
                              disabled={['DONE', 'PENDING_APPROVAL'].includes(activeTask.status) || !chatMessage.trim() || isSendingMessage}
                              onClick={handleSend}
                              className="rounded-full w-9 h-9 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:opacity-40"
                            >
                              {isSendingMessage
                                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Send className="w-3.5 h-3.5 ml-0.5 text-white" />}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <MessageSquare className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">Nội dung trao đổi nội bộ</p>
                        <p className="text-[12px] text-slate-400 mt-1 max-w-[200px]">Bạn không được phân công nên không thể xem trao đổi tại nhiệm vụ này.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── COL 2: Nhân sự + Thao tác + Thời hạn ── */}
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
                            <Button className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm" onClick={() => { onSmartAssign(activeTask); }}>
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
                                  onClick={() => setIsSubTaskModalOpen(true)}
                                >
                                  <Split className="w-4 h-4 mr-2" />
                                  Thủ công
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 h-10 rounded-lg font-bold text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
                                  onClick={() => setIsAiBreakdownModalOpen(true)}
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
                              <Button variant="outline" className="w-full h-10 rounded-lg font-medium text-sm" onClick={() => setIsCoordinationModalOpen(true)}>
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
                </div>

                {/* ── COL 3: Cây công việc ── */}
                <div className="flex flex-col bg-slate-50/60 dark:bg-slate-900/50 overflow-y-auto border-t xl:border-t-0 border-slate-200 dark:border-slate-800">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 sticky top-0 backdrop-blur-md z-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ArrowLeftCircle className="w-3.5 h-3.5 text-indigo-400 rotate-180" /> Cây công việc
                    </h3>
                  </div>

                  <div className="flex-1 p-4">
                    {isLoadingChain ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                      </div>
                    ) : delegationChain.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                          <Split className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-medium text-slate-400">Chưa có cây công việc</p>
                        <p className="text-[11px] text-slate-300 mt-1">Sử dụng &quot;Phân rã&quot; để tạo task con</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {(function RenderTree() {
                          // 1. Build Tree
                          const nodeMap: Record<number, any> = {};
                          const rootNodes: any[] = [];

                          delegationChain.forEach((n: any) => {
                            nodeMap[n.id] = { ...n, children: [] };
                          });

                          delegationChain.forEach((n: any) => {
                            const parent = nodeMap[n.parentId];
                            // Nếu có parent trong map VÀ không phải là root node giả (level -1) đang xét
                            if (parent && n.level !== -1) {
                              parent.children.push(nodeMap[n.id]);
                            } else if (n.level === -1) {
                              rootNodes.push(nodeMap[n.id]);
                            } else if (n.level === 0 && !delegationChain.find((x: any) => x.level === -1)) {
                              // Không có parent (-1), task hiện tại là root
                              rootNodes.push(nodeMap[n.id]);
                            } else if (!parent) {
                              // Fallback an toàn
                              rootNodes.push(nodeMap[n.id]);
                            }
                          });

                          // 2. Recursive Renderer
                          const renderNode = (node: any, isLast: boolean, depth: number) => {
                            const isCurrent = node.id === activeTask?.id;
                            const sc: Record<string, { dot: string; badge: string; label: string }> = {
                              DONE: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Xong' },
                              IN_PROGRESS: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Đang xử lý' },
                              PROCESSING: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Đang xử lý' },
                              TODO: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'Chờ' },
                              PENDING: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'Chờ' },
                              OVERDUE: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', label: 'Trễ' },
                              RETURNED: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', label: 'Trả lại' },
                              REJECTED: { dot: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700', label: 'Từ chối' },
                              CANCELED: { dot: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700', label: 'Hủy bỏ' },
                              UNASSIGNED: { dot: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700', label: 'Chưa giao' },
                            };
                            const color = sc[node.status] || { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', label: node.status };

                            return (
                              <div key={node.id} className="relative">
                                {/* L-shape line for branching */}
                                {depth > 0 && (
                                  <div className="absolute top-0 -left-[28px] w-[28px] h-7 border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl" />
                                )}
                                {/* Continuous vertical line if not the last child */}
                                {depth > 0 && !isLast && (
                                  <div className="absolute top-7 bottom-[-16px] -left-[28px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                                )}

                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isCurrent) {
                                      setActiveTask(node);
                                    }
                                  }}
                                  className={`relative flex items-start gap-3 pl-4 pr-3 py-3 rounded-2xl transition-all duration-200 ${isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}
                                >
                                  {/* Dot */}
                                  <div className={`mt-1 w-2.5 h-2.5 rounded-full ${color.dot} ring-[3px] ring-white dark:ring-slate-900 shadow-sm shrink-0 z-10`} />

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className={`text-[9.5px] font-black uppercase tracking-wider ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {node.level === -1 ? '🌳 Gốc' : isCurrent ? '▶ Đang xem' : node.children.length > 0 ? '🪵 Nhánh' : '🌿 Lá'}
                                      </span>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${color.badge}`}>{color.label}</span>
                                    </div>
                                    <p className={`font-bold text-[12.5px] line-clamp-3 leading-snug mb-1.5 ${isCurrent ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {node.title}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                                        {(node.assigneeName || node.assigneeCode)?.charAt(0) || '?'}
                                      </div>
                                      <span className="text-[11px] font-medium text-slate-500 truncate">{node.assigneeName || node.assigneeCode || 'Chưa phân công'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Children */}
                                {node.children && node.children.length > 0 && (
                                  <div className="ml-8 mt-2 relative space-y-2">
                                    {node.children.map((child: any, idx: number) =>
                                      renderNode(child, idx === node.children.length - 1, depth + 1)
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          };

                          return (
                            <div className="space-y-3">
                              {rootNodes.map((root, idx) => renderNode(root, idx === rootNodes.length - 1, 0))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* ── Modals ── */}
      <SubTaskModal
        isOpen={isSubTaskModalOpen}
        onClose={(created) => {
          setIsSubTaskModalOpen(false);
          if (created) {
            onRefetch();
            fetchDelegationChain();
          }
        }}
        parentTask={activeTask}
        planId={activeTask?.planId}
      />

      <AiTaskBreakdownModal
        isOpen={isAiBreakdownModalOpen}
        onClose={(created) => {
          setIsAiBreakdownModalOpen(false);
          if (created) {
            onRefetch();
            fetchDelegationChain();
          }
        }}
        parentTask={activeTask}
        planId={activeTask?.planId}
      />

      <CoordinationModal
        task={activeTask}
        open={isCoordinationModalOpen}
        onOpenChange={setIsCoordinationModalOpen}
        onSuccess={() => fetchComments()}
      />

      <AssignCoordinationModal
        task={activeTask}
        open={isAssignCoordinationOpen}
        onOpenChange={setIsAssignCoordinationOpen}
        onSuccess={() => {
          onRefetch();
          fetchComments();
        }}
      />
    </>
  );
}
