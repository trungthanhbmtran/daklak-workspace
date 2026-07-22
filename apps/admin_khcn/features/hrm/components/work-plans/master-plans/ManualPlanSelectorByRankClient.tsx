/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Target, Trash2, Save, Plus, Search, Check, ChevronsUpDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmRankQuotasApi } from '@/features/hrm/api';
import { categoryApi } from "@/features/system-admin/categories/api";
import { useTaskTemplatesList, useCreateMasterPlan } from '@/features/hrm/hooks';
import { toast } from 'sonner';

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/components/ui/typography";
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
    weight: number;
}

const PREFIX_NAMES: Record<string, string> = {
    'V.04': 'Kiến trúc, Xây dựng',
    'V.05': 'Khoa học & Công nghệ',
    'V.06': 'Y tế dự phòng',
    'V.07': 'Ngành Giáo dục',
    'V.08': 'Ngành Y tế',
    'V.09': 'Ngành Lưu trữ',
    'V.10': 'Văn hóa, Thể thao',
    'V.11': 'Thông tin & Truyền thông',
    '01.': 'Hành chính / Dùng chung',
    '02.': 'Ngành Thanh tra',
    '03.': 'Ngành Hải quan',
    '04.': 'Ngành Thuế',
    '06.': 'Ngành Kế toán',
    'STAFF': 'Nhân viên'
};

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
    const [weight, setWeight] = useState<number>(1);
    const [searchRankText, setSearchRankText] = useState<string>('');
    const [activeGroup, setActiveGroup] = useState<string>('ALL');
    const [isGroupOpen, setIsGroupOpen] = useState(false);

    const { isPending } = useCreateMasterPlan();

    const activeRanksList = classification === 'CONG_CHUC' ? congChucRanks : vienChucRanks;

    const currentGroups = React.useMemo(() => {
        const groupsMap = new Map<string, string>();
        activeRanksList.forEach((r: any) => {
            let prefix = r.code;
            if (r.code.startsWith('V.')) {
                prefix = r.code.substring(0, 4);
            } else if (r.code.match(/^\d{2}\./)) {
                prefix = r.code.substring(0, 3);
            }
            if (!groupsMap.has(prefix)) {
                groupsMap.set(prefix, PREFIX_NAMES[prefix] || `Nhóm ${prefix}`);
            }
        });
        const groups = Array.from(groupsMap.entries()).map(([id, name]) => ({ id, name }));
        groups.unshift({ id: 'ALL', name: 'Tất cả các ngành/ngạch' });
        return groups;
    }, [activeRanksList]);

    // Auto select first group correctly
    useEffect(() => {
        if (currentGroups.length > 1 && !currentGroups.find(g => g.id === activeGroup)) {
            // Default to ALL if changing classification
            setActiveGroup('ALL');
        }
    }, [classification, currentGroups, activeGroup]);

    // eslint-disable-next-line unused-imports/no-unused-vars
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
                unit: q.unit,
                weight: q.weight || 1
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

    // Filter ranks by activeGroup
    const groupedRanksList = activeGroup === 'ALL' 
        ? activeRanksList 
        : activeRanksList.filter((r: any) => r.code.startsWith(activeGroup) || r.code === activeGroup);

    const filteredRanksList = groupedRanksList.filter((r: any) => 
        (r.nameVi || r.name).toLowerCase().includes(searchRankText.toLowerCase()) || 
        r.code.toLowerCase().includes(searchRankText.toLowerCase())
    );

    useEffect(() => {
        if (groupedRanksList.length > 0 && !groupedRanksList.find((r: any) => r.code === activeRankFilter)) {
            setActiveRankFilter(groupedRanksList[0].code);
        }
    }, [classification, activeGroup, groupedRanksList, activeRankFilter]);

    const handleAssignTask = () => {
        const task = availableTasks.find(t => t.id === selectedTaskId);
        if (!task || addedPlans.some(p => p.title === task.taskName && p.rankType === activeRankFilter)) return;

        setAddedPlans([...addedPlans, {
            // eslint-disable-next-line react-hooks/purity
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: task.taskName,
            rankType: activeRankFilter,
            targetValue: targetValue,
            unit: task.defaultUnit,
            weight: 1
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
        // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (error) {
            toast.error('Có lỗi xảy ra', {
                description: 'Không thể lưu định biên vào lúc này.'
            });
        }
    };

    return (
        <Card className="w-full max-w-[1400px] mx-auto mt-6 shadow-xl border overflow-hidden h-[calc(100vh-100px)] min-h-[700px] flex flex-col bg-card rounded-2xl shrink-0">
            <CardHeader className="shrink-0 bg-card border-b pb-4 pt-6 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-black text-foreground tracking-tight">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        Cấu Hình Chỉ Tiêu Định Biên Theo Ngạch
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                        Thiết lập và phân bổ danh mục công việc bắt buộc cho từng ngạch chức danh. Giúp tự động hóa việc giao việc và đánh giá KPI một cách khoa học.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col lg:flex-row min-h-0 p-6 gap-6">
                {/* LEFT COLUMN: MAIN CONTENT AREA */}
                <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-card rounded-2xl border shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b bg-muted/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            <Heading level="h4" className="font-bold tracking-tight text-foreground">Danh sách chỉ tiêu bắt buộc</Heading>
                        </div>
                        <div className="w-full sm:w-[300px]">
                            <Select value={activeDomainFilter} onValueChange={setActiveDomainFilter}>
                                <SelectTrigger className="h-10 rounded-xl bg-background border-input shadow-sm">
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

                            <div className="flex w-full sm:w-auto items-center bg-background border border-input rounded-xl overflow-hidden h-10 shadow-sm shrink-0">
                                <div className="px-3 text-xs font-medium text-muted-foreground border-r border-input bg-muted/50 h-full flex items-center">Trọng số</div>
                                <Input
                                    type="number"
                                    value={weight}
                                    onChange={e => setWeight(Math.max(0.1, Number(e.target.value)))}
                                    className="w-20 h-full border-0 focus-visible:ring-0 text-center font-semibold text-sm bg-transparent"
                                    step="0.1"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="p-4 border-b bg-background flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full flex-1 min-w-0">
                            <Select
                                value={selectedTaskId}
                                onValueChange={val => {
                                    setSelectedTaskId(val);
                                    const task = availableTasks.find(t => t.id === val);
                                    if (task) setTargetValue(task.defaultWeight);
                                }}
                            >
                                <SelectTrigger className="w-full flex-1 min-w-0 h-10 rounded-xl bg-background shadow-sm border-input">
                                    <SelectValue placeholder="-- Chọn nhiệm vụ mẫu từ thư viện --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTasks.map(task => {
                                        const isAdded = addedPlans.some(p => p.title === task.taskName);
                                        return (
                                            <SelectItem key={task.id} value={task.id} disabled={isAdded} className="text-sm">
                                                <div className="truncate max-w-[300px] sm:max-w-[400px] md:max-w-[600px]">
                                                    {task.taskName} {isAdded ? <Text as="span" variant="small" className="text-muted-foreground ml-1 italic font-normal">(Đã thêm)</Text> : ''}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            <div className="flex w-full sm:w-auto items-center bg-background border border-input rounded-xl overflow-hidden h-10 shadow-sm shrink-0">
                                <div className="px-3 text-xs font-medium text-muted-foreground border-r border-input bg-muted/50 h-full flex items-center">Chỉ tiêu</div>
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
                                className="w-full sm:w-auto h-10 px-5 rounded-xl font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                             iconStart={<Plus className="w-4 h-4" />}>Thêm</Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden bg-background relative">
                        <ScrollArea className="h-full">
                            <Table className="w-full table-fixed">
                                <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold text-muted-foreground">Tên nhiệm vụ</TableHead>
                                        <TableHead className="w-[100px] font-semibold text-muted-foreground text-center">Đơn vị</TableHead>
                                        <TableHead className="w-[120px] font-semibold text-muted-foreground text-center">Chỉ tiêu</TableHead>
                                        <TableHead className="w-[100px] font-semibold text-muted-foreground text-center">Trọng số</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {addedPlans.map((plan, idx) => (
                                        <TableRow key={plan.id} className="group transition-colors hover:bg-muted/10">
                                            <TableCell className="font-medium text-foreground py-3 pr-4">
                                                <div className="flex items-start gap-3">
                                                    <Text as="span" className="flex items-center justify-center w-6 h-6 rounded-full bg-muted font-semibold text-muted-foreground shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </Text>
                                                    <Text as="span" className="mt-0.5 leading-relaxed line-clamp-3 overflow-hidden text-ellipsis break-words font-normal">{plan.title}</Text>
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
                                                        className="w-24 h-8 text-center font-bold text-sm bg-background border-input focus-visible:ring-primary/30 transition-shadow rounded-lg"
                                                    />
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <Input
                                                        type="number"
                                                        value={plan.weight || 1}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            setAddedPlans(addedPlans.map(p => p.id === plan.id ? { ...p, weight: val } : p));
                                                        }}
                                                        className="w-24 h-8 text-center font-bold text-sm bg-background border-input focus-visible:ring-primary/30 transition-shadow rounded-lg"
                                                        step="0.1"
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
                                                    <Text variant="small" className="font-normal">Chưa có nhiệm vụ bắt buộc nào cho ngạch này.</Text>
                                                    // eslint-disable-next-line react/no-unescaped-entities
                                                    <Text variant="small" className="opacity-60 font-normal">Hãy chọn một nhiệm vụ mẫu từ thư viện và nhấn "Thêm"</Text>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>

                {/* RIGHT COLUMN: FILTER SECTION */}
                <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 flex flex-col gap-4 bg-card text-card-foreground rounded-2xl border p-4 shadow-sm h-full overflow-hidden">
                    <div className="space-y-3 shrink-0">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phân loại Ngạch</Label>
                        <Tabs value={classification} onValueChange={(val: any) => setClassification(val)} className="w-full">
                            <TabsList className="w-full grid grid-cols-2 p-1 bg-muted rounded-xl">
                                <TabsTrigger value="CONG_CHUC" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Khối Công chức</TabsTrigger>
                                <TabsTrigger value="VIEN_CHUC" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Khối Viên chức</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                        <div className="flex flex-col gap-2 shrink-0">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nhóm Ngành / Vị trí</Label>
                            <Popover open={isGroupOpen} onOpenChange={setIsGroupOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isGroupOpen}
                                        className="w-full justify-between h-10 rounded-xl bg-background shadow-sm border-input font-normal"
                                    >
                                        <span className="truncate">{activeGroup === 'ALL' ? 'Tất cả các ngành' : currentGroups.find(g => g.id === activeGroup)?.name || 'Chọn nhóm ngành...'}</span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[350px] lg:w-[300px] xl:w-[350px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Tìm nhanh nhóm ngành..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>Không tìm thấy nhóm.</CommandEmpty>
                                            <CommandGroup>
                                                {currentGroups.map(group => (
                                                    <CommandItem
                                                        key={group.id}
                                                        value={group.name}
                                                        onSelect={() => {
                                                            setActiveGroup(group.id);
                                                            setIsGroupOpen(false);
                                                        }}
                                                    >
                                                        {group.name}
                                                        <Check className={cn("ml-auto h-4 w-4", activeGroup === group.id ? "opacity-100" : "opacity-0")} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center justify-between shrink-0 mt-1">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Danh mục Ngạch / Hạng</Label>
                        </div>
                        <div className="relative shrink-0">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                            <Input 
                                placeholder="Lọc theo tên ngành hoặc mã..." 
                                value={searchRankText}
                                onChange={e => setSearchRankText(e.target.value)}
                                className="pl-9 h-9 text-sm rounded-lg border-muted/60 bg-muted/20 focus-visible:bg-white"
                            />
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-2 pb-4">
                                    {filteredRanksList.map((rank: any) => (
                                        <div
                                            key={rank.code}
                                            onClick={() => setActiveRankFilter(rank.code)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${activeRankFilter === rank.code
                                                ? 'bg-primary/10 border-primary shadow-sm'
                                                : 'bg-background border-transparent hover:bg-muted/50 hover:border-muted'
                                                }`}
                                        >
                                            <h4 className={`text-sm font-semibold leading-tight ${activeRankFilter === rank.code ? 'text-primary' : 'text-foreground'}`}>
                                                {rank.nameVi || rank.name}
                                            </h4>
                                            <Text variant="small" className="text-[11px] text-muted-foreground font-mono mt-1 font-normal">{rank.code}</Text>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center px-6 py-4 border-t bg-card relative z-10 shrink-0">
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