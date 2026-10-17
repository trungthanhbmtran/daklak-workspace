/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useTaskComments, useAddComment } from "../../hooks/useTasks";
import { useChatSocket } from "../../hooks/useChatSocket";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/components/ui/typography";
import { MentionInput } from "../MentionInput";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageSquare, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { useHrmPermissions } from "../../hooks/useHrmPermissions";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

const parseMessageContent = (content: string, isCurrentUser: boolean) => {
  if (!content) return null;
  const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const name = match[1];
    parts.push(
      <span
        key={match.index}
        className={
          isCurrentUser
            ? "text-blue-100 bg-blue-700/60 font-semibold px-1.5 py-0.5 rounded mx-0.5 text-xs inline-block"
            : "text-blue-700 bg-blue-100/80 font-semibold px-1.5 py-0.5 rounded mx-0.5 text-xs inline-block"
        }
      >
        @{name}
      </span>
    );
    lastIndex = mentionRegex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts.length > 0 ? parts : content;
};

export function TaskDiscussionTab({
  taskId,
  conversationId,
  allowedActions,
  participants,
  task,
}: {
  taskId?: number;
  conversationId?: string;
  allowedActions?: string[];
  participants?: any[];
  task?: any;
}) {
  const [commentText, setCommentText] = useState("");
  const activeConversationId = conversationId || (taskId ? String(taskId) : task?.id ? String(task.id) : undefined);
  const { data: commentsData, isLoading: commentsLoading } = useTaskComments(activeConversationId, {
    enabled: Boolean(activeConversationId),
  });
  const addComment = useAddComment(activeConversationId);
  const { typingUsers, emitTyping, emitStopTyping } = useChatSocket(activeConversationId);
  const { user, canChatTask, canManageTask } = useHrmPermissions();

  const getSenderName = (senderId: string) => {
    const participant = participants?.find((p: any) => p.employeeCode === senderId);
    return participant?.fullName || participant?.employeeName || senderId;
  };

  const comments: any[] = Array.isArray(commentsData) ? commentsData : [];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments, typingUsers]);

  const handleSendComment = () => {
    if (!commentText.trim() || !conversationId) return;

    let textToSend = commentText;
    if (participants && Array.isArray(participants)) {
      const sortedParticipants = [...participants].sort((a, b) => {
        const nameA = a.employeeName || a.fullName || "";
        const nameB = b.employeeName || b.fullName || "";
        return nameB.length - nameA.length;
      });

      sortedParticipants.forEach((p) => {
        const name = p.employeeName || p.fullName;
        const code = p.employeeCode;
        if (name && code) {
          const regex = new RegExp(`@${name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}`, "g");
          textToSend = textToSend.replace(regex, `@[${name}](${code})`);
        }
      });
    }

    try {
      emitStopTyping();
      addComment.mutateAsync(textToSend).then(() => {
        setCommentText("");
      });
    } catch {
      // handled in hook
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    if (e.target.value.trim().length > 0) {
      emitTyping();
    } else {
      emitStopTyping();
    }
  };

  const canChat = canChatTask(
    task || {
      status: (commentsData as any)?.taskStatus,
      allowedActions,
      participants,
    }
  );

  if (commentsLoading) {
    return (
      <div className="space-y-4 h-full flex flex-col p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const displayComments = [...comments].reverse();

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Discussion Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <Heading level="h4" className="font-bold text-slate-900 text-sm">
              Trao đổi & Phối hợp nghiệp vụ
            </Heading>
            <span className="text-[11px] text-slate-400">
              Kênh trao đổi nội bộ giữa người giao, người chủ trì và người phối hợp
            </span>
          </div>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          {displayComments.length} tin nhắn
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 space-y-3.5 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {displayComments.length === 0 ? (
          <div className="text-center text-slate-400 italic py-12 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-500">Chưa có trao đổi nào</p>
            <p className="text-[11px]">Hãy gửi ý kiến, đính kèm thông tin hoặc gõ @ để nhắc tên đồng nghiệp.</p>
          </div>
        ) : (
          displayComments.map((comment: any) => {
            const isCurrentUser = comment.senderId === user?.employeeCode || comment.senderId === user?.username;
            const senderDisplayName = comment.senderName || getSenderName(comment.senderId) || "Cán bộ";

            return (
              <div key={comment.id || comment.createdAt} className={`flex gap-2.5 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                {!isCurrentUser && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-indigo-100 text-indigo-700 shadow-2xs">
                    {senderDisplayName[0]?.toUpperCase() || "U"}
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl shadow-2xs ${
                    isCurrentUser
                      ? "rounded-tr-xs bg-blue-600 text-white"
                      : "rounded-tl-xs bg-white border border-slate-200/90 text-slate-800"
                  } ${comment.isOptimistic ? "opacity-60" : ""}`}
                >
                  {!isCurrentUser && (
                    <div className="flex items-center gap-2 mb-1 justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">{senderDisplayName}</span>
                      <span className="text-slate-400 text-[10px] shrink-0">
                        {safeFormatDate(comment.createdAt, "dd/MM HH:mm")}
                      </span>
                    </div>
                  )}

                  <div className={`text-xs whitespace-pre-wrap leading-relaxed ${isCurrentUser ? "text-white" : "text-slate-700"}`}>
                    {parseMessageContent(comment.content, isCurrentUser)}
                  </div>

                  {isCurrentUser && (
                    <div className="text-right mt-1">
                      <span className="text-blue-200 text-[10px] font-mono">
                        {safeFormatDate(comment.createdAt, "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {typingUsers.length > 0 && (
          <div className="flex gap-2.5 items-center text-slate-400 italic text-xs pl-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            Có cán bộ đang soạn tin nhắn...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="mt-auto pt-3 border-t border-slate-200 bg-white p-3 rounded-2xl shadow-2xs">
        {canChat ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <MentionInput
                placeholder="Nhập nội dung trao đổi (gõ @ để gắn thẻ cán bộ)..."
                className="min-h-[42px] max-h-[120px] text-xs"
                value={commentText}
                onChange={handleInputChange}
                onSend={handleSendComment}
                onBlur={emitStopTyping}
                participants={participants}
              />
            </div>
            <Button
              size="sm"
              onClick={handleSendComment}
              disabled={addComment.isPending || !commentText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white h-[42px] px-4 rounded-xl shadow-xs shrink-0"
            >
              {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        ) : (
          <div className="w-full text-center text-slate-400 text-xs py-2.5 italic border border-dashed rounded-xl bg-slate-50">
            Bạn không thuộc danh sách phân công tham gia trao đổi ở nhiệm vụ này.
          </div>
        )}
      </div>
    </div>
  );
}
