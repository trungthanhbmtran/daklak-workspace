/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  FileText,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  Loader2,
  Sparkles,
  Scale,
  Check,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/components/ui/typography";
import { toast } from "sonner";

import { useTaskDetail, useEvaluateTask, useTaskSteps } from "../../hooks/useTasks";
import { useUser } from "@/hooks/useUser";
import { safeFormatDate, translateTaskStatus, getTaskStatusColor } from "./task-ui-utils";

interface TaskEvaluateClientProps {
  id: string | number;
}

export function TaskEvaluateClient({ id }: TaskEvaluateClientProps) {
  const router = useRouter();
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;
  const isValidId = !Number.isNaN(numericId) && numericId > 0;
  const { user } = useUser();

  // Queries
  const { data: detailData, isLoading, isError } = useTaskDetail(isValidId ? numericId : undefined, {
    enabled: isValidId,
  });

  const rawDetail = (detailData as any)?.data ?? detailData;
  const currentTask: any =
    rawDetail && typeof rawDetail === "object" && rawDetail.data && typeof rawDetail.data === "object" && !Array.isArray(rawDetail.data)
      ? rawDetail.data
      : rawDetail;

  const { data: stepsData } = useTaskSteps(isValidId ? numericId : 0, { enabled: isValidId });
  const stepsList: any[] = (stepsData as any)?.data ?? currentTask?.steps ?? [];

  // Thống kê gợi ý thời hạn từ hệ thống
  const systemTimeliness = useMemo(() => {
    if (!currentTask?.dueDate) return { score: 90, label: "Đúng hạn (Không quy định hạn)" };
    const due = new Date(currentTask.dueDate);
    const comp = currentTask.completedAt ? new Date(currentTask.completedAt) : new Date();
    if (isNaN(due.getTime()) || isNaN(comp.getTime())) return { score: 90, label: "Đúng hạn" };

    const diffDays = Math.ceil((due.getTime() - comp.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return { score: 100, label: `Sớm hạn ${diffDays} ngày (+10đ)` };
    if (diffDays === 0) return { score: 90, label: "Hoàn thành đúng hạn (Chuẩn 90đ)" };
    const late = Math.abs(diffDays);
    if (late <= 3) return { score: 70, label: `Trễ hạn ${late} ngày (-20đ)` };
    return { score: 50, label: `Trễ hạn nghiêm trọng ${late} ngày (-40đ)` };
  }, [currentTask]);

  // Form State: 4 Thành tố Đề án 01-BTCTU
  const [c1Timeliness, setC1Timeliness] = useState<number>(90);
  const [c2Quality, setC2Quality] = useState<number>(90);
  const [c3Proactiveness, setC3Proactiveness] = useState<number>(85);
  const [c4Discipline, setC4Discipline] = useState<number>(95);
  const [bonusPenalty, setBonusPenalty] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  // Tự động gán điểm thời hạn gợi ý khi nạp xong task
  useMemo(() => {
    if (systemTimeliness?.score) {
      setC1Timeliness(systemTimeliness.score);
    }
  }, [systemTimeliness]);

  // Hệ số K & Tỷ lệ gánh vác
  const difficultyK = currentTask?.kpiWeight || currentTask?.difficultyFactor || 1.0;
  const baseScore = currentTask?.baseScore || currentTask?.kpiScore || 10;
  const primaryAssignee =
    (currentTask?.assignees || []).find((a: any) => a.role === "PRIMARY" || a.isPrimary) ||
    currentTask?.assignees?.[0] ||
    { percentage: 100, employeeName: currentTask?.assigneeName || "Cán bộ chủ trì" };
  const primaryPercentage = primaryAssignee?.percentage || primaryAssignee?.weight || 100;

  // Tính toán điểm số
  const rawWeightedScore = useMemo(() => {
    const s = c1Timeliness * 0.25 + c2Quality * 0.4 + c3Proactiveness * 0.2 + c4Discipline * 0.15 + bonusPenalty;
    return Math.max(0, Math.min(100, Math.round(s)));
  }, [c1Timeliness, c2Quality, c3Proactiveness, c4Discipline, bonusPenalty]);

  const finalKpiScore = useMemo(() => {
    return Math.round((baseScore * (rawWeightedScore / 100)) * difficultyK * (primaryPercentage / 100));
  }, [baseScore, rawWeightedScore, difficultyK, primaryPercentage]);

  const rankClassification = useMemo(() => {
    if (rawWeightedScore >= 90) return { label: "HOÀN THÀNH XUẤT SẮC", grade: "A", color: "bg-emerald-600 text-white" };
    if (rawWeightedScore >= 70) return { label: "HOÀN THÀNH TỐT", grade: "B", color: "bg-blue-600 text-white" };
    if (rawWeightedScore >= 50) return { label: "HOÀN THÀNH", grade: "C", color: "bg-amber-600 text-white" };
    return { label: "KHÔNG HOÀN THÀNH", grade: "D", color: "bg-red-600 text-white" };
  }, [rawWeightedScore]);

  // Mutation
  const evaluateTask = useEvaluateTask();

  const handleApprove = async () => {
    if (!isValidId) return;
    try {
      await evaluateTask.mutateAsync({
        id: numericId,
        payload: {
          action: "APPROVE",
          status: "COMPLETED",
          scores: {
            volumePct: primaryPercentage,
            difficultyK,
            isUnexpected: currentTask.metadata?.isIncidental || false,
            qualityGrade: rankClassification.label,
            qualityScore: c2Quality,
            timelinessScore: c1Timeliness,
            attitudeScore: c3Proactiveness,
            totalScore: rawWeightedScore,
            rankGrade: rankClassification.label,
          },
          feedback: feedback.trim() || undefined,
          evidenceData: {
            c1Timeliness,
            c2Quality,
            c3Proactiveness,
            c4Discipline,
            bonusPenalty,
            rawWeightedScore,
            finalKpiScore,
            evaluatorEmployeeCode: user?.employeeCode,
            evaluatedAt: new Date().toISOString(),
          },
        },
      });
      toast.success("Đã thẩm định và chốt điểm KPI công vụ thành công!");
      router.push(`/services/hrm/work-plans/tasks/${numericId}`);
    } catch {
      toast.error("Không thể hoàn tất thẩm định nhiệm vụ. Vui lòng thử lại.");
    }
  };

  const handleReturn = async () => {
    if (!isValidId) return;
    if (!feedback.trim()) {
      toast.error("Vui lòng nêu rõ lý do trả lại / yêu cầu chỉnh sửa trong phần Nhận xét");
      return;
    }
    try {
      await evaluateTask.mutateAsync({
        id: numericId,
        payload: {
          action: "RETURN",
          status: "RETURNED",
          rejectReason: feedback.trim(),
          feedback: feedback.trim(),
        },
      });
      toast.warning("Đã trả lại nhiệm vụ yêu cầu bổ sung minh chứng.");
      router.push(`/services/hrm/work-plans/tasks/${numericId}`);
    } catch {
      toast.error("Có lỗi xảy ra khi trả lại nhiệm vụ.");
    }
  };

  if (!isValidId) {
    return (
      <div className="flex flex-col min-h-[60vh] bg-background p-6 md:p-10 items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <Heading level="h4" className="text-slate-800 mb-2">Mã công việc không hợp lệ</Heading>
        <Link href="/services/hrm/work-plans/tasks">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1300px] mx-auto w-full p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-md" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 h-96 bg-slate-200 rounded-2xl" />
          <div className="col-span-4 h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !currentTask) {
    return (
      <div className="flex flex-col min-h-[60vh] bg-background p-6 md:p-10 items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <Heading level="h4" className="text-slate-800 mb-2">Không tìm thấy công việc #{numericId}</Heading>
        <Link href="/services/hrm/work-plans/tasks">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-[1300px] mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/services/hrm/work-plans/tasks" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Quản lý công việc
              </Link>
              <span>/</span>
              <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}`} className="hover:text-primary transition-colors">
                Nhiệm vụ #{currentTask.id}
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-700">Thẩm định & Đánh giá KPI</span>
            </div>
            <Heading level="h2" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Phiếu Thẩm định & Đánh giá Điểm số KPI Công vụ
            </Heading>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href={`/services/hrm/work-plans/tasks/${currentTask.id}`}>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-slate-600">
                <ArrowLeft className="w-4 h-4" /> Quay lại chi tiết
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReturn}
              disabled={evaluateTask.isPending}
              className="h-9 gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              <RotateCcw className="w-4 h-4" /> Yêu cầu chỉnh sửa
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={evaluateTask.isPending}
              className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              {evaluateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Phê duyệt & Chốt điểm KPI
            </Button>
          </div>
        </div>

        {/* Task Summary Banner */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`font-semibold ${getTaskStatusColor(currentTask.status)}`}>
                {translateTaskStatus(currentTask.status)}
              </Badge>
              <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200 font-semibold">
                Độ khó K = {difficultyK}
              </Badge>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 font-semibold">
                Cơ số: {baseScore}đ
              </Badge>
            </div>
            <div className="text-xs text-slate-500">
              Hạn chót: <span className="font-semibold text-slate-800">{safeFormatDate(currentTask.dueDate, "dd/MM/yyyy HH:mm")}</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">{currentTask.title}</h1>
            {currentTask.description && (
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">{currentTask.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-2xs">Cán bộ chủ trì</span>
              <span className="font-bold text-slate-800">{primaryAssignee?.employeeName || currentTask.assigneeName || "—"}</span>
              <span className="text-2xs text-blue-600 ml-1 font-semibold">({primaryPercentage}%)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-2xs">Tiến độ báo cáo</span>
              <span className="font-bold text-slate-800">{currentTask.progress ?? 0}%</span>
              <span className="text-2xs text-emerald-600 ml-1">({stepsList.length} bước quy trình)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-2xs">Gợi ý thời hạn</span>
              <span className="font-bold text-slate-800">{systemTimeliness.label}</span>
            </div>
          </div>
        </Card>

        {/* 12-Column Evaluation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main 4 Criteria Area (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Scale className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">4 Thành tố Thẩm định (Đề án 01-BTCTU)</h3>
              </div>

              {/* Thành tố 1: Tiến độ & Thời hạn (25%) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      1. Tiến độ & Thời hạn thực hiện (Trọng số 25%)
                    </span>
                    <span className="text-2xs text-slate-500">Đối chiếu thời gian hoàn thành thực tế so với hạn định</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={c1Timeliness}
                      onChange={(e) => setC1Timeliness(Number(e.target.value) || 0)}
                      className="w-20 h-8 text-center text-sm font-bold text-blue-700 bg-white"
                    />
                    <span className="text-xs text-slate-500 font-bold">/ 100đ</span>
                  </div>
                </div>
                <div className="text-2xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">Hệ thống đề xuất:</span> {systemTimeliness.label}. Có thể điều chỉnh điểm tùy theo tính chất khách quan.
                </div>
              </div>

              {/* Thành tố 2: Chất lượng & Sản phẩm đầu ra (40%) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      2. Chất lượng sản phẩm & Kết quả đầu ra (Trọng số 40%)
                    </span>
                    <span className="text-2xs text-slate-500">Độ chuẩn xác, thể thức văn bản, không phải chỉnh sửa nhiều lần</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={c2Quality}
                      onChange={(e) => setC2Quality(Number(e.target.value) || 0)}
                      className="w-20 h-8 text-center text-sm font-bold text-indigo-700 bg-white"
                    />
                    <span className="text-xs text-slate-500 font-bold">/ 100đ</span>
                  </div>
                </div>
              </div>

              {/* Thành tố 3: Chủ động & Sáng tạo (20%) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      3. Tinh thần chủ động, trách nhiệm & Sáng tạo (Trọng số 20%)
                    </span>
                    <span className="text-2xs text-slate-500">Đề xuất giải pháp cải tiến, báo cáo khó khăn vướng mắc kịp thời</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={c3Proactiveness}
                      onChange={(e) => setC3Proactiveness(Number(e.target.value) || 0)}
                      className="w-20 h-8 text-center text-sm font-bold text-emerald-700 bg-white"
                    />
                    <span className="text-xs text-slate-500 font-bold">/ 100đ</span>
                  </div>
                </div>
              </div>

              {/* Thành tố 4: Kỷ luật & Phối hợp (15%) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      4. Kỷ luật công vụ & Phối hợp công tác (Trọng số 15%)
                    </span>
                    <span className="text-2xs text-slate-500">Chấp hành phân công, phối hợp ăn ý với các bộ phận liên quan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={c4Discipline}
                      onChange={(e) => setC4Discipline(Number(e.target.value) || 0)}
                      className="w-20 h-8 text-center text-sm font-bold text-amber-700 bg-white"
                    />
                    <span className="text-xs text-slate-500 font-bold">/ 100đ</span>
                  </div>
                </div>
              </div>

              {/* Điểm thưởng / Điểm trừ */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Điểm Thưởng (+) / Phạt (-) đột xuất</span>
                  <span className="text-2xs text-slate-500">Áp dụng cho sáng kiến đặc biệt hoặc vi phạm quy chế</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={-30}
                    max={30}
                    value={bonusPenalty}
                    onChange={(e) => setBonusPenalty(Number(e.target.value) || 0)}
                    className="w-20 h-8 text-center text-xs font-bold"
                  />
                  <span className="text-xs text-slate-500 font-semibold">điểm</span>
                </div>
              </div>

              {/* Nhận xét của Lãnh đạo thẩm định */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label htmlFor="feedback" className="text-xs font-semibold text-slate-800">
                  Nhận xét & Ý kiến kết luận của Lãnh đạo thẩm định
                </Label>
                <Textarea
                  id="feedback"
                  rows={3}
                  placeholder="Ghi nhận ưu điểm, hạn chế cần rút kinh nghiệm hoặc lý do yêu cầu chỉnh sửa..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>
            </Card>
          </div>

          {/* Right Sticky Column: Kết quả Xếp loại & Thao tác (4 Columns) */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Kết quả Xếp loại & Điểm số</h3>
              </div>

              {/* Badge Xếp loại to */}
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">Xếp loại công vụ</span>
                <div className={`inline-block px-4 py-1.5 rounded-full font-bold text-sm shadow-xs ${rankClassification.color}`}>
                  HẠNG {rankClassification.grade} — {rankClassification.label}
                </div>
                <div className="text-xs text-slate-500 pt-1">
                  Điểm thô tổng hợp: <span className="font-bold text-slate-800">{rawWeightedScore} / 100đ</span>
                </div>
              </div>

              {/* Bảng phân rã tính điểm */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cơ số điểm nhiệm vụ:</span>
                  <span className="font-bold text-slate-800">{baseScore} điểm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Hệ số độ khó (K):</span>
                  <span className="font-bold text-indigo-700">K = {difficultyK}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tỷ lệ gánh vác chủ trì:</span>
                  <span className="font-bold text-blue-700">{primaryPercentage}%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                  <span className="text-2xs font-bold text-emerald-900 uppercase tracking-wider block">
                    Điểm KPI chốt chính thức
                  </span>
                  <div className="text-3xl font-extrabold text-emerald-700">
                    {finalKpiScore} <span className="text-sm font-semibold text-emerald-600">điểm</span>
                  </div>
                  <span className="text-2xs text-emerald-600">Ghi nhận vào hồ sơ KPI tháng của cán bộ</span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="space-y-2.5 pt-2">
                <Button
                  size="lg"
                  onClick={handleApprove}
                  disabled={evaluateTask.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-sm gap-2"
                >
                  {evaluateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Phê duyệt & Chốt điểm KPI
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReturn}
                  disabled={evaluateTask.isPending}
                  className="w-full h-10 text-xs font-semibold text-amber-700 border-amber-200 hover:bg-amber-50"
                >
                  Yêu cầu bổ sung minh chứng
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
