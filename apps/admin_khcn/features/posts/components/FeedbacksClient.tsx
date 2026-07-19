"use client";

import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/features/posts/api";
import { CitizenFeedback } from "@/features/posts/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Check,
  Eye,
  Mail,
  FileText,
  Calendar,
  User,
  MessageSquareDot,
} from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";


// ─── Pure UI helpers (không state, không side-effect) ────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PROCESSED":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          Đã xử lý
        </Badge>
      );
    case "READ":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
          Đã xem
        </Badge>
      );
    default:
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 animate-pulse hover:bg-orange-100">
          Mới
        </Badge>
      );
  }
}

function TypeBadge({ type }: { type: string }) {
  switch (type) {
    case "DRAFT_DOC":
      return (
        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
          Dự thảo VB
        </Badge>
      );
    case "SERVICE":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          Dịch vụ công
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-muted-foreground">Góp ý chung</Badge>;
  }
}

// ─── FeedbackDetailDialog — tự quản lý mutation của mình ─────────────────────

interface FeedbackDetailDialogProps {
  feedback: CitizenFeedback | null;
  open: boolean;
  onClose: () => void;
}

const FeedbackDetailDialog = React.memo(function FeedbackDetailDialog({
  feedback,
  open,
  onClose,
}: FeedbackDetailDialogProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      postsApi.updateFeedbackStatus(id, status),
    onSuccess: () => {
      toast.success("Đã chuyển trạng thái sang đã xử lý");
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Chi tiết ý kiến góp ý
          </DialogTitle>
        </DialogHeader>

        {feedback && (
          <div className="space-y-4 py-2">
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <Heading level="h3" className="font-bold">{feedback.title}</Heading>
                <div className="flex items-center gap-3 mt-2">
                  <TypeBadge type={feedback.feedbackType} />
                  <Text as="span" className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(feedback.createdAt).toLocaleString("vi-VN")}
                  </Text>
                </div>
              </div>
              <StatusBadge status={feedback.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 p-3 rounded-lg border">
                <Text className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Người gửi</Text>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {feedback.senderName}
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border">
                <Text className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Email liên hệ</Text>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {feedback.senderEmail}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Text className="font-bold">Nội dung góp ý:</Text>
              <div className="p-4 bg-muted/30 rounded-xl border text-foreground leading-relaxed min-h-[100px] text-sm">
                {feedback.content}
              </div>
            </div>

            {feedback.referenceId && (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <Text className="font-semibold text-blue-700 dark:text-blue-400">
                  ID tham chiếu tài liệu: {feedback.referenceId}
                </Text>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {feedback?.status !== "PROCESSED" && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={updateMutation.isPending}
              onClick={() =>
                feedback && updateMutation.mutate({ id: feedback.id, status: "PROCESSED" })
              }
            >
              <Check className="w-4 h-4 mr-2" /> Đánh dấu đã xử lý
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// ─── FeedbackRow — memoized, tự xử lý mutation "Đã xử lý" nhanh ─────────────

interface FeedbackRowProps {
  feedback: CitizenFeedback;
  onOpenDetail: (f: CitizenFeedback) => void;
}

const FeedbackRow = React.memo(function FeedbackRow({ feedback, onOpenDetail }: FeedbackRowProps) {
  const queryClient = useQueryClient();

  const quickProcessMutation = useMutation({
    mutationFn: (id: string) => postsApi.updateFeedbackStatus(id, "PROCESSED"),
    onSuccess: () => {
      toast.success("Đã đánh dấu đã xử lý");
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
      toast.error(message);
    },
  });

  const handleOpenDetail = useCallback(() => {
    onOpenDetail(feedback);
  }, [feedback, onOpenDetail]);

  const handleQuickProcess = useCallback(() => {
    quickProcessMutation.mutate(feedback.id);
  }, [feedback.id, quickProcessMutation]);

  return (
    <TableRow className={feedback.status === "NEW" ? "bg-orange-50/30 dark:bg-orange-950/10" : ""}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-violet-100 text-violet-700 font-bold">
              {(feedback.senderName || "A").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Text className="font-medium">{feedback.senderName}</Text>
            <Text className="text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" />
              {feedback.senderEmail}
            </Text>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <TypeBadge type={feedback.feedbackType} />
          <Text className="font-semibold line-clamp-1">{feedback.title}</Text>
        </div>
      </TableCell>

      <TableCell>
        <StatusBadge status={feedback.status} />
      </TableCell>

      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
        <Text as="span" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
        </Text>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenDetail}>
            <Eye className="w-4 h-4 mr-1" /> Chi tiết
          </Button>
          {feedback.status !== "PROCESSED" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              disabled={quickProcessMutation.isPending}
              onClick={handleQuickProcess}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

// ─── FeedbackTable — chỉ nhận data, không có state nào ───────────────────────

interface FeedbackTableProps {
  feedbacks: CitizenFeedback[];
  isLoading: boolean;
  onOpenDetail: (f: CitizenFeedback) => void;
}

const FeedbackTable = React.memo(function FeedbackTable({
  feedbacks,
  isLoading,
  onOpenDetail,
}: FeedbackTableProps) {
  return (
    <Card className="overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Người gửi</TableHead>
              <TableHead className="font-semibold">Loại & Tiêu đề</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Ngày nhận</TableHead>
              <TableHead className="text-right font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-10 h-10 text-muted-foreground/30" />
                    <Text className="text-muted-foreground italic">
                      Chưa có góp ý nào từ người dân gửi đến hệ thống.
                    </Text>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((f) => (
                <FeedbackRow key={f.id} feedback={f} onOpenDetail={onOpenDetail} />
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
});

// ─── Root: chỉ quản lý fetch data + dialog open/close state ──────────────────

export function FeedbacksClient() {
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<CitizenFeedback | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["feedbacks", 1, 50],
    queryFn: async () => {
      const response = await postsApi.getFeedbacks({ page: 1, limit: 50 });
      return response.data || [];
    },
    staleTime: 60_000,
  });

  // Đọc nhanh khi mở dialog (không cần invalidate, chỉ mark READ)
  const markReadMutation = useMutation({
    mutationFn: (id: string) => postsApi.updateFeedbackStatus(id, "READ"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedbacks"] }),
  });

  const handleOpenDetail = useCallback(
    (f: CitizenFeedback) => {
      setSelectedFeedback(f);
      setDialogOpen(true);
      if (f.status === "NEW") markReadMutation.mutate(f.id);
    },
    [markReadMutation],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const newCount = feedbacks.filter((f) => f.status === "NEW").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header — chỉ re-render khi feedbacks thay đổi */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1" className="font-bold tracking-tight">Góp ý công dân</Heading>
          <Text className="text-muted-foreground mt-1">
            Quản lý ý kiến đóng góp cho dự thảo văn bản và chất lượng dịch vụ
          </Text>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-sm">
          <MessageSquareDot className="w-3.5 h-3.5 mr-1.5" />
          {newCount} mới
        </Badge>
      </div>

      {/* Table — memoized, chỉ re-render khi feedbacks hoặc isLoading thay đổi */}
      <FeedbackTable
        feedbacks={feedbacks}
        isLoading={isLoading}
        onOpenDetail={handleOpenDetail}
      />

      {/* Dialog — component riêng, tự quản lý mutation "Đã xử lý" */}
      <FeedbackDetailDialog
        feedback={selectedFeedback}
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
