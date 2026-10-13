"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calculator,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Edit3,
  FileSpreadsheet,
  FlaskConical,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  taskKpiApi,
  VariableDef,
  CustomRule,
  GlobalKpiSettings,
  KpiPreviewVariables,
  KpiFormulaVersion,
} from '../../../api/task-kpi.api';

const DEFAULT_SETTINGS: GlobalKpiSettings = {
  baseFormula: '(C / Q) * W * 100',
  enableQualityScore: true,
  qualityWeight: 30,
  enablePenalty: true,
  penaltyPerDay: 2,
  customRules: [],
};

const DEFAULT_VARIABLES: KpiPreviewVariables = { Q: 10, C: 8, W: 1, D: 0, S: 80 };

const FORMULA_PRESETS = [
  {
    name: 'Chuẩn Hướng dẫn 05-HD/TU (Cơ bản)',
    formula: '(C / Q) * W * 100',
    desc: 'Tỷ lệ hoàn thành nhân trọng số nhân thang 100',
  },
  {
    name: 'Cân bằng Khối lượng 70% + Chất lượng 30%',
    formula: '((C / Q) * 0.70 + (S / 100) * 0.30) * W * 100',
    desc: 'Đánh giá đồng thời cả tiến độ hoàn thành và điểm thẩm định chất lượng',
  },
  {
    name: 'Nhiệp vụ Thẩm định & Bảo mật (Chất lượng 50%)',
    formula: '((C / Q) * 0.15 + (S / 100) * 0.50 + 0.35) * W * 100',
    desc: 'Đề cao tính chính xác tuyệt đối, chất lượng thẩm định chiếm tỷ trọng cao',
  },
  {
    name: 'Hành chính, Văn thư, Lưu trữ (Khối lượng 40%)',
    formula: '((C / Q) * 0.40 + (S / 100) * 0.20 + 0.40) * W * 100',
    desc: 'Tập trung khối lượng công việc thực tế tiếp nhận và xử lý',
  },
];

function responseData<T>(response: any): T {
  return (response?.data?.data ?? response?.data ?? response) as T;
}

function getRatingClassification(score: number): {
  label: string;
  badgeClass: string;
  desc: string;
  stars: number;
} {
  if (score >= 90) {
    return {
      label: 'Hoàn thành Xuất sắc nhiệm vụ',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300',
      desc: 'Đạt chuẩn xếp loại Xuất sắc (áp trần 20% theo quy định)',
      stars: 3,
    };
  }
  if (score >= 70) {
    return {
      label: 'Hoàn thành Tốt nhiệm vụ',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300',
      desc: 'Đạt chuẩn hoàn thành tốt các chỉ tiêu và tiến độ giao',
      stars: 2,
    };
  }
  if (score >= 50) {
    return {
      label: 'Hoàn thành nhiệm vụ',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300',
      desc: 'Hoàn thành khối lượng cơ bản nhưng cần cải thiện chất lượng/tiến độ',
      stars: 1,
    };
  }
  return {
    label: 'Không hoàn thành nhiệm vụ',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300',
    desc: 'Chưa đạt chỉ tiêu hoặc có lỗi nghiêm trọng / trễ hạn kéo dài',
    stars: 0,
  };
}

