/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/features/posts/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, X, ShieldAlert, Trash2, MessageSquare, Clock } from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";


// ─── DeleteConfirmDialog — tự quản lý delete mutation ────────────────────────

interface DeleteConfirmDialogProps {
  commentId: string | null;
  onClose: () => void;
}

const DeleteConfirmDialog = React.memo(function DeleteConfirmDialog({
  commentId,
  onClose,
}: DeleteConfirmDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteComment(id),
    onSuccess: () => {
      toast.success("Đã xóa bình luận");
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lỗi khi xóa bình luận";
      toast.error(message);
    },
  });

  return (
    <AlertDialog open={!!commentId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Bình luận này sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
            onClick={() => commentId && deleteMutation.mutate(commentId)}
          >
            Xóa bình luận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

// ─── CommentRow — memoized, tự xử lý updateStatus mutation ───────────────────

interface CommentRowProps {
  comment: any;
  onRequestDelete: (id: string) => void;
}

const CommentRow = React.memo(function CommentRow({ comment, onRequestDelete }: CommentRowProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      postsApi.updateCommentStatus(id, status),
    onSuccess: (_, variables) => {
      const labels: Record<string, string> = {
        APPROVED: "Đã duyệt",
        REJECTED: "Đã từ chối",
        SPAM: "Đã đánh dấu spam",
      };
      toast.success(labels[variables.status] ?? `Đã cập nhật trạng thái`);
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
      toast.error(message);
    },
  });

  const handleApprove = useCallback(
    () => updateStatusMutation.mutate({ id: comment.id, status: "APPROVED" }),
    [comment.id, updateStatusMutation],
  );
  const handleReject = useCallback(
    () => updateStatusMutation.mutate({ id: comment.id, status: "REJECTED" }),
    [comment.id, updateStatusMutation],
  );
  const handleSpam = useCallback(
    () => updateStatusMutation.mutate({ id: comment.id, status: "SPAM" }),
    [comment.id, updateStatusMutation],
  );
  const handleDelete = useCallback(
    () => onRequestDelete(comment.id),
    [comment.id, onRequestDelete],
  );

  const isPending = updateStatusMutation.isPending;

  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
              {(comment.authorName || "A").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Text className="font-medium leading-none">{comment.authorName || "Ẩn danh"}</Text>
            <Text className="text-muted-foreground mt-1">
              {comment.authorEmail || comment.authorIp}
            </Text>
          </div>
        </div>
      </TableCell>

      <TableCell className="max-w-xs">
        // eslint-disable-next-line react/no-unescaped-entities
        <Text className="italic text-foreground/80 line-clamp-2">"{comment.content}"</Text>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50">
          Post #{comment.postId}
        </Badge>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(comment.createdAt).toLocaleString("vi-VN")}
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                disabled={isPending}
                onClick={handleApprove}
               iconStart={<Check className="w-4 h-4" />}></Button>
            </TooltipTrigger>
            <TooltipContent>Duyệt</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                disabled={isPending}
                onClick={handleReject}
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Từ chối</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                disabled={isPending}
                onClick={handleSpam}
               iconStart={<ShieldAlert className="w-4 h-4" />}></Button>
            </TooltipTrigger>
            <TooltipContent>Đánh dấu Spam</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
               iconStart={<Trash2 className="w-4 h-4" />}></Button>
            </TooltipTrigger>
            <TooltipContent>Xóa vĩnh viễn</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
});

// ─── CommentsTable — pure presentational, chỉ re-render khi data thay đổi ────

interface CommentsTableProps {
  comments: any[];
  isLoading: boolean;
  onRequestDelete: (id: string) => void;
}

const CommentsTable = React.memo(function CommentsTable({
  comments,
  isLoading,
  onRequestDelete,
}: CommentsTableProps) {
  return (
    <Card className="overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Người gửi</TableHead>
              <TableHead className="font-semibold">Nội dung bình luận</TableHead>
              <TableHead className="font-semibold">Bài viết</TableHead>
              <TableHead className="font-semibold">Ngày gửi</TableHead>
              <TableHead className="text-right font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : comments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <Text className="font-medium text-muted-foreground">
                      Tuyệt vời! Không có bình luận nào đang chờ duyệt.
                    </Text>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              comments.map((c) => (
                <CommentRow key={c.id} comment={c} onRequestDelete={onRequestDelete} />
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
});

// ─── Root: chỉ fetch data + quản lý deletingId state ─────────────────────────

export function CommentsClient() {
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", "PENDING", 1, 50],
    queryFn: async () => {
      const response = await postsApi.getComments({ status: "PENDING", page: 1, limit: 50 });
      return response.data;
    },
    staleTime: 60_000,
  });

  const handleRequestDelete = useCallback((id: string) => {
    setDeletingCommentId(id);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeletingCommentId(null);
  }, []);

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="font-bold tracking-tight">Kiểm duyệt bình luận</Heading>
            <Text className="text-muted-foreground mt-1">
              Đang hiển thị các bình luận chờ duyệt (PENDING)
            </Text>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {comments.length} chờ duyệt
          </Badge>
        </div>

        {/* Table — memoized, chỉ re-render khi list thay đổi */}
        <CommentsTable
          comments={comments}
          isLoading={isLoading}
          onRequestDelete={handleRequestDelete}
        />
      </div>

      {/* Dialog xác nhận xóa — tự quản lý delete mutation */}
      <DeleteConfirmDialog
        commentId={deletingCommentId}
        onClose={handleCloseDeleteDialog}
      />
    </>
  );
}
