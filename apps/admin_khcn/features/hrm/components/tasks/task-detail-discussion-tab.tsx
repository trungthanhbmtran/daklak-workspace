/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useTaskComments, useAddComment } from "../../hooks/useTasks";
import { useChatSocket } from "../../hooks/useChatSocket";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/typography";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

export function TaskDiscussionTab({ taskId, conversationId, allowedActions }: { taskId: number; conversationId?: string; allowedActions?: string[] }) {
  const [commentText, setCommentText] = useState("");
  const { data: commentsData, isLoading: commentsLoading } = useTaskComments(conversationId);
  const addComment = useAddComment(conversationId);
  const { typingUsers, emitTyping, emitStopTyping } = useChatSocket(conversationId);
  
  const comments: any[] = (commentsData as any)?.data?.items ?? [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments, typingUsers]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      emitStopTyping();
      await addComment.mutateAsync(commentText.trim());
      setCommentText("");
    } catch { /* handled in hook */ }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    if (e.target.value.trim().length > 0) {
      emitTyping();
    } else {
      emitStopTyping();
    }
  };

  if (commentsLoading) {
    return (
      <div className="flex-1 space-y-3 mb-4 h-full flex flex-col">
        {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    );
  }

  // Reverse comments array if backend returns newest first
  const displayComments = [...comments].reverse();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar">
        {displayComments.length === 0 ? (
          <div className="text-center text-slate-500 italic py-8">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          displayComments.map((comment: any) => (
            <div key={comment.id || comment.createdAt} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                {(comment.senderId || "U")?.[0]?.toUpperCase()}
              </div>
              <div className={`flex-1 p-3 rounded-lg rounded-tl-none ${comment.isOptimistic ? "opacity-60 bg-slate-100" : "bg-slate-100"}`}>
                <div className="flex justify-between items-center mb-1">
                  <Text as="span" variant="small" weight="medium">{comment.senderId || "Người dùng"}</Text>
                  <Text as="span" className="text-slate-500">
                    {safeFormatDate(comment.createdAt, "dd/MM/yyyy HH:mm")}
                  </Text>
                </div>
                <Text variant="small" className="whitespace-pre-wrap font-normal">{comment.content}</Text>
              </div>
            </div>
          ))
        )}
        
        {typingUsers.length > 0 && (
          <div className="flex gap-3 items-center text-slate-400 italic text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            Ai đó đang soạn tin...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto flex gap-2 pt-2 border-t">
        {allowedActions?.includes('CHAT') ? (
          <>
            <Textarea
              placeholder="Nhập nội dung trao đổi..."
              className="min-h-[40px] h-[40px] resize-none"
              value={commentText}
              onChange={handleInputChange}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
              onBlur={emitStopTyping}
            />
            <Button
              size="icon"
              className="shrink-0"
              onClick={handleSendComment}
              disabled={addComment.isPending || !commentText.trim()}
            >
              {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </>
        ) : (
          <div className="w-full text-center text-slate-400 text-sm py-2 italic border border-dashed rounded-md bg-slate-50">
            Bạn không có quyền tham gia thảo luận ở bước này.
          </div>
        )}
      </div>
    </div>
  );
}
