"use client";

import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/features/posts/api";
import { CitizenQuestion } from "@/features/posts/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Check,
  Send,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  HelpCircle,
} from "lucide-react";

// ─── Pure UI ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ANSWERED":
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Đã trả lời</Badge>;
    case "PROCESSING":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Đang xử lý</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Từ chối</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Chờ tiếp nhận</Badge>;
  }
}

// ─── AnswerDialog — quản lý form state + answer mutation riêng ───────────────

interface AnswerDialogProps {
  question: CitizenQuestion | null;
  open: boolean;
  onClose: () => void;
}

const AnswerDialog = React.memo(function AnswerDialog({
  question,
  open,
  onClose,
}: AnswerDialogProps) {
  const queryClient = useQueryClient();
  // State form nằm trong dialog → không ảnh hưởng table ngoài
  const [answerContent, setAnswerContent] = useState(question?.answerContent ?? "");
  const [isPublic, setIsPublic] = useState(question?.isPublic ?? true);

  // Sync khi question thay đổi (mở dialog câu hỏi khác)
  React.useEffect(() => {
    setAnswerContent(question?.answerContent ?? "");
    setIsPublic(question?.isPublic ?? true);
  }, [question?.id, question?.answerContent, question?.isPublic]);

  const answerMutation = useMutation({
    mutationFn: (data: { id: string; answerContent: string; isPublic: boolean }) =>
      postsApi.answerQuestion(data.id, {
        answerContent: data.answerContent,
        isPublic: data.isPublic,
      }),
    onSuccess: () => {
      toast.success("Đã gửi câu trả lời");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      onClose();
    },
    onError: () => toast.error("Lỗi khi gửi câu trả lời"),
  });

  const handleAnswer = useCallback(() => {
    if (!question) return;
    if (!answerContent.trim()) {
      toast.error("Vui lòng nhập nội dung câu trả lời");
      return;
    }
    answerMutation.mutate({ id: question.id, answerContent, isPublic });
  }, [question, answerContent, isPublic, answerMutation]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            {question?.status === "ANSWERED"
              ? "Chi tiết câu hỏi & Trả lời"
              : "Trả lời câu hỏi từ công dân"}
          </DialogTitle>
        </DialogHeader>

        {question && (
          <div className="space-y-4 py-2">
            {/* Sender info */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-semibold mr-1">Người gửi:</span>
                {question.askedByName}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-semibold mr-1">SĐT:</span>
                {question.askedByPhone || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-semibold mr-1">Email:</span>
                {question.askedByEmail || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-semibold mr-1">Địa chỉ:</span>
                {question.address || "N/A"}
              </div>
            </div>

            <Separator />

            {/* Question content */}
            <div>
              <p className="text-sm font-bold mb-2">Nội dung câu hỏi:</p>
              <div className="p-4 rounded-xl border bg-blue-50/30 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900">
                <p className="font-semibold text-sm mb-1">{question.title}</p>
                <p className="text-sm italic text-foreground/80">{question.content}</p>
              </div>
            </div>

            {/* Answer textarea */}
            <div className="space-y-2">
              <Label htmlFor="answer" className="text-sm font-bold">
                Câu trả lời của cơ quan chức năng:
              </Label>
              <Textarea
                id="answer"
                placeholder="Nhập nội dung phản hồi chính thức cho người dân..."
                className="min-h-[130px]"
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                readOnly={question.status === "ANSWERED"}
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(!!checked)}
                disabled={question.status === "ANSWERED"}
              />
              <label
                htmlFor="isPublic"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Công khai câu hỏi và câu trả lời lên Portal
              </label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {question?.status !== "ANSWERED" && (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAnswer}
              disabled={answerMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" /> Gửi phản hồi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// ─── QuestionRow — memoized, không có state hay mutation ─────────────────────

interface QuestionRowProps {
  question: CitizenQuestion;
  onOpenAnswer: (q: CitizenQuestion) => void;
}

const QuestionRow = React.memo(function QuestionRow({
  question,
  onOpenAnswer,
}: QuestionRowProps) {
  const handleClick = useCallback(() => {
    onOpenAnswer(question);
  }, [question, onOpenAnswer]);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-bold">
              {(question.askedByName || "A").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{question.askedByName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {question.askedByPhone || question.askedByEmail}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="max-w-sm">
        <p className="text-sm font-semibold line-clamp-1">{question.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 italic">
          "{question.content}"
        </p>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-1">
          <StatusBadge status={question.status} />
          {question.isPublic && (
            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 w-fit">
              Công khai
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(question.createdAt).toLocaleDateString("vi-VN")}
        </span>
      </TableCell>

      <TableCell className="text-right">
        <Button
          variant={question.status === "ANSWERED" ? "outline" : "default"}
          size="sm"
          className={question.status !== "ANSWERED" ? "bg-blue-600 hover:bg-blue-700" : ""}
          onClick={handleClick}
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1" />
          {question.status === "ANSWERED" ? "Xem lại" : "Trả lời"}
        </Button>
      </TableCell>
    </TableRow>
  );
});

// ─── QuestionsTable — presentational, nhận data + callback ───────────────────

interface QuestionsTableProps {
  questions: CitizenQuestion[];
  isLoading: boolean;
  onOpenAnswer: (q: CitizenQuestion) => void;
}

const QuestionsTable = React.memo(function QuestionsTable({
  questions,
  isLoading,
  onOpenAnswer,
}: QuestionsTableProps) {
  return (
    <Card className="overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Người gửi</TableHead>
              <TableHead className="font-semibold">Tiêu đề & Nội dung</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
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
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Check className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tuyệt vời! Hệ thống không có câu hỏi nào chưa xử lý.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <QuestionRow key={q.id} question={q} onOpenAnswer={onOpenAnswer} />
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
});

// ─── Root: chỉ fetch + quản lý selectedQuestion để mở dialog ─────────────────

export function QuestionsClient() {
  const [selectedQuestion, setSelectedQuestion] = useState<CitizenQuestion | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", 1, 50],
    queryFn: async () => {
      const response = await postsApi.getQuestions({ page: 1, limit: 50 });
      return response.data || [];
    },
    staleTime: 60_000,
  });

  const handleOpenAnswer = useCallback((q: CitizenQuestion) => {
    setSelectedQuestion(q);
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const pendingCount = questions.filter(
    (q) => q.status === "PENDING" || q.status === "PROCESSING",
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hỏi đáp công dân</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hệ thống tiếp nhận và trả lời ý kiến, vướng mắc của người dân
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            {pendingCount} chờ xử lý
          </Badge>
        )}
      </div>

      {/* Table — memoized */}
      <QuestionsTable
        questions={questions}
        isLoading={isLoading}
        onOpenAnswer={handleOpenAnswer}
      />

      {/* Dialog — form state + mutation nằm trong dialog */}
      <AnswerDialog
        question={selectedQuestion}
        open={dialogOpen}
        onClose={handleClose}
      />
    </div>
  );
}
