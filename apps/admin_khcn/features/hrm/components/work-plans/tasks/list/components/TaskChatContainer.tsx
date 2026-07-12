import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MentionInput } from '../../../../MentionInput';
import {
  Message,
  MessageGroup,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from '@/components/ui/message';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Marker, MarkerIcon, MarkerContent } from '@/components/ui/marker';

import { useTaskChat } from '../hooks/useTaskChat';

interface TaskChatContainerProps {
  activeTask: any;
  allowedActions: string[];
}

/** Parse mention markdown @[Name](code) thành ReactNode */
function parseMentions(content: string): React.ReactNode[] {
  return content.split(/(@\[.*?\]\([^)]+\))/g).map((part, i) => {
    const match = part.match(/@\[(.*?)\]\(([^)]+)\)/);
    if (match) {
      return (
        <span
          key={i}
          className="font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1 py-0.5 rounded text-[0.85em]"
        >
          @{match[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** Nhóm messages theo ngày */
function groupByDate(messages: any[]) {
  const groups: { date: string; items: any[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = new Date(msg.createdAt).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (last && last.date === dateStr) {
      last.items.push(msg);
    } else {
      groups.push({ date: dateStr, items: [msg] });
    }
  });
  return groups;
}

export const TaskChatContainer = React.memo(({
  activeTask,
  allowedActions,
}: TaskChatContainerProps) => {
  const [chatMessage, setChatMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    taskComments,
    isLoadingComments,
    isSendingMessage,
    handleSendMessage,
  } = useTaskChat(activeTask?.id);

  const handleSend = useCallback(() => {
    handleSendMessage(chatMessage, () => setChatMessage(''));
  }, [chatMessage, handleSendMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [taskComments.length]);

  if (!allowedActions.includes('CHAT')) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <MessageSquare className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">Nội dung trao đổi nội bộ</p>
        <p className="text-[12px] text-slate-400 mt-1 max-w-[200px]">
          Bạn không được phân công nên không thể xem trao đổi tại nhiệm vụ này.
        </p>
      </div>
    );
  }

  const isTaskClosed = ['DONE', 'PENDING_APPROVAL'].includes(activeTask.status);
  const groupedMessages = groupByDate(taskComments);

  return (
    <>
      {/* Message List */}
      <ScrollArea ref={scrollRef} className="flex-1 max-h-[420px]">
        <div className="p-4 space-y-1">
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
              <p className="text-xs text-slate-300 mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <MessageGroup key={group.date}>
                {/* Date separator */}
                <Marker variant="separator" className="my-3 text-[11px]">
                  <MarkerContent>{group.date}</MarkerContent>
                </Marker>

                {group.items.map((msg: any, idx: number) => {
                  const isMine = msg.isMine;
                  const isSystem = msg.isSystemMessage;

                  if (isSystem) {
                    return (
                      <Marker key={idx} className="justify-center my-2 text-[11px] text-amber-600 dark:text-amber-400">
                        <MarkerIcon>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </MarkerIcon>
                        <MarkerContent>{parseMentions(msg.content)}</MarkerContent>
                      </Marker>
                    );
                  }

                  return (
                    <Message key={idx} align={isMine ? 'end' : 'start'} className="py-0.5">
                      {/* Avatar */}
                      {!isMine && (
                        <MessageAvatar className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 text-xs font-black ring-2 ring-white dark:ring-slate-800">
                          {msg.authorName?.charAt(0) || msg.authorCode?.charAt(0) || '?'}
                        </MessageAvatar>
                      )}

                      <MessageContent>
                        {/* Author name (only for received messages) */}
                        {!isMine && (
                          <MessageHeader className="px-2 pb-0.5 text-[10px] font-bold text-slate-500">
                            {msg.authorName || msg.authorCode}
                          </MessageHeader>
                        )}

                        {/* Bubble */}
                        <Bubble
                          variant={isMine ? 'default' : 'outline'}
                          align={isMine ? 'end' : 'start'}
                        >
                          <BubbleContent
                            className={
                              isMine
                                ? 'bg-indigo-600 text-white rounded-tr-sm border-transparent'
                                : 'rounded-tl-sm'
                            }
                          >
                            <p className="leading-relaxed whitespace-pre-wrap wrap-break-word text-[13.5px]">
                              {parseMentions(msg.content)}
                            </p>
                          </BubbleContent>
                        </Bubble>

                        {/* Timestamp */}
                        <MessageFooter
                          className={`px-2 pt-0.5 text-[10px] opacity-50 ${isMine ? 'justify-end' : ''}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </MessageFooter>
                      </MessageContent>

                      {/* My avatar */}
                      {isMine && (
                        <MessageAvatar className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-black">
                          {msg.authorName?.charAt(0) || msg.authorCode?.charAt(0) || 'T'}
                        </MessageAvatar>
                      )}
                    </Message>
                  );
                })}
              </MessageGroup>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-400/50 transition-all">
          <MentionInput
            disabled={isTaskClosed || isSendingMessage}
            value={chatMessage}
            onChange={(e: any) => setChatMessage(e.target.value)}
            onSend={handleSend}
            placeholder={
              isTaskClosed
                ? 'Công việc đã đóng/chờ duyệt'
                : 'Nhập nội dung trao đổi...'
            }
          />
          <Button
            disabled={isTaskClosed || !chatMessage.trim() || isSendingMessage}
            onClick={handleSend}
            className="rounded-full w-9 h-9 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:opacity-40"
          >
            {isSendingMessage ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 ml-0.5 text-white" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
});
