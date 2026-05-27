"use client";

import React, { useState } from 'react';
import { Award, MousePointerClick, Target, Trash2, Network, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmTaskTemplatesApi } from '@/features/hrm/api/task-templates.api';

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

interface SelectedPlanItem {
    id: string;
    title: string;
    rankType: string;
    targetValue: number;
    unit: string;
}

export function ManualPlanSelectorByRankClient() {
    const { data: serverTemplates = [] } = useQuery({
        queryKey: ['task-templates'],
        queryFn: async () => {
            const res = await hrmTaskTemplatesApi.list({ pageSize: 1000 });
            return res.data || [];
        }
    });

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
        <div className="space-y-6 max-w-[1600px] mx-auto p-6 bg-slate-50/50 min-h-screen text-slate-800 antialiased">
            <Card className="bg-slate-950 text-white shadow-md border-slate-800">
                <CardHeader>
                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                        <Network className="w-5 h-5 text-indigo-400" /> Bảng Phân rã Chỉ tiêu Định biên theo Tiêu chuẩn Ngạch Công vụ
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                        Hệ thống hóa thao tác phân bổ thủ công. Chọn ngạch công vụ hành chính để truy xuất bộ nhiệm vụ đặc thù được quy định bởi pháp luật điều hành.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* THANH ĐIỀU HƯỚNG BỘ LỌC THEO NGẠCH ĐẶC THÙ (4/12 COLS) */}
                <Card className="xl:col-span-4 border-slate-200 shadow-sm">
                    <CardHeader className="pb-4 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 font-bold text-slate-900 text-sm uppercase tracking-wider">
                            <MousePointerClick className="w-4 h-4 text-indigo-600" /> Chọn Ngạch công vụ tác nghiệp
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        {/* Cây danh mục ngạch bậc */}
                        <div className="flex flex-col gap-1.5">
                            {[
                                { key: 'CHUYEN_VIEN_CAO_CAP', label: 'Chuyên viên Cao cấp', desc: 'Đề án chiến lược, văn bản quy phạm vĩ mô' },
                                { key: 'CHUYEN_VIEN_CHINH', label: 'Chuyên viên Chính', desc: 'Tham mưu tổng hợp, tờ trình, thẩm định sở' },
                                { key: 'CHUYEN_VIEN', label: 'Chuyên viên', desc: 'Thực thi tác nghiệp, xử lý hồ sơ, phiếu chuyển' },
                                { key: 'CAN_SU', label: 'Cán sự', desc: 'Hỗ trợ nghiệp vụ, lưu trữ, thống kê' },
                                { key: 'NHAN_VIEN', label: 'Nhân viên', desc: 'Thực hiện các công việc thừa hành, phục vụ' },
                                { key: 'VIEN_CHUC_HANG_1', label: 'Viên chức Hạng I', desc: 'Chủ trì đề án khoa học, công nghệ cấp bộ/tỉnh' },
                                { key: 'VIEN_CHUC_HANG_2', label: 'Viên chức Hạng II', desc: 'Thực hiện nhiệm vụ chuyên môn phức tạp' },
                                { key: 'VIEN_CHUC_HANG_3', label: 'Viên chức Hạng III', desc: 'Thực hành chuyên môn nghiệp vụ cơ bản' },
                                { key: 'VIEN_CHUC_HANG_4', label: 'Viên chức Hạng IV', desc: 'Hỗ trợ kỹ thuật, nghiệp vụ đơn giản' },
                            ].map((rank) => (
                                <button
                                    key={rank.key}
                                    type="button"
                                    onClick={() => setActiveRankFilter(rank.key)}
                                    className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${activeRankFilter === rank.key ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 hover:bg-slate-50 bg-white'}`}
                                >
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-black">{rank.label}</div>
                                        <div className={`text-[10px] ${activeRankFilter === rank.key ? 'text-slate-400' : 'text-slate-500'}`}>{rank.desc}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                                </button>
                            ))}
                        </div>

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
                                                className={`p-3 border rounded-xl flex items-center justify-between transition-all text-xs font-semibold ${added ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer'}`}
                                            >
                                                <div className="text-slate-800 leading-relaxed pr-3">{task.taskName}</div>
                                                <Badge variant="outline" className="text-[9px] font-black font-mono text-indigo-600 bg-indigo-50 border-indigo-100 px-2 py-0.5 rounded shrink-0">
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
                                    <TableRow key={plan.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="font-bold text-slate-900 leading-relaxed text-xs">
                                            {plan.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-800 text-[9px] font-black uppercase tracking-wider">
                                                {plan.rankType.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end w-full">
                                                <Input
                                                    type="number"
                                                    value={plan.targetValue}
                                                    onChange={e => {
                                                        const val = Number(e.target.value);
                                                        setAddedPlans(addedPlans.map(p => p.id === plan.id ? { ...p, targetValue: val } : p));
                                                    }}
                                                    className="w-16 h-8 text-right font-mono font-black text-indigo-600 bg-white"
                                                />
                                                <span className="text-[10px] text-slate-500 font-medium min-w-[45px] text-left">{plan.unit}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))}
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {addedPlans.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400 text-xs bg-slate-50/30">
                                            Chưa có tác vụ ngạch nào được đưa vào ma trận thực thi.
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