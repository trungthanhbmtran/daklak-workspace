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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    const { data: congChucRanks = [] } = useQuery({
        queryKey: ['categories', 'CIVIL_SERVANT_RANK'],
        queryFn: () => categoryApi.fetchByGroup('CIVIL_SERVANT_RANK'),
        staleTime: 5 * 60 * 1000,
    });

    const { data: vienChucRanks = [] } = useQuery({
        queryKey: ['categories', 'PUBLIC_EMPLOYEE_RANK'],
        queryFn: () => categoryApi.fetchByGroup('PUBLIC_EMPLOYEE_RANK'),
        staleTime: 5 * 60 * 1000,
    });

    const { data: templatesData } = useTaskTemplatesList();
    const serverTemplates = templatesData?.data || [];

    const rankTasksRepository = serverTemplates.map((t: any) => ({
        id: t.id.toString(),
        classification: t.classification,
        rank: t.rank,
        taskName: t.taskName,
        defaultUnit: t.defaultUnit || 'Lượt',
        defaultWeight: t.defaultWeight || 1
    }));

    const [classification, setClassification] = useState<'CONG_CHUC' | 'VIEN_CHUC'>('CONG_CHUC');
    const [activeRankFilter, setActiveRankFilter] = useState<string>('');
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
        queryKey: ['rank-quotas', activeRankFilter],
        queryFn: () => hrmRankQuotasApi.getByRank(activeRankFilter),
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

    const availableTasks = rankTasksRepository.filter(item => item.rank === activeRankFilter);
    console.log("DEBUG_TASKS: serverTemplates =", serverTemplates);
    console.log("DEBUG_TASKS: activeRankFilter =", activeRankFilter);
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
                targetValue: p.targetValue,
                weight: 5
            }));

            await hrmRankQuotasApi.save(activeRankFilter, quotas);
            toast.success('Lưu định biên thành công!', {
                description: `Đã cập nhật ${addedPlans.length} chỉ tiêu vào danh sách.`
            });
        } catch (error) {
            toast.error('Có lỗi xảy ra', {
                description: 'Không thể lưu định biên vào lúc này.'
            });
        }
    };

    const getRankName = (code: string) => {
        const r: any = [...congChucRanks, ...vienChucRanks].find((r: any) => r.code === code);
        return r ? (r.nameVi || r.name) : code.replace(/_/g, ' ');
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 max-w-[1600px] mx-auto h-[calc(100vh-2rem)] min-h-[600px]">
            {/* LEFT SIDEBAR - RANK SELECTION */}
            <aside className="w-full md:w-[350px] flex-shrink-0 flex flex-col h-full">
                <Card className="h-full flex flex-col border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg">Danh mục Ngạch</CardTitle>
                        <CardDescription>Chọn nhóm và ngạch để thiết lập</CardDescription>
                        
                        <div className="mt-4">
                            <Select value={classification} onValueChange={(val: any) => setClassification(val)}>
                                <SelectTrigger className="w-full bg-muted/30">
                                    <SelectValue placeholder="Chọn nhóm đối tượng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CONG_CHUC">Công chức hành chính</SelectItem>
                                    <SelectItem value="VIEN_CHUC">Viên chức sự nghiệp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full w-full">
                            <div className="flex flex-col gap-1 p-3">
                                {activeRanksList.map((rank: any) => (
                                    <Button
                                        key={rank.code}
                                        variant={activeRankFilter === rank.code ? "secondary" : "ghost"}
                                        className={`justify-start text-left h-auto py-3 px-4 ${activeRankFilter === rank.code ? 'border-l-4 border-l-primary rounded-l-none' : ''}`}
                                        onClick={() => setActiveRankFilter(rank.code)}
                                    >
                                        <div className="flex flex-col items-start gap-1 w-full">
                                            <span className={`font-semibold text-sm leading-tight whitespace-normal ${activeRankFilter === rank.code ? 'text-primary' : ''}`}>
                                                {rank.nameVi || rank.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{rank.code}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </aside>

            {/* RIGHT MAIN AREA - TASK ASSIGNMENT */}
            <main className="flex-1 flex flex-col gap-6 min-w-0 h-full">
                {/* Form Add Task */}
                <Card className="flex-shrink-0 border shadow-sm">
                    <CardHeader className="pb-4 border-b bg-muted/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Thiết lập Chỉ tiêu</CardTitle>
                                <CardDescription className="mt-1">
                                    Đang cấu hình cho: <span className="font-semibold text-foreground">{getRankName(activeRankFilter)}</span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                            <div className="md:col-span-6 space-y-2">
                                <Label>Nhiệm vụ mẫu</Label>
                                <Select
                                    value={selectedTaskId || undefined}
                                    onValueChange={val => {
                                        setSelectedTaskId(val);
                                        const task = availableTasks.find(t => t.id === val);
                                        if (task) setTargetValue(task.defaultWeight);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Vui lòng chọn nhiệm vụ --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTasks.map(task => {
                                            const isAdded = addedPlans.some(p => p.title === task.taskName);
                                            return (
                                                <SelectItem key={task.id} value={task.id} disabled={isAdded}>
                                                    {task.taskName} {isAdded ? '(Đã thêm)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {availableTasks.length === 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">Không có nhiệm vụ mẫu nào cho ngạch này.</p>
                                )}
                            </div>
                            <div className="md:col-span-3 space-y-2">
                                <Label>Chỉ tiêu bắt buộc</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={targetValue}
                                        onChange={e => setTargetValue(Math.max(1, Number(e.target.value)))}
                                        className="w-full font-mono text-center"
                                    />
                                    <div className="px-3 h-10 flex items-center justify-center border rounded-md bg-muted text-sm text-muted-foreground whitespace-nowrap min-w-[60px]">
                                        {selectedTaskId ? availableTasks.find(t => t.id === selectedTaskId)?.defaultUnit : '---'}
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <Button
                                    onClick={handleAssignTask}
                                    disabled={!selectedTaskId}
                                    className="w-full gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Thêm vào cấu trúc
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Execution Matrix */}
                <Card className="flex-1 flex flex-col border shadow-sm min-h-0">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b flex-shrink-0 bg-muted/10">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="w-4 h-4" /> Ma trận Thực thi
                            </CardTitle>
                            <CardDescription>
                                Đã thêm {addedPlans.length} chỉ tiêu cho ngạch này.
                            </CardDescription>
                        </div>
                        {addedPlans.length > 0 && (
                            <Button
                                onClick={handleSubmitPlan}
                                disabled={isPending}
                                className="gap-2 shadow-sm"
                            >
                                {isPending ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                Lưu Cấu trúc Định biên
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden relative">
                        {isLoadingQuotas ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : null}
                        
                        <ScrollArea className="h-full w-full">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead className="w-[50%] min-w-[300px]">Nội dung Nhiệm vụ</TableHead>
                                        <TableHead className="min-w-[120px]">Áp dụng cho</TableHead>
                                        <TableHead className="text-right min-w-[150px]">Chỉ tiêu bắt buộc</TableHead>
                                        <TableHead className="w-[60px] text-center"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {addedPlans.map((plan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell className="font-medium whitespace-normal leading-relaxed">
                                                {plan.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-medium bg-muted">
                                                    {getRankName(plan.rankType)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center justify-end w-full gap-2">
                                                    <Input
                                                        type="number"
                                                        value={plan.targetValue}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            setAddedPlans(addedPlans.map(p => p.id === plan.id ? { ...p, targetValue: val } : p));
                                                        }}
                                                        className="w-20 h-9 text-center font-mono"
                                                    />
                                                    <span className="text-xs text-muted-foreground w-12 text-left">{plan.unit}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {addedPlans.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                                                Chưa có nhiệm vụ nào được cấu hình cho ngạch này.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}