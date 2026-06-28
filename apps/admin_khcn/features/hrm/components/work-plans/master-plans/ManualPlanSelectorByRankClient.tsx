"use client";

import React, { useState, useEffect } from 'react';
import { Target, Trash2, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmRankQuotasApi } from '@/features/hrm/api';
import { categoryApi } from "@/features/system-admin/categories/api";
import { useTaskTemplatesList, useCreateMasterPlan } from '@/features/hrm/hooks';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

    const { data: existingQuotasData } = useQuery({
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
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Phân bổ Chỉ tiêu Định biên theo Ngạch</CardTitle>
                    <CardDescription>
                        Cá nhân hóa và tinh chỉnh định mức công việc cho từng ngạch chức danh.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nhóm đối tượng</Label>
                            <Select value={classification} onValueChange={(val: any) => setClassification(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhóm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CONG_CHUC">Công chức (Hành chính công)</SelectItem>
                                    <SelectItem value="VIEN_CHUC">Viên chức (Sự nghiệp/Kỹ thuật)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ngạch / Chức danh nghề nghiệp</Label>
                            <Select value={activeRankFilter} onValueChange={setActiveRankFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn ngạch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeRanksList.map((rank: any) => (
                                        <SelectItem key={rank.code} value={rank.code}>
                                            {rank.nameVi || rank.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-6 space-y-2">
                            <Label>Nhiệm vụ định biên</Label>
                            <Select
                                value={selectedTaskId}
                                onValueChange={val => {
                                    setSelectedTaskId(val);
                                    const task = availableTasks.find(t => t.id === val);
                                    if (task) setTargetValue(task.defaultWeight);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Vui lòng chọn công việc --" />
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
                                <p className="text-xs text-muted-foreground mt-1">Chưa có công việc mẫu nào cho ngạch này.</p>
                            )}
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <Label>Chỉ tiêu bắt buộc</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={targetValue}
                                    onChange={e => setTargetValue(Math.max(1, Number(e.target.value)))}
                                    className="w-full"
                                />
                                <div className="px-3 flex items-center justify-center border rounded-md bg-muted text-sm text-muted-foreground whitespace-nowrap">
                                    {selectedTaskId ? availableTasks.find(t => t.id === selectedTaskId)?.defaultUnit : 'ĐVT'}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <Button
                                onClick={handleAssignTask}
                                disabled={!selectedTaskId}
                                className="w-full"
                            >
                                Gán vào ma trận
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Target className="w-4 h-4" /> Ma trận Thực thi
                        </CardTitle>
                        <CardDescription>Danh sách các nhiệm vụ được phân bổ cho ngạch đã chọn.</CardDescription>
                    </div>
                    {addedPlans.length > 0 && (
                        <Button
                            onClick={handleSubmitPlan}
                            disabled={isPending}
                            className="gap-2"
                        >
                            {isPending ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu cấu trúc
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Nhiệm vụ</TableHead>
                                <TableHead>Yêu cầu ngạch</TableHead>
                                <TableHead className="text-right">Chỉ tiêu áp đặt</TableHead>
                                <TableHead className="w-[60px] text-center"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {addedPlans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">
                                        {plan.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {getRankName(plan.rankType)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="inline-flex items-center gap-2 justify-end w-full">
                                            <Input
                                                type="number"
                                                value={plan.targetValue}
                                                onChange={e => {
                                                    const val = Number(e.target.value);
                                                    setAddedPlans(addedPlans.map(p => p.id === plan.id ? { ...p, targetValue: val } : p));
                                                }}
                                                className="w-20 h-8 text-center"
                                            />
                                            <span className="text-xs text-muted-foreground w-12 text-left">{plan.unit}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {addedPlans.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Chưa có nhiệm vụ nào được chọn.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}