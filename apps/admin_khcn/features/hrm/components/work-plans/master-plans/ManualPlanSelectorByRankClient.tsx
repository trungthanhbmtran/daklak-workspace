"use client";

import React, { useState } from 'react';
import { Award, MousePointerClick, Target, Trash2, Network, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmTaskTemplatesApi, hrmRankQuotasApi } from '@/features/hrm/api';
import { categoryApi } from "@/features/system-admin/categories/api";
import { useTaskTemplatesList, useCreateMasterPlan, useTasksList } from '@/features/hrm/hooks';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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

    const { data: globalTasksData } = useTasksList({ limit: 1000 });
    const globalTasks = globalTasksData?.data || [];

    const [activeRankFilter, setActiveRankFilter] = useState<string>('PRINCIPAL_SPECIALIST');
    const [addedPlans, setAddedPlans] = useState<SelectedPlanItem[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [targetValue, setTargetValue] = useState<number>(1);


    const router = useRouter();
    const { mutateAsync: createPlan, isPending } = useCreateMasterPlan();

    const { data: existingQuotasData, isLoading: isFetchingQuotas } = useQuery({
        queryKey: ['rank-quotas', activeRankFilter],
        queryFn: () => hrmRankQuotasApi.getByRank(activeRankFilter),
        staleTime: 0,
    });

    React.useEffect(() => {
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
                description: `Đã đưa ${addedPlans.length} chỉ tiêu vào danh sách.`
            });
        } catch (error) {
            toast.error('Có lỗi xảy ra', {
                description: 'Không thể lập cấu trúc kế hoạch vào lúc này.'
            });
        }
    };

    const getRankName = (code: string) => {
        const r: any = [...congChucRanks, ...vienChucRanks].find((r: any) => r.code === code);
        return r ? (r.nameVi || r.name) : code.replace(/_/g, ' ');
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8 bg-background min-h-screen text-foreground antialiased">
            <div className="bg-card rounded-3xl p-8 shadow-sm border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Network className="w-32 h-32 text-primary" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 mb-2">
                        <div className="bg-primary/20 p-2 rounded-xl backdrop-blur-sm border border-primary/30">
                            <Network className="w-6 h-6 text-primary" />
                        </div>
                        Phân bổ Chỉ tiêu Định biên theo Ngạch
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                        Hệ thống hóa thao tác phân bổ thủ công. Chọn ngạch công vụ hành chính để truy xuất bộ nhiệm vụ đặc thù được quy định bởi pháp luật điều hành.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* THANH ĐIỀU HƯỚNG BỘ LỌC THEO NGẠCH ĐẶC THÙ (4/12 COLS) */}
                <Card className="xl:col-span-4 border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                            <MousePointerClick className="w-4 h-4 text-primary" /> Chọn Ngạch công vụ tác nghiệp
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        {/* Cây danh mục ngạch bậc bằng Tabs */}
                        <Tabs defaultValue="cong-chuc" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted rounded-xl p-1">
                                <TabsTrigger value="cong-chuc" className="rounded-lg font-bold">Công chức</TabsTrigger>
                                <TabsTrigger value="vien-chuc" className="rounded-lg font-bold">Viên chức</TabsTrigger>
                            </TabsList>

                            <TabsContent value="cong-chuc" className="flex flex-col gap-1.5 mt-0">
                                {congChucRanks.map((rank: any) => (
                                    <button
                                        key={rank.code}
                                        type="button"
                                        onClick={() => setActiveRankFilter(rank.code)}
                                        className={`p-3 rounded-2xl text-left transition-all duration-300 flex items-center justify-between group border
                                            ${activeRankFilter === rank.code
                                                ? 'bg-primary text-primary-foreground shadow-md scale-[1.02] border-transparent'
                                                : 'bg-background hover:border-primary hover:shadow-sm hover:bg-muted/50 text-foreground'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold tracking-wide">{rank.nameVi || rank.name}</div>
                                            <div className={`text-[10px] leading-relaxed ${activeRankFilter === rank.code ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{rank.description || 'Chưa có mô tả'}</div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${activeRankFilter === rank.code ? 'opacity-100 translate-x-1' : 'opacity-40 group-hover:opacity-100 group-hover:text-primary'}`} />
                                    </button>
                                ))}
                            </TabsContent>

                            <TabsContent value="vien-chuc" className="flex flex-col gap-1.5 mt-0">
                                {vienChucRanks.map((rank: any) => (
                                    <button
                                        key={rank.code}
                                        type="button"
                                        onClick={() => setActiveRankFilter(rank.code)}
                                        className={`p-3 rounded-2xl text-left transition-all duration-300 flex items-center justify-between group border
                                            ${activeRankFilter === rank.code
                                                ? 'bg-primary text-primary-foreground shadow-md scale-[1.02] border-transparent'
                                                : 'bg-background hover:border-primary hover:shadow-sm hover:bg-muted/50 text-foreground'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold tracking-wide">{rank.nameVi || rank.name}</div>
                                            <div className={`text-[10px] leading-relaxed ${activeRankFilter === rank.code ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{rank.description || 'Chưa có mô tả'}</div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${activeRankFilter === rank.code ? 'opacity-100 translate-x-1' : 'opacity-40 group-hover:opacity-100 group-hover:text-primary'}`} />
                                    </button>
                                ))}
                            </TabsContent>
                        </Tabs>

                        {/* FORM CHỌN VIỆC VÀ ĐỊNH MỨC */}
                        <div className="mt-6 p-4 bg-muted/30 border rounded-2xl space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px]">1</span>
                                        Chọn công việc cần gán định mức
                                    </label>
                                    <Button
                                        variant="ghost"
                                        className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10"
                                        onClick={() => router.push('/services/hrm/work-plans/rank-templates')}
                                    >
                                        + Cấu hình thêm
                                    </Button>
                                </div>
                                <Select
                                    value={selectedTaskId}
                                    onValueChange={val => {
                                        setSelectedTaskId(val);
                                        const task = availableTasks.find(t => t.id === val);
                                        if (task) setTargetValue(task.defaultWeight);
                                    }}
                                >
                                    <SelectTrigger className="w-full h-11 px-3 text-sm rounded-xl border focus:ring-2 focus:ring-primary outline-none bg-background transition-shadow">
                                        <SelectValue placeholder="-- Vui lòng chọn công việc --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTasks.map(task => (
                                            <SelectItem key={task.id} value={task.id} disabled={addedPlans.some(p => p.title === task.taskName)}>
                                                {task.taskName} {addedPlans.some(p => p.title === task.taskName) ? '(Đã thêm)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {availableTasks.length === 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-[11px] text-destructive font-medium ml-1">Chưa có công việc mẫu nào được cấu hình cho ngạch này.</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px]">2</span>
                                        Nhập định mức
                                    </label>
                                    <Input
                                        type="number"
                                        value={targetValue}
                                        onChange={e => setTargetValue(Math.max(1, Number(e.target.value)))}
                                        className="h-11 text-sm font-mono font-bold bg-background rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider">
                                        Đơn vị tính
                                    </label>
                                    <div className="h-11 px-3 flex items-center bg-muted/50 text-muted-foreground text-sm rounded-xl border font-medium">
                                        {selectedTaskId ? availableTasks.find(t => t.id === selectedTaskId)?.defaultUnit : '---'}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleAssignTask}
                                disabled={!selectedTaskId}
                                className="w-full h-11 rounded-xl shadow-sm hover:shadow-md transition-all gap-2 mt-2"
                            >
                                Gán vào cấu trúc
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* BẢNG MA TRẬN KẾ HOẠCH CHI TIẾT SAU KHI PHÂN PHỐI (8/12 COLS) */}
                <Card className="xl:col-span-8 border shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                            <Target className="w-4 h-4 text-primary" /> Cấu trúc kế hoạch tổng hợp sau phân rã ngạch
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[55%] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nhiệm vụ hành chính công vụ</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Yêu cầu cấp ngạch</TableHead>
                                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chỉ tiêu áp đặt</TableHead>
                                    <TableHead className="w-[60px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hủy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {addedPlans.map((plan) => (
                                    <TableRow key={plan.id} className="hover:bg-muted/50 transition-colors group">
                                        <TableCell className="font-bold leading-relaxed text-sm py-4">
                                            {plan.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider shadow-sm px-2.5 py-1">
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
                                                    className="w-20 h-9 text-center font-mono font-black text-primary bg-background border rounded-lg shadow-sm focus-visible:ring-primary transition-shadow"
                                                />
                                                <span className="text-[11px] text-muted-foreground font-bold min-w-[45px] text-left uppercase tracking-wider bg-muted px-2 py-1.5 rounded-md">{plan.unit}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))}
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {addedPlans.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-muted-foreground text-sm bg-muted/30">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <p>Chưa có tác vụ nào được chọn vào ma trận thực thi.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {addedPlans.length > 0 && (
                        <div className="p-4 bg-muted/50 border-t flex justify-end items-center gap-3">
                            <Button variant="outline" onClick={() => setAddedPlans([])} className="h-10 text-muted-foreground hover:text-foreground">
                                Làm lại từ đầu
                            </Button>
                            <Button
                                onClick={handleSubmitPlan}
                                disabled={isPending}
                                className="h-10 font-bold px-6 rounded-xl shadow-sm hover:shadow-md transition-all gap-2"
                            >
                                {isPending ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Target className="w-4 h-4" />}
                                Lưu định biên theo ngạch
                            </Button>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    );
}