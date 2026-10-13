/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Award, Edit2, X, Search, ShieldCheck } from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heading, Text } from "@/components/ui/typography";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { useTaskConfigForm } from './hooks/useTaskConfigForm';

export function PartyTaskConfig({ templates, units, ranks }: { templates: any[], units: CategoryItem[], ranks: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const defaultPartyRank = ranks.find(r => r.code === 'SPECIALIST' || r.code === 'TRUONG_BAN')?.code || (ranks[0]?.code || 'SPECIALIST');

    const {
        selectedRank, setSelectedRank,
        newTaskName, setNewTaskName,
        newUnit, setNewUnit,
        editingId,
        editTaskName, setEditTaskName,
        editUnit, setEditUnit,
        handleAddTemplate,
        handleDeleteTemplate,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit
    } = useTaskConfigForm({
        templates,
        ranks,
        classification: 'DANG',
        defaultRank: defaultPartyRank
    });

    const filteredTemplates = templates.filter(t =>
        t.rank === selectedRank &&
        t.taskName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupRanks = (allRanks: any[]) => {
        const groups: Record<string, any[]> = {};
        allRanks.forEach(r => {
            let cat = r.category || 'Khác';
            if (cat === 'EXECUTIVE' || cat === 'MANAGER') cat = 'Lãnh đạo, quản lý';
            else if (cat === 'STAFF') cat = 'Nghiệp vụ công tác Đảng';
            else if (cat === 'SUPPORT') cat = 'Hỗ trợ, phục vụ';
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push(r);
        });
        return groups;
    };
    const rankGroups = groupRanks(ranks);

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[600px]">
            {/* Left Sidebar: Danh mục VTVL Khối Cơ quan Đảng */}
            <div className="w-full md:w-[300px] shrink-0 flex flex-col h-full border rounded-xl overflow-hidden bg-background shadow-xs">
                <div className="p-4 bg-muted/30 border-b shrink-0 space-y-1">
                    <div className="flex items-center gap-1.5 text-primary">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <Heading level="h4" className="font-semibold uppercase tracking-wider text-xs">VTVL Cơ quan Đảng</Heading>
                    </div>
                    <Text variant="muted" className="text-[11px] leading-tight break-words">
                        Theo Quy định 137-QĐ/TW & Hướng dẫn BTCTW
                    </Text>
                </div>
                <ScrollArea className="flex-1 w-full">
                    <Accordion type="multiple" defaultValue={Object.keys(rankGroups)} className="w-full">
                        {Object.entries(rankGroups).map(([groupName, gRanks]) => {
                            if (gRanks.length === 0) return null;
                            return (
                                <AccordionItem value={groupName} key={groupName} className="border-b-0">
                                    <AccordionTrigger className="px-4 py-2.5 bg-muted/10 hover:bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                                        <span className="truncate">{groupName} ({gRanks.length})</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-0">
                                        <div className="flex flex-col gap-0.5 p-2">
                                            {gRanks.map(r => (
                                                <Button
                                                    key={r.id || r.code}
                                                    variant={selectedRank === r.code ? "secondary" : "ghost"}
                                                    onClick={() => setSelectedRank(r.code)}
                                                    className={`justify-start text-left h-auto py-2 px-3 transition-colors ${selectedRank === r.code ? 'border-l-4 border-primary rounded-l-none bg-secondary/70' : 'hover:bg-muted/50'}`}
                                                >
                                                    <span className={`text-xs font-medium whitespace-normal leading-snug break-words ${selectedRank === r.code ? 'text-primary font-bold' : 'text-foreground/80'}`}>
                                                        {r.name}
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </ScrollArea>
            </div>

            {/* Right Main Area: Danh sách và Thêm mới nhiệm vụ */}
            <div className="flex-1 flex flex-col min-w-0 h-full border rounded-xl overflow-hidden bg-background shadow-xs">
                {/* Form thêm mới */}
                <div className="p-4 bg-muted/10 border-b shrink-0 space-y-3">
                    <Heading level="h4" className="font-semibold text-sm">Thêm nhiệm vụ mẫu khối Đảng</Heading>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex-1 w-full space-y-1.5 min-w-0">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Nội dung nhiệm vụ công tác Đảng</label>
                            <Input
                                placeholder="Nhập tên nhiệm vụ mẫu (VD: Thẩm định hồ sơ cán bộ, Quản lý thẻ Đảng...)"
                                value={newTaskName}
                                onChange={e => setNewTaskName(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                        <div className="w-full sm:w-[150px] space-y-1.5 shrink-0">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Đơn vị tính</label>
                            <Select value={newUnit || undefined} onValueChange={setNewUnit}>
                                <SelectTrigger className="w-full h-9 text-xs bg-background">
                                    <SelectValue placeholder="Chọn ĐVT" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(u => (
                                        <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">{(u as any).nameVi || u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddTemplate}
                            className="w-full sm:w-auto h-9 px-4 gap-2 text-xs shrink-0"
                            iconStart={<Plus className="w-3.5 h-3.5" />}
                        >
                            Thêm mới
                        </Button>
                    </div>
                </div>

                {/* Header danh sách */}
                <div className="p-3 px-4 bg-muted/30 border-b shrink-0 flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold flex items-center gap-2 min-w-0">
                        <Award className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">Thư viện Nhiệm vụ</span>
                        <Badge variant="outline" className="ml-1 font-normal">{filteredTemplates.length}</Badge>
                    </div>
                    <div className="relative w-[200px] shrink-0">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm nhiệm vụ..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-background"
                        />
                    </div>
                </div>

                {/* Danh sách nhiệm vụ */}
                <ScrollArea className="flex-1 w-full p-4">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-xs">
                            Chưa có nhiệm vụ mẫu nào cho Vị trí việc làm này.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTemplates.map(t => (
                                <div key={t.id} className="p-3 border rounded-lg bg-card flex items-center justify-between gap-3 text-xs">
                                    {editingId === t.id ? (
                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            <Input
                                                value={editTaskName}
                                                onChange={e => setEditTaskName(e.target.value)}
                                                className="h-8 text-xs flex-1 min-w-0"
                                            />
                                            <Select value={editUnit} onValueChange={setEditUnit}>
                                                <SelectTrigger className="w-[120px] h-8 text-xs shrink-0 bg-background">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map(u => (
                                                        <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">{(u as any).nameVi || u.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button size="icon-sm" variant="ghost" onClick={handleSaveEdit} className="shrink-0 text-emerald-600">
                                                <Award className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button size="icon-sm" variant="ghost" onClick={handleCancelEdit} className="shrink-0 text-muted-foreground">
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <p className="font-medium text-foreground break-words leading-snug">{t.taskName}</p>
                                                <p className="text-muted-foreground text-[11px]">Đơn vị tính: <span className="font-semibold text-foreground/80">{t.defaultUnit}</span></p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button size="icon-sm" variant="ghost" onClick={() => handleStartEdit(t)} className="text-muted-foreground hover:text-foreground">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteTemplate(t.id)} className="text-destructive/70 hover:text-destructive">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