export function KpiFormulasClient() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('formula');
  const [baseFormula, setBaseFormula] = useState(DEFAULT_SETTINGS.baseFormula);
  const [enableQualityScore, setEnableQualityScore] = useState(DEFAULT_SETTINGS.enableQualityScore);
  const [qualityWeight, setQualityWeight] = useState(DEFAULT_SETTINGS.qualityWeight);
  const [enablePenalty, setEnablePenalty] = useState(DEFAULT_SETTINGS.enablePenalty);
  const [penaltyPerDay, setPenaltyPerDay] = useState(DEFAULT_SETTINGS.penaltyPerDay);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');

  // Simulator variables
  const [previewVariables, setPreviewVariables] = useState<KpiPreviewVariables>(DEFAULT_VARIABLES);
  const [previewDomainCode, setPreviewDomainCode] = useState('GENERIC');
  const [isCustomDomainInput, setIsCustomDomainInput] = useState(false);

  // Edit/Add Rule Dialog State
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [ruleFormData, setRuleFormData] = useState<CustomRule>({ domainCode: '', name: '', formula: '' });

  // 1. Fetch System Variables
  const { data: variablesResponse } = useQuery({
    queryKey: ['kpi-system-variables'],
    queryFn: async () => responseData<VariableDef[]>(await taskKpiApi.getSystemVariables()),
    staleTime: Infinity,
  });
  const systemVariables = variablesResponse || [];

  // 2. Fetch Global Settings
  const { data: settingsResponse, isLoading } = useQuery({
    queryKey: ['kpi-global-settings'],
    queryFn: async () => responseData<GlobalKpiSettings>(await taskKpiApi.getGlobalSettings()),
  });
  const savedSettings = settingsResponse;

  // 3. Fetch Versions History
  const { data: versionsResponse } = useQuery({
    queryKey: ['kpi-global-settings-versions'],
    queryFn: async () => responseData<KpiFormulaVersion[]>(await taskKpiApi.getGlobalSettingVersions()),
  });
  const savedVersions = versionsResponse || [];

  // Sync state when settings loaded
  useEffect(() => {
    if (!savedSettings) return;
    setBaseFormula(savedSettings.baseFormula ?? DEFAULT_SETTINGS.baseFormula);
    setEnableQualityScore(savedSettings.enableQualityScore ?? DEFAULT_SETTINGS.enableQualityScore);
    setQualityWeight(savedSettings.qualityWeight ?? DEFAULT_SETTINGS.qualityWeight);
    setEnablePenalty(savedSettings.enablePenalty ?? DEFAULT_SETTINGS.enablePenalty);
    setPenaltyPerDay(savedSettings.penaltyPerDay ?? DEFAULT_SETTINGS.penaltyPerDay);
    setCustomRules(savedSettings.customRules ?? []);
  }, [savedSettings]);

  const currentSettings: GlobalKpiSettings = useMemo(
    () => ({
      baseFormula,
      enableQualityScore,
      qualityWeight,
      enablePenalty,
      penaltyPerDay,
      customRules,
    }),
    [baseFormula, enableQualityScore, qualityWeight, enablePenalty, penaltyPerDay, customRules]
  );

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: async (overrideDomain?: string | void) =>
      responseData<any>(
        await taskKpiApi.previewGlobalSettings({
          settings: currentSettings,
          variables: previewVariables,
          domainCode: typeof overrideDomain === 'string' && overrideDomain ? overrideDomain : previewDomainCode || 'GENERIC',
        })
      ),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || error?.message || 'Không thể tính thử công thức'),
  });

  // Tự động tính thử khi nạp xong cấu hình ban đầu
  useEffect(() => {
    if (savedSettings && !previewMutation.data && !previewMutation.isPending) {
      previewMutation.mutate();
    }
  }, [savedSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => taskKpiApi.saveGlobalSettings(currentSettings),
    onSuccess: () => {
      toast.success('Đã lưu và ban hành phiên bản công thức KPI mới thành công');
      previewMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['kpi-global-settings'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-global-settings-versions'] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || error?.message || 'Không thể lưu cấu hình KPI'),
  });

  const handleSave = async () => {
    try {
      const preview: any = await previewMutation.mutateAsync();
      if (!preview?.valid) {
        toast.error(preview?.error || 'Công thức chưa hợp lệ. Vui lòng kiểm tra lại biểu thức toán học.');
        return;
      }
      saveMutation.mutate();
    } catch {
      /* Handled by onError */
    }
  };

  const addFormulaToken = (token: string, target = 'base') => {
    if (target === 'dialog') {
      setRuleFormData((prev) => {
        const trimmed = (prev.formula || '').trimEnd();
        const op = /^[QqCcWwDdSs0-9.)]$/.test(trimmed.slice(-1)) && /^[QqCcWwDdSs0-9.(]$/.test(token) ? ' * ' : ' ';
        return { ...prev, formula: `${trimmed}${trimmed ? op : ''}${token}` };
      });
      return;
    }

    setBaseFormula((current) => {
      const trimmed = current.trimEnd();
      const operator = /^[QqCcWwDdSs0-9.)]$/.test(trimmed.slice(-1)) && /^[QqCcWwDdSs0-9.(]$/.test(token) ? ' * ' : ' ';
      return `${trimmed}${trimmed ? operator : ''}${token}`;
    });
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
    toast.info('Đã khôi phục các giá trị ban đầu');
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
      toast.success(`Đã nạp phiên bản v${item.version}. Bấm "Lưu" để ban hành phiên bản mới.`);
    } catch {
      toast.error('Không đọc được cấu hình của phiên bản này.');
    }
  };

  // Dialog actions for Custom Rule
  const handleOpenAddRule = () => {
    setEditingRuleIndex(null);
    setRuleFormData({
      domainCode: `DOM_NHOM_${customRules.length + 1}`,
      name: '',
      formula: '((C / Q) * 0.40 + (S / 100) * 0.20 + 0.40) * W * 100',
    });
    setIsRuleDialogOpen(true);
  };

  const handleOpenEditRule = (index: number) => {
    setEditingRuleIndex(index);
    setRuleFormData({ ...customRules[index] });
    setIsRuleDialogOpen(true);
  };

  const handleSaveRuleDialog = () => {
    if (!ruleFormData.domainCode.trim()) {
      toast.error('Mã nhóm không được để trống');
      return;
    }
    if (!ruleFormData.formula.trim()) {
      toast.error('Công thức ghi đè không được để trống');
      return;
    }

    if (editingRuleIndex === null) {
      setCustomRules((prev) => [...prev, ruleFormData]);
      toast.success(`Đã thêm nhóm ngoại lệ: ${ruleFormData.domainCode}`);
    } else {
      setCustomRules((prev) => prev.map((r, i) => (i === editingRuleIndex ? ruleFormData : r)));
      toast.success(`Đã cập nhật nhóm ngoại lệ: ${ruleFormData.domainCode}`);
    }
    setIsRuleDialogOpen(false);
    previewMutation.reset();
  };

  const handleDeleteRule = (index: number) => {
    const deleted = customRules[index];
    setCustomRules((prev) => prev.filter((_, i) => i !== index));
    previewMutation.reset();
    toast.info(`Đã xóa nhóm ngoại lệ ${deleted?.domainCode || ''}`);
  };

  const selectRuleForTesting = (rule: CustomRule) => {
    setPreviewDomainCode(rule.domainCode);
    setIsCustomDomainInput(false);
    setActiveTab('simulator');
    previewMutation.mutate(rule.domainCode);
    toast.success(`Đã nạp nhóm "${rule.name || rule.domainCode}" vào bộ thử nghiệm`);
  };

  // Filtered custom rules
  const filteredRules = useMemo(() => {
    const q = ruleSearchQuery.trim().toLowerCase();
    if (!q) return customRules;
    return customRules.filter(
      (r) =>
        r.domainCode.toLowerCase().includes(q) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        r.formula.toLowerCase().includes(q)
    );
  }, [customRules, ruleSearchQuery]);

  // Active formula info for preview
  const activeTestingFormula = useMemo(() => {
    if (previewDomainCode === 'GENERIC' || !previewDomainCode) {
      return { type: 'chung', name: 'Công thức chung toàn hệ thống (GENERIC)', formula: baseFormula };
    }
    const matched = customRules.find((r) => r.domainCode === previewDomainCode);
    if (matched) {
      return { type: 'rieng', name: matched.name || matched.domainCode, formula: matched.formula };
    }
    return { type: 'khac', name: `Mã nhóm ${previewDomainCode} (chưa cấu hình riêng, dùng chung)`, formula: baseFormula };
  }, [previewDomainCode, customRules, baseFormula]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
        <Activity className="size-8 animate-spin text-primary" />
        <p className="text-sm">Đang tải cấu hình hệ thống công thức KPI…</p>
      </div>
    );
  }

  const preview = previewMutation.data;
  const previewScoreNum = preview?.valid ? Number(preview.score) : 0;
  const previewScoreStr = preview?.valid
    ? Number(preview.score).toLocaleString('vi-VN', { maximumFractionDigits: 2 })
    : '0';
  const ratingInfo = getRatingClassification(previewScoreNum);

  return (
    <div className="w-full min-h-full flex flex-col flex-1 min-w-0 bg-background text-foreground space-y-6 pb-12">
      {/* ===================== 1. EXECUTIVE HEADER ===================== */}
      <header className="rounded-2xl border border-border/80 bg-gradient-to-br from-indigo-50/90 via-card to-card dark:from-indigo-950/30 dark:via-card dark:to-card p-5 sm:p-6 lg:p-7 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Calculator className="size-6" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Cấu hình KPI · Hệ thống Đắk Lắk
                </span>
                <Badge variant="outline" className="border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
                  Hướng dẫn 05-HD/TU
                </Badge>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  Phiên bản v{savedSettings?.version || 1}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl truncate">
                Công thức Tính điểm KPI & Đánh giá Cán bộ
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-4xl leading-relaxed">
                Quản lý biểu thức tính điểm chuẩn, quy tắc ghi đè theo từng mảng nhiệm vụ chuyên môn và các hệ số điều chỉnh chất lượng (S) / tiến độ SLA (D).
              </p>
            </div>
          </div>

          {/* CỤM NÚT THAO TÁC TRÊN HEADER */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={resetChanges}
              disabled={saveMutation.isPending}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RotateCcw className="size-3.5" />
              <span>Khôi phục gốc</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setActiveTab('simulator');
                previewMutation.mutate();
              }}
              variant="secondary"
              className="h-9 gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100"
            >
              <Zap className="size-3.5 fill-indigo-600 text-indigo-600" />
              <span>Mô phỏng KPI</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending || previewMutation.isPending}
              className="h-9 gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              {saveMutation.isPending ? (
                <>
                  <Activity className="size-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Ban hành phiên bản mới</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ===================== 2. TABS ĐIỀU HƯỚNG CHÍNH ===================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="border-b border-border/80 pb-1">
          <TabsList className="h-10 p-1 bg-muted/60 rounded-xl grid grid-cols-2 sm:inline-flex sm:w-auto">
            <TabsTrigger value="formula" className="gap-2 text-xs font-semibold px-4 rounded-lg">
              <Calculator className="size-3.5 text-indigo-600" />
              <span>1. Công thức chuẩn</span>
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="gap-2 text-xs font-semibold px-4 rounded-lg">
              <Layers className="size-3.5 text-indigo-600" />
              <span>2. Ngoại lệ lĩnh vực ({customRules.length})</span>
            </TabsTrigger>
            <TabsTrigger value="simulator" className="gap-2 text-xs font-semibold px-4 rounded-lg">
              <FlaskConical className="size-3.5 text-indigo-600" />
              <span>3. Mô phỏng & Sandbox</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 text-xs font-semibold px-4 rounded-lg">
              <Clock3 className="size-3.5 text-indigo-600" />
              <span>4. Lịch sử ({savedVersions.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ===================== TAB 1: CÔNG THỨC CHUẨN & THAM SỐ ===================== */}
        <TabsContent value="formula" className="space-y-6 m-0 focus-visible:outline-none">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
            {/* CỘT CHÍNH: BIỂU THỨC & TOÁN TỬ */}
            <div className="space-y-6 min-w-0">
              <Card className="rounded-2xl border shadow-2xs overflow-hidden">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Activity className="size-5 text-indigo-600" /> Biểu thức tính điểm toàn hệ thống
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      Mặc định: GENERIC
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Áp dụng cho mọi nhiệm vụ không thuộc nhóm ngoại lệ chuyên biệt theo Hướng dẫn 05-HD/TU.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 lg:p-6 space-y-5">
                  {/* PRESETS MẪU */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-500" /> Chọn nhanh mẫu biểu thức gợi ý:
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FORMULA_PRESETS.map((p, idx) => (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setBaseFormula(p.formula);
                            previewMutation.reset();
                            toast.success(`Đã áp dụng mẫu: ${p.name}`);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setBaseFormula(p.formula);
                              previewMutation.reset();
                            }
                          }}
                          className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                            baseFormula === p.formula
                              ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-400'
                              : 'bg-card hover:border-indigo-300 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-foreground truncate">{p.name}</span>
                            {baseFormula === p.formula && <Check className="size-3.5 text-indigo-600 shrink-0" />}
                          </div>
                          <p className="font-mono text-[11px] text-indigo-700 dark:text-indigo-400 mt-1 truncate">
                            {p.formula}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* THANH CHÈN TOÁN TỬ VÀ BIẾN SỐ */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Chèn biến số và toán tử nhanh vào ô soạn thảo:
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
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
                          <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                            ({variable.code === 'Q' ? 'Chỉ tiêu' : variable.code === 'C' ? 'Xong' : variable.code === 'W' ? 'Trọng số' : variable.code === 'D' ? 'Trễ' : 'Chất lượng'})
                          </span>
                        </Button>
                      ))}
                      {[['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/'], ['(', '('], [')', ')']].map(([label, token]) => (
                        <Button
                          key={label}
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addFormulaToken(token)}
                          className="h-8 min-w-8 px-2 font-mono font-bold bg-muted/40 hover:bg-muted"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* TEXTAREA BIỂU THỨC */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="base-formula" className="text-xs font-bold text-foreground">
                        Biểu thức toán học (JavaScript math syntax)
                      </Label>
                      <span className="text-[11px] font-mono text-muted-foreground">{baseFormula.length}/256 ký tự</span>
                    </div>
                    <Textarea
                      id="base-formula"
                      value={baseFormula}
                      onChange={(e) => {
                        setBaseFormula(e.target.value);
                        previewMutation.reset();
                      }}
                      placeholder="(C / Q) * W * 100"
                      maxLength={256}
                      rows={3}
                      className="font-mono text-base font-semibold text-indigo-950 dark:text-indigo-200 tracking-wide border-indigo-200 focus-visible:ring-indigo-400 bg-background resize-none"
                    />
                  </div>

                  {/* THẺ GIẢI NGHĨA BIỂU THỨC TOÁN HỌC */}
                  <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-2">
                    <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Calculator className="size-3.5 text-indigo-600" /> Mô phỏng cấu trúc toán học của biểu thức:
                    </div>
                    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-background border border-indigo-100 dark:border-indigo-900/40 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold">
                        (C ÷ Q)
                      </span>
                      <span className="text-muted-foreground text-[11px]">Tỷ lệ hoàn thành</span>
                      <span>×</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold">
                        W
                      </span>
                      <span className="text-muted-foreground text-[11px]">Hệ số K</span>
                      <span>×</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                        100
                      </span>
                      <span className="text-muted-foreground text-[11px]">Thang điểm 100</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      * Điểm chất lượng $S$ và điểm phạt trễ hạn $D$ sẽ được tính bổ sung tự động theo cài đặt tham số bên phải.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 2. CÀI ĐẶT THAM SỐ BỔ SUNG */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* ĐIỂM CHẤT LƯỢNG (S) */}
                <Card className="rounded-2xl border shadow-2xs">
                  <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <span>Điểm chất lượng (S)</span>
                      </div>
                      <Switch
                        checked={enableQualityScore}
                        onCheckedChange={(val) => {
                          setEnableQualityScore(val);
                          previewMutation.reset();
                        }}
                      />
                    </div>
                    <CardDescription className="text-xs">
                      Cộng thêm theo chất lượng sản phẩm do Lãnh đạo thẩm định.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Tỷ trọng tối đa:</span>
                        <span className="font-mono text-emerald-700 font-bold">{qualityWeight}%</span>
                      </div>
                      <Slider
                        value={[qualityWeight]}
                        onValueChange={(val) => {
                          setQualityWeight(val[0]);
                          previewMutation.reset();
                        }}
                        disabled={!enableQualityScore}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                    <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                      Đạt điểm chất lượng 100/100 sẽ cộng tối đa <b>+{qualityWeight} điểm</b>. Đạt 80 điểm cộng <b>+{(80 * qualityWeight / 100).toFixed(1)} điểm</b>.
                    </div>
                  </CardContent>
                </Card>

                {/* KHẤU TRỪ TRỄ HẠN SLA (D) */}
                <Card className="rounded-2xl border shadow-2xs">
                  <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <ShieldAlert className="size-4 text-rose-600" />
                        <span>Trừ điểm trễ hạn SLA (D)</span>
                      </div>
                      <Switch
                        checked={enablePenalty}
                        onCheckedChange={(val) => {
                          setEnablePenalty(val);
                          previewMutation.reset();
                        }}
                      />
                    </div>
                    <CardDescription className="text-xs">
                      Khấu trừ tự động theo số ngày hoàn thành trễ hẹn.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Mức phạt trễ hạn:</span>
                        <span className="font-mono text-rose-700 font-bold">-{penaltyPerDay} đ / ngày</span>
                      </div>
                      <Slider
                        value={[penaltyPerDay]}
                        onValueChange={(val) => {
                          setPenaltyPerDay(val[0]);
                          previewMutation.reset();
                        }}
                        disabled={!enablePenalty}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>
                    <div className="rounded-lg bg-rose-50/60 dark:bg-rose-950/20 p-2.5 text-[11px] leading-relaxed text-rose-900 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40">
                      Nhiệm vụ trễ 2 ngày sẽ tự động bị khấu trừ <b>-{(2 * penaltyPerDay).toFixed(1)} điểm</b> trực tiếp vào kết quả đánh giá.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CỘT PHẢI: MINI LIVE PREVIEW WIDGET */}
            <aside className="space-y-6 min-w-0">
              <Card className="rounded-2xl border border-indigo-200/80 shadow-xs overflow-hidden sticky top-4">
                <CardHeader className="bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Zap className="size-4 text-indigo-600" /> Thử nhanh điểm số
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-background">
                      {previewDomainCode}
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px]">
                    Kết quả tính toán thời gian thực theo cấu hình đang chọn.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* DISPLAY BIG SCORE */}
                  <div className="rounded-xl border border-border/80 bg-card p-4 text-center space-y-2 shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Điểm KPI Mô phỏng
                    </span>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-4xl font-extrabold text-foreground tracking-tight">
                        {previewScoreStr}
                      </span>
                      <span className="text-sm text-muted-foreground font-semibold">/ 100</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${ratingInfo.badgeClass}`}>
                        {ratingInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* QUICK SLIDERS */}
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hoàn thành (C/Q):</span>
                        <span className="font-mono font-bold">{previewVariables.C} / {previewVariables.Q} việc</span>
                      </div>
                      <Slider
                        value={[previewVariables.C]}
                        onValueChange={(v) => {
                          setPreviewVariables((curr) => ({ ...curr, C: v[0] }));
                          previewMutation.reset();
                        }}
                        min={0}
                        max={previewVariables.Q}
                        step={1}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chất lượng (S):</span>
                        <span className="font-mono font-bold text-emerald-700">{previewVariables.S} / 100</span>
                      </div>
                      <Slider
                        value={[previewVariables.S]}
                        onValueChange={(v) => {
                          setPreviewVariables((curr) => ({ ...curr, S: v[0] }));
                          previewMutation.reset();
                        }}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trễ hạn (D):</span>
                        <span className="font-mono font-bold text-rose-700">{previewVariables.D} ngày</span>
                      </div>
                      <Slider
                        value={[previewVariables.D]}
                        onValueChange={(v) => {
                          setPreviewVariables((curr) => ({ ...curr, D: v[0] }));
                          previewMutation.reset();
                        }}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => previewMutation.mutate()}
                    className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    Tính toán lại
                  </Button>
                </CardContent>
              </Card>

              {/* TỪ ĐIỂN BIẾN SỐ NHANH */}
              <Card className="rounded-2xl border shadow-2xs">
                <CardHeader className="pb-2 border-b bg-muted/20">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CircleHelp className="size-3.5 text-primary" /> Từ điển biến số chuẩn
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {systemVariables.map((v) => (
                    <div key={v.code} className="flex items-start gap-2 text-xs">
                      <Badge variant="outline" className="font-mono font-bold text-[10px] px-1.5 py-0 shrink-0">
                        {v.code}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground text-[11px]">{v.name}</span>
                        <p className="text-[10px] text-muted-foreground leading-tight">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        {/* ===================== TAB 2: NGOẠI LỆ THEO LĨNH VỰC ===================== */}
        <TabsContent value="exceptions" className="space-y-6 m-0 focus-visible:outline-none">
          <Card className="rounded-2xl border shadow-2xs">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Layers className="size-5 text-indigo-600" /> Danh mục Quy tắc Ngoại lệ theo mảng việc ({customRules.length})
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Cấu hình công thức chuyên biệt ghi đè công thức chuẩn cho từng lĩnh vực đặc thù của Tỉnh ủy Đắk Lắk.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={handleOpenAddRule}
                  className="h-9 px-3 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs shrink-0"
                >
                  <Plus className="size-3.5" /> Thêm nhóm ngoại lệ
                </Button>
              </div>

              {/* THANH TÌM KIẾM NHANH */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={ruleSearchQuery}
                  onChange={(e) => setRuleSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo mã nhóm (DOM_VAN_THU, DOM_THAM_DINH...), tên lĩnh vực hoặc công thức..."
                  className="h-9 pl-9 text-xs rounded-lg"
                />
              </div>
            </CardHeader>

            <CardContent className="p-5 lg:p-6 space-y-4">
              {filteredRules.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground space-y-2">
                  <Layers className="size-8 mx-auto text-muted-foreground/40" />
                  <p className="font-semibold text-foreground text-sm">Không tìm thấy nhóm ngoại lệ nào</p>
                  <p className="text-[11px]">
                    {ruleSearchQuery ? 'Thử tìm với từ khóa khác' : 'Chưa có nhóm ngoại lệ nào được cấu hình.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRules.map((rule, idx) => (
                    <div
                      key={`${idx}-${rule.domainCode}`}
                      className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs hover:border-indigo-300 transition-colors flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-none font-bold text-[11px] font-mono">
                              {rule.domainCode}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-primary"
                              onClick={() => handleOpenEditRule(idx)}
                              title="Chỉnh sửa nhóm này"
                            >
                              <Edit3 className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteRule(idx)}
                              title="Xóa nhóm này"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-foreground leading-snug">
                            {rule.name || 'Chưa đặt tên diễn giải'}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-2.5 font-mono text-xs text-indigo-950 dark:text-indigo-200 break-words border border-border/50">
                          {rule.formula}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground">Mảng việc chuyên biệt</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => selectRuleForTesting(rule)}
                          className="h-7 px-2 text-xs text-indigo-700 dark:text-indigo-300 gap-1"
                        >
                          <Zap className="size-3 text-indigo-600 fill-indigo-600" /> Thử trong Simulator
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 3: MÔ PHỎNG & KPI SANDBOX ===================== */}
        <TabsContent value="simulator" className="space-y-6 m-0 focus-visible:outline-none">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,1fr)]">
            {/* CỘT ĐIỀU KHIỂN THAM SỐ THỬ NGHIỆM */}
            <Card className="rounded-2xl border shadow-2xs">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <FlaskConical className="size-5 text-indigo-600" /> Bảng thiết lập thông số giả lập
                </CardTitle>
                <CardDescription className="text-xs">
                  Điều chỉnh các thanh trượt và giá trị biến để kiểm tra kết quả điểm số thực tế.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 lg:p-6 space-y-5">
                {/* CHỌN NHÓM CÔNG VIỆC ÁP DỤNG */}
                <div className="space-y-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="size-3.5 text-indigo-600" /> Chọn nhóm mảng việc cần thử nghiệm:
                  </Label>
                  {!isCustomDomainInput ? (
                    <NativeSelect
                      value={previewDomainCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__MANUAL__') {
                          setIsCustomDomainInput(true);
                        } else {
                          setPreviewDomainCode(val);
                          previewMutation.mutate(val);
                        }
                      }}
                      className="w-full text-xs font-semibold h-9"
                    >
                      <NativeSelectOption value="GENERIC">
                        [GENERIC] Công thức chuẩn toàn hệ thống
                      </NativeSelectOption>
                      {customRules.map((r, i) => (
                        <NativeSelectOption key={`${i}-${r.domainCode}`} value={r.domainCode}>
                          [{r.domainCode}] {r.name ? r.name : `Ngoại lệ #${i + 1}`}
                        </NativeSelectOption>
                      ))}
                      <NativeSelectOption value="__MANUAL__">
                        ✏️ Nhập mã tùy chỉnh khác...
                      </NativeSelectOption>
                    </NativeSelect>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={previewDomainCode}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
                          setPreviewDomainCode(val);
                          previewMutation.mutate(val);
                        }}
                        placeholder="VD: DOM_THAM_DINH"
                        className="font-mono text-xs uppercase font-bold"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsCustomDomainInput(false);
                          setPreviewDomainCode('GENERIC');
                          previewMutation.mutate('GENERIC');
                        }}
                        className="text-xs"
                      >
                        Hủy
                      </Button>
                    </div>
                  )}

                  {/* THÔNG TIN CÔNG THỨC ÁP DỤNG */}
                  <div className="mt-2 rounded-lg bg-background p-2.5 text-xs border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                      <span>Công thức đang áp dụng:</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {activeTestingFormula.type === 'rieng' ? 'Quy tắc ngoại lệ' : 'Chuẩn chung'}
                      </Badge>
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 break-words">
                      {activeTestingFormula.formula}
                    </div>
                  </div>
                </div>

                {/* SLIDERS CHI TIẾT */}
                <div className="space-y-4">
                  {/* Q - Khối lượng giao */}
                  <div className="space-y-1.5 rounded-xl border p-3 bg-card">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-indigo-700">Q</Badge> Chỉ tiêu khối lượng giao
                      </span>
                      <span className="font-mono font-bold text-sm text-foreground">{previewVariables.Q} việc</span>
                    </div>
                    <Slider
                      value={[previewVariables.Q]}
                      onValueChange={(v) => {
                        setPreviewVariables((c) => ({ ...c, Q: v[0], C: Math.min(c.C, v[0]) }));
                        previewMutation.reset();
                      }}
                      min={1}
                      max={50}
                      step={1}
                    />
                  </div>

                  {/* C - Khối lượng hoàn thành */}
                  <div className="space-y-1.5 rounded-xl border p-3 bg-card">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-emerald-700">C</Badge> Khối lượng đã hoàn thành
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-700">{previewVariables.C} việc</span>
                    </div>
                    <Slider
                      value={[previewVariables.C]}
                      onValueChange={(v) => {
                        setPreviewVariables((c) => ({ ...c, C: v[0] }));
                        previewMutation.reset();
                      }}
                      min={0}
                      max={previewVariables.Q}
                      step={1}
                    />
                  </div>

                  {/* W - Hệ số K / Trọng số */}
                  <div className="space-y-1.5 rounded-xl border p-3 bg-card">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-amber-700">W</Badge> Hệ số độ phức tạp (K)
                      </span>
                      <span className="font-mono font-bold text-sm text-amber-700">{previewVariables.W}</span>
                    </div>
                    <Slider
                      value={[previewVariables.W]}
                      onValueChange={(v) => {
                        setPreviewVariables((c) => ({ ...c, W: v[0] }));
                        previewMutation.reset();
                      }}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                    />
                  </div>

                  {/* S - Điểm chất lượng */}
                  <div className="space-y-1.5 rounded-xl border p-3 bg-card">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-indigo-700">S</Badge> Điểm chất lượng thẩm định
                      </span>
                      <span className="font-mono font-bold text-sm text-indigo-700">{previewVariables.S} / 100</span>
                    </div>
                    <Slider
                      value={[previewVariables.S]}
                      onValueChange={(v) => {
                        setPreviewVariables((c) => ({ ...c, S: v[0] }));
                        previewMutation.reset();
                      }}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  {/* D - Trễ hạn */}
                  <div className="space-y-1.5 rounded-xl border p-3 bg-card">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-rose-700">D</Badge> Số ngày hoàn thành trễ hạn
                      </span>
                      <span className="font-mono font-bold text-sm text-rose-700">{previewVariables.D} ngày</span>
                    </div>
                    <Slider
                      value={[previewVariables.D]}
                      onValueChange={(v) => {
                        setPreviewVariables((c) => ({ ...c, D: v[0] }));
                        previewMutation.reset();
                      }}
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => previewMutation.mutate()}
                  disabled={previewMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 gap-2 shadow-xs"
                >
                  <Zap className="size-4" />
                  {previewMutation.isPending ? 'Đang tính toán...' : 'Tính thử điểm KPI ngay'}
                </Button>
              </CardContent>
            </Card>

            {/* CỘT KẾT QUẢ ĐIỂM SỐ & PHÂN RÃ */}
            <div className="space-y-6">
              <Card className="rounded-2xl border shadow-md overflow-hidden bg-gradient-to-b from-card to-muted/20">
                <CardHeader className="border-b bg-muted/30 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <TrendingUp className="size-4 text-emerald-600" /> Kết quả Đánh giá KPI
                    </CardTitle>
                    <Badge variant={preview?.valid ? 'default' : 'destructive'} className="text-xs">
                      {preview?.valid ? 'Biểu thức hợp lệ' : 'Có lỗi'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {preview?.valid ? (
                    <div className="space-y-5">
                      {/* ĐIỂM SỐ CHÍNH */}
                      <div className="text-center space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Tổng điểm KPI đạt được
                        </span>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-6xl font-extrabold tracking-tight text-foreground">
                            {previewScoreStr}
                          </span>
                          <span className="text-base font-bold text-muted-foreground">/ 100 điểm</span>
                        </div>
                        <div className="pt-1">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${ratingInfo.badgeClass}`}>
                            {ratingInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">{ratingInfo.desc}</p>
                      </div>

                      {/* THANH TIẾN ĐỘ THANG 100 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                          <span>Mức độ đạt chỉ tiêu:</span>
                          <span className="font-mono text-foreground font-bold">{previewScoreNum.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(100, Math.max(0, previewScoreNum))} className="h-3 rounded-full" />
                      </div>

                      {/* PHÂN RÃ THÀNH PHẦN ĐIỂM */}
                      <div className="rounded-xl border bg-card p-4 space-y-2.5 text-xs">
                        <div className="font-semibold text-foreground border-b pb-1.5 flex items-center gap-1.5">
                          <FileSpreadsheet className="size-3.5 text-primary" /> Phân rã các thành tố cấu thành điểm:
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tỷ lệ hoàn thành ({previewVariables.C}/{previewVariables.Q}):</span>
                          <span className="font-mono font-bold">{((previewVariables.C / (previewVariables.Q || 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hệ số trọng số công việc (W):</span>
                          <span className="font-mono font-bold">{previewVariables.W}</span>
                        </div>
                        {enableQualityScore && (
                          <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                            <span>Điểm thưởng chất lượng (S={previewVariables.S}):</span>
                            <span className="font-mono font-bold">+{((previewVariables.S / 100) * qualityWeight).toFixed(1)} đ</span>
                          </div>
                        )}
                        {enablePenalty && previewVariables.D > 0 && (
                          <div className="flex justify-between text-rose-700 dark:text-rose-400">
                            <span>Khấu trừ trễ hạn (D={previewVariables.D} ngày):</span>
                            <span className="font-mono font-bold">-{(previewVariables.D * penaltyPerDay).toFixed(1)} đ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-center text-destructive space-y-1.5">
                      <p className="font-bold text-sm">Lỗi tính toán biểu thức</p>
                      <p className="text-xs text-muted-foreground">
                        {preview?.error || 'Biểu thức công thức chứa cú pháp không hợp lệ. Vui lòng kiểm tra lại các toán tử.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===================== TAB 4: LỊCH SỬ PHIÊN BẢN ===================== */}
        <TabsContent value="history" className="space-y-6 m-0 focus-visible:outline-none">
          <Card className="rounded-2xl border shadow-2xs">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Clock3 className="size-5 text-indigo-600" /> Nhật ký kiểm toán & Các phiên bản công thức ({savedVersions.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Hệ thống lưu vết bất biến mọi lần ban hành; bạn có thể nạp lại phiên bản cũ để xem hoặc phục hồi.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 lg:p-6 space-y-3">
              {savedVersions.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                  Chưa có lịch sử phiên bản nào được ghi nhận.
                </div>
              ) : (
                savedVersions.map((item) => {
                  let parsedConfig: GlobalKpiSettings | null = null;
                  try {
                    parsedConfig = JSON.parse(item.settingsJson);
                  } catch {
                    /* json error */
                  }
                  const isCurrent = item.version === savedSettings?.version;

                  return (
                    <div
                      key={item.version}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
                        isCurrent
                          ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-400/50'
                          : 'border-border/80 bg-card hover:border-indigo-300'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-400">
                            Phiên bản v{item.version}
                          </span>
                          {isCurrent && (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
                              Đang áp dụng
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Người phê duyệt / ban hành: <b>{item.changedBy || 'Quản trị viên'}</b>
                        </div>
                        {parsedConfig && (
                          <div className="font-mono text-xs text-foreground bg-muted/40 px-2 py-1 rounded inline-block max-w-xl truncate">
                            {parsedConfig.baseFormula} · ({parsedConfig.customRules?.length || 0} ngoại lệ)
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant={isCurrent ? 'outline' : 'default'}
                        onClick={() => loadVersion(item)}
                        className="text-xs h-8 shrink-0"
                      >
                        {isCurrent ? 'Xem lại bản này' : 'Nạp phiên bản này'}
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===================== DIALOG: THÊM / SỬA NHÓM NGOẠI LỆ ===================== */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-indigo-600" />
              {editingRuleIndex === null ? 'Thêm nhóm ngoại lệ mới' : 'Chỉnh sửa nhóm ngoại lệ'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thiết lập mã định danh và biểu thức tính điểm đặc thù cho mảng nhiệm vụ này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* TÊN NHÓM CÔNG VIỆC */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground">Tên mảng việc (Diễn giải nghiệp vụ đầy đủ)</Label>
              <Input
                value={ruleFormData.name || ''}
                onChange={(e) => setRuleFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Thẩm định hồ sơ cán bộ & Bảo vệ CTNB (Chất lượng 50%)"
                className="text-xs"
              />
            </div>

            {/* MÃ ĐỊNH DANH */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground">Mã định danh nhóm (Domain Code)</Label>
              <Input
                value={ruleFormData.domainCode}
                onChange={(e) =>
                  setRuleFormData((prev) => ({
                    ...prev,
                    domainCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                  }))
                }
                placeholder="VD: DOM_THAM_DINH"
                className="font-mono text-xs uppercase font-bold text-indigo-700"
              />
              <p className="text-[10px] text-muted-foreground">
                Mã viết hoa, không dấu cách, dùng để ánh xạ tự động vào metadata nhiệm vụ.
              </p>
            </div>

            {/* CHÈN TOÁN TỬ VÀO FORMULA DIALOG */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Chèn nhanh biến số:</Label>
              <div className="flex flex-wrap gap-1">
                {['Q', 'C', 'W', 'S', 'D', '+', '-', '*', '/', '(', ')'].map((token) => (
                  <Button
                    key={token}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFormulaToken(token, 'dialog')}
                    className="h-6 px-1.5 text-[10px] font-mono font-bold"
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>

            {/* BIỂU THỨC GHI ĐÈ */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground">Biểu thức tính điểm ghi đè</Label>
              <Textarea
                value={ruleFormData.formula}
                onChange={(e) => setRuleFormData((prev) => ({ ...prev, formula: e.target.value }))}
                placeholder="((C / Q) * 0.15 + (S / 100) * 0.50 + 0.35) * W * 100"
                rows={3}
                className="font-mono text-xs font-semibold text-indigo-950 dark:text-indigo-200 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsRuleDialogOpen(false)} className="text-xs">
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveRuleDialog}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Lưu nhóm ngoại lệ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
