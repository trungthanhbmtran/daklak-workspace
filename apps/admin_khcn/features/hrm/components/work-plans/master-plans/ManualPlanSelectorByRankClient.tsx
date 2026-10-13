/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Trash2,
  Save,
  Plus,
  Search,
  Check,
  ChevronsUpDown,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  RefreshCw,
  Scale,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  X,
  RotateCcw,
  Info,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrmRankQuotasApi, type AiSuggestedQuotaItem } from '@/features/hrm/api/rank-quotas.api';
import { organizationApi } from "@/features/system-admin/organization/api";
import { useTaskTemplatesList, useCreateMasterPlan } from '@/features/hrm/hooks';
import { OrganizationUnitSelector, flattenUnitHierarchy } from '@/features/workflow/components/OrganizationUnitSelector';
import { AiQuotaPlanModal } from './AiQuotaPlanModal';
import { toast } from 'sonner';

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SelectedPlanItem {
    id: string;
    title: string;
    rankType: string;
    unit: string;
    targetValue: number;
    monthlyTarget: number;
    quarterlyTarget: number;
    yearlyTarget: number;
    weight: number;
}

export function ManualPlanSelectorByRankClient() {
    const DOMAINS = [
        { code: 'GENERIC', name: 'Dùng chung / Hành chính' },
        { code: 'CONG_TAC_TO_CHUC', name: 'Công tác Tổ chức, Cán bộ, Đảng viên' },
        { code: 'CONG_TAC_KIEM_TRA', name: 'Công tác Kiểm tra, Giám sát' },
        { code: 'CONG_TAC_NOI_CHINH', name: 'Công tác Nội chính, BVCTNB' },
        { code: 'CONG_TAC_VAN_PHONG', name: 'Công tác Văn phòng cấp ủy' },
        { code: 'IOC', name: 'Trung tâm Điều hành thông minh (IOC)' },
        { code: 'IT', name: 'Công nghệ thông tin' },
        { code: 'HEALTHCARE', name: 'Y tế' },
        { code: 'EDUCATION', name: 'Giáo dục' },
    ];

    // 1. Cây cơ cấu tổ chức & Bộ phận đã chọn
    const [selectedUnitCode, setSelectedUnitCode] = useState<string>('BTCTU_DAKLAK');
    const { data: orgTreeRes, isLoading: isLoadingOrgTree } = useQuery({
        queryKey: ['org-tree-manual-selector'],
        queryFn: () => organizationApi.getTree(),
        staleTime: 5 * 60 * 1000,
    });
    const unitTree = orgTreeRes?.data || [];
    const flatUnits = useMemo(() => flattenUnitHierarchy(unitTree), [unitTree]);
    const selectedUnit = useMemo(() => flatUnits.find(u => u.code === selectedUnitCode), [flatUnits, selectedUnitCode]);
    const selectedUnitId = selectedUnit?.id;

    // 2. Định biên theo bộ phận (Vị trí việc làm thực tế của bộ phận trong tổ chức)
    const { data: unitStaffingReportRes, isLoading: isLoadingStaffing } = useQuery({
        queryKey: ['staffing-report-selector', selectedUnitId],
        queryFn: () => organizationApi.getStaffingReport(selectedUnitId!),
        enabled: !!selectedUnitId,
        staleTime: 60 * 1000,
    });
    const unitStaffingList = useMemo(() => {
        const raw = unitStaffingReportRes?.allReport || unitStaffingReportRes?.data || [];
        return Array.isArray(raw) ? raw : [];
    }, [unitStaffingReportRes]);

    // 3. Toàn bộ danh mục chức danh/VTVL hệ thống
    const { data: jobTitlesRes = { allTitles: [], govTitles: [], partyTitles: [] } } = useQuery({
        queryKey: ['job-titles-all'],
        queryFn: async () => (await organizationApi.getJobTitles()).data,
        staleTime: 5 * 60 * 1000,
    });

    const congChucRanks = jobTitlesRes.govTitles;
    const vienChucRanks = jobTitlesRes.allTitles.filter((j: any) => j.category && j.category.includes('Viên chức'));
    const partyRanks = jobTitlesRes.partyTitles || [];

    // Chuyển đổi VTVL từ Staffing của bộ phận sang cấu trúc thống nhất
    const unitPositionsList = useMemo(() => {
        if (!selectedUnitId || unitStaffingList.length === 0) return [];
        return unitStaffingList.map((st: any) => {
            const matchedTitle = jobTitlesRes.allTitles.find((t: any) => t.id === st.jobTitleId);
            return {
                id: st.id,
                jobTitleId: st.jobTitleId,
                code: matchedTitle?.code || `JOB_${st.jobTitleId}`,
                name: st.jobTitleName || matchedTitle?.name || 'Vị trí việc làm',
                quantity: st.quantity ?? 1,
                currentCount: st.currentCount ?? 0,
                category: matchedTitle?.category || (selectedUnitCode?.startsWith('BTCTU') || selectedUnitCode?.startsWith('TU') ? 'Khối Đảng' : 'Chính quyền'),
                isFromDepartment: true,
            };
        });
    }, [selectedUnitId, unitStaffingList, jobTitlesRes.allTitles, selectedUnitCode]);

    // 4. Thư viện nhiệm vụ mẫu
    const { data: templatesData } = useTaskTemplatesList();
    const serverTemplates = Array.isArray(templatesData) ? templatesData : (templatesData?.data || []);

    const rankTasksRepository = useMemo(() => serverTemplates.map((t: any) => ({
        id: t.id.toString(),
        classification: t.classification,
        rank: t.rank,
        domainCode: t.domainCode || 'GENERIC',
        taskName: t.taskName,
        defaultUnit: t.defaultUnit || 'Lượt',
        defaultWeight: t.defaultWeight || 10,
    })), [serverTemplates]);

    // Chế độ xem danh sách VTVL: Theo bộ phận hay Toàn hệ thống
    const [vtvlViewSource, setVtvlViewSource] = useState<'DEPARTMENT' | 'ALL'>('DEPARTMENT');
    const [classification, setClassification] = useState<'CONG_CHUC' | 'VIEN_CHUC' | 'DANG'>('DANG');
    const [activeRankFilter, setActiveRankFilter] = useState<string>('');
    const [activeDomainFilter, setActiveDomainFilter] = useState<string>('CONG_TAC_TO_CHUC');
    const [addedPlans, setAddedPlans] = useState<SelectedPlanItem[]>([]);
    
    // Quản lý chế độ thêm nhiệm vụ: Từ kho mẫu hoặc Nhập chuyên thù
    const [taskInputMode, setTaskInputMode] = useState<'TEMPLATE' | 'CUSTOM'>('TEMPLATE');
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [customTaskName, setCustomTaskName] = useState<string>('');
    const [customUnit, setCustomUnit] = useState<string>('Lượt');
    
    // Các trường chỉ tiêu: Tháng, Quý, Năm, Trọng số
    const [monthlyTarget, setMonthlyTarget] = useState<number>(1);
    const [quarterlyTarget, setQuarterlyTarget] = useState<number>(3);
    const [yearlyTarget, setYearlyTarget] = useState<number>(12);
    const [weight, setWeight] = useState<number>(10);
    const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
    
    // Tìm kiếm trong danh sách VTVL & tìm trong bảng
    const [searchRankText, setSearchRankText] = useState<string>('');
    const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
    const [activeGroup, setActiveGroup] = useState<string>('ALL');
    const [isGroupOpen, setIsGroupOpen] = useState(false);

    const { isPending: isSavingPlan } = useCreateMasterPlan();

    // Handler nhận định mức tự động từ Trợ lý AI
    const handleApplyAiQuotas = (items: AiSuggestedQuotaItem[]) => {
        const newPlans: SelectedPlanItem[] = items.map((item, idx) => ({
            id: `ai_${Date.now()}_${idx}`,
            title: item.taskName,
            rankType: activeRankFilter || 'VTVL',
            unit: item.unit || 'Lượt',
            targetValue: item.monthlyTarget,
            monthlyTarget: item.monthlyTarget,
            quarterlyTarget: item.quarterlyTarget,
            yearlyTarget: item.yearlyTarget,
            weight: item.weight || 10,
        }));
        setAddedPlans(newPlans);
    };

    // Đồng bộ tự động Quý = Tháng * 3 và Năm = Tháng * 12 khi người dùng gõ Tháng
    const handleMonthlyTargetChange = (val: number) => {
        const m = Math.max(0.1, Number(val));
        setMonthlyTarget(m);
        setQuarterlyTarget(Math.round(m * 3 * 10) / 10);
        setYearlyTarget(Math.round(m * 12 * 10) / 10);
    };

    // Danh sách VTVL hiển thị bên cột phải
    const displayRanksList = useMemo(() => {
        if (vtvlViewSource === 'DEPARTMENT') {
            return unitPositionsList;
        }
        const activeList = classification === 'CONG_CHUC'
            ? congChucRanks
            : classification === 'VIEN_CHUC'
            ? vienChucRanks
            : partyRanks;
        return activeList.map((r: any) => ({
            ...r,
            quantity: undefined,
            currentCount: undefined,
            isFromDepartment: false,
        }));
    }, [vtvlViewSource, unitPositionsList, classification, congChucRanks, vienChucRanks, partyRanks]);

    // Nhóm VTVL
    const currentGroups = useMemo(() => {
        const catSet = new Map<string, string>();
        displayRanksList.forEach((r: any) => {
            const cat = r.category || 'Khác';
            if (!catSet.has(cat)) catSet.set(cat, cat);
        });
        const groups = Array.from(catSet.entries()).map(([id, name]) => ({ id, name }));
        groups.unshift({ id: 'ALL', name: 'Tất cả các nhóm VTVL' });
        return groups;
    }, [displayRanksList]);

    // Tự động reset group khi chuyển danh sách
    useEffect(() => {
        if (currentGroups.length > 1 && !currentGroups.find(g => g.id === activeGroup)) {
            setActiveGroup('ALL');
        }
    }, [displayRanksList, currentGroups, activeGroup]);

    // Lọc theo từ khóa tìm kiếm & nhóm
    const filteredRanksList = useMemo(() => {
        const byGroup = activeGroup === 'ALL'
            ? displayRanksList
            : displayRanksList.filter((r: any) => (r.category || 'Khác') === activeGroup);
        const q = searchRankText.toLowerCase().trim();
        if (!q) return byGroup;
        return byGroup.filter((r: any) =>
            (r.name && r.name.toLowerCase().includes(q)) ||
            (r.code && r.code.toLowerCase().includes(q))
        );
    }, [displayRanksList, activeGroup, searchRankText]);

    // Tự động chọn VTVL đầu tiên nếu danh sách thay đổi hoặc rank hiện tại không còn
    useEffect(() => {
        if (filteredRanksList.length > 0) {
            const exists = filteredRanksList.find((r: any) => r.code === activeRankFilter);
            if (!exists) {
                setActiveRankFilter(filteredRanksList[0].code);
            }
        }
    }, [filteredRanksList, activeRankFilter]);

    // Tự động chuyển mode xem VTVL của bộ phận nếu bộ phận có định biên
    useEffect(() => {
        if (unitPositionsList.length > 0) {
            setVtvlViewSource('DEPARTMENT');
        } else {
            setVtvlViewSource('ALL');
        }
    }, [unitPositionsList.length, selectedUnitId]);

    // 5. Nạp cấu trúc định biên đã lưu trong CSDL
    const { data: existingQuotasData, refetch: refetchQuotas } = useQuery({
        queryKey: ['rank-quotas', activeRankFilter, activeDomainFilter, selectedUnitId],
        queryFn: () => hrmRankQuotasApi.getByRank(activeRankFilter, activeDomainFilter, selectedUnitId, selectedUnitCode),
        enabled: !!activeRankFilter,
        staleTime: 0,
    });

    useEffect(() => {
        if (existingQuotasData?.data && Array.isArray(existingQuotasData.data)) {
            setAddedPlans(existingQuotasData.data.map((q: any) => {
                const m = Number(q.monthlyTarget || q.targetValue || 1);
                const qua = Number(q.quarterlyTarget || (m * 3));
                const y = Number(q.yearlyTarget || (m * 12));
                return {
                    id: q.id?.toString() || Date.now().toString() + Math.random().toString(36).substring(2, 9),
                    title: q.taskName,
                    rankType: q.rankCode,
                    unit: q.unit || 'Lượt',
                    targetValue: m,
                    monthlyTarget: m,
                    quarterlyTarget: qua,
                    yearlyTarget: y,
                    weight: Number(q.weight ?? 10),
                };
            }));
        } else {
            setAddedPlans([]);
        }
    }, [existingQuotasData, activeRankFilter]);

    // Nhiệm vụ mẫu phù hợp từ kho thư viện
    const availableTasks = useMemo(() => {
        return rankTasksRepository.filter(item => 
            (item.rank === activeRankFilter || item.rank === 'ALL' || !item.rank) &&
            (item.domainCode === activeDomainFilter || item.domainCode === 'GENERIC')
        );
    }, [rankTasksRepository, activeRankFilter, activeDomainFilter]);

    // Thêm nhiệm vụ vào bảng định biên
    const handleAssignTask = () => {
        let taskTitle = '';
        let taskUnit = 'Lượt';
        let defaultWeight = weight || 10;

        if (taskInputMode === 'TEMPLATE') {
            const task = rankTasksRepository.find(t => t.id === selectedTaskId);
            if (!task) {
                toast.warning('Vui lòng chọn một nhiệm vụ mẫu từ kho nghiệp vụ.');
                return;
            }
            taskTitle = task.taskName;
            taskUnit = task.defaultUnit || 'Lượt';
            defaultWeight = weight || task.defaultWeight || 10;
        } else {
            if (!customTaskName.trim()) {
                toast.warning('Vui lòng nhập tên nhiệm vụ chuyên thù.');
                return;
            }
            taskTitle = customTaskName.trim();
            taskUnit = customUnit.trim() || 'Lượt';
        }

        if (addedPlans.some(p => p.title.toLowerCase() === taskTitle.toLowerCase())) {
            toast.warning('Nhiệm vụ này đã có trong danh sách định biên.');
            return;
        }

        setAddedPlans(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            title: taskTitle,
            rankType: activeRankFilter || 'VTVL',
            unit: taskUnit,
            targetValue: monthlyTarget,
            monthlyTarget: monthlyTarget,
            quarterlyTarget: quarterlyTarget,
            yearlyTarget: yearlyTarget,
            weight: defaultWeight,
        }]);

        // Reset form input
        setSelectedTaskId('');
        setCustomTaskName('');
        setMonthlyTarget(1);
        setQuarterlyTarget(3);
        setYearlyTarget(12);
        setWeight(10);
        toast.info('Đã thêm nhiệm vụ vào bảng định biên.');
    };

    // Tự động cân đối trọng số về đúng 100%
    const handleAutoBalanceWeights = () => {
        if (addedPlans.length === 0) {
            toast.warning('Chưa có nhiệm vụ nào trong bảng để cân đối.');
            return;
        }
        const count = addedPlans.length;
        const currentSum = addedPlans.reduce((sum, p) => sum + (Number(p.weight) || 0), 0);

        let newPlans: SelectedPlanItem[];
        if (currentSum === 0) {
            const base = Math.floor((100 / count) * 10) / 10;
            newPlans = addedPlans.map((p, idx) => {
                const isLast = idx === count - 1;
                const w = isLast ? Math.max(0.1, Math.round((100 - base * (count - 1)) * 10) / 10) : base;
                return { ...p, weight: w };
            });
        } else {
            let allocated = 0;
            newPlans = addedPlans.map((p, idx) => {
                if (idx === count - 1) {
                    const finalWeight = Math.max(0.1, Math.round((100 - allocated) * 10) / 10);
                    return { ...p, weight: finalWeight };
                }
                const ratio = (Number(p.weight) || 0) / currentSum;
                const itemWeight = Math.round(ratio * 100 * 10) / 10;
                allocated += itemWeight;
                return { ...p, weight: itemWeight };
            });
        }
        setAddedPlans(newPlans);
        toast.success('Đã tự động cân đối trọng số các nhiệm vụ về đúng 100%!');
    };

    // Tự động đồng bộ lại Quý và Năm theo Tháng cho tất cả các dòng
    const handleRecalculateQuarterAndYear = () => {
        if (addedPlans.length === 0) return;
        setAddedPlans(prev => prev.map(p => ({
            ...p,
            quarterlyTarget: Math.round(p.monthlyTarget * 3 * 10) / 10,
            yearlyTarget: Math.round(p.monthlyTarget * 12 * 10) / 10,
        })));
        toast.success('Đã đồng bộ lại chỉ tiêu Quý (x3) và Năm (x12) theo Tháng!');
    };

    // Xóa trắng bảng làm việc
    const handleClearAllPlans = () => {
        if (addedPlans.length === 0) return;
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nhiệm vụ trong bảng làm việc này?')) {
            setAddedPlans([]);
            toast.info('Đã xóa toàn bộ nhiệm vụ khỏi bảng định biên.');
        }
    };

    // Lưu toàn bộ cấu trúc định biên
    const handleSubmitPlan = async () => {
        if (!activeRankFilter) {
            toast.error('Vui lòng chọn vị trí việc làm trước khi lưu định biên.');
            return;
        }

        try {
            const quotasPayload = addedPlans.map(p => ({
                taskName: p.title,
                unit: p.unit,
                targetValue: Number(p.monthlyTarget),
                monthlyTarget: Number(p.monthlyTarget),
                quarterlyTarget: Number(p.quarterlyTarget),
                yearlyTarget: Number(p.yearlyTarget),
                weight: Number(p.weight || 10),
                departmentId: selectedUnitId || undefined,
                unitCode: selectedUnitCode || undefined,
            }));

            await hrmRankQuotasApi.save(
                activeRankFilter,
                activeDomainFilter,
                quotasPayload,
                selectedUnitId,
                selectedUnitCode
            );

            toast.success('Lưu cấu trúc định biên thành công!', {
                description: `Đã cập nhật ${addedPlans.length} chỉ tiêu theo Tháng, Quý, Năm cho VTVL ${activeRankFilter}.`
            });
            refetchQuotas();
        } catch {
            toast.error('Có lỗi xảy ra', {
                description: 'Không thể lưu định biên vào lúc này. Vui lòng thử lại.'
            });
        }
    };

    // Thống kê tổng chỉ tiêu
    const summaryTotals = useMemo(() => {
        return addedPlans.reduce((acc, p) => ({
            month: Math.round((acc.month + (p.monthlyTarget || 0)) * 10) / 10,
            quarter: Math.round((acc.quarter + (p.quarterlyTarget || 0)) * 10) / 10,
            year: Math.round((acc.year + (p.yearlyTarget || 0)) * 10) / 10,
        }), { month: 0, quarter: 0, year: 0 });
    }, [addedPlans]);

    const totalWeight = useMemo(() => {
        return Math.round(addedPlans.reduce((acc, p) => acc + (Number(p.weight) || 0), 0) * 10) / 10;
    }, [addedPlans]);

    const activeRankObj = useMemo(() => {
        return displayRanksList.find((r: any) => r.code === activeRankFilter);
    }, [displayRanksList, activeRankFilter]);

    // Danh sách nhiệm vụ trong bảng sau khi tìm kiếm
    const displayedTablePlans = useMemo(() => {
        if (!tableSearchQuery.trim()) return addedPlans;
        const q = tableSearchQuery.toLowerCase().trim();
        return addedPlans.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.unit.toLowerCase().includes(q)
        );
    }, [addedPlans, tableSearchQuery]);

    return (
        <TooltipProvider>
            <div className="w-full flex flex-col min-w-0 space-y-4 pb-6">
                {/* HERO COMMAND HEADER */}
                <Card className="w-full shadow-sm border rounded-2xl bg-card min-w-0">
                    <CardHeader className="p-4 sm:p-6 bg-linear-to-r from-primary/10 via-primary/5 to-transparent relative min-w-0">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 min-w-0">
                            {/* TITLE & DESCRIPTION */}
                            <div className="min-w-0 space-y-1.5 flex-1">
                                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                                    <div className="p-2.5 bg-primary/15 rounded-xl text-primary shrink-0 shadow-2xs">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-black text-foreground tracking-tight break-words min-w-0">
                                        Giao Định Mức Chỉ Tiêu Công Việc Theo Vị Trí Việc Làm
                                    </CardTitle>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-semibold gap-1 border-primary/20 shrink-0">
                                        <Scale className="w-3 h-3" /> NĐ 62 • NĐ 106 • QĐ 137
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words min-w-0">
                                    Kế thừa trực tiếp Định biên biên chế từ Quản trị Tổ chức, thiết lập chỉ tiêu số lượng công việc theo <strong className="text-foreground">Tháng</strong>, <strong className="text-foreground">Quý</strong>, và <strong className="text-foreground">Năm</strong> làm căn cứ giao việc và đánh giá KPI.
                                </CardDescription>
                            </div>

                            {/* ACTIONS & SELECTOR */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 min-w-0">
                                {/* NÚT TRỢ LÝ AI NỔI BẬT */}
                                <Button
                                    onClick={() => setIsAiModalOpen(true)}
                                    size="default"
                                    className="gap-2 font-black rounded-xl bg-linear-to-r from-indigo-600 via-primary to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-xs px-3.5 h-10 shrink-0"
                                >
                                    <Sparkles className="w-4 h-4 animate-pulse text-amber-300 shrink-0" />
                                    <span>Trợ lý AI Đề xuất Định mức</span>
                                </Button>

                                {/* BỘ CHỌN BỘ PHẬN TỔ CHỨC */}
                                <div className="w-full sm:w-[280px] md:w-[320px] shrink-0 min-w-0 bg-background/80 p-2 rounded-xl border border-border/80 shadow-2xs">
                                    <div className="flex items-center justify-between mb-1 px-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Building2 className="w-3 h-3 text-primary" />
                                            Bộ phận tổ chức
                                        </span>
                                        {selectedUnit && (
                                            <Badge variant="outline" className="text-[9px] font-mono py-0 h-4 bg-muted/40">
                                                {selectedUnit.code}
                                            </Badge>
                                        )}
                                    </div>
                                    <OrganizationUnitSelector
                                        value={selectedUnitCode}
                                        onChange={(code) => setSelectedUnitCode(code)}
                                        unitTree={unitTree}
                                        isLoading={isLoadingOrgTree}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MINI STATS RIBBON */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 pt-4 mt-2 border-t border-border/50 text-xs min-w-0">
                            {/* STAT 1: VTVL */}
                            <div className="p-3 rounded-xl bg-background/70 border border-border/60 min-w-0 shadow-2xs">
                                <span className="text-[10px] font-medium text-muted-foreground block truncate">Vị trí việc làm</span>
                                <span className="font-bold text-foreground text-xs block mt-0.5 break-words line-clamp-1" title={activeRankObj?.name || activeRankFilter}>
                                    {activeRankObj?.name || activeRankFilter || 'Chưa chọn VTVL'}
                                </span>
                            </div>

                            {/* STAT 2: BIÊN CHẾ */}
                            <div className="p-3 rounded-xl bg-background/70 border border-border/60 min-w-0 shadow-2xs">
                                <span className="text-[10px] font-medium text-muted-foreground block truncate">Biên chế theo định biên</span>
                                <span className="font-bold text-foreground text-xs block mt-0.5 truncate">
                                    {activeRankObj?.quantity != null
                                        ? `${activeRankObj.quantity} biên chế (${activeRankObj.currentCount ?? 0} có mặt)`
                                        : 'Dùng chung toàn hệ thống'}
                                </span>
                            </div>

                            {/* STAT 3: NHIỆM VỤ ĐÃ GÁN */}
                            <div className="p-3 rounded-xl bg-background/70 border border-border/60 min-w-0 shadow-2xs">
                                <span className="text-[10px] font-medium text-muted-foreground block truncate">Nhiệm vụ đã gán</span>
                                <span className="font-bold text-primary text-xs block mt-0.5 truncate">
                                    {addedPlans.length} nhiệm vụ
                                </span>
                            </div>

                            {/* STAT 4: TỔNG CHỈ TIÊU */}
                            <div className="p-3 rounded-xl bg-background/70 border border-border/60 min-w-0 shadow-2xs">
                                <span className="text-[10px] font-medium text-muted-foreground block truncate">Tổng chỉ tiêu T / Q / N</span>
                                <div className="flex items-center gap-1.5 mt-1 font-bold text-xs tabular-nums flex-wrap">
                                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold" title="Tổng Tháng">
                                        {summaryTotals.month}T
                                    </span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold" title="Tổng Quý">
                                        {summaryTotals.quarter}Q
                                    </span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold" title="Tổng Năm">
                                        {summaryTotals.year}N
                                    </span>
                                </div>
                            </div>

                            {/* STAT 5: TRỌNG SỐ W% */}
                            <div className="p-3 rounded-xl bg-background/70 border border-border/60 min-w-0 shadow-2xs col-span-2 sm:col-span-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-muted-foreground block truncate">Tổng trọng số (W%)</span>
                                    <span className={cn(
                                        "font-black text-xs tabular-nums",
                                        totalWeight === 100 ? "text-emerald-600 dark:text-emerald-400" : totalWeight > 100 ? "text-rose-600" : "text-amber-600 dark:text-amber-400"
                                    )}>
                                        {totalWeight}%
                                    </span>
                                </div>
                                <div className="mt-1.5 space-y-1">
                                    <Progress
                                        value={Math.min(100, totalWeight)}
                                        className={cn(
                                            "h-1.5",
                                            totalWeight === 100 ? "[&>div]:bg-emerald-600" : totalWeight > 100 ? "[&>div]:bg-rose-600" : "[&>div]:bg-amber-500"
                                        )}
                                    />
                                    <div className="flex items-center justify-between text-[10px]">
                                        {totalWeight === 100 ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                                <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn 100%
                                            </span>
                                        ) : totalWeight > 100 ? (
                                            <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                                                <AlertTriangle className="w-3 h-3" /> Vượt {(totalWeight - 100).toFixed(1)}%
                                            </span>
                                        ) : (
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                                                <SlidersHorizontal className="w-3 h-3" /> Còn thiếu {(100 - totalWeight).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* MAIN CONTENT WORKSPACE: CỘT TRÁI (BẢNG ĐỊNH BIÊN) & CỘT PHẢI (DANH SÁCH VTVL) */}
                <div className="flex flex-col lg:flex-row gap-4 min-w-0 items-start">
                    {/* CỘT TRÁI: KHU VỰC THIẾT LẬP CHỈ TIÊU & BẢNG ĐỊNH BIÊN */}
                    <div className="flex-1 min-w-0 w-full flex flex-col bg-card rounded-2xl border shadow-xs">
                        {/* THANH THÔNG TIN VỊ TRÍ ĐANG CHỌN & LĨNH VỰC */}
                        <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between min-w-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-2 h-7 bg-primary rounded-full shrink-0" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <Heading level="h4" className="font-extrabold text-foreground break-words text-base min-w-0">
                                            {activeRankObj?.name || activeRankFilter || 'Chưa chọn VTVL'}
                                        </Heading>
                                        {activeRankObj?.quantity != null && (
                                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary font-semibold border-primary/20 shrink-0">
                                                Định biên: {activeRankObj.quantity} ({activeRankObj.currentCount ?? 0} có mặt)
                                            </Badge>
                                        )}
                                    </div>
                                    <Text variant="small" className="text-xs text-muted-foreground mt-0.5 font-normal break-words block min-w-0">
                                        Mã VTVL: <code className="font-mono font-medium">{activeRankFilter || '---'}</code>
                                        {selectedUnit ? ` • Thuộc: ${selectedUnit.name}` : ' • Áp dụng dùng chung'}
                                    </Text>
                                </div>
                            </div>

                            {/* SELECT LĨNH VỰC CHUYÊN MÔN */}
                            <div className="w-full sm:w-[260px] md:w-[300px] shrink-0 min-w-0">
                                <Select value={activeDomainFilter} onValueChange={setActiveDomainFilter}>
                                    <SelectTrigger className="h-9 rounded-xl bg-background border-input shadow-xs text-xs">
                                        <SelectValue placeholder="Chọn mảng nghiệp vụ..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOMAINS.map(domain => (
                                            <SelectItem key={domain.code} value={domain.code} className="cursor-pointer text-xs">
                                                {domain.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* KHỐI INPUT GÁN NHIỆM VỤ & CHỈ TIÊU (TWO-TIER ENTERPRISE FORM) */}
                        <div className="p-4 border-b bg-background/90 space-y-3.5 min-w-0">
                            {/* HÀNG 1: CHỌN CHẾ ĐỘ & CHỌN/NHẬP TÊN NHIỆM VỤ */}
                            <div className="flex flex-col gap-2 min-w-0">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 min-w-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                                            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                                            Thêm nhiệm vụ
                                        </span>
                                        {/* NÚT CHUYỂN CHẾ ĐỘ THÊM */}
                                        <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border text-[11px] shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setTaskInputMode('TEMPLATE')}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-md font-medium transition-all",
                                                    taskInputMode === 'TEMPLATE'
                                                        ? "bg-background text-primary shadow-xs font-bold"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Kho mẫu ({availableTasks.length})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTaskInputMode('CUSTOM')}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-md font-medium transition-all",
                                                    taskInputMode === 'CUSTOM'
                                                        ? "bg-background text-primary shadow-xs font-bold"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Nhiệm vụ chuyên thù
                                            </button>
                                        </div>
                                    </div>

                                    <span className="text-[11px] text-muted-foreground italic shrink-0 hidden md:inline">
                                        * Quý (x3) và Năm (x12) tự tính đồng bộ từ Tháng
                                    </span>
                                </div>

                                {/* INPUT / SELECT TÊN NHIỆM VỤ */}
                                {taskInputMode === 'TEMPLATE' ? (
                                    <div className="w-full min-w-0">
                                        <Select
                                            value={selectedTaskId}
                                            onValueChange={val => {
                                                setSelectedTaskId(val);
                                                const task = rankTasksRepository.find(t => t.id === val);
                                                if (task) {
                                                    setWeight(task.defaultWeight || 10);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-10 rounded-xl bg-background shadow-xs border-input text-xs min-w-0">
                                                <SelectValue placeholder="-- Chọn nhiệm vụ mẫu từ kho nghiệp vụ chuẩn hóa --" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-72">
                                                {availableTasks.map(task => {
                                                    const isAdded = addedPlans.some(p => p.title === task.taskName);
                                                    return (
                                                        <SelectItem key={task.id} value={task.id} disabled={isAdded} className="text-xs">
                                                            <div className="truncate max-w-[500px]">
                                                                {task.taskName} {isAdded ? <span className="text-muted-foreground italic font-normal ml-1">(Đã thêm)</span> : ''}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-2.5 w-full min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                placeholder="Nhập tên nhiệm vụ chuyên thù (VD: Thẩm định hồ sơ công tác cán bộ đột xuất...)"
                                                value={customTaskName}
                                                onChange={e => setCustomTaskName(e.target.value)}
                                                className="h-10 rounded-xl bg-background text-xs"
                                            />
                                        </div>
                                        <div className="w-full sm:w-[140px] shrink-0">
                                            <Input
                                                placeholder="ĐVT (Lượt/Báo cáo)"
                                                value={customUnit}
                                                onChange={e => setCustomUnit(e.target.value)}
                                                className="h-10 rounded-xl bg-background text-xs"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* HÀNG 2: 4 CHỈ TIÊU (THÁNG, QUÝ, NĂM, TRỌNG SỐ) & NÚT THÊM - ĐẦY ĐỦ RỘNG RÃI */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-end min-w-0 pt-1">
                                {/* CHỈ TIÊU THÁNG */}
                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] text-muted-foreground font-semibold flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                            <Calendar className="w-3 h-3" /> Tháng
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">(x1)</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0.1}
                                        step={0.5}
                                        value={monthlyTarget}
                                        onChange={e => handleMonthlyTargetChange(Number(e.target.value))}
                                        className="h-10 rounded-xl text-center font-bold text-sm bg-background border-input text-blue-600 dark:text-blue-400 tabular-nums shadow-xs"
                                    />
                                </div>

                                {/* CHỈ TIÊU QUÝ */}
                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] text-muted-foreground font-semibold flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                            <Calendar className="w-3 h-3" /> Quý
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">(x3)</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0.1}
                                        step={0.5}
                                        value={quarterlyTarget}
                                        onChange={e => setQuarterlyTarget(Math.max(0.1, Number(e.target.value)))}
                                        className="h-10 rounded-xl text-center font-bold text-sm bg-background border-input text-amber-600 dark:text-amber-400 tabular-nums shadow-xs"
                                    />
                                </div>

                                {/* CHỈ TIÊU NĂM */}
                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] text-muted-foreground font-semibold flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <Calendar className="w-3 h-3" /> Năm
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">(x12)</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0.1}
                                        step={1}
                                        value={yearlyTarget}
                                        onChange={e => setYearlyTarget(Math.max(0.1, Number(e.target.value)))}
                                        className="h-10 rounded-xl text-center font-bold text-sm bg-background border-input text-emerald-600 dark:text-emerald-400 tabular-nums shadow-xs"
                                    />
                                </div>

                                {/* TRỌNG SỐ W% */}
                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] text-muted-foreground font-semibold flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                            <Scale className="w-3 h-3" /> Trọng số
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">(%)</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0.1}
                                        step={1}
                                        value={weight}
                                        onChange={e => setWeight(Math.max(0.1, Number(e.target.value)))}
                                        className="h-10 rounded-xl text-center font-bold text-sm bg-background border-input text-purple-700 dark:text-purple-400 tabular-nums shadow-xs"
                                    />
                                </div>

                                {/* NÚT THÊM VÀO BẢNG */}
                                <div className="col-span-2 sm:col-span-1 min-w-0">
                                    <Button
                                        onClick={handleAssignTask}
                                        disabled={taskInputMode === 'TEMPLATE' ? !selectedTaskId : !customTaskName.trim()}
                                        className="w-full h-10 rounded-xl font-bold shadow-xs gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Thêm vào bảng</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* ENTERPRISE TABLE TOOLBAR */}
                        <div className="px-4 py-2.5 border-b bg-muted/15 flex flex-wrap items-center justify-between gap-2.5 min-w-0 text-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
                                <div className="relative w-full">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm nhiệm vụ trong bảng..."
                                        value={tableSearchQuery}
                                        onChange={e => setTableSearchQuery(e.target.value)}
                                        className="h-8 pl-8 text-xs rounded-lg bg-background border-input"
                                    />
                                    {tableSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setTableSearchQuery('')}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAutoBalanceWeights}
                                            disabled={addedPlans.length === 0}
                                            className="h-8 gap-1.5 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Cân đối 100% W</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">Tự động tính toán phân bổ trọng số các nhiệm vụ sao cho tổng bằng đúng 100%</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRecalculateQuarterAndYear}
                                            disabled={addedPlans.length === 0}
                                            className="h-8 gap-1.5 text-xs rounded-lg"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>Đồng bộ Quý/Năm</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">Tính lại Quý (x3) và Năm (x12) dựa theo chỉ tiêu Tháng hiện tại</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearAllPlans}
                                            disabled={addedPlans.length === 0}
                                            className="h-8 gap-1.5 text-xs rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Xóa trắng</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">Xóa toàn bộ các nhiệm vụ đang có trong bảng</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        {/* BẢNG CHỈ TIÊU: CUỘN MƯỢT CẢ DỌC VÀ NGANG, KHÔNG BAO GIỜ BỊ ĐÈ NÉT */}
                        <div className="w-full overflow-auto max-h-[540px] min-h-[300px] border-b relative bg-background">
                            <table className="w-full min-w-[860px] border-collapse text-xs">
                                <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b shadow-2xs">
                                    <tr>
                                        <th className="w-[48px] min-w-[48px] py-3 text-center font-bold text-muted-foreground">STT</th>
                                        <th className="min-w-[280px] py-3 px-3 text-left font-bold text-muted-foreground">Tên nhiệm vụ định biên bắt buộc</th>
                                        <th className="w-[85px] min-w-[85px] py-3 text-center font-bold text-muted-foreground">Đơn vị</th>
                                        <th className="w-[110px] min-w-[110px] py-3 text-center font-bold text-blue-600 dark:text-blue-400">Chỉ tiêu Tháng</th>
                                        <th className="w-[110px] min-w-[110px] py-3 text-center font-bold text-amber-600 dark:text-amber-400">Chỉ tiêu Quý</th>
                                        <th className="w-[115px] min-w-[115px] py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">Chỉ tiêu Năm</th>
                                        <th className="w-[95px] min-w-[95px] py-3 text-center font-bold text-purple-600 dark:text-purple-400">Trọng số (W%)</th>
                                        <th className="w-[50px] min-w-[50px] py-3 text-center font-bold text-muted-foreground">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedTablePlans.map((plan, idx) => (
                                        <tr key={plan.id} className="group transition-colors hover:bg-muted/15 border-b">
                                            <td className="text-center font-bold text-xs text-muted-foreground py-3">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3 px-3 min-w-0">
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed break-words">
                                                        {plan.title}
                                                    </p>
                                                    <span className="text-[11px] text-muted-foreground font-mono">
                                                        {plan.rankType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center text-xs text-muted-foreground py-3">
                                                <Badge variant="outline" className="font-normal text-[11px] px-2 py-0.5 bg-muted/30">
                                                    {plan.unit || 'Lượt'}
                                                </Badge>
                                            </td>

                                            {/* Ô SỬA CHỈ TIÊU THÁNG */}
                                            <td className="py-3 px-2 text-center">
                                                <Input
                                                    type="number"
                                                    min={0.1}
                                                    step={0.5}
                                                    value={plan.monthlyTarget}
                                                    onChange={e => {
                                                        const m = Number(e.target.value);
                                                        setAddedPlans(prev => prev.map(p => p.id === plan.id ? {
                                                            ...p,
                                                            monthlyTarget: m,
                                                            targetValue: m,
                                                        } : p));
                                                    }}
                                                    className="w-[74px] h-8 mx-auto text-center font-bold text-xs bg-background border-input focus-visible:ring-primary/30 rounded-lg text-blue-600 dark:text-blue-400 tabular-nums shadow-2xs"
                                                />
                                            </td>

                                            {/* Ô SỬA CHỈ TIÊU QUÝ */}
                                            <td className="py-3 px-2 text-center">
                                                <Input
                                                    type="number"
                                                    min={0.1}
                                                    step={0.5}
                                                    value={plan.quarterlyTarget}
                                                    onChange={e => {
                                                        const qua = Number(e.target.value);
                                                        setAddedPlans(prev => prev.map(p => p.id === plan.id ? { ...p, quarterlyTarget: qua } : p));
                                                    }}
                                                    className="w-[74px] h-8 mx-auto text-center font-bold text-xs bg-background border-input focus-visible:ring-primary/30 rounded-lg text-amber-600 dark:text-amber-400 tabular-nums shadow-2xs"
                                                />
                                            </td>

                                            {/* Ô SỬA CHỈ TIÊU NĂM */}
                                            <td className="py-3 px-2 text-center">
                                                <Input
                                                    type="number"
                                                    min={0.1}
                                                    step={1}
                                                    value={plan.yearlyTarget}
                                                    onChange={e => {
                                                        const y = Number(e.target.value);
                                                        setAddedPlans(prev => prev.map(p => p.id === plan.id ? { ...p, yearlyTarget: y } : p));
                                                    }}
                                                    className="w-[78px] h-8 mx-auto text-center font-bold text-xs bg-background border-input focus-visible:ring-primary/30 rounded-lg text-emerald-600 dark:text-emerald-400 tabular-nums shadow-2xs"
                                                />
                                            </td>

                                            {/* TRỌNG SỐ */}
                                            <td className="py-3 px-2 text-center">
                                                <Input
                                                    type="number"
                                                    min={0.1}
                                                    step={1}
                                                    value={plan.weight || 10}
                                                    onChange={e => {
                                                        const w = Number(e.target.value);
                                                        setAddedPlans(prev => prev.map(p => p.id === plan.id ? { ...p, weight: w } : p));
                                                    }}
                                                    className="w-[66px] h-8 mx-auto text-center font-bold text-xs bg-background border-input focus-visible:ring-primary/30 rounded-lg text-purple-700 dark:text-purple-400 tabular-nums shadow-2xs"
                                                />
                                            </td>

                                            {/* XÓA */}
                                            <td className="text-center py-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setAddedPlans(prev => prev.filter(p => p.id !== plan.id))}
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg opacity-70 group-hover:opacity-100 transition-all mx-auto"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}

                                    {displayedTablePlans.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="h-[280px] text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3 py-10">
                                                    <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center">
                                                        <Target className="w-7 h-7 opacity-30 text-primary" />
                                                    </div>
                                                    {tableSearchQuery ? (
                                                        <>
                                                            <Text variant="small" className="font-semibold text-foreground">Không tìm thấy nhiệm vụ nào khớp với từ khóa</Text>
                                                            <Button variant="outline" size="sm" onClick={() => setTableSearchQuery('')} className="text-xs">
                                                                Xóa từ khóa tìm kiếm
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Text variant="small" className="font-semibold text-foreground">Chưa có nhiệm vụ định biên nào cho vị trí việc làm này</Text>
                                                            <Text variant="small" className="opacity-70 text-xs font-normal max-w-sm">
                                                                Bạn có thể dùng nút &quot;Trợ lý AI Đề xuất&quot; phía trên hoặc chọn nhiệm vụ mẫu ở khung trên để thiết lập.
                                                            </Text>
                                                            <div className="flex items-center gap-2 pt-1">
                                                                <Button size="sm" onClick={() => setIsAiModalOpen(true)} className="gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20">
                                                                    <Sparkles className="w-3.5 h-3.5" /> Khởi chạy AI Đề xuất
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* THANH TỔNG HỢP CHỈ TIÊU TRÊN BẢNG */}
                        {addedPlans.length > 0 && (
                            <div className="p-3.5 bg-muted/30 flex flex-wrap items-center justify-between gap-3 text-xs min-w-0">
                                <span className="text-muted-foreground">
                                    Tổng số: <strong className="text-foreground">{addedPlans.length}</strong> nhiệm vụ định biên
                                </span>
                                <div className="flex items-center gap-4 flex-wrap tabular-nums">
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        Tổng Tháng: <strong>{summaryTotals.month}</strong>
                                    </span>
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        Tổng Quý: <strong>{summaryTotals.quarter}</strong>
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        Tổng Năm: <strong>{summaryTotals.year}</strong>
                                    </span>
                                    <span className={cn(
                                        "font-bold",
                                        totalWeight === 100 ? "text-emerald-600" : totalWeight > 100 ? "text-rose-600" : "text-amber-600"
                                    )}>
                                        Tổng W%: <strong>{totalWeight}%</strong>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: BỘ LỌC & DANH SÁCH VỊ TRÍ VIỆC LÀM - CUỘN ĐỘC LẬP MƯỢT MÀ */}
                    <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-3 bg-card text-card-foreground rounded-2xl border p-4 shadow-xs min-w-0">
                        {/* TABS CHUYỂN ĐỔI NGUỒN VTVL */}
                        <div className="space-y-2 shrink-0 min-w-0">
                            <div className="flex items-center justify-between min-w-0">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
                                    <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                                    Nguồn Vị trí việc làm
                                </Label>
                                {unitPositionsList.length > 0 && (
                                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shrink-0">
                                        Bộ phận có {unitPositionsList.length} VTVL
                                    </Badge>
                                )}
                            </div>

                            <Tabs value={vtvlViewSource} onValueChange={(val: any) => setVtvlViewSource(val)} className="w-full">
                                <TabsList className="w-full grid grid-cols-2 p-1 bg-muted rounded-xl h-9">
                                    <TabsTrigger value="DEPARTMENT" className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                                        Của bộ phận ({unitPositionsList.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="ALL" className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                                        Tất cả danh mục chuẩn
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* NẾU BỘ PHẬN CHƯA CÓ VỊ TRÍ VIỆC LÀM RIÊNG */}
                        {vtvlViewSource === 'DEPARTMENT' && unitPositionsList.length === 0 && (
                            <Alert className="py-2.5 px-3 bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200">
                                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertTitle className="text-xs font-bold">Chưa có cơ cấu VTVL riêng</AlertTitle>
                                <AlertDescription className="text-[11px] mt-0.5 leading-relaxed">
                                    Bộ phận này chưa ban hành định biên vị trí riêng trong CSDL.
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => setVtvlViewSource('ALL')}
                                        className="h-auto p-0 text-[11px] text-primary font-bold underline ml-1"
                                    >
                                        Xem danh mục chuẩn &rarr;
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* NẾU CHỌN TẤT CẢ DANH MỤC CHUẨN: HIỂN THỊ PHÂN LOẠI CÔNG CHỨC / VIÊN CHỨC / KHỐI ĐẢNG */}
                        {vtvlViewSource === 'ALL' && (
                            <div className="space-y-2 shrink-0 pt-1 border-t min-w-0">
                                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Phân loại ngạch</Label>
                                <Tabs value={classification} onValueChange={(val: any) => setClassification(val)} className="w-full">
                                    <TabsList className="w-full grid grid-cols-3 p-1 bg-muted rounded-xl h-8">
                                        <TabsTrigger value="CONG_CHUC" className="rounded-lg text-[11px]">Công chức</TabsTrigger>
                                        <TabsTrigger value="VIEN_CHUC" className="rounded-lg text-[11px]">Viên chức</TabsTrigger>
                                        <TabsTrigger value="DANG" className="rounded-lg text-[11px]">Khối Đảng</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        )}

                        {/* LỌC THEO NHÓM NGÀNH / VỊ TRÍ */}
                        <div className="space-y-1.5 shrink-0 min-w-0">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nhóm Ngành / Vị trí</Label>
                            <Popover open={isGroupOpen} onOpenChange={setIsGroupOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isGroupOpen}
                                        className="w-full justify-between h-9 rounded-xl bg-background shadow-xs border-input font-normal text-xs"
                                    >
                                        <span className="truncate">{activeGroup === 'ALL' ? 'Tất cả các nhóm' : currentGroups.find(g => g.id === activeGroup)?.name || 'Chọn nhóm ngành...'}</span>
                                        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[320px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Tìm nhanh nhóm ngành..." className="h-9 text-xs" />
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
                                                        className="text-xs"
                                                    >
                                                        {group.name}
                                                        <Check className={cn("ml-auto h-3.5 w-3.5", activeGroup === group.id ? "opacity-100" : "opacity-0")} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Ô TÌM KIẾM VTVL */}
                        <div className="relative shrink-0 min-w-0">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                            <Input 
                                placeholder="Lọc theo tên VTVL hoặc mã..." 
                                value={searchRankText}
                                onChange={e => setSearchRankText(e.target.value)}
                                className="pl-9 h-9 text-xs rounded-xl border-input bg-muted/20 focus-visible:bg-background"
                            />
                        </div>

                        {/* DANH SÁCH CUỘN VTVL ĐỘC LẬP: KHÔNG BỊ TRÓI CHIỀU CAO CỨNG, CUỘN MƯỢT MÀ */}
                        <div className="flex flex-col min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 px-0.5 min-w-0">
                                <span>Danh sách ({filteredRanksList.length} VTVL)</span>
                                {isLoadingStaffing && <RefreshCw className="w-3 h-3 animate-spin text-primary shrink-0" />}
                            </div>

                            <div className="max-h-[580px] min-h-[300px] overflow-y-auto overflow-x-hidden pr-1.5 space-y-2 rounded-xl">
                                {filteredRanksList.map((rank: any) => {
                                    const isSelected = activeRankFilter === rank.code;
                                    return (
                                        <div
                                            key={rank.code}
                                            onClick={() => setActiveRankFilter(rank.code)}
                                            className={cn(
                                                "p-3 rounded-xl border cursor-pointer transition-all min-w-0 group",
                                                isSelected
                                                    ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/20 border-l-4 border-l-primary"
                                                    : "bg-background border-border/70 hover:bg-muted/40 hover:border-primary/40"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2 min-w-0">
                                                <h4 className={cn(
                                                    "text-xs sm:text-sm font-semibold leading-relaxed break-words min-w-0",
                                                    isSelected ? "text-primary" : "text-foreground"
                                                )}
                                                title={rank.name}
                                                >
                                                    {rank.name}
                                                </h4>
                                                {rank.quantity != null && (
                                                    <Badge variant="outline" className="text-[10px] shrink-0 font-bold bg-muted/50 border-primary/20 text-foreground">
                                                        {rank.quantity} ĐB
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground font-mono min-w-0">
                                                <span className="truncate">{rank.code}</span>
                                                {rank.currentCount != null && (
                                                    <span className="font-sans text-[10px] text-muted-foreground shrink-0 font-medium">
                                                        Có mặt: {rank.currentCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredRanksList.length === 0 && (
                                    <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                                        Không tìm thấy vị trí việc làm nào phù hợp.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTION FOOTER BAR: DOCK STICKY SANG TRỌNG TIỆN LỢI */}
                <Card className="rounded-2xl border shadow-md bg-card shrink-0 min-w-0 sticky bottom-2 z-30">
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-3.5 min-w-0">
                        <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap min-w-0">
                            <span className="break-words">
                                Đang chọn: <strong className="text-foreground">{activeRankObj?.name || activeRankFilter}</strong>
                            </span>
                            <span>•</span>
                            <span>
                                Tổng nhiệm vụ: <strong className="text-foreground">{addedPlans.length}</strong>
                            </span>
                            <span>•</span>
                            <span className={cn(
                                "font-bold",
                                totalWeight === 100 ? "text-emerald-600" : totalWeight > 100 ? "text-rose-600" : "text-amber-600"
                            )}>
                                Trọng số: {totalWeight}%
                            </span>
                        </div>
                        <Button
                            onClick={handleSubmitPlan}
                            disabled={isSavingPlan || addedPlans.length === 0}
                            size="lg"
                            className="w-full sm:w-auto gap-2 font-bold px-8 rounded-xl shadow-md hover:shadow-lg transition-all h-11"
                        >
                            {isSavingPlan ? (
                                <>Đang lưu...</>
                            ) : (
                                <><Save className="w-4 h-4" /> LƯU CẤU TRÚC ĐỊNH BIÊN</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* MODAL TRỢ LÝ AI ĐỀ XUẤT ĐỊNH MỨC & KẾ HOẠCH */}
                <AiQuotaPlanModal
                    isOpen={isAiModalOpen}
                    onClose={() => setIsAiModalOpen(false)}
                    unitName={selectedUnit?.name || 'Đơn vị'}
                    unitCode={selectedUnitCode}
                    rankName={activeRankObj?.name || activeRankFilter}
                    rankCode={activeRankFilter}
                    classification={classification}
                    domainCode={activeDomainFilter}
                    headcount={activeRankObj?.quantity || 1}
                    onApplyQuotas={handleApplyAiQuotas}
                />
            </div>
        </TooltipProvider>
    );
}