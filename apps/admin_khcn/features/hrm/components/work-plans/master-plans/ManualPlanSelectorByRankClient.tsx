"use client";

import React, { useState } from 'react';
import { Award, MousePointerClick, Target, Trash2, Network, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmTaskTemplatesApi } from '@/features/hrm/api/task-templates.api';
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

    // Custom task states
    const [selectedGlobalTaskId, setSelectedGlobalTaskId] = useState<string>('');
    const [customTargetValue, setCustomTargetValue] = useState<number>(1);
    const [customUnit, setCustomUnit] = useState<string>('Lượt');

    const router = useRouter();
    const { mutateAsync: createPlan, isPending } = useCreateMasterPlan();

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

    const handleAssignGlobalTask = () => {
        const task = globalTasks.find((t: any) => t.id === selectedGlobalTaskId);
        if (!task || addedPlans.some(p => p.title === task.title && p.rankType === activeRankFilter)) return;

        setAddedPlans([...addedPlans, {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: task.title,
            rankType: activeRankFilter,
            targetValue: customTargetValue,
            unit: customUnit
        }]);

        setSelectedGlobalTaskId('');
        setCustomTargetValue(1);
        setCustomUnit('Lượt');
    };

    const handleSubmitPlan = async () => {
        try {
            await createPlan({
                title: 'Kế hoạch Định biên Tổng hợp năm 2026',
                description: 'Được lập từ tiện ích Phân bổ Chỉ tiêu Định biên theo Ngạch.',
                startDate: new Date().toISOString(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                status: 'DRAFT',
                objectives: addedPlans.map(p => ({
                    title: p.title,
                    perspective: p.rankType,
                    metric: p.unit,
                    target: p.targetValue.toString(),
                    weight: 5,
                    status: 'TODO'
                }))
            });
            toast.success('Khởi tạo Kế hoạch thành công!', {
                description: `Đã đưa ${addedPlans.length} chỉ tiêu vào danh sách.`
            });
            setAddedPlans([]);
            router.push('/services/hrm/work-plans/master-plans');
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
        <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8 bg-slate-50/50 min-h-screen text-slate-800 antialiased">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 shadow-xl border border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Network className="w-32 h-32 text-white" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 text-white mb-2">
                        <div className="bg-indigo-500/20 p-2 rounded-xl backdrop-blur-sm border border-indigo-500/30">
                            <Network className="w-6 h-6 text-indigo-400" />
                        </div>
                        Phân bổ Chỉ tiêu Định biên theo Ngạch
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                        Hệ thống hóa thao tác phân bổ thủ công. Chọn ngạch công vụ hành chính để truy xuất bộ nhiệm vụ đặc thù được quy định bởi pháp luật điều hành.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* THANH ĐIỀU HƯỚNG BỘ LỌC THEO NGẠCH ĐẶC THÙ (4/12 COLS) */}
                <Card className="xl:col-span-4 border-slate-200 shadow-sm">
                    <CardHeader className="pb-4 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 font-bold text-slate-900 text-sm uppercase tracking-wider">
                            <MousePointerClick className="w-4 h-4 text-indigo-600" /> Chọn Ngạch công vụ tác nghiệp
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        {/* Cây danh mục ngạch bậc bằng Tabs */}
                        <Tabs defaultValue="cong-chuc" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 rounded-xl p-1">
                                <TabsTrigger value="cong-chuc" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Công chức</TabsTrigger>
                                <TabsTrigger value="vien-chuc" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Viên chức</TabsTrigger>
                            </TabsList>

                            <TabsContent value="cong-chuc" className="flex flex-col gap-1.5 mt-0">
                                {congChucRanks.map((rank: any) => (
                                    <button
                                        key={rank.code}
                                        type="button"
                                        onClick={() => setActiveRankFilter(rank.code)}
                                        className={`p-3 rounded-2xl text-left transition-all duration-300 flex items-center justify-between group
                                            ${activeRankFilter === rank.code
                                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 border-transparent scale-[1.02]'
                                                : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30 text-slate-700'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold tracking-wide">{rank.nameVi || rank.name}</div>
                                            <div className={`text-[10px] leading-relaxed ${activeRankFilter === rank.code ? 'text-indigo-100' : 'text-slate-500'}`}>{rank.description || 'Chưa có mô tả'}</div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${activeRankFilter === rank.code ? 'opacity-100 translate-x-1 text-white' : 'opacity-40 group-hover:opacity-100 group-hover:text-indigo-500'}`} />
                                    </button>
                                ))}
                            </TabsContent>

                            <TabsContent value="vien-chuc" className="flex flex-col gap-1.5 mt-0">
                                {vienChucRanks.map((rank: any) => (
                                    <button
                                        key={rank.code}
                                        type="button"
                                        onClick={() => setActiveRankFilter(rank.code)}
                                        className={`p-3 rounded-2xl text-left transition-all duration-300 flex items-center justify-between group
                                            ${activeRankFilter === rank.code
                                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 border-transparent scale-[1.02]'
                                                : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30 text-slate-700'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold tracking-wide">{rank.nameVi || rank.name}</div>
                                            <div className={`text-[10px] leading-relaxed ${activeRankFilter === rank.code ? 'text-indigo-100' : 'text-slate-500'}`}>{rank.description || 'Chưa có mô tả'}</div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${activeRankFilter === rank.code ? 'opacity-100 translate-x-1 text-white' : 'opacity-40 group-hover:opacity-100 group-hover:text-indigo-500'}`} />
                                    </button>
                                ))}
                            </TabsContent>
                        </Tabs>

                        {/* FORM CHỌN VIỆC VÀ ĐỊNH MỨC */}
                        <div className="mt-6 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px]">1</span>
                                        Chọn công việc cần gán định mức
                                    </label>
                                    <Button
                                        variant="ghost"
                                        className="h-6 px-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                        onClick={() => router.push('/services/hrm/work-plans/rank-templates')}
                                    >
                                        + Cấu hình thêm
                                    </Button>
                                </div>
                                <select
                                    className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-shadow"
                                    value={selectedTaskId}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setSelectedTaskId(val);
                                        const task = availableTasks.find(t => t.id === val);
                                        if (task) setTargetValue(task.defaultWeight);
                                    }}
                                >
                                    <option value="">-- Vui lòng chọn công việc --</option>
                                    {availableTasks.map(task => (
                                        <option key={task.id} value={task.id} disabled={addedPlans.some(p => p.title === task.taskName)}>
                                            {task.taskName} {addedPlans.some(p => p.title === task.taskName) ? '(Đã thêm)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {availableTasks.length === 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-[11px] text-rose-500 font-medium ml-1">Chưa có công việc mẫu nào được cấu hình cho ngạch này.</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px]">2</span>
                                        Nhập định mức
                                    </label>
                                    <Input
                                        type="number"
                                        value={targetValue}
                                        onChange={e => setTargetValue(Math.max(1, Number(e.target.value)))}
                                        className="h-11 text-sm font-mono font-bold bg-white rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Đơn vị tính
                                    </label>
                                    <div className="h-11 px-3 flex items-center bg-slate-100/50 text-slate-500 text-sm rounded-xl border border-slate-200 font-medium">
                                        {selectedTaskId ? availableTasks.find(t => t.id === selectedTaskId)?.defaultUnit : '---'}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleAssignTask}
                                disabled={!selectedTaskId}
                                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all gap-2 mt-2"
                            >
                                Gán vào cấu trúc
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* BẢNG MA TRẬN KẾ HOẠCH CHI TIẾT SAU KHI PHÂN PHỐI (8/12 COLS) */}
                <Card className="xl:col-span-8 border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="flex items-center gap-2 font-black text-slate-900 text-sm uppercase tracking-wider">
                            <Target className="w-4 h-4 text-indigo-600" /> Cấu trúc kế hoạch tổng hợp sau phân rã ngạch
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[55%] text-[10px] font-bold uppercase tracking-wider text-slate-500">Nhiệm vụ hành chính công vụ</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Yêu cầu cấp ngạch</TableHead>
                                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Chỉ tiêu áp đặt</TableHead>
                                    <TableHead className="w-[60px] text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Hủy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {addedPlans.map((plan) => (
                                    <TableRow key={plan.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <TableCell className="font-bold text-slate-800 leading-relaxed text-sm py-4">
                                            {plan.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100 shadow-sm px-2.5 py-1">
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
                                                    className="w-20 h-9 text-center font-mono font-black text-indigo-700 bg-white border-slate-200 rounded-lg shadow-sm focus-visible:ring-indigo-500 transition-shadow"
                                                />
                                                <span className="text-[11px] text-slate-500 font-bold min-w-[45px] text-left uppercase tracking-wider bg-slate-100 px-2 py-1.5 rounded-md">{plan.unit}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))}
                                                className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {addedPlans.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-slate-500 text-sm bg-slate-50/50">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-slate-300" />
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
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3">
                            <Button variant="outline" onClick={() => setAddedPlans([])} className="h-10 text-slate-500 hover:text-slate-700">
                                Làm lại từ đầu
                            </Button>
                            <Button
                                onClick={handleSubmitPlan}
                                disabled={isPending}
                                className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-sm hover:shadow-md transition-all gap-2"
                            >
                                {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Target className="w-4 h-4" />}
                                Xác nhận lập kế hoạch
                            </Button>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    );
}