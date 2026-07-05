import React, { useState, useCallback } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MentionInput } from '../../../../MentionInput';

import { useTaskChat } from '../hooks/useTaskChat';

interface TaskChatContainerProps {
  activeTask: any;
  allowedActions: string[];
}

export const TaskChatContainer = React.memo(({
  activeTask,
  allowedActions,
}: TaskChatContainerProps) => {
  const [chatMessage, setChatMessage] = useState('');
  
  const { 
    taskComments, 
    isLoadingComments, 
    isSendingMessage, 
    handleSendMessage 
  } = useTaskChat(activeTask?.id);

  const handleSend = useCallback(() => {
    handleSendMessage(chatMessage, () => setChatMessage(''));
  }, [chatMessage, handleSendMessage]);

  if (!allowedActions.includes('CHAT')) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <MessageSquare className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">Nội dung trao đổi nội bộ</p>
        <p className="text-[12px] text-slate-400 mt-1 max-w-[200px]">Bạn không được phân công nên không thể xem trao đổi tại nhiệm vụ này.</p>
      </div>
    );
  }

  return (
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
  );
});
