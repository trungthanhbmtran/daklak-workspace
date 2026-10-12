"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calculator,
  Check,
  CircleHelp,
  Clock3,
  FlaskConical,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Zap,
  Tag,
  Sparkles,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskKpiApi, VariableDef, CustomRule, GlobalKpiSettings, KpiPreviewVariables, KpiFormulaVersion } from '../../../api/task-kpi.api';

const DEFAULT_SETTINGS: GlobalKpiSettings = {
  baseFormula: '(C / Q) * W * 100',
  enableQualityScore: true,
  qualityWeight: 30,
  enablePenalty: true,
  penaltyPerDay: 2,
  customRules: [],
};

const DEFAULT_VARIABLES: KpiPreviewVariables = { Q: 10, C: 8, W: 1, D: 2, S: 80 };

function responseData<T>(response: any): T {
  return (response?.data?.data ?? response?.data ?? response) as T;
}

export function KpiFormulasClient() {
  const queryClient = useQueryClient();
  const [baseFormula, setBaseFormula] = useState(DEFAULT_SETTINGS.baseFormula);
  const [enableQualityScore, setEnableQualityScore] = useState(DEFAULT_SETTINGS.enableQualityScore);
  const [qualityWeight, setQualityWeight] = useState(DEFAULT_SETTINGS.qualityWeight);
  const [enablePenalty, setEnablePenalty] = useState(DEFAULT_SETTINGS.enablePenalty);
  const [penaltyPerDay, setPenaltyPerDay] = useState(DEFAULT_SETTINGS.penaltyPerDay);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [previewVariables, setPreviewVariables] = useState<KpiPreviewVariables>(DEFAULT_VARIABLES);
  const [previewDomainCode, setPreviewDomainCode] = useState('GENERIC');
  const [isCustomDomainInput, setIsCustomDomainInput] = useState(false);

  const { data: variablesResponse } = useQuery({
    queryKey: ['kpi-system-variables'],
    queryFn: async () => responseData<VariableDef[]>(await taskKpiApi.getSystemVariables()),
    staleTime: Infinity,
  });
  const systemVariables = variablesResponse || [];

  const { data: settingsResponse, isLoading } = useQuery({
    queryKey: ['kpi-global-settings'],
    queryFn: async () => responseData<GlobalKpiSettings>(await taskKpiApi.getGlobalSettings()),
  });
  const savedSettings = settingsResponse;

  const { data: versionsResponse } = useQuery({
    queryKey: ['kpi-global-settings-versions'],
    queryFn: async () => responseData<KpiFormulaVersion[]>(await taskKpiApi.getGlobalSettingVersions()),
  });
  const savedVersions = versionsResponse || [];

  useEffect(() => {
    if (!savedSettings) return;
    setBaseFormula(savedSettings.baseFormula ?? DEFAULT_SETTINGS.baseFormula);
    setEnableQualityScore(savedSettings.enableQualityScore ?? DEFAULT_SETTINGS.enableQualityScore);
    setQualityWeight(savedSettings.qualityWeight ?? DEFAULT_SETTINGS.qualityWeight);
    setEnablePenalty(savedSettings.enablePenalty ?? DEFAULT_SETTINGS.enablePenalty);
    setPenaltyPerDay(savedSettings.penaltyPerDay ?? DEFAULT_SETTINGS.penaltyPerDay);
    setCustomRules(savedSettings.customRules ?? []);
  }, [savedSettings]);

  const settings: GlobalKpiSettings = useMemo(() => ({
    baseFormula,
    enableQualityScore,
    qualityWeight,
    enablePenalty,
    penaltyPerDay,
    customRules,
  }), [baseFormula, enableQualityScore, qualityWeight, enablePenalty, penaltyPerDay, customRules]);

  const previewMutation = useMutation({
    mutationFn: async (overrideDomain?: string | void) => responseData<any>(await taskKpiApi.previewGlobalSettings({
      settings,
      variables: previewVariables,
      domainCode: (typeof overrideDomain === 'string' && overrideDomain) ? overrideDomain : (previewDomainCode || 'GENERIC'),
    })),
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || 'Không thể thử công thức'),
  });

  // Tự động tính thử khi nạp xong cấu hình ban đầu
  useEffect(() => {
    if (savedSettings && !previewMutation.data && !previewMutation.isPending) {
      previewMutation.mutate();
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => taskKpiApi.saveGlobalSettings(settings),
    onSuccess: () => {
      toast.success('Đã lưu và áp dụng phiên bản công thức mới');
      previewMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['kpi-global-settings'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-global-settings-versions'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || 'Không thể lưu cấu hình KPI'),
  });

  const handleSave = async () => {
    try {
      const preview: any = await previewMutation.mutateAsync();
      if (!preview?.valid) {
        toast.error(preview?.error || 'Công thức chưa hợp lệ. Hãy kiểm tra lại trước khi lưu.');
        return;
      }
      saveMutation.mutate();
    } catch { /* mutation displays the request error */ }
  };

  const addFormulaToken = (token: string) => {
    setBaseFormula((current) => {
      const trimmed = current.trimEnd();
      const operator = /^[QqCcWwDdSs0-9.)]$/.test(trimmed.slice(-1)) && /^[QqCcWwDdSs0-9.(]$/.test(token)
        ? ' * '
        : ' ';
      return `${trimmed}${trimmed ? operator : ''}${token}`;
    });
    previewMutation.reset();
  };

  const addCustomRule = () => {
    const newRule: CustomRule = {
      domainCode: `DOM_NHOM_${customRules.length + 1}`,
      name: '',
      formula: '(C / Q) * W * 100',
    };
    setCustomRules((current) => [...current, newRule]);
    previewMutation.reset();
  };

  const updateRule = (index: number, patch: Partial<CustomRule>) => {
    setCustomRules((current) => current.map((rule, i) => i === index ? { ...rule, ...patch } : rule));
    previewMutation.reset();
  };

  const resetChanges = () => {
    if (!savedSettings) return;
    setBaseFormula(savedSettings.baseFormula ?? DEFAULT_SETTINGS.baseFormula);
    setEnableQualityScore(savedSettings.enableQualityScore ?? DEFAULT_SETTINGS.enableQualityScore);
    setQualityWeight(savedSettings.qualityWeight ?? DEFAULT_SETTINGS.qualityWeight);
    setEnablePenalty(savedSettings.enablePenalty ?? DEFAULT_SETTINGS.enablePenalty);
    setPenaltyPerDay(savedSettings.penaltyPerDay ?? DEFAULT_SETTINGS.penaltyPerDay);
    setCustomRules(savedSettings.customRules ?? []);
    previewMutation.reset();
  };

  const loadVersion = (item: KpiFormulaVersion) => {
    try {
      const versionSettings = JSON.parse(item.settingsJson) as GlobalKpiSettings;
      setBaseFormula(versionSettings.baseFormula);
      setEnableQualityScore(versionSettings.enableQualityScore);
      setQualityWeight(versionSettings.qualityWeight);
      setEnablePenalty(versionSettings.enablePenalty);
      setPenaltyPerDay(versionSettings.penaltyPerDay);
      setCustomRules(versionSettings.customRules || []);
      previewMutation.reset();
      toast.info(`Đã nạp phiên bản v${item.version} để xem/sửa; lưu sẽ tạo phiên bản mới.`);
    } catch {
      toast.error('Không đọc được cấu hình của phiên bản này.');
    }
  };

  // Nạp nhanh nhóm ngoại lệ vào bộ thử và tự động tính luôn
  const selectRuleForPreview = (rule: CustomRule) => {
    setPreviewDomainCode(rule.domainCode);
    setIsCustomDomainInput(false);
    previewMutation.mutate(rule.domainCode);
    toast.success(`Đã nạp nhóm "${rule.name || rule.domainCode}" vào bộ thử công thức.`);
  };

  // Xác định công thức đang có hiệu lực trong bộ thử
  const activeTestingFormula = useMemo(() => {
    if (previewDomainCode === 'GENERIC' || !previewDomainCode) {
      return { type: 'chung', name: 'Công thức chung toàn hệ thống', formula: baseFormula };
    }
    const matched = customRules.find((r) => r.domainCode === previewDomainCode);
    if (matched) {
      return { type: 'rieng', name: matched.name || matched.domainCode, formula: matched.formula };
    }
    return { type: 'khac', name: `Mã nhóm ${previewDomainCode} (chưa cấu hình riêng, dùng chung)`, formula: baseFormula };
  }, [previewDomainCode, customRules, baseFormula]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải cấu hình KPI...</div>;

  const preview = previewMutation.data;
  const previewScore = preview?.valid ? Number(preview.score).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-36 lg:px-8">
      {/* HEADER */}
      <header className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-indigo-50/80 via-background to-background p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8 shadow-xs">
        <div className="flex items-start gap-4 min-w-0">
          <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-sm shrink-0">
            <Calculator className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">Cấu hình KPI · Toàn hệ thống</span>
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50/50 text-indigo-700 font-mono text-[11px]">
                Theo Hướng dẫn 05-HD/TU
              </Badge>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl text-foreground break-words">
              Công thức tính điểm KPI
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Cấu hình công thức chuẩn, quy tắc ghi đè theo nhóm mảng việc và các hệ số điều chỉnh chất lượng/tiến độ. Mọi thông tin trong ô input đều hiển thị rõ ràng, kèm bộ công cụ thử nghiệm trực quan.
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-xl border bg-card px-4 py-3 text-sm shadow-2xs">
          <div className="text-xs text-muted-foreground">Phiên bản đang áp dụng</div>
          <div className="mt-1 font-mono text-xl font-bold text-indigo-600">v{savedSettings?.version || 1}</div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.9fr)]">
        {/* MAIN COLUMN */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* 1. CÔNG THỨC CHUNG */}
          <Card className="overflow-hidden rounded-2xl shadow-xs">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-indigo-600" /> 1. Công thức chung toàn hệ thống
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">Mặc định: GENERIC</Badge>
              </div>
              <CardDescription>
                Áp dụng cho tất cả các nhiệm vụ không thuộc nhóm ngoại lệ chuyên biệt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 lg:p-6">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Chèn nhanh biến số và toán tử:</div>
                <div className="flex flex-wrap gap-2">
                  {systemVariables.map((variable) => (
                    <Button
                      key={variable.code}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addFormulaToken(variable.code)}
                      className="h-8 font-mono font-bold text-xs hover:border-indigo-400 hover:bg-indigo-50/50"
                      title={`${variable.code}: ${variable.name}`}
                    >
                      + {variable.code}
                      <span className="ml-1 text-[10px] font-normal text-muted-foreground">({variable.code === 'Q' ? 'Chỉ tiêu' : variable.code === 'C' ? 'Xong' : variable.code === 'W' ? 'Trọng số' : variable.code === 'D' ? 'Trễ' : 'Chất lượng'})</span>
                    </Button>
                  ))}
                  {[['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/'], ['(', '('], [')', ')']].map(([label, token]) => (
                    <Button
                      key={label}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addFormulaToken(token)}
                      className="h-8 min-w-8 px-2 font-mono font-bold bg-muted/30 hover:bg-muted"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="base-formula" className="font-semibold text-sm">
                    Biểu thức tính điểm công việc
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">{baseFormula.length}/256 ký tự</span>
                </div>
                <Textarea
                  id="base-formula"
                  value={baseFormula}
                  onChange={(event) => { setBaseFormula(event.target.value); previewMutation.reset(); }}
                  placeholder="(C / Q) * W * 100"
                  maxLength={256}
                  className="min-h-24 resize-y bg-background font-mono text-base font-semibold text-indigo-950 dark:text-indigo-200 tracking-wide border-indigo-200/80 focus-visible:ring-indigo-400"
                />
              </div>

              {/* Giải thích trực quan công thức chung */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs leading-relaxed text-indigo-950 dark:text-indigo-200">
                <div className="font-semibold flex items-center gap-1.5 mb-1.5 text-indigo-900 dark:text-indigo-100">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Ý nghĩa biểu thức đang cấu hình:
                </div>
                <div className="flex items-center flex-wrap gap-2 font-mono text-xs text-foreground bg-background/80 p-2.5 rounded-lg border border-indigo-100">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">(C ÷ Q)</span>
                  <span className="text-muted-foreground">Tỷ lệ hoàn thành nhiệm vụ</span>
                  <span>×</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">W</span>
                  <span className="text-muted-foreground">Trọng số việc</span>
                  <span>×</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">100</span>
                  <span className="text-muted-foreground">Quy đổi thang điểm 100</span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  * Điểm chất lượng $S$ và điểm phạt trễ hạn $D$ sẽ được cộng/trừ bổ sung tự động theo tùy chọn ở Mục 2.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. ĐIỀU CHỈNH ĐIỂM BỔ SUNG */}
          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg">2. Điều chỉnh điểm bổ sung</CardTitle>
              <CardDescription>Bật/tắt và thiết lập ngưỡng tác động của điểm chất lượng và tiến độ.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 md:grid-cols-2 lg:p-6">
              {/* Điểm chất lượng */}
              <div className="space-y-4 rounded-xl border bg-card p-4.5 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Điểm chất lượng (S)
                  </div>
                  <Switch
                    checked={enableQualityScore}
                    onCheckedChange={(value) => { setEnableQualityScore(value); previewMutation.reset(); }}
                  />
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Cộng thêm dựa trên điểm chất lượng thực tế do Lãnh đạo chấm (thang điểm 0–100).
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="quality-weight" className="text-xs font-semibold text-foreground">
                    Tỷ trọng điểm chất lượng tối đa
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="quality-weight"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      disabled={!enableQualityScore}
                      value={qualityWeight}
                      onChange={(event) => { setQualityWeight(Number(event.target.value)); previewMutation.reset(); }}
                      className="pr-10 font-mono font-bold text-base"
                    />
                    <span className="pointer-events-none absolute right-3 text-sm font-semibold text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-emerald-50/60 p-2.5 text-[11px] leading-4 text-emerald-900 border border-emerald-100">
                  <b>Ví dụ:</b> Đạt 100/100 điểm chất lượng sẽ được cộng tối đa <b>+{qualityWeight} điểm</b>. Đạt 80 điểm cộng <b>+{(80 * qualityWeight / 100).toFixed(1)} điểm</b>.
                </div>
              </div>

              {/* Trừ điểm trễ hạn */}
              <div className="space-y-4 rounded-xl border bg-card p-4.5 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Activity className="h-4 w-4 text-rose-600" /> Trừ điểm trễ hạn SLA (D)
                  </div>
                  <Switch
                    checked={enablePenalty}
                    onCheckedChange={(value) => { setEnablePenalty(value); previewMutation.reset(); }}
                  />
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Khấu trừ tự động vào tổng điểm theo số ngày hoàn thành sau hạn quy định.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="penalty-per-day" className="text-xs font-semibold text-foreground">
                    Mức điểm trừ cho mỗi ngày trễ
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="penalty-per-day"
                      type="number"
                      min="0"
                      max="1000"
                      step="0.1"
                      disabled={!enablePenalty}
                      value={penaltyPerDay}
                      onChange={(event) => { setPenaltyPerDay(Number(event.target.value)); previewMutation.reset(); }}
                      className="pr-24 font-mono font-bold text-base text-rose-600"
                    />
                    <span className="pointer-events-none absolute right-3 text-xs font-medium text-muted-foreground">
                      điểm / ngày
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-rose-50/60 p-2.5 text-[11px] leading-4 text-rose-900 border border-rose-100">
                  <b>Ví dụ:</b> Nhiệm vụ trễ 2 ngày sẽ bị trừ tự động <b>-{(2 * penaltyPerDay).toFixed(1)} điểm</b> trực tiếp vào kết quả đánh giá.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. CÔNG THỨC THEO NHÓM CÔNG VIỆC (NGOẠI LỆ) */}
          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b bg-muted/20 pb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">3. Công thức theo nhóm công việc</CardTitle>
                  <Badge variant="secondary" className="font-semibold text-xs">{customRules.length} nhóm</Badge>
                </div>
                <CardDescription className="mt-1">
                  Mỗi mảng công việc đặc thù có thể cấu hình công thức riêng (ghi đè công thức chung).
                </CardDescription>
              </div>
              <Button type="button" onClick={addCustomRule} className="shrink-0 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                <Plus className="h-4 w-4" /> Thêm nhóm ngoại lệ
              </Button>
            </CardHeader>
            <CardContent className="space-y-5 p-5 lg:p-6">
              {customRules.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Chưa có công thức riêng. Tất cả các mảng việc sẽ áp dụng công thức chung ở Mục 1.
                </div>
              ) : (
                customRules.map((rule, index) => (
                  <div
                    key={`${index}-${rule.domainCode}`}
                    className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-2xs hover:border-indigo-300 transition-colors"
                  >
                    {/* Header Thẻ Ngoại lệ: Thông tin định danh + Nút Thử + Nút Xóa */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none font-bold text-xs">
                          Ngoại lệ #{index + 1}
                        </Badge>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200">
                          <Tag className="h-3 w-3 text-indigo-600" />
                          <span>{rule.domainCode || 'CHƯA_ĐẶT_MÃ'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => selectRuleForPreview(rule)}
                          className="h-8 gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200 shadow-2xs"
                        >
                          <Zap className="h-3.5 w-3.5 fill-indigo-600 text-indigo-600" />
                          Thử nhóm này
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Xóa ngoại lệ ${index + 1}`}
                          onClick={() => { setCustomRules((current) => current.filter((_, i) => i !== index)); previewMutation.reset(); }}
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Dòng 1 (Full Width): Tên nhóm công việc - Cho phép chuỗi dài 100% hiển thị thoải mái */}
                    <div className="space-y-1.5 min-w-0">
                      <Label htmlFor={`rule-name-${index}`} className="flex items-center justify-between font-semibold text-xs text-foreground">
                        <span>Tên nhóm công việc (Diễn giải nghiệp vụ đầy đủ)</span>
                        <span className="text-[11px] font-normal text-muted-foreground">{(rule.name || '').length} ký tự</span>
                      </Label>
                      <Input
                        id={`rule-name-${index}`}
                        value={rule.name || ''}
                        onChange={(event) => updateRule(index, { name: event.target.value })}
                        placeholder="Ví dụ: Văn thư, Lưu trữ, Quản lý Hồ sơ & Thẻ Đảng (Khối lượng 40%)"
                        className="bg-background text-sm font-medium text-foreground w-full border-border focus-visible:ring-indigo-400"
                      />
                    </div>

                    {/* Dòng 2: Mã nhóm nhiệm vụ */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`rule-code-${index}`} className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                        <Tag className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Mã định danh nhóm (Dùng trong metadata nhiệm vụ, chữ in hoa)</span>
                      </Label>
                      <Input
                        id={`rule-code-${index}`}
                        value={rule.domainCode}
                        onChange={(event) => updateRule(index, { domainCode: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                        placeholder="VD: DOM_VAN_THU"
                        className="font-mono text-sm uppercase bg-background font-bold text-indigo-700 max-w-md border-border focus-visible:ring-indigo-400"
                      />
                    </div>

                    {/* Dòng 3 (Full Width): Công thức ghi đè biểu thức */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`rule-formula-${index}`} className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                          <Calculator className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Công thức ghi đè biểu thức (Hiển thị trọn vẹn biểu thức)</span>
                        </Label>
                        <span className="text-[11px] text-muted-foreground font-mono">Biểu thức toán học</span>
                      </div>
                      <Textarea
                        id={`rule-formula-${index}`}
                        value={rule.formula}
                        onChange={(event) => updateRule(index, { formula: event.target.value })}
                        placeholder="((C / Q) * 0.40 + (S / 100) * 0.20 + 0.40) * W * 100"
                        className="font-mono text-sm font-semibold min-h-[52px] resize-y bg-background text-indigo-950 dark:text-indigo-200 border-border focus-visible:ring-indigo-400"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* LỊCH SỬ PHIÊN BẢN */}
          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock3 className="h-4 w-4 text-indigo-600" /> Lịch sử phiên bản công thức
              </CardTitle>
              <CardDescription>
                Hệ thống lưu lại toàn bộ các lần thay đổi công thức; có thể nạp lại bản cũ để kiểm tra.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 p-5">
              {savedVersions.length === 0 ? (
                <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Chưa có phiên bản nào được lưu.</p>
              ) : (
                savedVersions.map((item) => (
                  <div key={item.version} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-indigo-700">Phiên bản v{item.version}</span>
                        {item.version === savedSettings?.version && (
                          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                            Đang áp dụng
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString('vi-VN')} · Bởi: {item.changedBy || 'Quản trị viên'}
                      </div>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => loadVersion(item)} className="text-xs h-8">
                      Nạp để sửa
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* STICKY BOTTOM BAR */}
          <div className="sticky bottom-3 z-20 flex flex-col-reverse justify-end gap-3 rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur-md sm:flex-row">
            <Button
              variant="outline"
              onClick={resetChanges}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Khôi phục thiết lập gốc
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || previewMutation.isPending}
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-2 shadow-sm"
            >
              {saveMutation.isPending ? 'Đang lưu...' : (
                <>
                  <Save className="h-4 w-4" /> Kiểm tra & Lưu thành phiên bản mới
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ASIDE COLUMN (THỬ CÔNG THỨC & TỪ ĐIỂN BIẾN) */}
        <aside className="flex flex-col gap-6 xl:sticky xl:top-4 min-w-0">
          {/* 4. THỬ CÔNG THỨC */}
          <Card className="overflow-hidden rounded-2xl border-indigo-200/90 shadow-sm">
            <CardHeader className="bg-indigo-50/80 border-b border-indigo-100 pb-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg text-indigo-950">
                  <FlaskConical className="h-5 w-5 text-indigo-700" /> 4. Thử công thức
                </CardTitle>
                <Badge variant="outline" className="border-indigo-300 bg-white text-indigo-800 text-xs">
                  Máy chủ tính
                </Badge>
              </div>
              <CardDescription className="text-indigo-900/80 text-xs">
                Kiểm tra điểm số thực tế trước khi lưu phiên bản mới.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* BỘ CHỌN NHÓM THỬ (KHÔNG BẮT NGƯỜI DÙNG PHẢI ĐOÁN MÃ) */}
              <div className="space-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
                <Label htmlFor="preview-domain-select" className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Chọn nhóm công việc để thử:</span>
                </Label>
                {!isCustomDomainInput ? (
                  <NativeSelect
                    id="preview-domain-select"
                    value={previewDomainCode}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val === '__MANUAL__') {
                        setIsCustomDomainInput(true);
                      } else {
                        setPreviewDomainCode(val);
                        previewMutation.mutate(val);
                      }
                    }}
                    className="w-full bg-background font-medium text-xs text-foreground"
                  >
                    <NativeSelectOption value="GENERIC">
                      [GENERIC] Công thức chung toàn hệ thống
                    </NativeSelectOption>
                    {customRules.map((r, i) => (
                      <NativeSelectOption key={`${i}-${r.domainCode}`} value={r.domainCode}>
                        [{r.domainCode}] {r.name ? `${r.name}` : `Ngoại lệ #${i + 1}`}
                      </NativeSelectOption>
                    ))}
                    <NativeSelectOption value="__MANUAL__">
                      ✏️ Tự gõ mã khác...
                    </NativeSelectOption>
                  </NativeSelect>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={previewDomainCode}
                      onChange={(event) => {
                        const val = event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
                        setPreviewDomainCode(val);
                        previewMutation.mutate(val);
                      }}
                      placeholder="VD: DOM_THAM_DINH"
                      className="font-mono text-xs uppercase bg-background font-bold text-indigo-700"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => { setIsCustomDomainInput(false); setPreviewDomainCode('GENERIC'); previewMutation.mutate('GENERIC'); }}
                      className="text-xs text-muted-foreground shrink-0"
                    >
                      Hủy
                    </Button>
                  </div>
                )}

                {/* Hiển thị công thức đang có hiệu lực */}
                <div className="mt-2 rounded-lg bg-background p-2.5 text-[11px] border border-indigo-100/80">
                  <div className="text-muted-foreground font-medium">Đang áp dụng:</div>
                  <div className="font-semibold text-indigo-900 mt-0.5 truncate">{activeTestingFormula.name}</div>
                  <div className="mt-1 font-mono text-[11px] text-foreground bg-muted/40 px-2 py-1 rounded break-all">
                    {activeTestingFormula.formula}
                  </div>
                </div>
              </div>

              {/* CÁC BIẾN SỐ ĐẦU VÀO VỚI ĐƠN VỊ ĐO RÕ RÀNG */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Giá trị biến mẫu đầu vào:</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Được gán đơn vị cụ thể</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Q - Khối lượng giao */}
                  <div className="space-y-1">
                    <Label htmlFor="preview-Q" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <span className="font-mono font-bold text-indigo-700">Q</span> · Chỉ tiêu giao
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="preview-Q"
                        type="number"
                        min="0"
                        step="0.1"
                        value={previewVariables.Q}
                        onChange={(event) => { setPreviewVariables((curr) => ({ ...curr, Q: Number(event.target.value) })); previewMutation.reset(); }}
                        className="pr-16 font-mono font-bold text-sm bg-background"
                      />
                      <span className="pointer-events-none absolute right-2.5 text-[11px] text-muted-foreground font-medium select-none">
                        nhiệm vụ
                      </span>
                    </div>
                  </div>

                  {/* C - Hoàn thành */}
                  <div className="space-y-1">
                    <Label htmlFor="preview-C" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <span className="font-mono font-bold text-emerald-700">C</span> · Hoàn thành
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="preview-C"
                        type="number"
                        min="0"
                        step="0.1"
                        value={previewVariables.C}
                        onChange={(event) => { setPreviewVariables((curr) => ({ ...curr, C: Number(event.target.value) })); previewMutation.reset(); }}
                        className="pr-16 font-mono font-bold text-sm bg-background text-emerald-800"
                      />
                      <span className="pointer-events-none absolute right-2.5 text-[11px] text-muted-foreground font-medium select-none">
                        đã xong
                      </span>
                    </div>
                  </div>

                  {/* W - Trọng số */}
                  <div className="space-y-1">
                    <Label htmlFor="preview-W" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <span className="font-mono font-bold text-amber-700">W</span> · Trọng số
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="preview-W"
                        type="number"
                        min="0"
                        step="0.1"
                        value={previewVariables.W}
                        onChange={(event) => { setPreviewVariables((curr) => ({ ...curr, W: Number(event.target.value) })); previewMutation.reset(); }}
                        className="pr-14 font-mono font-bold text-sm bg-background"
                      />
                      <span className="pointer-events-none absolute right-2.5 text-[11px] text-muted-foreground font-medium select-none">
                        hệ số
                      </span>
                    </div>
                  </div>

                  {/* D - Ngày trễ */}
                  <div className="space-y-1">
                    <Label htmlFor="preview-D" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <span className="font-mono font-bold text-rose-700">D</span> · Trễ hạn
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="preview-D"
                        type="number"
                        min="0"
                        step="0.5"
                        value={previewVariables.D}
                        onChange={(event) => { setPreviewVariables((curr) => ({ ...curr, D: Number(event.target.value) })); previewMutation.reset(); }}
                        className="pr-14 font-mono font-bold text-sm bg-background text-rose-700"
                      />
                      <span className="pointer-events-none absolute right-2.5 text-[11px] text-muted-foreground font-medium select-none">
                        ngày
                      </span>
                    </div>
                  </div>

                  {/* S - Chất lượng (full width 2 cột) */}
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="preview-S" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                        <span className="font-mono font-bold text-indigo-700">S</span> · Điểm chất lượng nhiệm vụ
                      </Label>
                      <span className="text-[11px] text-muted-foreground">Thang 0 – 100</span>
                    </div>
                    <div className="relative flex items-center">
                      <Input
                        id="preview-S"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={previewVariables.S}
                        onChange={(event) => { setPreviewVariables((curr) => ({ ...curr, S: Number(event.target.value) })); previewMutation.reset(); }}
                        className="pr-16 font-mono font-bold text-sm bg-background text-indigo-800"
                      />
                      <span className="pointer-events-none absolute right-2.5 text-[11px] text-muted-foreground font-medium select-none">
                        / 100 điểm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NÚT TÍNH THỬ */}
              <Button
                type="button"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-xs"
                onClick={() => previewMutation.mutate()}
                disabled={previewMutation.isPending}
              >
                <Zap className="h-4 w-4" />
                {previewMutation.isPending ? 'Đang tính toán...' : 'Tính thử điểm KPI ngay'}
              </Button>

              {/* KẾT QUẢ TÍNH THỬ TRỰC QUAN */}
              {preview && (
                <div className={`rounded-xl border p-4.5 shadow-2xs ${preview.valid ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50'}`}>
                  {preview.valid ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                          Điểm KPI Dự kiến
                        </span>
                        <Badge className="bg-emerald-600 text-white font-mono text-xs">Hợp lệ</Badge>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-4xl font-black text-emerald-950 tracking-tight">{previewScore}</span>
                        <span className="text-sm font-semibold text-emerald-800">/ 100 điểm</span>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-emerald-200/80 space-y-1 text-xs text-emerald-900 leading-relaxed">
                        <div className="flex justify-between">
                          <span className="text-emerald-800">Tỷ lệ hoàn thành ({previewVariables.C}/{previewVariables.Q}):</span>
                          <span className="font-mono font-semibold">{((previewVariables.C / (previewVariables.Q || 1)) * 100).toFixed(0)}%</span>
                        </div>
                        {enableQualityScore && (
                          <div className="flex justify-between text-emerald-800">
                            <span>Thưởng chất lượng (S={previewVariables.S}):</span>
                            <span className="font-mono font-semibold text-emerald-700">+{((previewVariables.S / 100) * qualityWeight).toFixed(1)} đ</span>
                          </div>
                        )}
                        {enablePenalty && previewVariables.D > 0 && (
                          <div className="flex justify-between text-rose-800">
                            <span>Trừ trễ hạn (D={previewVariables.D} ngày):</span>
                            <span className="font-mono font-semibold text-rose-600">-{(previewVariables.D * penaltyPerDay).toFixed(1)} đ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-rose-800 leading-relaxed">
                      <b>Lỗi công thức:</b> {preview.error || 'Biểu thức không hợp lệ. Vui lòng kiểm tra lại các toán tử.'}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TỪ ĐIỂN BIẾN SỐ */}
          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleHelp className="h-4 w-4 text-indigo-600" /> Từ điển biến số chuẩn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-4">
              {systemVariables.map((variable) => (
                <div key={variable.code} className="flex gap-3 rounded-xl border bg-card p-3 shadow-2xs">
                  <span className="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-mono font-black text-indigo-700 border border-indigo-200 text-sm">
                    {variable.code}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground">{variable.name}</div>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{variable.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
