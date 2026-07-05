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
        <Card className="max-w-5xl mx-auto mt-6 shadow-sm border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black text-foreground">
                    <Target className="w-5 h-5 text-primary" /> Thiết lập Chỉ tiêu Định biên Thủ công
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                    Hệ thống hóa danh mục công việc dựa trên phân hạng Ngạch giúp phân rã khối lượng công việc đúng năng lực, đúng thẩm quyền pháp lý.
                </CardDescription>
            </CardHeader>
            
            <CardContent>
                <Tabs value={classification} onValueChange={(val: any) => setClassification(val)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="CONG_CHUC">Khối Công chức</TabsTrigger>
                        <TabsTrigger value="VIEN_CHUC">Khối Viên chức</TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col gap-4 mb-6">
                        <div className="grid gap-2">
                            <Label>Chọn Chức danh / Hạng:</Label>
                            <Select value={activeRankFilter} onValueChange={setActiveRankFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn chức danh..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeRanks.map((rank: any) => (
                                        <SelectItem key={rank.code} value={rank.code}>
                                            {rank.nameVi || rank.name} ({rank.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label>Chọn Lĩnh vực (Chuyên ngành):</Label>
                            <Select value={activeDomainFilter} onValueChange={setActiveDomainFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lĩnh vực..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOMAINS.map(domain => (
                                        <SelectItem key={domain.code} value={domain.code}>
                                            {domain.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
                        <div className="flex-1 flex flex-col min-w-0 h-full border rounded-xl overflow-hidden bg-background shadow-sm">
                            <div className="p-4 bg-muted/10 border-b flex-shrink-0 space-y-3">
                                <h3 className="font-semibold text-sm">Thêm chỉ tiêu bắt buộc</h3>
                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                    <div className="flex-1 w-full space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nhiệm vụ mẫu</Label>
                                        <Select
                                            value={selectedTaskId}
                                            onValueChange={val => {
                                                setSelectedTaskId(val);
                                                const task = availableTasks.find(t => t.id === val);
                                                if (task) setTargetValue(task.defaultWeight);
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-auto min-h-9 text-xs">
                                                <SelectValue placeholder="-- Chọn nhiệm vụ --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTasks.map(task => {
                                                    const isAdded = addedPlans.some(p => p.title === task.taskName);
                                                    return (
                                                        <SelectItem key={task.id} value={task.id} disabled={isAdded} className="text-xs">
                                                            {task.taskName} {isAdded ? '(Đã thêm)' : ''}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-[120px] space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Chỉ tiêu</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={targetValue}
                                                onChange={e => setTargetValue(Math.max(1, Number(e.target.value)))}
                                                className="w-24 h-9 text-center font-mono text-xs bg-background"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAssignTask}
                                        disabled={!selectedTaskId}
                                        className="h-9 px-4 text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2" /> Thêm
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nội dung</TableHead>
                                                <TableHead className="w-[150px]">Chỉ tiêu</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {addedPlans.map((plan) => (
                                                <TableRow key={plan.id}>
                                                    <TableCell className="text-xs">{plan.title}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={plan.targetValue}
                                                            onChange={e => {
                                                                const val = Number(e.target.value);
                                                                setAddedPlans(addedPlans.map(p => p.id === plan.id ? { ...p, targetValue: val } : p));
                                                            }}
                                                            className="w-24 h-7 text-center font-mono text-xs bg-muted/20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))}
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {addedPlans.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="h-40 text-center text-[13px] text-muted-foreground">
                                                        Chưa có nhiệm vụ nào được cấu hình cho ngạch này.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </CardContent>

            <CardFooter className="flex justify-end pt-4 pb-4 border-t bg-muted/30 rounded-b-2xl">
                <Button
                    onClick={handleSubmitPlan}
                    disabled={isPending || addedPlans.length === 0}
                    className="gap-2 font-bold text-xs h-10 px-6 rounded-xl"
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