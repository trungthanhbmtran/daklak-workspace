/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Search,
    Check,
    CheckCircle2,
    AlertCircle,
    Layers,
    ListChecks,
    Sparkles,
    Briefcase,
    Building2,
    Percent,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';
import { JobTitleItem } from '@/features/system-admin/organization/types';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { useTaskConfigForm } from './hooks/useTaskConfigForm';
import { TaskRankTemplateItem } from './hooks/useConfigureRankTasks';

const POPULAR_UNITS = ['Văn bản', 'Báo cáo', 'Hồ sơ', 'Quyết định', 'Đề án', 'Cuộc họp', 'Lượt', 'Buổi'];

export interface RankTaskCatalogManagerProps {
    classification: 'CONG_CHUC' | 'VIEN_CHUC' | 'DANG';
    classificationTitle: string;
    legalBasis: string;
    icon?: React.ReactNode;
    templates: TaskRankTemplateItem[];
    units: CategoryItem[];
    ranks: JobTitleItem[];
    defaultRank?: string;
    isLoading?: boolean;
}

export function RankTaskCatalogManager({
    classification,
    classificationTitle,
    legalBasis,
    icon,
    templates,
    units,
    ranks,
    defaultRank = 'SPECIALIST',
    isLoading = false
}: RankTaskCatalogManagerProps) {
    const [rankSearchQuery, setRankSearchQuery] = useState('');
    const [taskSearchQuery, setTaskSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIGURED' | 'EMPTY'>('ALL');
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Tính toán số lượng nhiệm vụ mẫu đã có theo từng rank code
    const taskCountByRank = useMemo(() => {
        const counts: Record<string, number> = {};
        templates.forEach(t => {
            counts[t.rank] = (counts[t.rank] || 0) + 1;
        });
        return counts;
    }, [templates]);

    // Nhóm các chức danh VTVL
    const groupRanks = (allRanks: JobTitleItem[]) => {
        const groups: Record<string, JobTitleItem[]> = {
            'Lãnh đạo, quản lý': [],
            'Nghiệp vụ chuyên ngành & Dùng chung': [],
            'Hỗ trợ, phục vụ': [],
        };
        const others: JobTitleItem[] = [];

        allRanks.forEach(r => {
            const cat = (r.category || '').toUpperCase();
            const type = (r.type || '').toUpperCase();
            const name = (r.name || '').toUpperCase();

            if (
                cat.includes('EXECUTIVE') ||
                cat.includes('MANAGER') ||
                cat.includes('LÃNH ĐẠO') ||
                type.includes('EXECUTIVE') ||
                name.includes('TRƯỞNG') ||
                name.includes('PHÓ TRƯỞNG') ||
                name.includes('GIÁM ĐỐC') ||
                name.includes('CỤC TRƯỞNG') ||
                name.includes('CHI CỤC TRƯỞNG')
            ) {
                groups['Lãnh đạo, quản lý'].push(r);
            } else if (
                cat.includes('SUPPORT') ||
                cat.includes('HỖ TRỢ') ||
                cat.includes('PHỤC VỤ') ||
                name.includes('LÁI XE') ||
                name.includes('BẢO VỆ') ||
                name.includes('PHỤC VỤ')
            ) {
                groups['Hỗ trợ, phục vụ'].push(r);
            } else if (
                cat.includes('STAFF') ||
                cat.includes('CHUYÊN MÔN') ||
                cat.includes('NGHIỆP VỤ') ||
                cat.includes('CHUYÊN VIÊN') ||
                name.includes('CHUYÊN VIÊN') ||
                name.includes('CÁN SỰ') ||
                name.includes('KỸ SƯ') ||
                name.includes('KẾ TOÁN')
            ) {
                groups['Nghiệp vụ chuyên ngành & Dùng chung'].push(r);
            } else {
                others.push(r);
            }
        });

        if (others.length > 0) {
            if (groups['Nghiệp vụ chuyên ngành & Dùng chung'].length === 0) {
                groups['Nghiệp vụ chuyên ngành & Dùng chung'] = others;
            } else {
                groups['Vị trí việc làm khác'] = others;
            }
        }

        return Object.fromEntries(
            Object.entries(groups).filter(([_, items]) => items.length > 0)
        );
    };

    // Lọc danh sách chức danh theo tìm kiếm và trạng thái
    const filteredRanks = useMemo(() => {
        return ranks.filter(r => {
            const matchesQuery =
                r.name.toLowerCase().includes(rankSearchQuery.toLowerCase()) ||
                r.code.toLowerCase().includes(rankSearchQuery.toLowerCase());

            if (!matchesQuery) return false;

            const count = taskCountByRank[r.code] || 0;
            if (statusFilter === 'CONFIGURED') return count > 0;
            if (statusFilter === 'EMPTY') return count === 0;
            return true;
        });
    }, [ranks, rankSearchQuery, statusFilter, taskCountByRank]);

    const rankGroups = useMemo(() => groupRanks(filteredRanks), [filteredRanks]);

    // Accordion controlled state để tránh lỗi Radix không mở khi dữ liệu tải xong
    const allGroupKeys = useMemo(() => Object.keys(rankGroups), [rankGroups]);
    const [openAccordionGroups, setOpenAccordionGroups] = useState<string[]>([]);

    useEffect(() => {
        if (allGroupKeys.length > 0) {
            setOpenAccordionGroups(allGroupKeys);
        }
    }, [allGroupKeys.length]);

    // Xác định rank khởi tạo
    const effectiveDefaultRank = useMemo(() => {
        if (ranks.find(r => r.code === defaultRank)) return defaultRank;
        return ranks[0]?.code || defaultRank;
    }, [ranks, defaultRank]);

    const {
        selectedRank,
        setSelectedRank,
        newTaskName,
        setNewTaskName,
        newUnit,
        setNewUnit,
        newWeight,
        setNewWeight,
        isSubmitting,
        isUpdating,
        deletingId,
        itemToDelete,
        handleRequestDelete,
        handleCancelDelete,
        handleConfirmDelete,
        editingId,
        editTaskName,
        setEditTaskName,
        editUnit,
        setEditUnit,
        editWeight,
        setEditWeight,
        handleAddTemplate,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit
    } = useTaskConfigForm({
        templates,
        ranks,
        classification,
        defaultRank: effectiveDefaultRank
    });

    // Thông tin chức danh đang được chọn
    const currentSelectedRankInfo = useMemo(() => {
        return ranks.find(r => r.code === selectedRank);
    }, [ranks, selectedRank]);

    // Danh sách nhiệm vụ mẫu của rank đang chọn, có lọc theo tìm kiếm
    const currentRankTemplates = useMemo(() => {
        return templates.filter(t => t.rank === selectedRank);
    }, [templates, selectedRank]);

    const filteredTemplates = useMemo(() => {
        if (!taskSearchQuery.trim()) return currentRankTemplates;
        const q = taskSearchQuery.toLowerCase().trim();
        return currentRankTemplates.filter(t =>
            t.taskName.toLowerCase().includes(q) ||
            t.defaultUnit.toLowerCase().includes(q)
        );
    }, [currentRankTemplates, taskSearchQuery]);

    // Thống kê nhanh trong khối
    const totalRanksCount = ranks.length;
    const configuredRanksCount = useMemo(() => {
        return ranks.filter(r => (taskCountByRank[r.code] || 0) > 0).length;
    }, [ranks, taskCountByRank]);
    const coveragePercent = totalRanksCount > 0 ? Math.round((configuredRanksCount / totalRanksCount) * 100) : 0;

    const handleCreateSubmit = async () => {
        await handleAddTemplate();
        setIsAddSheetOpen(false);
    };

    return (
        <div className="flex flex-col w-full gap-4 min-w-0">
            {/* Top Metric Strip - Enterprise Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border bg-card/80 shadow-xs min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-muted-foreground truncate">Tổng VTVL trong khối</p>
                        <p className="text-base sm:text-lg font-black tracking-tight text-foreground truncate mt-0.5">
                            {isLoading ? <Skeleton className="h-5 w-12" /> : `${totalRanksCount} vị trí`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl border bg-card/80 shadow-xs min-w-0">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-muted-foreground truncate">Đã thiết lập mẫu</p>
                        <p className="text-base sm:text-lg font-black tracking-tight text-emerald-600 truncate mt-0.5">
                            {isLoading ? <Skeleton className="h-5 w-12" /> : `${configuredRanksCount} / ${totalRanksCount}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl border bg-card/80 shadow-xs min-w-0">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                        <ListChecks className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-muted-foreground truncate">Tổng nhiệm vụ mẫu</p>
                        <p className="text-base sm:text-lg font-black tracking-tight text-foreground truncate mt-0.5">
                            {isLoading ? <Skeleton className="h-5 w-12" /> : `${templates.length} nhiệm vụ`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl border bg-card/80 shadow-xs min-w-0">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                        <Percent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-muted-foreground truncate">Tỷ lệ bao phủ VTVL</p>
                        <p className="text-base sm:text-lg font-black tracking-tight text-foreground truncate mt-0.5">
                            {isLoading ? <Skeleton className="h-5 w-12" /> : `${coveragePercent}%`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Fluid 2-Column Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 w-full min-w-0 items-start">
                {/* Left Sidebar: VTVL Directory */}
                {isSidebarOpen ? (
                    <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 flex flex-col border rounded-2xl bg-card shadow-xs overflow-hidden">
                        {/* Sidebar Header */}
                        <div className="p-4 bg-muted/20 border-b shrink-0 space-y-3">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                                        {icon || <Building2 className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
                                            {classificationTitle}
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {legalBasis}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Badge variant="secondary" className="text-[10px] font-semibold">
                                        {filteredRanks.length} VTVL
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="text-muted-foreground hover:text-foreground hidden lg:flex"
                                        title="Thu gọn danh mục VTVL"
                                    >
                                        <PanelLeftClose className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Search VTVL */}
                            <div className="relative w-full">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm chức danh, mã ngạch..."
                                    value={rankSearchQuery}
                                    onChange={e => setRankSearchQuery(e.target.value)}
                                    className="h-8 pl-8 pr-7 text-xs bg-background rounded-lg"
                                />
                                {rankSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setRankSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Status Chips */}
                            <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto hide-scrollbar">
                                <Button
                                    variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                                    size="xs"
                                    onClick={() => setStatusFilter('ALL')}
                                    className="text-[10px] h-6 px-2 rounded-md font-medium shrink-0"
                                >
                                    Tất cả ({ranks.length})
                                </Button>
                                <Button
                                    variant={statusFilter === 'CONFIGURED' ? 'default' : 'outline'}
                                    size="xs"
                                    onClick={() => setStatusFilter('CONFIGURED')}
                                    className="text-[10px] h-6 px-2 rounded-md font-medium shrink-0"
                                >
                                    Có mẫu ({configuredRanksCount})
                                </Button>
                                <Button
                                    variant={statusFilter === 'EMPTY' ? 'default' : 'outline'}
                                    size="xs"
                                    onClick={() => setStatusFilter('EMPTY')}
                                    className="text-[10px] h-6 px-2 rounded-md font-medium shrink-0"
                                >
                                    Chưa có ({ranks.length - configuredRanksCount})
                                </Button>
                            </div>
                        </div>

                        {/* VTVL Scrollable List with Native Clean Scrollbar */}
                        <div className="max-h-[460px] lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-1 divide-y divide-border/60">
                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(6)].map((_, i) => (
                                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : filteredRanks.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
                                    <AlertCircle className="w-6 h-6 mx-auto opacity-30" />
                                    <p>Không tìm thấy vị trí việc làm phù hợp.</p>
                                    {rankSearchQuery && (
                                        <Button
                                            variant="link"
                                            size="xs"
                                            onClick={() => { setRankSearchQuery(''); setStatusFilter('ALL'); }}
                                            className="text-xs"
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Accordion
                                    type="multiple"
                                    value={openAccordionGroups}
                                    onValueChange={setOpenAccordionGroups}
                                    className="w-full"
                                >
                                    {Object.entries(rankGroups).map(([groupName, gRanks]) => {
                                        if (gRanks.length === 0) return null;
                                        return (
                                            <AccordionItem value={groupName} key={groupName} className="border-b last:border-b-0">
                                                <AccordionTrigger className="px-3.5 py-2.5 bg-muted/10 hover:bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="truncate">{groupName}</span>
                                                        <Badge variant="outline" className="text-[9px] font-normal py-0 px-1.5 h-4">
                                                            {gRanks.length}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-1.5 pt-1">
                                                    <div className="flex flex-col gap-1 px-2">
                                                        {gRanks.map(r => {
                                                            const isSelected = selectedRank === r.code;
                                                            const taskCount = taskCountByRank[r.code] || 0;
                                                            return (
                                                                <button
                                                                    key={r.id || r.code}
                                                                    type="button"
                                                                    onClick={() => setSelectedRank(r.code)}
                                                                    className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between gap-2.5 min-w-0 ${
                                                                        isSelected
                                                                            ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/20 ring-1 ring-primary/20'
                                                                            : 'hover:bg-muted/60 text-foreground/85 border border-transparent'
                                                                    }`}
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className={`text-xs leading-snug break-words ${isSelected ? 'text-primary font-bold' : 'text-foreground font-medium'}`}>
                                                                            {r.name}
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                                                                            {r.code}
                                                                        </p>
                                                                    </div>
                                                                    <div className="shrink-0">
                                                                        {taskCount > 0 ? (
                                                                            <Badge
                                                                                variant={isSelected ? "default" : "secondary"}
                                                                                className={`text-[10px] font-mono h-5 px-1.5 shrink-0 ${
                                                                                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                                                }`}
                                                                            >
                                                                                {taskCount} mẫu
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-[10px] text-muted-foreground/60 italic shrink-0">
                                                                                Trống
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Collapsed Sidebar Pill */
                    <div className="shrink-0 hidden lg:block">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsSidebarOpen(true)}
                            className="gap-2 h-10 px-3 rounded-xl shadow-xs"
                            title="Mở danh mục VTVL"
                        >
                            <PanelLeftOpen className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold">Danh mục VTVL ({ranks.length})</span>
                        </Button>
                    </div>
                )}

                {/* Right Main Area: Task Catalog for Selected Rank */}
                <div className="flex-1 min-w-0 w-full flex flex-col border rounded-2xl bg-card shadow-xs overflow-hidden">
                    {/* Active Rank Header */}
                    <div className="p-4 sm:p-5 bg-muted/20 border-b shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                                {!isSidebarOpen && (
                                    <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="h-6 gap-1 text-[11px] rounded-md lg:hidden"
                                    >
                                        <PanelLeftOpen className="w-3 h-3" /> Đổi VTVL
                                    </Button>
                                )}
                                <h2 className="text-base sm:text-lg font-bold text-foreground break-words min-w-0">
                                    {currentSelectedRankInfo?.name || selectedRank}
                                </h2>
                                <Badge variant="outline" className="font-mono text-xs uppercase bg-background shrink-0">
                                    Mã: {selectedRank}
                                </Badge>
                                {currentSelectedRankInfo?.category && (
                                    <Badge variant="secondary" className="text-[11px] shrink-0">
                                        {currentSelectedRankInfo.category}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed break-words">
                                Danh mục công việc định mức chuẩn hóa theo phân hạng VTVL.
                            </p>
                        </div>

                        {/* Top Action Button */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                            <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="h-9 gap-1.5 rounded-xl font-bold text-xs shadow-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Thêm nhiệm vụ mẫu
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                                    <SheetHeader className="pb-4 border-b">
                                        <SheetTitle className="text-base font-bold flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            Thêm nhiệm vụ mẫu cho VTVL
                                        </SheetTitle>
                                        <SheetDescription className="text-xs">
                                            Vị trí áp dụng: <span className="font-semibold text-foreground">{currentSelectedRankInfo?.name || selectedRank}</span>
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="py-6 space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                                                Nội dung nhiệm vụ mẫu <span className="text-destructive">*</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="VD: Soạn thảo văn bản quy phạm pháp luật, thẩm định hồ sơ công chức..."
                                                value={newTaskName}
                                                onChange={e => setNewTaskName(e.target.value)}
                                                className="w-full p-3 text-xs rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                                                Đơn vị tính (ĐVT) <span className="text-destructive">*</span>
                                            </label>
                                            <Select value={newUnit || undefined} onValueChange={setNewUnit}>
                                                <SelectTrigger className="w-full h-10 text-xs bg-background rounded-xl">
                                                    <SelectValue placeholder="Chọn đơn vị tính..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map(u => (
                                                        <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">
                                                            {(u as any).nameVi || u.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Quick Pick Unit Chips */}
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                <span className="text-[10px] text-muted-foreground mr-1">Gợi ý nhanh:</span>
                                                {POPULAR_UNITS.map(chip => (
                                                    <button
                                                        key={chip}
                                                        type="button"
                                                        onClick={() => setNewUnit(chip)}
                                                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                                                            newUnit === chip
                                                                ? 'bg-primary text-primary-foreground border-primary font-bold'
                                                                : 'bg-muted/40 hover:bg-muted text-foreground/80 border-border'
                                                        }`}
                                                    >
                                                        {chip}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                                                    Trọng số KPI mặc định (%)
                                                </label>
                                                <span className="text-[10px] text-muted-foreground">Tùy chọn (0 - 100%)</span>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="5"
                                                placeholder="VD: 15, 20, 25..."
                                                value={newWeight}
                                                onChange={e => setNewWeight(e.target.value)}
                                                className="h-10 text-xs bg-background rounded-xl"
                                            />
                                        </div>

                                        <div className="pt-4 border-t flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsAddSheetOpen(false)}
                                                className="text-xs rounded-xl"
                                            >
                                                Hủy bỏ
                                            </Button>
                                            <Button
                                                size="sm"
                                                disabled={isSubmitting}
                                                onClick={handleCreateSubmit}
                                                className="text-xs font-bold rounded-xl gap-1.5"
                                            >
                                                {isSubmitting ? 'Đang lưu...' : (
                                                    <><Plus className="w-3.5 h-3.5" /> Lưu vào thư viện</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Quick Add Bar - Responsive Grid (Zero overlapping) */}
                    <div className="p-3 sm:p-4 bg-muted/10 border-b shrink-0">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                            <div className="sm:col-span-12 md:col-span-5 space-y-1 min-w-0">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Nội dung nhiệm vụ mẫu</label>
                                <Input
                                    placeholder="Nhập tên nhiệm vụ mẫu..."
                                    value={newTaskName}
                                    onChange={e => setNewTaskName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey && newTaskName.trim() && newUnit) {
                                            handleAddTemplate();
                                        }
                                    }}
                                    className="h-9 text-xs bg-background rounded-lg"
                                />
                            </div>

                            <div className="sm:col-span-6 md:col-span-3 space-y-1 min-w-0">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Đơn vị tính</label>
                                <Select value={newUnit || undefined} onValueChange={setNewUnit}>
                                    <SelectTrigger className="w-full h-9 text-xs bg-background rounded-lg">
                                        <SelectValue placeholder="Chọn ĐVT" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map(u => (
                                            <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">
                                                {(u as any).nameVi || u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="sm:col-span-6 md:col-span-2 space-y-1 min-w-0">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Trọng số %</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="%"
                                    value={newWeight}
                                    onChange={e => setNewWeight(e.target.value)}
                                    className="h-9 text-xs bg-background rounded-lg"
                                />
                            </div>

                            <div className="sm:col-span-12 md:col-span-2">
                                <Button
                                    size="sm"
                                    disabled={isSubmitting}
                                    onClick={handleAddTemplate}
                                    className="w-full h-9 px-3 text-xs font-bold rounded-lg gap-1.5"
                                >
                                    {isSubmitting ? 'Đang thêm...' : (
                                        <><Plus className="w-3.5 h-3.5" /> Thêm nhanh</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Quick pick chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            <span className="text-[10px] text-muted-foreground mr-1">ĐVT nhanh:</span>
                            {POPULAR_UNITS.map(chip => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => setNewUnit(chip)}
                                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                                        newUnit === chip
                                            ? 'bg-primary text-primary-foreground border-primary font-bold'
                                            : 'bg-background hover:bg-muted text-foreground/80 border-border'
                                    }`}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Task Search & Filter Toolbar */}
                    <div className="p-2.5 px-4 bg-muted/30 border-b shrink-0 flex items-center justify-between gap-4">
                        <div className="text-xs font-semibold flex items-center gap-2 min-w-0">
                            <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">Nhiệm vụ thuộc VTVL:</span>
                            <Badge variant="outline" className="font-bold text-[11px] bg-background">
                                {currentRankTemplates.length}
                            </Badge>
                        </div>

                        <div className="relative w-full max-w-[240px] shrink-0">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm nhiệm vụ..."
                                value={taskSearchQuery}
                                onChange={e => setTaskSearchQuery(e.target.value)}
                                className="h-7 pl-8 pr-7 text-xs bg-background rounded-md"
                            />
                            {taskSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setTaskSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tasks List Content with Native Clean Scrollbar */}
                    <div className="max-h-[580px] lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-1 divide-y divide-border">
                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground space-y-3">
                                <div className="p-4 rounded-full bg-muted/40 text-muted-foreground">
                                    <Layers className="w-8 h-8 opacity-40" />
                                </div>
                                <div className="space-y-1 max-w-sm">
                                    <p className="text-sm font-semibold text-foreground">
                                        {taskSearchQuery ? 'Không tìm thấy nhiệm vụ phù hợp' : 'Chưa có nhiệm vụ mẫu nào'}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {taskSearchQuery
                                            ? `Không có kết quả nào khớp với "${taskSearchQuery}".`
                                            : `Vị trí việc làm này chưa được cấu hình danh mục công việc chuẩn hóa.`}
                                    </p>
                                </div>
                                {taskSearchQuery ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTaskSearchQuery('')}
                                        className="text-xs rounded-lg"
                                    >
                                        Xóa từ khóa tìm kiếm
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => setIsAddSheetOpen(true)}
                                        className="text-xs font-bold rounded-xl gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Thêm nhiệm vụ đầu tiên
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {filteredTemplates.map((item, index) => {
                                    const isEditing = editingId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            className="p-3.5 sm:p-4 hover:bg-muted/30 transition-colors"
                                        >
                                            {isEditing ? (
                                                /* Edit Inline Mode - Stacked Grid */
                                                <div className="flex flex-col gap-2.5 p-3 rounded-xl border bg-card">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Nội dung nhiệm vụ</label>
                                                        <Input
                                                            value={editTaskName}
                                                            onChange={e => setEditTaskName(e.target.value)}
                                                            placeholder="Nội dung nhiệm vụ..."
                                                            className="h-8 text-xs bg-background"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Đơn vị tính</label>
                                                            <Select value={editUnit || undefined} onValueChange={setEditUnit}>
                                                                <SelectTrigger className="w-full h-8 text-xs bg-background">
                                                                    <SelectValue placeholder="ĐVT" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {units.map(u => (
                                                                        <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">
                                                                            {(u as any).nameVi || u.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Trọng số %</label>
                                                            <Input
                                                                type="number"
                                                                placeholder="Trọng số %"
                                                                value={editWeight}
                                                                onChange={e => setEditWeight(e.target.value)}
                                                                className="h-8 text-xs bg-background"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 flex items-center justify-end gap-2 pt-2">
                                                            <Button
                                                                size="xs"
                                                                variant="outline"
                                                                onClick={handleCancelEdit}
                                                                className="h-8 px-3 text-xs rounded-md"
                                                            >
                                                                Hủy
                                                            </Button>
                                                            <Button
                                                                size="xs"
                                                                disabled={isUpdating}
                                                                onClick={handleSaveEdit}
                                                                className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md gap-1 font-bold"
                                                            >
                                                                <Check className="w-3.5 h-3.5" /> Lưu cập nhật
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* View Mode - Spacious layout */
                                                <div className="flex items-start justify-between gap-3 min-w-0">
                                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-bold shrink-0 mt-0.5">
                                                            {index + 1}
                                                        </span>
                                                        <div className="min-w-0 flex-1 space-y-1.5">
                                                            <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed break-words whitespace-normal">
                                                                {item.taskName}
                                                            </p>
                                                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                                                                <Badge variant="outline" className="text-[10px] font-mono py-0 px-2 h-5 bg-background border-slate-200">
                                                                    ĐVT: <span className="font-bold text-foreground ml-1">{item.defaultUnit}</span>
                                                                </Badge>
                                                                {item.defaultWeight != null && (
                                                                    <Badge variant="secondary" className="text-[10px] font-mono py-0 px-2 h-5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                                        Trọng số: <span className="font-bold ml-1">{item.defaultWeight}%</span>
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() => handleStartEdit(item)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                                            title="Chỉnh sửa nhiệm vụ"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() => handleRequestDelete(item)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                            title="Xóa nhiệm vụ"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Delete Alert Dialog (Tuân thủ chuẩn Dialog cho tương tác ngắn) */}
            <AlertDialog open={!!itemToDelete} onOpenChange={open => !open && handleCancelDelete()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            Xác nhận xóa nhiệm vụ mẫu
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            Bạn có chắc chắn muốn xóa nhiệm vụ{' '}
                            <span className="font-bold text-foreground break-words">
                                "{itemToDelete?.taskName}"
                            </span>{' '}
                            khỏi vị trí việc làm{' '}
                            <span className="font-semibold text-foreground">
                                "{currentSelectedRankInfo?.name || selectedRank}"
                            </span>?
                            Thao tác này sẽ xóa khỏi danh mục định mức VTVL chuẩn và không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel onClick={handleCancelDelete} className="text-xs">
                            Hủy bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={deletingId !== null}
                            className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                        >
                            {deletingId !== null ? 'Đang xóa...' : 'Đồng ý xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
