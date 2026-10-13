/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Building2,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Check,
  Zap,
  TrendingUp,
  MonitorCheck,
  ChevronRight,
  ShieldCheck,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  hrmRankQuotasApi,
  type AiSuggestedQuotaItem,
  type AiSuggestQuotaResult,
} from "@/features/hrm/api/rank-quotas.api";
import { useCreateMasterPlan } from "@/features/hrm/hooks";

interface AiQuotaPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitName?: string;
  unitCode?: string;
  rankName?: string;
  rankCode?: string;
  classification?: 'CONG_CHUC' | 'VIEN_CHUC' | 'DANG';
  domainCode?: string;
  headcount?: number;
  onApplyQuotas: (items: AiSuggestedQuotaItem[]) => void;
}

export function AiQuotaPlanModal({
  isOpen,
  onClose,
  unitName = 'Đơn vị',
  unitCode = '',
  rankName = 'Chuyên viên',
  rankCode = 'JOB_POSITION',
  classification = 'CONG_CHUC',
  domainCode = 'GENERIC',
  headcount = 1,
  onApplyQuotas,
}: AiQuotaPlanModalProps) {
  const [targetScope, setTargetScope] = useState<'INDIVIDUAL' | 'UNIT'>('INDIVIDUAL');
  const [goalOrientation, setGoalOrientation] = useState<
    'STANDARD' | 'INTENSIVE' | 'DIGITAL_TRANSFORMATION'
  >('STANDARD');

  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiSuggestQuotaResult | null>(null);
  const [resultTab, setResultTab] = useState<'QUOTAS' | 'PLAN'>('QUOTAS');

  const { mutate: createMasterPlan, isPending: isCreatingPlan } = useCreateMasterPlan();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await hrmRankQuotasApi.aiSuggest({
        unitName,
        unitCode,
        rankName,
        rankCode,
        classification,
        domainCode,
        targetScope,
        goalOrientation,
        headcount,
      });

      if (res && res.data) {
        setAiResult(res.data);
        toast.success('AI đã hoàn tất tính toán định mức và xây dựng kế hoạch!');
      } else {
        toast.error('Không nhận được phản hồi từ AI, vui lòng thử lại.');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi gọi trợ lý AI. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToTable = () => {
    if (!aiResult?.suggestedQuotas?.length) return;
    onApplyQuotas(aiResult.suggestedQuotas);
    toast.success(`Đã áp dụng ${aiResult.suggestedQuotas.length} nhiệm vụ định mức vào bảng làm việc!`);
    onClose();
  };

  const handleCreatePlanFromAi = () => {
    if (!aiResult?.suggestedPlan) return;
    const plan = aiResult.suggestedPlan;
    createMasterPlan(
      {
        title: plan.title,
        description: aiResult.strategicGoal,
        type: 'SMART_GOAL',
        status: 'ACTIVE',
      },
      {
        onSuccess: () => {
          toast.success('Đã khởi tạo Kế hoạch thực hiện nhiệm vụ thành công!');
          onClose();
        },
        onError: () => {
          toast.error('Không thể tạo kế hoạch lúc này. Vui lòng thử lại.');
        },
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 flex flex-col min-w-0 h-full border-l shadow-2xl bg-background"
      >
        {/* HEADER */}
        <SheetHeader className="p-6 border-b shrink-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent relative min-w-0">
          <div className="flex items-start justify-between gap-4 min-w-0">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <div className="p-2 bg-primary rounded-xl text-primary-foreground shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <SheetTitle className="text-xl font-black text-foreground truncate min-w-0">
                  Trợ lý AI Đề xuất Định mức & Kế hoạch Nhiệm vụ
                </SheetTitle>
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary text-xs font-semibold gap-1 border-primary/20"
                >
                  <Sparkles className="w-3 h-3" /> Chuẩn Trung ương
                </Badge>
              </div>
              <SheetDescription className="text-xs text-muted-foreground leading-relaxed break-words min-w-0">
                Tự động phân tích biên chế, chức trách vị trí việc làm và mảng nghiệp vụ để tính toán định mức khối lượng công việc khoa học theo NĐ 62, NĐ 106, QĐ 137.
              </SheetDescription>
            </div>
          </div>

          {/* CHIP THÔNG TIN NGỮ CẢNH */}
          <div className="flex flex-wrap items-center gap-2 pt-3 text-xs min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border text-foreground font-medium min-w-0 truncate">
              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{unitName}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border text-foreground font-medium min-w-0 truncate">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{rankName}</span>
            </span>
            <Badge variant="outline" className="font-mono text-[11px] py-1 bg-background shrink-0">
              Định biên: {headcount} người
            </Badge>
          </div>
        </SheetHeader>

        {/* NỘI DUNG CUỘN CHÍNH */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6 min-w-0">
            {/* KHỐI 1: TÙY CHỌN ĐẦU VÀO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              {/* CHỌN ĐỐI TƯỢNG */}
              <div className="p-4 rounded-xl border bg-card space-y-2 min-w-0 shadow-2xs">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                  1. Phạm vi áp dụng
                </Label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTargetScope('INDIVIDUAL')}
                    className={`p-3 rounded-lg border text-left transition-all min-w-0 ${
                      targetScope === 'INDIVIDUAL'
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                        : 'border-border bg-background hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">Vị trí cá nhân</span>
                      {targetScope === 'INDIVIDUAL' && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug truncate">
                      Cho vị trí {rankName}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetScope('UNIT')}
                    className={`p-3 rounded-lg border text-left transition-all min-w-0 ${
                      targetScope === 'UNIT'
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                        : 'border-border bg-background hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">Toàn bộ Đơn vị</span>
                      {targetScope === 'UNIT' && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug truncate">
                      Tổng hợp cấp phòng/ban
                    </p>
                  </button>
                </div>
              </div>

              {/* CHỌN ĐỊNH HƯỚNG MỤC TIÊU */}
              <div className="p-4 rounded-xl border bg-card space-y-2 min-w-0 shadow-2xs">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
                  2. Định hướng mục tiêu kỳ
                </Label>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setGoalOrientation('STANDARD')}
                    className={`p-2.5 rounded-lg border text-center transition-all min-w-0 flex flex-col items-center gap-1 ${
                      goalOrientation === 'STANDARD'
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <Scale className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold truncate">Chuẩn hóa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoalOrientation('INTENSIVE')}
                    className={`p-2.5 rounded-lg border text-center transition-all min-w-0 flex flex-col items-center gap-1 ${
                      goalOrientation === 'INTENSIVE'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold ring-1 ring-amber-500/30'
                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold truncate">Cao điểm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoalOrientation('DIGITAL_TRANSFORMATION')}
                    className={`p-2.5 rounded-lg border text-center transition-all min-w-0 flex flex-col items-center gap-1 ${
                      goalOrientation === 'DIGITAL_TRANSFORMATION'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold ring-1 ring-blue-500/30'
                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <MonitorCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-[11px] font-bold truncate">Chuyển đổi số</span>
                  </button>
                </div>
              </div>
            </div>

            {/* NÚT KÍCH HOẠT AI */}
            <div className="flex justify-center pt-1 min-w-0">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                size="lg"
                className="w-full sm:w-auto px-8 py-6 rounded-2xl font-black text-sm gap-2.5 shadow-md bg-linear-to-r from-primary via-indigo-600 to-primary hover:opacity-95 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    AI Đang Phân Tích Định Biên & Tính Toán Chỉ Tiêu...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5 shrink-0" />
                    Khởi Chạy AI Phân Tích & Tự Động Sinh Định Mức
                  </>
                )}
              </Button>
            </div>

            {/* KHỐI 2: HIỂN THỊ KẾT QUẢ AI */}
            {aiResult && (
              <div className="space-y-4 pt-2 min-w-0 animate-in fade-in-50 duration-300">
                {/* TÓM TẮT CHIẾN LƯỢC TỪ AI */}
                <Card className="border-primary/20 bg-primary/5 rounded-2xl overflow-hidden shadow-xs min-w-0">
                  <CardHeader className="pb-2 pt-4 px-5 min-w-0">
                    <CardTitle className="text-sm font-black flex items-center gap-2 text-primary min-w-0">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span className="truncate">Định hướng Chiến lược & Mục tiêu SMART</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4 space-y-2 text-xs leading-relaxed min-w-0">
                    <p className="font-semibold text-foreground break-words min-w-0">
                      {aiResult.strategicGoal}
                    </p>
                    <p className="text-muted-foreground italic text-[11px] break-words min-w-0">
                      * Căn cứ: {aiResult.rationale}
                    </p>
                  </CardContent>
                </Card>

                {/* TABS KẾT QUẢ: ĐỊNH MỨC HOẶC KẾ HOẠCH */}
                <Tabs
                  value={resultTab}
                  onValueChange={(v: any) => setResultTab(v)}
                  className="w-full flex flex-col min-w-0"
                >
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-muted rounded-xl h-10 shrink-0">
                    <TabsTrigger
                      value="QUOTAS"
                      className="rounded-lg text-xs font-bold gap-1.5 flex items-center min-w-0"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        Định mức Nhiệm vụ ({aiResult.suggestedQuotas.length})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="PLAN"
                      className="rounded-lg text-xs font-bold gap-1.5 flex items-center min-w-0"
                    >
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Bản Kế hoạch Hành động</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="QUOTAS" className="mt-3 min-w-0 space-y-3">
                    <div className="rounded-xl border overflow-auto max-h-[380px] bg-card min-w-0">
                      <div className="min-w-[620px]">
                        <Table className="w-full text-xs min-w-0">
                        <TableHeader className="bg-muted/90 sticky top-0 backdrop-blur-sm border-b z-10">
                          <TableRow>
                            <TableHead className="w-[40px] text-center text-xs font-bold">#</TableHead>
                            <TableHead className="text-xs font-bold min-w-0">Nhiệm vụ trọng tâm</TableHead>
                            <TableHead className="w-[75px] text-center text-xs font-bold">ĐVT</TableHead>
                            <TableHead className="w-[85px] text-center text-xs font-bold text-blue-600 dark:text-blue-400">
                              Tháng
                            </TableHead>
                            <TableHead className="w-[85px] text-center text-xs font-bold text-amber-600 dark:text-amber-400">
                              Quý
                            </TableHead>
                            <TableHead className="w-[85px] text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              Năm
                            </TableHead>
                            <TableHead className="w-[75px] text-center text-xs font-bold">W (%)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aiResult.suggestedQuotas.map((q, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/15 border-b text-xs">
                              <TableCell className="text-center font-bold text-muted-foreground py-2.5">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="py-2.5 pr-2 min-w-0">
                                <p className="font-medium text-foreground leading-snug break-words">
                                  {q.taskName}
                                </p>
                                {q.outputProduct && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                    Sản phẩm: {q.outputProduct}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-center text-muted-foreground">
                                <Badge variant="outline" className="font-normal text-[10px] px-1 py-0">
                                  {q.unit}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400">
                                {q.monthlyTarget}
                              </TableCell>
                              <TableCell className="text-center font-bold text-amber-600 dark:text-amber-400">
                                {q.quarterlyTarget}
                              </TableCell>
                              <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                                {q.yearlyTarget}
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                {q.weight}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={handleApplyToTable}
                        className="gap-2 font-bold px-6 rounded-xl shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Áp dụng toàn bộ vào bảng Định mức hiện tại
                      </Button>
                    </div>
                  </TabsContent>

                  {/* TAB 2: KẾ HOẠCH HÀNH ĐỘNG */}
                  <TabsContent value="PLAN" className="mt-3 min-w-0 space-y-3">
                    {aiResult.suggestedPlan && (
                      <div className="space-y-3 min-w-0">
                        <div className="p-3.5 rounded-xl border bg-card min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate uppercase tracking-wider mb-2">
                            {aiResult.suggestedPlan.title}
                          </h4>
                          <div className="space-y-2 min-w-0">
                            {aiResult.suggestedPlan.phases.map((phase, pIdx) => (
                              <div
                                key={pIdx}
                                className="p-3 rounded-lg bg-muted/40 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 min-w-0"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Badge className="font-black text-[11px] shrink-0">
                                    {phase.phase}
                                  </Badge>
                                  <p className="text-xs font-medium text-foreground break-words min-w-0">
                                    {phase.focus}
                                  </p>
                                </div>
                                <div className="text-[11px] text-muted-foreground shrink-0 sm:text-right">
                                  Đầu ra: <strong className="text-foreground">{phase.expectedOutput}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <Button
                            onClick={handleCreatePlanFromAi}
                            disabled={isCreatingPlan}
                            variant="secondary"
                            className="gap-2 font-bold px-6 rounded-xl border shadow-xs"
                          >
                            <Calendar className="w-4 h-4 text-primary" />
                            {isCreatingPlan ? 'Đang tạo kế hoạch...' : 'Khởi tạo Kế hoạch (Master Plan)'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
