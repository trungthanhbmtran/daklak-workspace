"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calculator, Check, CircleHelp, Clock3, FlaskConical, Plus, RotateCcw, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
    mutationFn: async () => responseData<any>(await taskKpiApi.previewGlobalSettings({
      settings,
      variables: previewVariables,
      domainCode: previewDomainCode || 'GENERIC',
    })),
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || 'Không thể thử công thức'),
  });

  const saveMutation = useMutation({
    mutationFn: async () => taskKpiApi.saveGlobalSettings(settings),
    onSuccess: () => {
      toast.success('Đã lưu và áp dụng phiên bản công thức mới');
      previewMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['kpi-global-settings'] });
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
    setCustomRules((current) => [...current, { domainCode: '', name: '', formula: '(C / Q) * W * 100' }]);
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

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải cấu hình KPI...</div>;

  const preview = previewMutation.data;
  const previewScore = preview?.valid ? Number(preview.score).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-indigo-50 via-background to-background p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-sm"><Calculator className="h-7 w-7" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">Cấu hình KPI · Toàn hệ thống</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Công thức tính điểm</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Chỉnh công thức, xem thử bằng dữ liệu mẫu và lưu thành phiên bản có thể tra soát. Công thức được dùng khi hệ thống tổng hợp điểm công việc cho kỳ đánh giá.
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-xl border bg-background px-4 py-3 text-sm">
          <div className="text-xs text-muted-foreground">Phiên bản đang áp dụng</div>
          <div className="mt-1 font-mono text-lg font-bold">v{savedSettings?.version || 1}</div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-indigo-600" /> 1. Công thức chung</CardTitle>
              <CardDescription>Dùng khi nhóm công việc không có quy tắc riêng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 lg:p-6">
              <div className="flex flex-wrap gap-2">
                {systemVariables.map((variable) => (
                  <Button key={variable.code} type="button" size="sm" variant="outline" onClick={() => addFormulaToken(variable.code)} className="h-8 font-mono font-bold">
                    + {variable.code}
                  </Button>
                ))}
                {[['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/'], ['(', '('], [')', ')']].map(([label, token]) => (
                  <Button key={label} type="button" size="sm" variant="ghost" onClick={() => addFormulaToken(token)} className="h-8 min-w-8 px-2 font-mono">{label}</Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-formula">Biểu thức điểm công việc</Label>
                <Textarea
                  id="base-formula"
                  value={baseFormula}
                  onChange={(event) => { setBaseFormula(event.target.value); previewMutation.reset(); }}
                  placeholder="(C / Q) * W * 100"
                  maxLength={256}
                  className="min-h-24 resize-y bg-background font-mono text-base font-semibold"
                />
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span>Toán tử: + − × ÷ và ngoặc. Có thể dùng số thập phân.</span>
                  <span>{baseFormula.length}/256 ký tự</span>
                </div>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-sm leading-6 text-blue-950">
                <b>Cách đọc mặc định:</b> tỷ lệ hoàn thành × hệ số trọng số × 100. Phần trừ trễ và điểm chất lượng được cộng/trừ theo tùy chọn bên dưới.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">2. Điều chỉnh điểm bổ sung</CardTitle>
              <CardDescription>Bật/tắt từng yếu tố và cấu hình mức tác động.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:p-6">
              <div className="space-y-4 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Điểm chất lượng</div>
                  <Switch checked={enableQualityScore} onCheckedChange={(value) => { setEnableQualityScore(value); previewMutation.reset(); }} />
                </div>
                <p className="text-xs leading-5 text-muted-foreground">Cộng theo điểm chất lượng S (0–100) nhân với tỷ trọng cấu hình.</p>
                <Label htmlFor="quality-weight">Tỷ trọng cộng tối đa (%)</Label>
                <Input id="quality-weight" type="number" min="0" max="100" step="1" disabled={!enableQualityScore} value={qualityWeight} onChange={(event) => { setQualityWeight(Number(event.target.value)); previewMutation.reset(); }} />
              </div>
              <div className="space-y-4 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-rose-600" /> Trừ điểm trễ hạn</div>
                  <Switch checked={enablePenalty} onCheckedChange={(value) => { setEnablePenalty(value); previewMutation.reset(); }} />
                </div>
                <p className="text-xs leading-5 text-muted-foreground">Số ngày trễ D × mức trừ mỗi ngày.</p>
                <Label htmlFor="penalty-per-day">Điểm trừ mỗi ngày</Label>
                <Input id="penalty-per-day" type="number" min="0" max="1000" step="0.1" disabled={!enablePenalty} value={penaltyPerDay} onChange={(event) => { setPenaltyPerDay(Number(event.target.value)); previewMutation.reset(); }} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Clock3 className="h-4 w-4 text-indigo-600" /> Lịch sử phiên bản</CardTitle>
              <CardDescription>Có thể nạp bản cũ để tham khảo; khi lưu sẽ phát sinh phiên bản mới.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {savedVersions.length === 0 ? <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Chưa có lần lưu cấu hình nào.</p> : savedVersions.map((item) => (
                <div key={item.version} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-bold">Phiên bản v{item.version}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('vi-VN')} · {item.changedBy || 'Quản trị viên'}</div>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => loadVersion(item)}>Nạp để sửa</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b bg-muted/20">
              <div>
                <CardTitle className="text-lg">3. Công thức theo nhóm công việc</CardTitle>
                <CardDescription className="mt-1">Mỗi mã nhóm có thể ghi đè công thức chung. Mã nhóm lấy từ metadata của nhiệm vụ.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addCustomRule} className="shrink-0 gap-2"><Plus className="h-4 w-4" /> Thêm nhóm</Button>
            </CardHeader>
            <CardContent className="space-y-4 p-5 lg:p-6">
              {customRules.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có công thức riêng. Tất cả nhóm sẽ dùng công thức chung.</div>
              ) : customRules.map((rule, index) => (
                <div key={`${index}-${rule.domainCode}`} className="space-y-3 rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Ngoại lệ {index + 1}</div>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Xóa ngoại lệ ${index + 1}`} onClick={() => { setCustomRules((current) => current.filter((_, i) => i !== index)); previewMutation.reset(); }}>
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Tên nhóm dễ nhận biết</Label><Input value={rule.name || ''} onChange={(event) => updateRule(index, { name: event.target.value })} placeholder="Ví dụ: Thẩm định hồ sơ" /></div>
                    <div className="space-y-2"><Label>Mã nhóm</Label><Input value={rule.domainCode} onChange={(event) => updateRule(index, { domainCode: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })} placeholder="VD: THAM_DINH" /></div>
                  </div>
                  <div className="space-y-2"><Label>Công thức ghi đè</Label><Input value={rule.formula} onChange={(event) => updateRule(index, { formula: event.target.value })} placeholder="(C / Q) * W * 100" className="font-mono" /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="sticky bottom-3 z-10 flex flex-col-reverse justify-end gap-2 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row">
            <Button variant="outline" onClick={resetChanges} disabled={saveMutation.isPending}><RotateCcw className="mr-2 h-4 w-4" /> Hoàn tác</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || previewMutation.isPending} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {saveMutation.isPending ? 'Đang lưu...' : <><Save className="mr-2 h-4 w-4" /> Kiểm tra và lưu phiên bản</>}
            </Button>
          </div>
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-4">
          <Card className="overflow-hidden rounded-2xl border-indigo-200 shadow-sm">
            <CardHeader className="bg-indigo-50/80">
              <CardTitle className="flex items-center gap-2 text-lg"><FlaskConical className="h-5 w-5 text-indigo-700" /> 4. Thử công thức</CardTitle>
              <CardDescription>Dùng cùng bộ tính toán phía máy chủ trước khi lưu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                {(['Q', 'C', 'W', 'D', 'S'] as const).map((code) => (
                  <div key={code} className="space-y-1.5">
                    <Label htmlFor={`preview-${code}`} className="text-xs">{code} · {systemVariables.find((variable) => variable.code === code)?.name || code}</Label>
                    <Input id={`preview-${code}`} type="number" min="0" step="0.1" value={previewVariables[code]} onChange={(event) => { setPreviewVariables((current) => ({ ...current, [code]: Number(event.target.value) })); previewMutation.reset(); }} />
                  </div>
                ))}
                <div className="space-y-1.5"><Label htmlFor="preview-domain" className="text-xs">Mã nhóm thử</Label><Input id="preview-domain" value={previewDomainCode} onChange={(event) => { setPreviewDomainCode(event.target.value.toUpperCase()); previewMutation.reset(); }} /></div>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending}>
                {previewMutation.isPending ? 'Đang tính thử...' : 'Tính kết quả mẫu'}
              </Button>
              {preview && (
                <div className={`rounded-xl border p-4 ${preview.valid ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                  {preview.valid ? <><div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Điểm dự kiến</div><div className="mt-1 text-3xl font-black text-emerald-900">{previewScore}</div><div className="mt-1 text-xs text-emerald-800">Bao gồm điều chỉnh trễ hạn và chất lượng đang bật.</div></> : <div className="text-sm font-medium text-rose-800">{preview.error || 'Công thức không hợp lệ.'}</div>}
                </div>
              )}
              <div className="rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                Ví dụ mặc định: Q=10, C=8, W=1, D=2, S=80 cho kết quả 100 điểm khi cả hai điều chỉnh đang bật.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CircleHelp className="h-4 w-4 text-indigo-600" /> Từ điển biến</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0">
              {systemVariables.map((variable) => (
                <div key={variable.code} className="flex gap-3 rounded-lg border p-3">
                  <span className="flex h-8 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-50 font-mono font-black text-indigo-700">{variable.code}</span>
                  <div><div className="text-sm font-semibold">{variable.name}</div><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{variable.description}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
            <div className="mb-1 flex items-center gap-2 font-bold"><Check className="h-4 w-4" /> Kiểm soát thay đổi</div>
            Lần lưu tạo một phiên bản mới trong lịch sử. Hệ thống chỉ chấp nhận số, biến Q/C/W/D/S, ngoặc và phép tính cơ bản; biểu thức không hợp lệ sẽ không được lưu.
          </div>
        </aside>
      </div>
    </div>
  );
}
