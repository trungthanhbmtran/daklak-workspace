/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  FileText,
  UserCheck,
  Cpu,
  Layers,
  Paperclip,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  Loader2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { HrmTask } from "../../types/task";
import { useEvaluateTask, useTaskHistory, useTaskSteps, useTaskSubtasks } from "../../hooks/useTasks";
import { useUser } from "@/hooks/useUser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskEvaluationApprovalSheetProps {
  task: HrmTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

export function TaskEvaluationApprovalSheet({
  task,
  open,
  onOpenChange,
  onSuccess,
}: TaskEvaluationApprovalSheetProps) {
  const { user } = useUser();
  const taskId = Number(task.id);

  // ── Queries lấy dữ liệu đối chiếu (Chỉ fetch khi Sheet thực sự mở - Lazy Gating) ──
  const { data: historyData } = useTaskHistory(taskId, { enabled: open });
  const { data: stepsData } = useTaskSteps(taskId, { enabled: open });
  const { data: subtasksData } = useTaskSubtasks(taskId, { enabled: open });

  const historyList: any[] = (historyData as any)?.data ?? [];
  const stepsList: any[] = (stepsData as any)?.data ?? task.steps ?? [];
  const subtasksList: any[] = (subtasksData as any)?.data ?? task.subTasks ?? [];

  // ── Thống kê Dữ liệu Hệ thống (System Metrics) ──
  const systemMetrics = useMemo(() => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const completedDate = task.completedAt
      ? new Date(task.completedAt)
      : task.updatedAt
      ? new Date(task.updatedAt)
      : new Date();

    let diffDays = 0;
    let delayStatus: "EARLY" | "ON_TIME" | "LATE" = "ON_TIME";

    if (dueDate) {
      const dueDay = new Date(dueDate).setHours(0, 0, 0, 0);
      const doneDay = new Date(completedDate).setHours(0, 0, 0, 0);
      diffDays = Math.round((doneDay - dueDay) / 86_400_000);
      if (diffDays < 0) {
        delayStatus = "EARLY";
      } else if (diffDays > 0) {
        delayStatus = "LATE";
      } else {
        delayStatus = "ON_TIME";
      }
    }

    const totalSteps = stepsList.length;
    const completedSteps = stepsList.filter(
      (s) => s.status?.toUpperCase() === "COMPLETED"
    ).length;
    const stepCompletionRate =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 100;

    const totalSub = subtasksList.length;
    const completedSub = subtasksList.filter(
      (s) => s.status?.toUpperCase() === "COMPLETED"
    ).length;

    // Tìm các lần xin gia hạn
    const extensions = historyList.filter(
      (h) => h.action?.includes("Gia hạn") || h.action?.includes("extend")
    );

    return {
      dueDate,
      completedDate,
      diffDays: Math.abs(diffDays),
      delayStatus,
      totalSteps,
      completedSteps,
      stepCompletionRate,
      totalSub,
      completedSub,
      extensionCount: extensions.length,
      extensions,
    };
  }, [task, stepsList, subtasksList, historyList]);

  // ── Trích xuất Nguồn Tự báo cáo của Chuyên viên (Assignee Self-Report) ──
  const selfReport = useMemo(() => {
    // 1. Kiểm tra trong metadata của task
    const metaEval = task.metadata?.evaluation;
    const metaSelf = task.metadata?.selfReport;

    // 2. Tìm evidence báo cáo gần nhất trong lịch sử
    const evidenceLogs = historyList
      .filter((h) => h.action?.includes("Hoàn thành") || h.newValue?.evidence || h.detail)
      .reverse();

    const latestEvidenceLog = evidenceLogs[0];
    const evidenceText =
      metaSelf?.summary ||
      latestEvidenceLog?.newValue?.evidence ||
      latestEvidenceLog?.note ||
      task.description ||
      "Đã hoàn thành toàn bộ các hạng mục công việc được phân công.";

    // Trích xuất danh sách file minh chứng
    const files: { name: string; url: string }[] = [];
    if (metaSelf?.files && Array.isArray(metaSelf.files)) {
      files.push(...metaSelf.files);
    }
    if (task.attachments && Array.isArray(task.attachments)) {
      task.attachments.forEach((att) => {
        files.push({ name: att.fileName || "Tài liệu minh chứng", url: att.fileUrl || "#" });
      });
    }

    return {
      summary: evidenceText,
      files,
      submittedAt: metaSelf?.submittedAt || latestEvidenceLog?.createdAt || task.updatedAt,
      deliverable: metaSelf?.outputProduct || "Bản thảo kết quả / Báo cáo hoàn thành",
    };
  }, [task, historyList]);

  // ── State Chấm điểm của Lãnh đạo (Leader Evaluation Matrix) ──
  const [volumePct, setVolumePct] = useState<number>(100);
  const [difficultyK, setDifficultyK] = useState<number>(1.0);
  const [isUnexpected, setIsUnexpected] = useState<boolean>(false);
  const [qualityGrade, setQualityGrade] = useState<"EXCELLENT" | "STANDARD" | "MINOR" | "MODERATE" | "SEVERE">("STANDARD");
  const [isObjectiveDelay, setIsObjectiveDelay] = useState<boolean>(false);
  const [attitudeScore, setAttitudeScore] = useState<number>(9.5);
  const [feedback, setFeedback] = useState<string>("");

  // Dialog trả lại yêu cầu bổ sung
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState<boolean>(false);
  const [returnReason, setReturnReason] = useState<string>("");

  // ── Tính toán Điểm số 4 Thành tố Thời gian thực ──
  const calculatedScores = useMemo(() => {
    // 1. Thành tố Khối lượng (A) - Tỷ trọng 35%
    let volScore = (volumePct / 100) * difficultyK * 100;
    if (isUnexpected) volScore += 10; // Đột xuất thưởng +10%
    volScore = Math.min(120, Math.max(0, volScore)); // Trần 120%

    // 2. Thành tố Chất lượng (B) - Tỷ trọng 35%
    let qualScore = 100;
    if (qualityGrade === "EXCELLENT") qualScore = 110;
    else if (qualityGrade === "STANDARD") qualScore = 100;
    else if (qualityGrade === "MINOR") qualScore = 95;
    else if (qualityGrade === "MODERATE") qualScore = 85;
    else if (qualityGrade === "SEVERE") qualScore = 65;

    // 3. Thành tố Tiến độ (C) - Tỷ trọng 20%
    let progScore = 100;
    if (systemMetrics.delayStatus === "EARLY") {
      progScore = 110; // Sớm hạn thưởng 10%
    } else if (systemMetrics.delayStatus === "LATE") {
      if (isObjectiveDelay) {
        progScore = 100; // Bảo lưu nếu do lý do khách quan
      } else {
        const penalty = systemMetrics.diffDays * 5; // Trừ 5% mỗi ngày trễ
        progScore = Math.max(40, 100 - penalty);
      }
    } else {
      progScore = 100;
    }

    // 4. Thành tố Trách nhiệm / Thái độ (D) - Tỷ trọng 10%
    const attScore = Math.min(10, Math.max(1, attitudeScore)) * 10; // Quy đổi thang 100

    // Tổng hợp điểm: A*0.35 + B*0.35 + C*0.20 + D*0.10
    const finalScore = Number(
      (volScore * 0.35 + qualScore * 0.35 + progScore * 0.2 + attScore * 0.1).toFixed(1)
    );

    // Xếp loại đề xuất
    let rank = "HOÀN THÀNH XUẤT SẮC";
    let rankColor = "bg-emerald-600 text-white";
    let rankBadgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";

    if (finalScore >= 90) {
      rank = "HOÀN THÀNH XUẤT SẮC";
      rankColor = "bg-emerald-600 text-white border-emerald-700";
    } else if (finalScore >= 70) {
      rank = "HOÀN THÀNH TỐT";
      rankColor = "bg-blue-600 text-white border-blue-700";
    } else if (finalScore >= 50) {
      rank = "HOÀN THÀNH";
      rankColor = "bg-amber-500 text-white border-amber-600";
    } else {
      rank = "KHÔNG HOÀN THÀNH";
      rankColor = "bg-red-600 text-white border-red-700";
      rankBadgeVariant = "destructive";
    }

    return {
      volScore: Number(volScore.toFixed(1)),
      qualScore: Number(qualScore.toFixed(1)),
      progScore: Number(progScore.toFixed(1)),
      attScore: Number(attScore.toFixed(1)),
      finalScore,
      rank,
      rankColor,
      rankBadgeVariant,
    };
  }, [volumePct, difficultyK, isUnexpected, qualityGrade, systemMetrics, isObjectiveDelay, attitudeScore]);

  // ── Mutation Đánh giá ──
  const evaluateTaskMutation = useEvaluateTask();

  const handleApprove = async () => {
    try {
      await evaluateTaskMutation.mutateAsync({
        id: taskId,
        payload: {
          action: "APPROVE",
          scores: {
            volumePct,
            difficultyK,
            isUnexpected,
            qualityGrade,
            qualityScore: calculatedScores.qualScore,
            timelinessScore: calculatedScores.progScore,
            attitudeScore,
            totalScore: calculatedScores.finalScore,
            rankGrade: calculatedScores.rank,
          },
          feedback: feedback.trim() || `Đạt ${calculatedScores.finalScore} điểm. Đánh giá xếp loại: ${calculatedScores.rank}.`,
        },
      });
      onSuccess?.();
      onOpenChange(false);
    } catch {
      // Error đã được sonner toast trong hook
    }
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      return;
    }
    try {
      await evaluateTaskMutation.mutateAsync({
        id: taskId,
        payload: {
          action: "RETURN",
          rejectReason: returnReason.trim(),
          feedback: returnReason.trim(),
        },
      });
      setIsReturnDialogOpen(false);
      onSuccess?.();
      onOpenChange(false);
    } catch {
      // Error đã toast
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-3xl w-full p-0 flex flex-col h-full bg-slate-50 min-w-0">
          {/* HEADER CỐ ĐỊNH */}
          <div className="p-6 bg-white border-b shrink-0 min-w-0">
            <SheetHeader className="min-w-0">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1 px-2.5 py-0.5 font-semibold shrink-0">
                      <Award className="w-3.5 h-3.5" />
                      Thẩm định & Phê duyệt Lãnh đạo
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">
                      Mã #{task.id}
                    </span>
                  </div>
                  <SheetTitle className="text-lg sm:text-xl font-bold leading-tight wrap-break-word min-w-0 text-foreground pt-1">
                    {task.title}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground leading-relaxed wrap-break-word">
                    Đối chiếu song song dữ liệu tự động từ hệ thống và báo cáo kết quả của chuyên viên để chốt điểm KPI.
                  </SheetDescription>
                </div>
              </div>

              {/* CHIP NGỮ CẢNH */}
              <div className="flex flex-wrap items-center gap-2 pt-3 text-xs min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border text-foreground font-medium min-w-0 max-w-full">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Người xử lý: {task.assigneeName || "Chưa xác định"}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border text-foreground font-medium min-w-0 max-w-full">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Hạn chót: {safeFormatDate(task.dueDate, "dd/MM/yyyy HH:mm")}</span>
                </span>
                {task.sourceDocumentRef && (
                  <Badge variant="outline" className="font-mono text-[11px] py-1 bg-background shrink-0">
                    Căn cứ: {task.sourceDocumentRef}
                  </Badge>
                )}
              </div>
            </SheetHeader>
          </div>

          {/* NỘI DUNG CUỘN CHÍNH (NATIVE SCROLLING, CHỐNG SCROLL TRAP) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 min-w-0">
            {/* ══════════════════════════════════════════════════════════════════
                PHÂN VÙNG 1: BẢNG ĐỐI CHIẾU SONG SONG 2 NGUỒN DỮ LIỆU
            ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-primary shrink-0" />
                  1. Đối chiếu kết quả thực tế (Hai nguồn dữ liệu)
                </Label>
                <span className="text-[11px] text-muted-foreground italic">
                  So sánh tự động theo thời gian thực
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                {/* ── CỘT 1: NGUỒN TỪ HỆ THỐNG ── */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3.5 min-w-0 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                      NGUỒN TỪ HỆ THỐNG (Đo lường tự động)
                    </span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-[10px] font-semibold">
                      Chính xác 100%
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-xs min-w-0">
                    {/* Tiến độ & Checklist */}
                    <div className="flex items-center justify-between py-1 border-b border-blue-100 min-w-0">
                      <span className="text-slate-600">Tiến độ Checklist:</span>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>{systemMetrics.completedSteps}/{systemMetrics.totalSteps} bước ({systemMetrics.stepCompletionRate}%)</span>
                        {systemMetrics.stepCompletionRate === 100 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Nhiệm vụ con */}
                    {systemMetrics.totalSub > 0 && (
                      <div className="flex items-center justify-between py-1 border-b border-blue-100 min-w-0">
                        <span className="text-slate-600">Nhiệm vụ con:</span>
                        <span className="font-semibold text-slate-800">
                          {systemMetrics.completedSub}/{systemMetrics.totalSub} hoàn thành
                        </span>
                      </div>
                    )}

                    {/* So sánh Thời hạn */}
                    <div className="flex items-start justify-between py-1 border-b border-blue-100 min-w-0 gap-2">
                      <span className="text-slate-600 shrink-0">Độ lệch thời gian:</span>
                      <div className="text-right min-w-0">
                        {systemMetrics.delayStatus === "EARLY" && (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">
                            ⚡ Sớm {systemMetrics.diffDays} ngày (+Thưởng)
                          </Badge>
                        )}
                        {systemMetrics.delayStatus === "ON_TIME" && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-bold">
                            ✓ Đúng hạn quy định (100%)
                          </Badge>
                        )}
                        {systemMetrics.delayStatus === "LATE" && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 font-bold">
                            ⚠️ Trễ {systemMetrics.diffDays} ngày (-Trừ điểm)
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Gia hạn */}
                    <div className="flex items-center justify-between py-1 border-b border-blue-100 min-w-0">
                      <span className="text-slate-600">Gia hạn hợp lệ:</span>
                      <span className="font-medium text-slate-800">
                        {systemMetrics.extensionCount > 0 ? (
                          <span className="text-amber-700 font-bold">{systemMetrics.extensionCount} lần</span>
                        ) : (
                          "0 lần (Không phát sinh)"
                        )}
                      </span>
                    </div>

                    {/* Điểm cơ sở VTVL */}
                    <div className="flex items-center justify-between py-1 min-w-0">
                      <span className="text-slate-600">Điểm cơ sở VTVL:</span>
                      <span className="font-bold text-indigo-700">
                        +{task.baseScore || 0} điểm (Trọng số: {task.weight || 1.0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── CỘT 2: NGUỒN TỪ TỰ BÁO CÁO CỦA CÁN BỘ ── */}
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3.5 min-w-0 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900">
                      <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      NGUỒN TỰ BÁO CÁO (Cán bộ nộp)
                    </span>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-[10px] font-semibold">
                      Tự giải trình
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-xs min-w-0">
                    {/* Báo cáo tóm tắt */}
                    <div className="py-1 border-b border-purple-100 min-w-0">
                      <span className="text-slate-600 font-medium block mb-1">Giải trình kết quả:</span>
                      <p className="text-slate-800 italic bg-white/80 p-2 rounded-lg border border-purple-100 wrap-break-word leading-relaxed text-[11px]">
                        "{selfReport.summary}"
                      </p>
                    </div>

                    {/* Sản phẩm đầu ra */}
                    <div className="flex items-start justify-between py-1 border-b border-purple-100 min-w-0 gap-2">
                      <span className="text-slate-600 shrink-0">Sản phẩm đầu ra:</span>
                      <span className="font-semibold text-slate-800 wrap-break-word text-right">
                        {selfReport.deliverable}
                      </span>
                    </div>

                    {/* Minh chứng đính kèm */}
                    <div className="py-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                          Tài liệu minh chứng ({selfReport.files.length}):
                        </span>
                      </div>

                      {selfReport.files.length > 0 ? (
                        <div className="space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
                          {selfReport.files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-1.5 px-2 bg-white rounded border border-purple-100 hover:bg-purple-50 transition-colors text-blue-600 text-[11px] truncate"
                            >
                              <span className="truncate flex-1">{file.name}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 ml-1.5 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">
                          Chưa đính kèm file (Đã cập nhật checklist).
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                PHÂN VÙNG 2: BẢNG THẨM ĐỊNH & CHO ĐIỂM CỦA LÃNH ĐẠO (4 THÀNH TỐ)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-4 min-w-0">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  2. Thẩm định & Cho điểm KPI của Lãnh đạo (Khung chuẩn 4 thành tố)
                </Label>
              </div>

              {/* KHỐI 4 THÀNH TỐ ĐÁNH GIÁ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                {/* 1. THÀNH TỐ A: KHỐI LƯỢNG */}
                <div className="p-4 rounded-xl border bg-card space-y-3 min-w-0 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      A. Khối lượng công việc (35%)
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700">
                      {calculatedScores.volScore}%
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1 text-[11px] text-muted-foreground">
                        <span>Tỷ lệ hoàn thành (%):</span>
                        <span className="font-bold text-foreground">{volumePct}%</span>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={120}
                        value={volumePct}
                        onChange={(e) => setVolumePct(Number(e.target.value) || 0)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">Hệ số độ khó K:</span>
                        <select
                          value={difficultyK}
                          onChange={(e) => setDifficultyK(Number(e.target.value))}
                          aria-label="Hệ số độ khó K"
                          className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground font-medium"
                        >
                          <option value={1.0}>1.0 (Chuẩn)</option>
                          <option value={1.2}>1.2 (Khá)</option>
                          <option value={1.5}>1.5 (Phức tạp)</option>
                          <option value={2.0}>2.0 (Trọng tâm)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={() => setIsUnexpected(!isUnexpected)}
                          className={`h-8 px-2 rounded-md border text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                            isUnexpected
                              ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Việc đột xuất (+10%)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. THÀNH TỐ B: CHẤT LƯỢNG */}
                <div className="p-4 rounded-xl border bg-card space-y-3 min-w-0 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      B. Chất lượng sản phẩm (35%)
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs bg-emerald-50 text-emerald-700">
                      {calculatedScores.qualScore}đ
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-[11px] text-muted-foreground block">Mức độ chất lượng sản phẩm:</span>
                    <select
                      value={qualityGrade}
                      onChange={(e) => setQualityGrade(e.target.value as any)}
                      aria-label="Mức độ chất lượng sản phẩm"
                      className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground font-semibold"
                    >
                      <option value="EXCELLENT">🌟 Xuất sắc vượt trội (+10% thưởng)</option>
                      <option value="STANDARD">✓ Đạt chuẩn yêu cầu (100% điểm)</option>
                      <option value="MINOR">⚠️ Lỗi kỹ thuật / văn bản nhỏ (-5%)</option>
                      <option value="MODERATE">❗ Lỗi nội dung trung bình (-15%)</option>
                      <option value="SEVERE">❌ Lỗi nghiêm trọng / làm lại (-35%)</option>
                    </select>

                    <p className="text-[10px] text-muted-foreground italic leading-tight pt-1">
                      {qualityGrade === "EXCELLENT" && "Sản phẩm đạt chất lượng cao, có sáng kiến được áp dụng."}
                      {qualityGrade === "STANDARD" && "Sản phẩm đáp ứng đầy đủ yêu cầu nghiệp vụ chuyên môn."}
                      {qualityGrade === "MINOR" && "Có chỉnh sửa nhỏ về định dạng, căn lề, lỗi chính tả."}
                      {qualityGrade === "MODERATE" && "Phải sửa đổi bổ sung số liệu hoặc căn cứ pháp lý."}
                      {qualityGrade === "SEVERE" && "Sản phẩm không đạt chuẩn, trả lại chỉnh sửa nhiều lần."}
                    </p>
                  </div>
                </div>

                {/* 3. THÀNH TỐ C: TIẾN ĐỘ */}
                <div className="p-4 rounded-xl border bg-card space-y-3 min-w-0 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      C. Tiến độ giải quyết (20%)
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs bg-purple-50 text-purple-700">
                      {calculatedScores.progScore}đ
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-muted/30 border text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tình trạng hệ thống:</span>
                        <span className="font-bold">
                          {systemMetrics.delayStatus === "EARLY" && "Hoàn thành trước hạn (+10%)"}
                          {systemMetrics.delayStatus === "ON_TIME" && "Đúng hạn (100%)"}
                          {systemMetrics.delayStatus === "LATE" && `Trễ ${systemMetrics.diffDays} ngày (-${systemMetrics.diffDays * 5}%)`}
                        </span>
                      </div>
                    </div>

                    {systemMetrics.delayStatus === "LATE" && (
                      <button
                        type="button"
                        onClick={() => setIsObjectiveDelay(!isObjectiveDelay)}
                        className={`w-full py-1.5 px-2 rounded border text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                          isObjectiveDelay
                            ? "bg-blue-100 text-blue-900 border-blue-300 font-bold"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        {isObjectiveDelay ? "Đã bảo lưu điểm (Lý do khách quan)" : "Bảo lưu điểm tiến độ (Khách quan/Gia hạn)"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. THÀNH TỐ D: TRÁCH NHIỆM & PHỐI HỢP */}
                <div className="p-4 rounded-xl border bg-card space-y-3 min-w-0 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      D. Thái độ & Trách nhiệm (10%)
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs bg-amber-50 text-amber-700">
                      {attitudeScore}/10đ
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Mức độ chủ động, phối hợp:</span>
                      <span className="font-bold text-foreground">{attitudeScore} / 10 điểm</span>
                    </div>
                    <Input
                      type="number"
                      step={0.5}
                      min={1}
                      max={10}
                      value={attitudeScore}
                      onChange={(e) => setAttitudeScore(Number(e.target.value) || 0)}
                      className="h-8 text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      Đánh giá tinh thần phục vụ, chủ động trao đổi và phối hợp phòng ban.
                    </p>
                  </div>
                </div>
              </div>

              {/* THẺ TỔNG HỢP KẾT QUẢ ĐIỂM SỐ & XẾP LOẠI THỜI GIAN THỰC */}
              <div className="p-4 sm:p-5 rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-background to-primary/10 shadow-sm min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Tổng hợp Điểm nhiệm vụ (Thang 100 điểm)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono tracking-tight">
                        {calculatedScores.finalScore}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">/ 100 điểm</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>Khối lượng: <strong className="text-foreground">{calculatedScores.volScore}%</strong></span>
                      <span>•</span>
                      <span>Chất lượng: <strong className="text-foreground">{calculatedScores.qualScore}đ</strong></span>
                      <span>•</span>
                      <span>Tiến độ: <strong className="text-foreground">{calculatedScores.progScore}đ</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                    <span className="text-xs text-muted-foreground font-medium">Xếp loại đề xuất:</span>
                    <Badge className={`text-xs sm:text-sm px-3.5 py-1.5 font-bold shadow-sm ${calculatedScores.rankColor}`}>
                      {calculatedScores.rank}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* NHẬN XÉT & CHỈ ĐẠO CỦA LÃNH ĐẠO */}
              <div className="space-y-2 min-w-0">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                  3. Ý kiến Nhận xét & Chỉ đạo của Lãnh đạo
                </Label>
                <Textarea
                  placeholder="Nhập ý kiến đánh giá, khen thưởng hoặc chỉ đạo bổ sung cho cán bộ..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[75px] text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* FOOTER CỐ ĐỊNH VỚI HÀNH ĐỘNG RÕ RÀNG */}
          <SheetFooter className="p-4 px-6 bg-white border-t shrink-0 flex flex-row items-center justify-between gap-3 min-w-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReturnDialogOpen(true)}
              disabled={evaluateTaskMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Yêu cầu làm lại / Bổ sung
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={evaluateTaskMutation.isPending}
                className="h-9 text-xs"
              >
                Đóng
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApprove}
                disabled={evaluateTaskMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-xs font-semibold shadow-sm"
              >
                {evaluateTaskMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                )}
                Phê duyệt & Chốt điểm đánh giá
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* DIALOG XÁC NHẬN YÊU CẦU LÀM LẠI */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Yêu cầu hoàn thiện lại công việc
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Công việc sẽ được chuyển lại cho cán bộ xử lý kèm theo lý do chỉ đạo. Vui lòng ghi rõ nội dung cần chỉnh sửa hoặc tài liệu minh chứng cần bổ sung.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs font-medium">Nội dung chỉ đạo / Lý do trả lại (*):</Label>
            <Textarea
              placeholder="Ví dụ: Thiếu văn bản nghiệm thu đính kèm, cần rà soát lại số liệu bảng tổng hợp..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="min-h-[90px] text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReturnDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleReturn}
              disabled={!returnReason.trim() || evaluateTaskMutation.isPending}
            >
              {evaluateTaskMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Gửi yêu cầu làm lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
