"use client";

import React, { useState } from 'react';
import { Award, MousePointerClick, Target, Trash2, Network, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmTaskTemplatesApi } from '@/features/hrm/api/task-templates.api';
import { categoryApi } from "@/features/system-admin/categories/api";
import { useTaskTemplatesList } from '@/features/hrm/hooks';

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
        queryKey: ['categories', 'RANK_CONG_CHUC'],
        queryFn: () => categoryApi.fetchByGroup('RANK_CONG_CHUC'),
        staleTime: 5 * 60 * 1000,
    });

    const { data: vienChucRanks = [] } = useQuery({
        queryKey: ['categories', 'RANK_VIEN_CHUC'],
        queryFn: () => categoryApi.fetchByGroup('RANK_VIEN_CHUC'),
        staleTime: 5 * 60 * 1000,
    });

    const { data: templatesData } = useTaskTemplatesList();
    const serverTemplates = templatesData?.data || [];

    const rankTasksRepository = serverTemplates.map((t: any) => ({
        id: t.id.toString(),
        classification: t.classification,
        rank: t.rank,
        taskName: t.taskName,
        defaultUnit: t.defaultUnit || 'Lượt'
    }));

    const [activeRankFilter, setActiveRankFilter] = useState<string>('CHUYEN_VIEN_CHINH');
    const [addedPlans, setAddedPlans] = useState<SelectedPlanItem[]>([]);
    const [globalValue, setGlobalValue] = useState<number>(1);

    const handleQuickAdd = (taskName: string, unit: string) => {
        if (addedPlans.some(p => p.title === taskName)) return;
        setAddedPlans([...addedPlans, {
            id: crypto.randomUUID(),
            title: taskName,
            rankType: activeRankFilter,
            targetValue: globalValue,
            unit: unit
        }]);
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

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600">Định mức số lượng gán nhanh:</span>
                            <Input
                                type="number"
                                value={globalValue}
                                onChange={e => setGlobalValue(Math.max(1, Number(e.target.value)))}
                                className="w-20 h-8 text-center font-mono font-bold bg-white"
                            />
                        </div>

                        {/* KHO VIỆC LỌC ĐỘNG THEO NGẠCH ĐÃ CHỌN */}
                        <ScrollArea className="h-[250px] w-full rounded-md border border-slate-100 p-2">
                            <div className="space-y-2">
                                {rankTasksRepository
                                    .filter(item => item.rank === activeRankFilter)
                                    .map(task => {
                                        const added = addedPlans.some(p => p.title === task.taskName);
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => !added && handleQuickAdd(task.taskName, task.defaultUnit)}
                                                className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all duration-300 text-xs font-semibold group
                                                    ${added
                                                        ? 'bg-slate-50/80 border-slate-100 opacity-50 cursor-not-allowed'
                                                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md hover:bg-gradient-to-r hover:from-white hover:to-indigo-50 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="text-slate-800 leading-relaxed pr-3 group-hover:text-indigo-900 transition-colors">{task.taskName}</div>
                                                <Badge variant="outline" className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-lg shrink-0 transition-colors
                                                    ${added ? 'text-slate-400 bg-slate-100 border-slate-200' : 'text-indigo-600 bg-indigo-50 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                    +{task.defaultUnit}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                {rankTasksRepository.filter(item => item.rank === activeRankFilter).length === 0 && (
                                    <div className="text-center text-xs text-slate-400 p-4">
                                        Chưa có công việc mẫu nào được cấu hình cho ngạch này.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
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
                                                {plan.rankType.replace(/_/g, ' ')}
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
                </Card>

            </div>
        </div>
    );
}