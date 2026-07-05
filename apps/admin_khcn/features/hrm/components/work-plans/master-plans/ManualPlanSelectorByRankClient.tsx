"use client";

import React, { useState, useEffect } from 'react';
import { Target, Trash2, Save, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmRankQuotasApi } from '@/features/hrm/api';
import { categoryApi } from "@/features/system-admin/categories/api";
import { useTaskTemplatesList, useCreateMasterPlan } from '@/features/hrm/hooks';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface SelectedPlanItem {
    id: string;
    title: string;
    rankType: string;
    targetValue: number;
    unit: string;
}

export function ManualPlanSelectorByRankClient() {
    const DOMAINS = [
        { code: 'GENERIC', name: 'Dùng chung / Hành chính' },
        { code: 'IOC', name: 'Trung tâm Điều hành thông minh (IOC)' },
        { code: 'IT', name: 'Công nghệ thông tin' },
        { code: 'HEALTHCARE', name: 'Y tế' },
        { code: 'EDUCATION', name: 'Giáo dục' },
    ];

    const { data: congChucRanks = [] } = useQuery({
        queryKey: ['categories', 'CIVIL_SERVANT_RANK'],
        queryFn: async () => (await categoryApi.fetchByGroup('CIVIL_SERVANT_RANK')).data,
        staleTime: 5 * 60 * 1000,
    });

    const { data: vienChucRanks = [] } = useQuery({
        queryKey: ['categories', 'PUBLIC_EMPLOYEE_RANK'],
        queryFn: async () => (await categoryApi.fetchByGroup('PUBLIC_EMPLOYEE_RANK')).data,
        staleTime: 5 * 60 * 1000,
    });

    const { data: templatesData } = useTaskTemplatesList();
    const serverTemplates = Array.isArray(templatesData) ? templatesData : (templatesData?.data || []);

    const rankTasksRepository = serverTemplates.map((t: any) => ({
        id: t.id.toString(),
        classification: t.classification,
        rank: t.rank,
        domainCode: t.domainCode || 'GENERIC',
        taskName: t.taskName,
        defaultUnit: t.defaultUnit || 'Lượt',
        defaultWeight: t.defaultWeight || 1
    }));

    const [classification, setClassification] = useState<'CONG_CHUC' | 'VIEN_CHUC'>('CONG_CHUC');
    const [activeRankFilter, setActiveRankFilter] = useState<string>('');
    const [activeDomainFilter, setActiveDomainFilter] = useState<string>('GENERIC');
    const [addedPlans, setAddedPlans] = useState<SelectedPlanItem[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [targetValue, setTargetValue] = useState<number>(1);

    const { isPending } = useCreateMasterPlan();

    useEffect(() => {
        if (classification === 'CONG_CHUC' && congChucRanks.length > 0 && !congChucRanks.find(r => r.code === activeRankFilter)) {
            setActiveRankFilter(congChucRanks[0].code);
        } else if (classification === 'VIEN_CHUC' && vienChucRanks.length > 0 && !vienChucRanks.find(r => r.code === activeRankFilter)) {
            setActiveRankFilter(vienChucRanks[0].code);
        }
    }, [classification, congChucRanks, vienChucRanks]);

    const { data: existingQuotasData, isLoading: isLoadingQuotas } = useQuery({
        queryKey: ['rank-quotas', activeRankFilter, activeDomainFilter],
        queryFn: () => hrmRankQuotasApi.getByRank(activeRankFilter, activeDomainFilter),
        enabled: !!activeRankFilter,
        staleTime: 0,
    });

    useEffect(() => {
        if (existingQuotasData?.data) {
            setAddedPlans(existingQuotasData.data.map((q: any) => ({
                id: q.id.toString(),
                title: q.taskName,
                rankType: q.rankCode,
                targetValue: q.targetValue,
                unit: q.unit
            })));
        } else {
            setAddedPlans([]);
        }
    }, [existingQuotasData, activeRankFilter]);

    const availableTasks = rankTasksRepository.filter(item => item.rank === activeRankFilter && item.domainCode === activeDomainFilter);
    console.log("DEBUG_TASKS: serverTemplates =", serverTemplates);
    console.log("DEBUG_TASKS: activeRankFilter =", activeRankFilter);
    console.log("DEBUG_TASKS: activeDomainFilter =", activeDomainFilter);
    console.log("DEBUG_TASKS: availableTasks =", availableTasks);
    
    const activeRanksList = classification === 'CONG_CHUC' ? congChucRanks : vienChucRanks;

    const handleAssignTask = () => {
        const task = availableTasks.find(t => t.id === selectedTaskId);
        if (!task || addedPlans.some(p => p.title === task.taskName && p.rankType === activeRankFilter)) return;

        setAddedPlans([...addedPlans, {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: task.taskName,
            rankType: activeRankFilter,
            targetValue: targetValue,
            unit: task.defaultUnit
        }]);

        setSelectedTaskId('');
        setTargetValue(1);
    };

    const handleSubmitPlan = async () => {
        if (!activeRankFilter) {
            toast.error('Vui lòng chọn ngạch trước khi lưu định biên.');
            return;
        }

        try {
            const quotas = addedPlans.map(p => ({
                taskName: p.title,
                unit: p.unit,
                targetValue: Number(p.targetValue),
                weight: 1
            }));
            await hrmRankQuotasApi.save(activeRankFilter, activeDomainFilter, quotas);
            toast.success('Lưu định biên thành công!', {
                description: `Đã cập nhật ${addedPlans.length} chỉ tiêu vào danh sách.`
            });
        } catch (error) {
            toast.error('Có lỗi xảy ra', {
                description: 'Không thể lưu định biên vào lúc này.'
            });
        }
    };

    return (
        <Card className="max-w-6xl mx-auto mt-6 shadow-xl border-0 ring-1 ring-black/5 overflow-hidden h-[calc(100vh-100px)] flex flex-col bg-gradient-to-b from-muted/20 to-background rounded-2xl">
            <CardHeader className="flex-shrink-0 bg-white/50 backdrop-blur-md border-b pb-4 pt-6 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tight">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        Cấu Hình Chỉ Tiêu Định Biên Theo Ngạch
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                        Thiết lập và phân bổ danh mục công việc bắt buộc cho từng ngạch chức danh. Giúp tự động hóa việc giao việc và đánh giá KPI một cách khoa học.
                    </CardDescription>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col min-h-0 p-6 gap-6">
                {/* FILTER SECTION */}
                <div className="flex-shrink-0 bg-white rounded-2xl border p-4 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-end">
                    <div className="flex-1 w-full space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phân loại Ngạch</Label>
                        <Tabs value={classification} onValueChange={(val: any) => setClassification(val)} className="w-full">
                            <TabsList className="w-full grid grid-cols-2 p-1 bg-muted/50 rounded-xl">
                                <TabsTrigger value="CONG_CHUC" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Khối Công chức</TabsTrigger>
                                <TabsTrigger value="VIEN_CHUC" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Khối Viên chức</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chọn Chức danh / Hạng</Label>
                        <Select value={activeRankFilter} onValueChange={setActiveRankFilter}>
                            <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-muted">
                                <SelectValue placeholder="Chọn chức danh..." />
                            </SelectTrigger>
                            <SelectContent>
                                {activeRanksList.map((rank: any) => (
                                    <SelectItem key={rank.code} value={rank.code} className="cursor-pointer">
                                        {rank.nameVi || rank.name} ({rank.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex-1 w-full space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lĩnh vực (Chuyên ngành)</Label>
                        <Select value={activeDomainFilter} onValueChange={setActiveDomainFilter}>
                            <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-muted">
                                <SelectValue placeholder="Chọn lĩnh vực..." />
                            </SelectTrigger>
                            <SelectContent>
                                {DOMAINS.map(domain => (
                                    <SelectItem key={domain.code} value={domain.code} className="cursor-pointer">
                                        {domain.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/5 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            <h3 className="font-bold text-sm tracking-tight text-foreground">Danh sách chỉ tiêu bắt buộc</h3>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            <Select
                                value={selectedTaskId}
                                onValueChange={val => {
                                    setSelectedTaskId(val);
                                    const task = availableTasks.find(t => t.id === val);
                                    if (task) setTargetValue(task.defaultWeight);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[350px] h-10 rounded-xl bg-white">
                                    <SelectValue placeholder="-- Chọn nhiệm vụ mẫu từ thư viện --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTasks.map(task => {
                                        const isAdded = addedPlans.some(p => p.title === task.taskName);
                                        return (
                                            <SelectItem key={task.id} value={task.id} disabled={isAdded} className="text-sm">
                                                {task.taskName} {isAdded ? '(Đã thêm)' : ''}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            
                            <div className="flex w-full sm:w-auto items-center bg-white border rounded-xl overflow-hidden h-10">
                                <div className="px-3 text-xs font-medium text-muted-foreground border-r bg-muted/10 h-full flex items-center">Chỉ tiêu</div>
                                <Input
                                    type="number"
                                    value={targetValue}
                                    onChange={e => setTargetValue(Math.max(1, Number(e.target.value)))}
                                    className="w-20 h-full border-0 focus-visible:ring-0 text-center font-semibold text-sm bg-transparent"
                                />
                            </div>
                            
                            <Button
                                onClick={handleAssignTask}
                                disabled={!selectedTaskId}
                                className="w-full sm:w-auto h-10 px-5 rounded-xl font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Thêm
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden bg-white relative">
                        <ScrollArea className="h-full">
                            <Table>
                                <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-sm z-10">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold text-muted-foreground">Tên nhiệm vụ</TableHead>
                                        <TableHead className="w-[120px] font-semibold text-muted-foreground text-center">Đơn vị</TableHead>
                                        <TableHead className="w-[150px] font-semibold text-muted-foreground text-center">Chỉ tiêu (Lần/Lượt)</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {addedPlans.map((plan, idx) => (
                                        <TableRow key={plan.id} className="group transition-colors hover:bg-muted/10">
                                            <TableCell className="font-medium text-foreground py-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold text-muted-foreground flex-shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="mt-0.5 leading-relaxed">{plan.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {plan.unit || 'Lượt'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <Input
                                                        type="number"
                                                        value={plan.targetValue}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            setAddedPlans(addedPlans.map(p => p.id === plan.id ? { ...p, targetValue: val } : p));
                                                        }}
                                                        className="w-24 h-8 text-center font-bold text-sm bg-white border-muted-foreground/20 focus-visible:ring-primary/30 transition-shadow rounded-lg"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))}
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {addedPlans.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-[300px] text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                                                        <Target className="w-8 h-8 opacity-20" />
                                                    </div>
                                                    <p className="text-sm">Chưa có nhiệm vụ bắt buộc nào cho ngạch này.</p>
                                                    <p className="text-xs opacity-60">Hãy chọn một nhiệm vụ mẫu từ thư viện và nhấn "Thêm"</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center px-6 py-4 border-t bg-white relative z-10 flex-shrink-0">
                <div className="text-xs text-muted-foreground">
                    Tổng số nhiệm vụ định biên: <strong className="text-foreground">{addedPlans.length}</strong>
                </div>
                <Button
                    onClick={handleSubmitPlan}
                    disabled={isPending || addedPlans.length === 0}
                    size="lg"
                    className="gap-2 font-bold px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                    {isPending ? (
                        <>Đang lưu...</>
                    ) : (
                        <><Save className="w-4 h-4" /> LƯU CẤU TRÚC ĐỊNH BIÊN</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}