"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, Save, Plus, Trash2, Info, FunctionSquare, Percentage, ShieldCheck, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskKpiApi, VariableDef, CustomRule } from '../../api/task-kpi.api';

export function KpiFormulasClient() {
    const queryClient = useQueryClient();

    // Fetch System Variables
    const { data: variablesRes } = useQuery({
        queryKey: ['kpi-system-variables'],
        queryFn: async () => (await taskKpiApi.getSystemVariables()).data,
        staleTime: Infinity,
    });
    const systemVariables: VariableDef[] = variablesRes?.data || [];

    // Fetch Global Settings
    const { data: settingsRes, isLoading } = useQuery({
        queryKey: ['kpi-global-settings'],
        queryFn: async () => (await taskKpiApi.getGlobalSettings()).data,
    });

    const [baseFormula, setBaseFormula] = useState("(C / Q) * W * 100");
    const [enableQualityScore, setEnableQualityScore] = useState(true);
    const [qualityWeight, setQualityWeight] = useState(30);
    const [enablePenalty, setEnablePenalty] = useState(true);
    const [penaltyPerDay, setPenaltyPerDay] = useState(2);
    const [customRules, setCustomRules] = useState<CustomRule[]>([]);

    useEffect(() => {
        if (settingsRes?.data) {
            const data = settingsRes.data;
            setBaseFormula(data.baseFormula || "(C / Q) * W * 100");
            setEnableQualityScore(data.enableQualityScore ?? true);
            setQualityWeight(data.qualityWeight || 30);
            setEnablePenalty(data.enablePenalty ?? true);
            setPenaltyPerDay(data.penaltyPerDay || 2);
            setCustomRules(data.customRules || []);
        }
    }, [settingsRes]);

    const mutation = useMutation({
        mutationFn: async () => {
            const payload = {
                baseFormula,
                enableQualityScore,
                qualityWeight,
                enablePenalty,
                penaltyPerDay,
                customRules
            };
            return await taskKpiApi.saveGlobalSettings(payload);
        },
        onSuccess: () => {
            toast.success("Đã lưu cấu hình công thức KPI thành công!");
            queryClient.invalidateQueries({ queryKey: ['kpi-global-settings'] });
        },
        onError: (err: any) => {
            console.error(err);
            toast.error(err?.response?.data?.message || "Lỗi khi lưu cấu hình KPI");
        }
    });

    const handleSave = () => {
        mutation.mutate();
    };

    const addCustomRule = () => {
        setCustomRules([...customRules, { domainCode: 'GENERIC', formula: '', name: 'Công thức mới' }]);
    };

    const removeCustomRule = (index: number) => {
        setCustomRules(customRules.filter((_, idx) => idx !== index));
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Đang tải cấu hình KPI...</div>;
    }

    return (
        <Card className="w-full max-w-[1200px] mx-auto mt-6 shadow-xl border overflow-hidden flex flex-col bg-card rounded-2xl">
            <CardHeader className="shrink-0 bg-card border-b pb-6 pt-8 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl shadow-inner">
                                <Calculator className="w-7 h-7" />
                            </div>
                            Công Thức Tính KPI Chung
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                            Thiết lập công thức toán học tính toán hiệu suất hoàn thành công việc (KPI) áp dụng toàn hệ thống. Hỗ trợ các biến số động từ dữ liệu đánh giá thực tế.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COL: Formula Settings */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* Basic Formula */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FunctionSquare className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground">Công Thức Cốt Lõi</h3>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-2xl border shadow-sm space-y-4">
                            <Label className="text-sm font-semibold text-muted-foreground">Biểu thức tính % Hoàn thành theo Khối lượng (Volume Score)</Label>
                            <div className="relative">
                                <Input 
                                    className="text-xl font-mono p-6 font-bold tracking-wider text-indigo-700 bg-white shadow-inner"
                                    value={baseFormula}
                                    onChange={e => setBaseFormula(e.target.value)}
                                    placeholder="(C / Q) * W * 100"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50/50 text-blue-800 p-3 rounded-lg border border-blue-100">
                                <Info className="w-4 h-4 shrink-0" />
                                <p>Công thức áp dụng cho các nhiệm vụ không có đánh giá đặc thù. Kết quả trả về là tỷ lệ % KPI hoàn thành của đầu mục đó.</p>
                            </div>
                        </div>
                    </div>

                    {/* Quality & Penalty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quality */}
                        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <h4 className="font-bold">Đánh giá chất lượng</h4>
                                </div>
                                <Switch checked={enableQualityScore} onCheckedChange={setEnableQualityScore} />
                            </div>
                            <Text className="text-xs text-muted-foreground">Tính thêm điểm chất lượng (Score) do người kiểm duyệt đánh giá vào KPI tổng.</Text>
                            
                            <div className={cn("transition-all duration-300", enableQualityScore ? "opacity-100" : "opacity-40 pointer-events-none")}>
                                <Label className="text-xs font-semibold mb-2 block">Tỷ trọng chất lượng (%)</Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        type="number" 
                                        value={qualityWeight} 
                                        onChange={e => setQualityWeight(Number(e.target.value))}
                                        className="font-bold font-mono"
                                    />
                                    <Percentage className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        {/* Penalty */}
                        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-rose-500" />
                                    <h4 className="font-bold">Trừ điểm trễ hạn</h4>
                                </div>
                                <Switch checked={enablePenalty} onCheckedChange={setEnablePenalty} />
                            </div>
                            <Text className="text-xs text-muted-foreground">Tự động trừ KPI nếu nhiệm vụ bị hoàn thành trễ hơn deadline quy định.</Text>
                            
                            <div className={cn("transition-all duration-300", enablePenalty ? "opacity-100" : "opacity-40 pointer-events-none")}>
                                <Label className="text-xs font-semibold mb-2 block">Điểm trừ mỗi ngày trễ</Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        type="number" 
                                        value={penaltyPerDay} 
                                        onChange={e => setPenaltyPerDay(Number(e.target.value))}
                                        className="font-bold font-mono text-rose-600"
                                    />
                                    <span className="text-sm font-medium text-muted-foreground">điểm / ngày</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom domain formulas */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-foreground">Ghi đè theo Lĩnh vực (Tùy chọn)</h3>
                            <Button variant="outline" size="sm" onClick={addCustomRule} className="h-8 gap-1 rounded-lg">
                                <Plus className="w-3 h-3" /> Thêm ngoại lệ
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {customRules.map((rule, idx) => (
                                <div key={rule.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-muted/20 border p-3 rounded-xl transition-all hover:bg-muted/40">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background font-semibold text-xs border shadow-sm shrink-0">
                                        {idx + 1}
                                    </div>
                                    <Select value={rule.domainCode} onValueChange={(val) => setCustomRules(customRules.map(r => r.id === rule.id ? {...r, domainCode: val} : r))}>
                                        <SelectTrigger className="w-[180px] bg-background">
                                            <SelectValue placeholder="Chọn lĩnh vực" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GENERIC">Hành chính</SelectItem>
                                            <SelectItem value="IT">Công nghệ TT</SelectItem>
                                            <SelectItem value="HEALTHCARE">Y tế</SelectItem>
                                            <SelectItem value="EDUCATION">Giáo dục</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    <Input 
                                        placeholder="Công thức..." 
                                        value={rule.formula}
                                        onChange={e => setCustomRules(customRules.map(r => r.id === rule.id ? {...r, formula: e.target.value} : r))}
                                        className="font-mono bg-background flex-1"
                                    />
                                    
                                    <Button variant="ghost" size="icon" onClick={() => removeCustomRule(rule.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {customRules.length === 0 && (
                                <div className="text-center p-6 border border-dashed rounded-xl text-muted-foreground text-sm">
                                    Không có ngoại lệ nào. Áp dụng công thức cốt lõi cho mọi lĩnh vực.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COL: Variables Dictionary */}
                <div className="bg-muted/20 border rounded-2xl p-6 h-fit shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-500" />
                        Từ điển Biến số
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Sử dụng các biến số sau trong công thức tính toán. Các biến sẽ được tự động điền giá trị thực tế của từng nhân viên khi tổng hợp.
                    </p>

                    <div className="space-y-4">
                        {systemVariables.map(variable => (
                            <div key={variable.code} className="flex gap-4 p-3 bg-background border rounded-xl hover:border-indigo-200 transition-colors cursor-default">
                                <div className="font-mono font-black text-indigo-600 bg-indigo-50 w-10 h-10 flex items-center justify-center rounded-lg shrink-0 text-lg">
                                    {variable.code}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">{variable.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{variable.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Lưu ý bảo mật</h4>
                        <p className="text-xs text-amber-700/80 leading-relaxed">
                            Công thức sẽ được biên dịch an toàn ở server (AST parser). Không sử dụng các hàm javascript thuần túy, chỉ sử dụng các toán tử: +, -, *, /, (, ).
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-muted/30 border-t p-6 flex justify-end gap-3 rounded-b-2xl">
                <Button variant="outline" className="font-semibold h-11 px-6 rounded-xl">Hủy thay đổi</Button>
                <Button 
                    onClick={handleSave} 
                    disabled={mutation.isPending}
                    className="font-bold h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all active:scale-95 gap-2"
                >
                    {mutation.isPending ? "Đang lưu..." : <><Save className="w-4 h-4" /> Lưu cấu hình KPI</>}
                </Button>
            </CardFooter>
        </Card>
    );
}
